const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('MongoDB connected');

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        })
    })
    .catch(err => {
        console.log(err);
    });

app.use('/api', authRouter);
app.use('/api', userRouter);