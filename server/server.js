require('dotenv').config();
const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  const server = http.createServer(app);
  server.listen(PORT, () => {
    console.log(`✅ Server chal raha hai port ${PORT} pe`);
    console.log(`🔗 http://localhost:${PORT}/api/health`);
  });
};

startServer();