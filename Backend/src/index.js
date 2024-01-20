import express from "express";
import dotenv from "dotenv";
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { spawn } from 'child_process';
import ConnectDB from "./database/connection";
import errorMiddleware from './middleware/errorMiddleware';
import authRoutes from './routes/authRoutes';

dotenv.config();

const yatra = express();
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

yatra.use(cors(corsOptions));
yatra.use(express.json());
yatra.use(cookieParser());

yatra.use('/auth', authRoutes);

yatra.use(errorMiddleware);

yatra.get("/", (req, res) => {
  res.json({
    message: "Server is running",
  });
});

const PORT = 4000;

yatra.listen(PORT, () => {
  ConnectDB()
    .then(() => {
      console.log("Server is running and mongodb connected !!!");
    })
    .catch((error) => {
      console.log("Server is running, but database connection failed...");
      console.log(error);
    });
});

yatra.post('/generate-itinerary', (req, res) => {
  const inputData = req.body;
  const pythonProcess = spawn('python', ['./python_model/generate_itinerary.py', JSON.stringify(inputData)]);

  pythonProcess.stdout.on('data', (data) => {
    const result = JSON.parse(data);
    res.json(result);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`Error = Python script: ${data}`);
    res.status(500).json({ error: 'An error occurred while generating the itinerary.' });
  });
});
