import type { RequestHandler } from "express";
import type { UploadedFile } from "express-fileupload";
import type { Types } from "mongoose";
import { Song } from "../models/song.model.js";
import { Album } from "../models/album.model.js";
import cloudinary from "../lib/cloudinary.js";
import { Artist } from "../models/artist.model.js";
import { User } from "../models/user.model.js";
import { Favorite } from "../models/favorite.model.js";

// express-fileupload yields an array when a field is sent more than once
const singleFile = (file: UploadedFile | UploadedFile[]): UploadedFile =>
	Array.isArray(file) ? file[0] : file;

// helper function for cloudinary uploads
const uploadToCloudinary = async (file: UploadedFile) => {
	try {
		const result = await cloudinary.uploader.upload(file.tempFilePath, {
			resource_type: "auto",
		});
		return result.secure_url;
	} catch (error) {
		console.log("Error in uploadToCloudinary", error);
		throw new Error("Error uploading to cloudinary");
	}
};

export const createSong: RequestHandler = async (req, res, next) => {
	try {
		if (!req.files || !req.files.audioFile || !req.files.imageFile) {
			res.status(400).json({ message: "Please upload all files" });
			return;
		}

		const { title, artist, album, genre } = req.body;
		const audioFile = singleFile(req.files.audioFile);
		const imageFile = singleFile(req.files.imageFile);

		const audioUpload = await cloudinary.uploader.upload(audioFile.tempFilePath, {resource_type: "auto",});
		const duration = `${Math.floor(audioUpload.duration/60)}:${Math.floor(audioUpload.duration%60)}` ;
		const imageUrl = await uploadToCloudinary(imageFile);

		const song = new Song({
			title,
			artist: artist,
			audioUrl: audioUpload.secure_url,
			imageUrl,
			duration,
			genre,
			album: album || null,
		});

		await song.save();

		// if song belongs to an album, update the albums songs array
		if (album) {
			await Album.findByIdAndUpdate(album, {
				$push: { songs: song._id },
			});
		}
		// update the artist songs array
		
			await Artist.findByIdAndUpdate(artist, {
				$push: { songs: song._id },
			});
		
		res.status(201).json(song);
	} catch (error) {
		console.log("Error in createSong", error);
		next(error);
	}
};

export const updateSong: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, artist, album, genre } = req.body;

    // Find the song
    const song = await Song.findById(id);
    if (!song) {
      res.status(404).json({ message: "Song not found" });
      return;
    }

    // Handle optional file uploads
    let imageUrl = song.imageUrl;
    let audioUrl = song.audioUrl;
    let duration = song.duration;

    if (req.files?.imageFile) {
      imageUrl = await uploadToCloudinary(singleFile(req.files.imageFile));
    }
    if (req.files?.audioFile) {
      const audioUpload = await cloudinary.uploader.upload(singleFile(req.files.audioFile).tempFilePath, { resource_type: "auto" });
      audioUrl = audioUpload.secure_url;
      duration = `${Math.floor(audioUpload.duration/60)}:${Math.floor(audioUpload.duration%60)}`;
    }

    // Update song fields
    song.title = title ?? song.title;
    song.artist = artist ?? song.artist;
    song.album = album ?? song.album;
    song.genre = genre ?? song.genre;
    song.imageUrl = imageUrl;
    song.audioUrl = audioUrl;
    song.duration = duration;

    await song.save();

    res.status(200).json(song);
  } catch (error) {
    console.log("Error in updateSong", error);
    next(error);
  }
};

export const deleteSong: RequestHandler<{ id: string }> = async (req, res, next) => {
	try {
		const { id } = req.params;

		await deleteSongById(id);

		res.status(200).json({ message: "Song deleted successfully" });
	} catch (error) {
		console.log("Error in deleteSong", error);
		next(error);
	}
};

const deleteSongById = async (songId: string | Types.ObjectId) => {
    const song = await Song.findById(songId);
    if (!song) {
        throw new Error("Song not found");
    }

	// if song belongs to an album, update the album songs array
    if (song.album) {
        await Album.findByIdAndUpdate(song.album, {
            $pull: { songs: song._id },
        });
    }
	// update the artist songs array
    await Artist.findByIdAndUpdate(song.artist, {
        $pull: { songs: song._id },
    });

	// Delete image from Cloudinary
    if (song.imageUrl) {
        const imagePublicId = getCloudinaryPublicId(song.imageUrl);
        if (imagePublicId) {
            await cloudinary.uploader.destroy(imagePublicId);
        }
    }

    // Delete audio from Cloudinary
    if (song.audioUrl) {
        const audioPublicId = getCloudinaryPublicId(song.audioUrl);
        if (audioPublicId) {
            await cloudinary.uploader.destroy(audioPublicId, { resource_type: "video" });
        }
    }

    await Song.findByIdAndDelete(songId);
};

export const createAlbum: RequestHandler = async (req, res, next) => {
	try {
		if (!req.files || !req.files.imageFile) {
			res.status(400).json({ message: "Please upload all files" });
			return;
		}
		const { title, artist, releaseYear } = req.body;
		const imageUrl = await uploadToCloudinary(singleFile(req.files.imageFile));

		const album = new Album({
			title,
			artist,
			imageUrl,
			releaseYear,
		});

		await album.save();

		await Artist.findByIdAndUpdate(artist, {
				$push: { albums: album._id },
			});

		res.status(201).json(album);
	} catch (error) {
		console.log("Error in createAlbum", error);
		next(error);
	}
};

export const deleteAlbum: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const album = await Album.findById(id);
		if (!album) {
			res.status(404).json({ message: "Album not found" });
			return;
		}

		const songsInAlbum = await Song.find({ album: id});

		for (let i = 0; i < songsInAlbum.length; i++) {
            await deleteSongById(songsInAlbum[i]._id);		// delete all songs in the album
        }		
		await Artist.findByIdAndUpdate(album.artist, {
				$pull: { albums: album._id },				// remove that album reference from artist
			});
		await Album.findByIdAndDelete(id);					// delete the album
		
		if (album.imageUrl) {								// Delete image from Cloudinary
			const imagePublicId = getCloudinaryPublicId(album.imageUrl);
			if (imagePublicId) {
				await cloudinary.uploader.destroy(imagePublicId);
			}
    	}
		res.status(200).json({ message: "Album deleted successfully" });
	} catch (error) {
		console.log("Error in deleteAlbum", error);
		next(error);
	}
};

export const createArtist: RequestHandler = async (req, res, next) => {
	try {
		if (!req.files || !req.files.imageFile) {
			res.status(400).json({ message: "Please upload all files" });
			return;
		}
		const { name } = req.body;

		const existingArtistName = await Artist.findOne({ name });
		if (existingArtistName) {
			res.status(400).json({ message: "Artist name already exists, please use a diffrent one" });
			return;
		}

		const imageUrl = await uploadToCloudinary(singleFile(req.files.imageFile));

		const artist = new Artist({
			name,
			imageUrl,
		});

		await artist.save();

		res.status(201).json(artist);
	} catch (error) {
		console.log("Error in createArtist", error);
		next(error);
	}
};

export const deleteArtist: RequestHandler = async (req, res, next) => {
	try {
		const { id } = req.params;
		const artist = await Artist.findById(id);
		if (!artist) {
			res.status(404).json({ message: "Artist not found" });
			return;
		}
		const albumsByArtist = await Album.find({ artist: id });
		albumsByArtist.forEach(async (album) => {
			const songsInAlbum = await Song.find({ album: album._id });
			for (let i = 0; i < songsInAlbum.length; i++) {
				await deleteSongById(songsInAlbum[i]._id);		// delete all songs in the album
			}
			await Album.findByIdAndDelete(album._id);			// delete the album

			if (album.imageUrl) {								// Delete image from Cloudinary
					const imagePublicId = getCloudinaryPublicId(album.imageUrl);
				if (imagePublicId) {
					await cloudinary.uploader.destroy(imagePublicId);
				}
    		}
		}
	);
		await Artist.findByIdAndDelete(id);				// delete the artist						

		if (artist.imageUrl) {								// Delete image from Cloudinary
			const imagePublicId = getCloudinaryPublicId(artist.imageUrl);
			if (imagePublicId) {
				await cloudinary.uploader.destroy(imagePublicId);
			}
    	}
		
		res.status(200).json({ message: "Artist deleted successfully" });
	} catch (error) {
		console.log("Error in deleteArtist", error);
		next(error);
	}
};

export const updateRole: RequestHandler = async (req, res, next) => {
	const { id } = req.params;
    const { role } = req.body;

    try {
        const user = await User.findById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Update the role
        user.role = role;
        await user.save();

        res.status(200).json({ message: 'User role updated', user });
    } catch (error) {
        next(error);
        res.status(500).json({ message: 'Error updating role' });
    }
};

export const deleteUser: RequestHandler = async (req, res, next) => {
	const { id } = req.params;

	try {
		const user = await User.findById(id);
		if (!user) {
			res.status(404).json({ message: "User not found" });
			return;
		}
		const favorites = await Favorite.find({ user: id });
		if (favorites.length > 0) {
			await Favorite.deleteMany({ user: id }); // delete all favorites of the user
		}
		await User.findByIdAndDelete(id);
		res.status(200).json({ message: "User deleted successfully" });
	} catch (error) {
		console.log("Error in deleteUser", error);
		next(error);
	}
};

export const checkAdmin: RequestHandler = async (req, res, next) => {
	res.status(200).json({ admin: true });
};

function getCloudinaryPublicId(url: string) {
    // Example: https://res.cloudinary.com/demo/video/upload/v1234567890/folder/filename.mp3
    // Extract 'folder/filename' (without extension and version)
    try {
        const parts = url.split('/');
        // Remove version and extension
        const versionIndex = parts.findIndex(p => /^v\d+$/.test(p));
        const publicIdWithExt = parts.slice(versionIndex + 1).join('/');
        return publicIdWithExt.replace(/\.[^/.]+$/, ''); // remove extension
    } catch {
        return null;
    }
}