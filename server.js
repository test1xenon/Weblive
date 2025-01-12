const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
    origin: '*', // Allow all origins
    methods: ['GET', 'POST'], // Allow GET and POST requests
    allowedHeaders: ['Content-Type']
}));

// Parse incoming JSON requests
app.use(bodyParser.json());

// Serve static files from the "assets" directory
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Serve HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/requests.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'requests.html'));
});

// Initialize SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create "requests" table if it doesn't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            services TEXT NOT NULL,
            date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table "requests" is ready');
        }
    });
});

// Handle form submissions (POST /submit-request)
app.post('/submit-request', (req, res) => {
    const { name, email, services } = req.body;

    // Validate input
    if (!name || !email || !services.length) {
        return res.status(400).json({ error: 'All fields are required!' });
    }

    const servicesString = services.join(', ');

    // Insert the request into the database
    db.run(
        `INSERT INTO requests (name, email, services) VALUES (?, ?, ?)`,
        [name, email, servicesString],
        function (err) {
            if (err) {
                console.error('Error inserting into database:', err.message);
                return res.status(500).json({ error: 'Database error' });
            }
            res.status(201).json({ message: 'Request saved successfully!' });
        }
    );
});

// Fetch all stored requests (GET /requests)
app.get('/requests', (req, res) => {
    db.all(`SELECT * FROM requests`, [], (err, rows) => {
        if (err) {
            console.error('Error fetching from database:', err.message);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
