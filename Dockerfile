# Dockerfile
FROM node:22.18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm prune --omit=dev
EXPOSE 5000
CMD [ "npm", "start" ]