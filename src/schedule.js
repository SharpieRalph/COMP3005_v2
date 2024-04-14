// schedule.js

const express = require('express');
const router = express.Router();
const pool = require('./db');

// Route to add a session to the schedule table
router.post('/add-session', async (req, res) => {
    try {
        const { dayOfWeek, timeSlot, trainerId, memberId } = req.body;

        // Check if there is no session on the same day around 1 hour difference
        const existingSession = await pool.query(
            `SELECT * FROM schedules
             WHERE day_of_week = $1
             AND time_slot >= $2::time - INTERVAL '1 hour'
             AND time_slot <= $2::time + INTERVAL '1 hour'`,
            [dayOfWeek, timeSlot]
        );

        if (existingSession.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Session already exists around this time.' });
        }

        // Insert the new session into the schedule table
        const newSession = await pool.query(
            `INSERT INTO schedules (day_of_week, time_slot, trainer_id, member_id)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [dayOfWeek, timeSlot, trainerId, memberId]
        );

        res.status(201).json({ success: true, message: 'Session added successfully.', session: newSession.rows[0] });
    } catch (error) {
        console.error('Error adding session:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});
router.get('/api/schedule/:trainerId', async (req, res) => {
    // Implementation to fetch the schedule for the specified trainer ID
    const { trainerId } = req.params;

        try {
            const schedule = await pool.query(
                'SELECT * FROM schedules WHERE trainer_id = $1',
                [trainerId]
            );

            res.json(schedule.rows);
        } catch (error) {
            console.error('Error fetching schedule:', error);
            res.status(500).json({ success: false, message: 'Server error.' });
        }
});


module.exports = router;
