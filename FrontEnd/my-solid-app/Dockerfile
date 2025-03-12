# Use an official Node.js image as base
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /my-solid-app

# Copy package.json and lock file, then install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy all frontend files to the container
COPY . .

# Build the frontend
RUN npm run build

# Expose the port (Vite typically runs on port 3000)
EXPOSE 3000

# Start the frontend using a simple static server
CMD ["npx", "serve", "-s", "dist", "-l", "3000"]
