import express from 'express';
import cors from 'cors';
import { openDatabase, loadState, saveState } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

openDatabase();

app.get('/api/state', (_req, res) => {
  try {
    res.json(loadState());
  } catch (err) {
    console.error('GET /api/state failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/state', (req, res) => {
  try {
    saveState(req.body);
    res.json({ ok: true });
  } catch (err) {
    console.error('PUT /api/state failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`suitCASE API  →  http://localhost:${PORT}`);
});
