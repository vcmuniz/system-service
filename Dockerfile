FROM node:18
WORKDIR /app
COPY package*.json ./
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi
COPY . .
# In development we run via ts-node-dev (overridden by docker-compose command)
CMD ["npm","run","dev"]
