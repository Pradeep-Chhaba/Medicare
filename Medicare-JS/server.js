const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'medicare_secret_key',
    resave: false,
    saveUninitialized: false
}));

// Home Route / Redirect
app.get('/', (req, res) => {
    if (req.session.user_id) {
        res.redirect('/dashboard.html');
    } else {
        res.redirect('/login.html');
    }
});

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'medicare'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL Database');
});

// Authentication APIs
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true, message: 'Registered successfully!' });
    });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'SELECT * FROM users WHERE username=? AND password=?';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        if (results.length > 0) {
            req.session.user_id = results[0].id;
            req.session.username = results[0].username;
            res.json({ success: true });
        } else {
            res.status(401).json({ success: false, message: 'Invalid Login' });
        }
    });
});

app.get('/api/session', (req, res) => {
    if (req.session.user_id) {
        res.json({ success: true, username: req.session.username });
    } else {
        res.json({ success: false });
    }
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Medicine APIs
app.get('/api/medicines', (req, res) => {
    if (!req.session.user_id) return res.status(401).json({ success: false });
    
    const sql = 'SELECT * FROM medicines WHERE user_id=?';
    db.query(sql, [req.session.user_id], (err, results) => {
        if (err) throw err;
        res.json({ success: true, medicines: results });
    });
});

app.post('/api/medicines', (req, res) => {
    if (!req.session.user_id) return res.status(401).json({ success: false });
    
    const { medicine, dosage, time, expiry } = req.body;
    const sql = 'INSERT INTO medicines (user_id, medicine_name, dosage, schedule_time, expiry_date) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [req.session.user_id, medicine, dosage, time, expiry], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true });
    });
});

app.post('/api/medicines/log', (req, res) => {
    if (!req.session.user_id) return res.status(401).json({ success: false });
    
    const { medicine_id, status } = req.body;
    const sql = 'INSERT INTO medicine_history (user_id, medicine_id, status) VALUES (?, ?, ?)';
    db.query(sql, [req.session.user_id, medicine_id, status], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Database error' });
        }
        res.json({ success: true });
    });
});

app.get('/api/medicines/history', (req, res) => {
    if (!req.session.user_id) return res.status(401).json({ success: false });
    
    // Join with medicines table to get medicine name
    const sql = 'SELECT h.*, m.medicine_name, m.dosage, m.schedule_time FROM medicine_history h JOIN medicines m ON h.medicine_id = m.id WHERE h.user_id=? ORDER BY h.action_time DESC';
    db.query(sql, [req.session.user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        res.json({ success: true, history: results });
    });
});

app.get('/api/medicines/adherence', (req, res) => {
    if (!req.session.user_id) return res.status(401).json({ success: false });
    
    const sql = 'SELECT status, COUNT(*) as count FROM medicine_history WHERE user_id=? GROUP BY status';
    db.query(sql, [req.session.user_id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false });
        }
        
        let taken = 0;
        let total = 0;
        results.forEach(r => {
            total += r.count;
            if (r.status === 'Taken') taken += r.count;
        });
        
        const percentage = total === 0 ? 0 : Math.round((taken / total) * 100);
        res.json({ success: true, adherence: percentage, total });
    });
});

// Server Entry Point
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
