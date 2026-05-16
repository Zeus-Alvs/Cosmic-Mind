FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 7485


CMD ["npx", "next", "start", "-H", "0.0.0.0", "-p", "7485"]