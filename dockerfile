FROM node:14
WORKDIR C:/Users/habensalah/Downloads/nodejs
COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 3000
CMD ["node", "employee.js"]
