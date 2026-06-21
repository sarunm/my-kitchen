FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY src/views ./src/views
COPY public ./public

EXPOSE 3002

CMD ["npm", "start"]
