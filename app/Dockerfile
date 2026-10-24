FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY . .

# Tạo thư mục uploads và cấp quyền đầy đủ TRƯỚC KHI chuyển sang user node
RUN mkdir -p /usr/src/app/public/uploads && chmod -R 777 /usr/src/app/public/uploads
RUN chown -R node:node /usr/src/app

USER node
EXPOSE 3000
CMD ["node", "server.js"]