const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve static files
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/collect', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Data received',
        timestamp: Date.now()
    });
});

app.post('/api/track', (req, res) => {
    res.json({ success: true });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        uptime: process.uptime()
    });
});

// 404 Handler - ngapaain cok
app.get('*', (req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>404 - Not Found</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                body {
                    font-family: 'Courier New', monospace;
                    background: #000;
                    color: #0f0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    text-align: center;
                }
                .container {
                    padding: 20px;
                }
                h1 {
                    font-size: 4rem;
                    margin-bottom: 20px;
                    animation: glitch 1s infinite;
                }
                p {
                    font-size: 1.5rem;
                    margin-bottom: 30px;
                }
                a {
                    color: #0f0;
                    text-decoration: none;
                    border: 2px solid #0f0;
                    padding: 10px 20px;
                    transition: all 0.3s;
                }
                a:hover {
                    background: #0f0;
                    color: #000;
                }
                @keyframes glitch {
                    0% { text-shadow: 2px 2px #f00, -2px -2px #00f; }
                    50% { text-shadow: -2px 2px #00f, 2px -2px #f00; }
                    100% { text-shadow: 2px 2px #f00, -2px -2px #00f; }
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>404</h1>
                <p>ngapaain cok 🤨</p>
                <a href="/">← Balik ke Homepage</a>
            </div>
        </body>
        </html>
    `);
});

app.use((err, req, res, next) => {
    res.status(500).json({ error: 'Server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = app;
