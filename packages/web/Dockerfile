FROM node:20-alpine
WORKDIR /app
COPY package.json tsconfig.json next.config.js next-env.d.ts ./
COPY public ./public
COPY src ./src
RUN npm install
RUN npm run build
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
COPY . .
CMD ["npm", "run", "start"]
