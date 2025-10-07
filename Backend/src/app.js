import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}))

app.use(express.json({
    limit:'20kb'
}))

app.use(express.urlencoded({
    extended : true,
    limit : '20kb'
}))

app.use(cookieParser())


import authRoutes from './routes/auth.route.js'
import userRoutes from './routes/user.route.js'
import modelRoutes from './routes/models.route.js'
import twoFactorRoutes from './routes/twoFactorAuth.route.js'
import adminRoutes from './routes/admin.route.js'

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/models', modelRoutes);
app.use('/api/v1/2fa', twoFactorRoutes);
app.use('/api/v1/admin', adminRoutes);

export default app;