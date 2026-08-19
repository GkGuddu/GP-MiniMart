const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const compression = require('compression');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

app.set('io', io);

io.on('connection', (socket) => {
    socket.on('joinOrderRoom', (orderId) => {
        socket.join(orderId);
    });
});

app.use(express.json());
app.use(cors());
app.use(compression());
app.use(require('helmet')({
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));

mongoose.connect(process.env.MONGO_URI);

const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));

app.get('/', (req, res) => {
    res.send('Kirana Shop API is running...');
});

app.use(notFound);
app.use(errorHandler);

server.listen(PORT);
