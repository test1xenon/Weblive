const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const db = new sqlite3.Database('./database.db');

// Middleware
app.use(bodyParser.json());
app.use(cors());

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
app.get('/requests', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Start server
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
