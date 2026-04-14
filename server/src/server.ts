import app from './app';
import dotenv from 'dotenv';
dotenv.config({ debug: true });

const PORT = process.env.PORT || 5500;

app.listen(PORT, () => {
  console.log(`Server is running at port ${PORT}`);
});