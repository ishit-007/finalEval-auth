const express = require('express');
const app = express();
const port = 4000;
const dotenv = require('dotenv');

dotenv.config();

const userRoutes = require('./src/routes/userRoutes');
// const { redisClient } = require('./src/utils/redis');
app.use(express.json());
app.use('/', userRoutes);


app.listen(port, () => console.log(`Server Started on port ${port}!`));
