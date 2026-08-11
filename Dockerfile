# Step 1: Use lightweight Node.js 20 base image on Alpine Linux
FROM node:20-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package dependency definitions
COPY package*.json ./

# Step 4: Install production dependencies
RUN npm install --only=production

# Step 5: Copy application source code
COPY . .

# Step 6: Expose application port
EXPOSE 3000

# Step 7: Configure environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Step 8: Run as non-root node user for security
USER node

# Step 9: Define container entry command
CMD ["node", "src/server.js"]
