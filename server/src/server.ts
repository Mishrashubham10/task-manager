import dotenv from 'dotenv';
import { connectDB } from './config/db';
dotenv.config({ debug: true });
import app from './app';

const PORT = process.env.PORT || 5500;

/*
--------- DB CONNECTION ----------
*/
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});