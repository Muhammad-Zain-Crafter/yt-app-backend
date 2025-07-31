import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser';

const app = express();
app.use(cors({
    origin: process.env.CORS_ORGIGN,
    credentials: true
}));
app.use(express.json({  // built-in middleware
    limit: '50kb'
}));
app.use(express.urlencoded({ // encodeed data that comes from url
    limit: '50kb',
    extended: true
}))
app.use(express.static('public')); // for serving static files
app.use(cookieParser()); // for parsing cookies

export default app;