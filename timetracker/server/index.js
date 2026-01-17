const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(bodyParser.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ projects: [], tasks: [], timeEntries: [] }, null, 2));
}

// Helper to read data
const readData = () => {
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};

// Helper to write data
const writeData = (data) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

// GET all data
app.get('/api/data', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read data' });
    }
});

// POST update data (Full sync for MVP simplicity)
app.post('/api/data', (req, res) => {
    try {
        const newData = req.body;
        // Basic validation could go here
        writeData(newData);
        res.json({ success: true, data: newData });
    } catch (error) {
        res.status(500).json({ error: 'Failed to write data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
