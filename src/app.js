import express from 'express';
import cors from 'cors';
// ...existing imports...

const app = express();

// ✅ CORS Configuration for Production
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://fe-x37.vercel.app',          // ✨ FE production domain
    'https://be-x37-eight.vercel.app',    // ✨ BE production domain (for admin)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  optionsSuccessStatus: 200
};

// ✅ Apply CORS before other middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// ...existing middleware...
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ...existing routes...
