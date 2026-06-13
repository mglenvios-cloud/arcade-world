FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Transpile ts to js using ts-node or tsc. In production it's better to compile.
RUN npm install -g typescript
RUN tsc
EXPOSE 2567
CMD ["node", "index.js"]
