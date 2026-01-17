import express from 'express';
import cors from 'cors';
import api from './routes/api.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api', api);

app.listen(PORT, () => {
  console.log(`Time Tracker API running on http://localhost:${PORT}`);
});
