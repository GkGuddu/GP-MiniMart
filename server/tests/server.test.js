const request = require('supertest');
const express = require('express');
const cors = require('cors'); // Assuming you're using cors
const helmet = require('helmet'); // Assuming you're using helmet

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());

app.get('/', (req, res) => {
    res.send('Kirana Shop API is running...');
});

describe('Server Basic Tests', () => {
    it('should return 200 OK for the root route', async () => {
        const res = await request(app).get('/');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toBe('Kirana Shop API is running...');
    });
});
