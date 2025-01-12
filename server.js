const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

const app = express();
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to save data
app.post('/submit-request', (req, res) => {
    const { name, email, services } = req.body;
    if (!name || !email || !services.length) {
        return res.status(400).json({ error: 'All fields are required!' });
    }
    const servicesString = services.join(', ');
    db.run(
        `INSERT INTO requests (name, email, services) VALUES (?, ?, ?)`,
        [name, email, servicesString],
        function (err) {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Request saved successfully!' });
        }
    );
});

// Endpoint to retrieve data
app.get('/api/requests', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Serve the "requests.html" file for viewing stored requests
app.get('/requests', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'requests.html'));
});

// Default route to serve "index.html"
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000; // Use Render's PORT or fallback to 3000
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
