import morgan from 'morgan';
import { buildApp } from './app.js';

const port: number = Number(process.env.PORT) || 3007;
const app = buildApp();

// Morgan должен быть ПЕРВЫМ middleware
const environment = process.env.NODE_ENV || 'development';
app.use(morgan('dev')); // ← упрощаем для теста

const server = app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
}); 