import express from 'express';
import path from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '3002', 10);
const API_URL = process.env.API_URL || 'http://192.168.1.131:3001';

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/dashboard', (req, res) => {
  res.render('dashboard', { apiUrl: API_URL });
});

app.get('/', (req, res) => {
  res.redirect('/dashboard');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Pi Dashboard running on http://0.0.0.0:${PORT}`);
  console.log(`Backend API: ${API_URL}`);
});
