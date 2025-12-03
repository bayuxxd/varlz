const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'no-referrer');
    
    // Permissions for camera, mic, geolocation
    res.setHeader('Permissions-Policy', 'camera=*, microphone=*, geolocation=*');
    
    // Content Security Policy (flexible for your needs)
    res.setHeader('Content-Security-Policy', 
        "default-src 'self' 'unsafe-inline' 'unsafe-eval' https: data: blob:; " +
        "connect-src 'self' https: wss:; " +
        "media-src 'self' https: data: blob:;"
    );
    
    next();
});

// Main page - clean URL
app.get('/', (req, res) => {
    // Log visitor info (optional)
    const visitorInfo = {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        referrer: req.get('Referrer') || 'Direct'
    };
    
    console.log('📊 New visitor:', visitorInfo);
    
    // Serve main page
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});


app.post('/api/collect', (req, res) => {
    const data = req.body;
    
    // Log collected data
    console.log('📊 Data collected:', {
        timestamp: new Date().toISOString(),
        ip: req.ip,
        dataSize: JSON.stringify(data).length
    });
    
    res.json({ 
        success: true, 
        message: 'Data received',
        timestamp: Date.now()
    });
});

app.post('/api/track', (req, res) => {
    const trackingData = req.body;
    
    console.log('📍 Tracking data:', trackingData);
    
    res.json({ success: true });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('*', (req, res) => {
    console.log('🔍 404 attempt:', req.url);
    res.redirect('/');
});

// Error handler
app.use((err, req, res, next) => {
    console.error('💥 Server error:', err.stack);
    res.status(500).redirect('/');
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Server running on port ${PORT}
🌐 Access: http://localhost:${PORT}
🛡️  Security headers: Active
📊 Logging: Enabled
    `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('🛑 Server shutting down...');
    process.exit(0);
});

module.exports = app;
