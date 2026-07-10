# Base image
FROM node:20-alpine

# Tạo thư mục app
WORKDIR /app

# Copy package 
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source
COPY . .

# Expose port 
EXPOSE 3000

# Chạy app
CMD ["npm", "run", "start"]