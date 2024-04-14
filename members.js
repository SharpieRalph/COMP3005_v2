// members.js

const express = require('express');
const router = express.Router();
const pool = require('./db');

// Route to retrieve all members
router.get('/members', async (req, res) => {
    try {
        // Query to select all members from the members table
        const query = 'SELECT * FROM UserProfiles';

        // Execute the query
        const { rows } = await pool.query(query);

        // Send the list of members as JSON response
        res.json(rows);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
