const express = require('express');
const router = express.Router();
const pool = require('./db');
const bcrypt = require('bcryptjs');

// Add express.json() middleware to parse incoming JSON requests
router.use(express.json());

router.post('/login', async (req, res) => {
    console.log("Request Body:", req.body);

    const { username, password } = req.body;
    try {
        console.log("Username inputted:", username); // Log the inputted username
        console.log("Password inputted:", password); // Log the inputted password

        // Fetch all trainers from the database
        const allTrainers = await pool.query('SELECT * FROM trainers');
        console.log("All Trainers:", allTrainers.rows); // Output all trainers to the console

        // Check if the provided username exists in the database
        const result = await pool.query('SELECT * FROM trainers WHERE username = $1', [username]);
        if (result.rows.length > 0) {
            const trainer = result.rows[0];
            console.log(trainer);
            console.log("Found trainer in database:", trainer.username); // Log the username of the trainer found
            console.log("Found password:", trainer.loginpass);
            console.log(password == trainer.loginpass);



        if (password == trainer.loginpass) {
                res.json({ success: true, message: "Login successful", trainerId: trainer.id });

            } else {
                res.status(401).json({ success: false, message: "Invalid password" });
            }
        } else {
            res.status(404).json({ success: false, message: "Trainer not found" });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Server error" });
    }
});

module.exports = router;
