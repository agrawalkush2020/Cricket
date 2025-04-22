import express from 'express';
import mongoose from "mongoose";
import cors from 'cors';
import deliveryRouter from './routes/delivery';
import inningRouter from './routes/inning';
const app = express();
const PORT = 5000;
mongoose
  .connect(
    "mongodb+srv://agrawalkush2020:1N8SL2gWRrlfhAny@cluster0.8hx4y0s.mongodb.net/"
  )
  .then(() => {
    console.log("connected to db atlas")
  })
  .catch(()=>{
    console.log("error does not connect ");
  })
app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('CORS is working!');
});

app.use("/delivery", deliveryRouter);
app.use("/inning-details", inningRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
