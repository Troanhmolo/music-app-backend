import mongoose, { type HydratedDocument, type Model } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser {
	username: string;
	email: string;
	password: string;
	profileImage: string;
	role: "user" | "admin";
	createdAt: Date;
	updatedAt: Date;
}

export interface IUserMethods {
	matchPassword(enteredPassword: string): Promise<boolean>;
}

export type UserModel = Model<IUser, object, IUserMethods>;
export type UserDocument = HydratedDocument<IUser, IUserMethods>;

const userSchema = new mongoose.Schema<IUser, UserModel, IUserMethods>(
	{
		username: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
			unique: true
		},
		password: {
			type: String,
			required: true,
			minlength: 6
		},
		profileImage: {
			type: String,
			default:""
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default:"user"
		}
	},
	{ timestamps: true } //  createdAt, updatedAt
);

userSchema.pre("save", async function() {

	if(!this.isModified("password")) return;

	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword: string) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
