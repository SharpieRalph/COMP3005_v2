require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const { Pool } = require('pg');
const authRoutes = require('./auth');
const scheduleRouter =  require('./schedule');
const port = process.env.PORT || 4000;

const pool = require('./db');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.send('Testing');
});

app.get('/trainer-login', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'trainer-login.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
});

app.get('/admin/billing', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin-billing.html'));
});

app.get('/admin/equipment', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin-equipment.html'));
});

app.get('/admin/room', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin-room.html'));
});

app.get('/admin/schedule', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin-schedule.html'));
});

app.get('/trainer-page',(req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'trainer-page.html'));
});

// Assuming you have express and pool already set up
// Route to fetch members based on username start
app.get('/api/members', async (req, res) => {
    const { username } = req.query; // Directly get the username parameter
    try {
        let query = 'SELECT * FROM UserProfiles';
        const values = [];

        // Add a WHERE clause if the username query parameter is provided
        if (username) {
            query += ' WHERE username LIKE $1';
            values.push(`${username}%`); // Correctly use the username to filter, assuming you want partial matches
        }

        const result = await pool.query(query, values);
        res.json(result.rows); // Send back the query results
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// Use the authRoutes for handling authentication requests
app.use('/api/auth', authRoutes);

app.post('/api/schedule/check', async (req, res) => {
    try {
        const { day, startTime } = req.body;
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM schedules WHERE day_of_week = $1 AND time_slot >= $2 AND time_slot <= $3', [day, new Date(`2000-01-01T${startTime}:00Z`), new Date(`2000-01-01T${startTime}:00Z`)]);
        const sessions = result.rows;
        client.release();
        res.json(sessions);
    } catch (error) {
        console.error('Error checking schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/schedule/add', async (req, res) => {
    try {
        const { day, startTime } = req.body;
        const client = await pool.connect();
        await client.query('INSERT INTO schedules (day_of_week, time_slot) VALUES ($1, $2)', [day, new Date(`2000-01-01T${startTime}:00Z`)]);
        client.release();
        res.sendStatus(200);
    } catch (error) {
        console.error('Error adding session:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/schedule/trainer/:trainerId', async (req, res) => {
    const { trainerId } = req.params;

    try {
        // Query the database to retrieve the schedule for the specified trainerId
        // Adjust this query based on your database schema
        const schedule = await pool.query(
            'SELECT * FROM schedules WHERE trainer_id = $1',
            [trainerId]
        );

        // Return the schedule as a JSON response
        res.json(schedule.rows);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        // If there's an error, send a 500 Internal Server Error response
        res.status(500).json({ success: false, message: 'Server error.' });
    }
});


app.get('/api/schedules', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM schedules ORDER BY day_of_week, time_slot');
        const schedule = result.rows;
        client.release();
        res.json(schedule);
    } catch (error) {
        console.error('Error fetching schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/api/trainer/:trainerId', async (req, res) => {
  const { trainerId } = req.params;

  try {
    // Query the database to get the trainer's name based on ID
    const query = 'SELECT name FROM trainers WHERE id = $1';
    const result = await pool.query(query, [trainerId]);

    if (result.rows.length === 0) {
      // If no trainer with the given ID is found, return a 404 response
      return res.status(404).json({ error: 'Trainer not found' });
    }

    // Extract the trainer's name from the query result
    const trainerName = result.rows[0].name;

    // Send the trainer's name as a JSON response
    res.json({ trainerName });
  } catch (error) {
    // If an error occurs during database query or processing, return a 500 response
    console.error('Error fetching trainer name:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assuming Express and a pool from 'pg' module is already set up
app.post('/api/schedule/add', async (req, res) => {
    const { day_of_week, time_slot, trainer_id } = req.body;

    try {
        const result = await pool.query(
            'INSERT INTO schedules (day_of_week, time_slot, trainer_id) VALUES ($1, $2, $3) RETURNING *',
            [day_of_week, time_slot, trainer_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Failed to add session:', err);
        res.status(500).json({ message: 'Error adding session to the database' });
    }
});
app.use('/api/schedule', scheduleRouter);


// User side
// Serve Sign-In form
app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'user-page.html'));
});

// Serve Sign-Up form
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'user-signup.html'));
});


//Serve user main menu
app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'user-menu.html'));
});
// Handle login form submission

app.post('/submit-your-login-form', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if the username and password match a user in the database
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM UserProfiles WHERE username = $1 AND password = $2', [username, password]);
        client.release();

        if (result.rows.length > 0) {
            const user = result.rows[0].user_id;
            // If login is successful, send user ID along with success message
            res.json({ success: true, message: "Login successful", userId: user });
        } else {
            // If login fails, send a response indicating authentication failure
            res.status(401).send('Authentication failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/api/check-username', async (req, res) => {
    const { username } = req.body;

    try {
        // Check if the username already exists in the database
        const result = await pool.query('SELECT * FROM UserProfiles WHERE username = $1', [username]);

        // If a row with the given username exists, return username not available
        if (result.rows.length > 0) {
            return res.status(400).json({ message: 'Username not available, please select another username.' });
        } else {
            // If the username is available, return success
            return res.status(200).json({ message: 'Username is available.' });
        }
    } catch (error) {
        console.error('Error checking username availability:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/signup', async (req, res) => {
    const { username, password, confirm_password, height, weight, goal1 } = req.body;
    console.log(req.body);

    // Simple validation
    if (!username || !password || !height || !weight || !goal1) {
        console.log(username);
        console.log(password);
        console.log(height);
        console.log(weight);
        console.log(goal1);
        return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match.' });
    }

    try {
        const client = await pool.connect();

        // Check if username already exists
        const userExists = await client.query('SELECT * FROM UserProfiles WHERE username = $1', [username]);
        if (userExists.rows.length > 0) {
            client.release();
            return res.status(400).json({ message: 'Username already exists.' });
        }

        // Insert new user into the database
        const newUser = await client.query(
            'INSERT INTO UserProfiles (username, password, height, weight, goal1) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [username, password, height, weight, goal1]
        );

        client.release();

        // Redirect user to their page
        return res.status(200).json({ message: 'Successful registration' });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Failed to register user.' });
    }
});


app.get('/api/user/profile/:userId', async (req, res) => {
    const { userId } = req.params; // Retrieve userId from request parameters

    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM UserProfiles WHERE user_id = $1', [userId]);
        const userProfile = result.rows[0];
        client.release();
        res.json(userProfile);
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




// Update user profile
app.put('/api/user/profile/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { password, height, weight, goal1, goal2, goal3 } = req.body;

    try {
        const client = await pool.connect();
        const result = await client.query(
            'UPDATE UserProfiles SET password = $1, height = $2, weight = $3, goal1 = $4, goal2 = $5, goal3 = $6 WHERE user_id = $7',
            [password, height, weight, goal1, goal2, goal3, userId]
        );
        client.release();

        // Check if the query was successful
        if (result.rowCount > 0) {
            res.status(200).json({ success: true, message: 'Profile updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'User not found or no changes made' });
        }
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Handle adding achievements
app.post('/api/user/achievements/:userId', async (req, res) => {
    const { userId } = req.params;
    const { achievement } = req.body;

    try {
        // Insert the achievement into the database
        const result = await pool.query(
            'INSERT INTO achievements (user_id, achievement) VALUES ($1, $2) RETURNING *',
            [userId, achievement]
        );

        // Send success response with the added achievement
        res.status(201).json({
            success: true,
            achievement: result.rows[0],
        });
    } catch (error) {
        console.error('Error adding achievement:', error);
        res.status(500).json({ success: false, message: 'Failed to add achievement' });
    }
});


app.get('/api/user/achievements/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        // Query the database to retrieve achievements for the specified user
        const result = await pool.query(
            'SELECT * FROM achievements WHERE user_id = $1',
            [userId]
        );

        // Send the achievements as a JSON response
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching user achievements:', error);
        // If an error occurs, send a 500 Internal Server Error response
        res.status(500).json({ success: false, message: 'Failed to fetch achievements' });
    }
});

// Assuming you have already set up your Express app and connected it to your database

// PUT route to update the member_id of a schedule
app.put('/api/schedule/:id', async (req, res) => {
    const scheduleId = req.params.id;
    const userId = req.body.userId; // Assuming the userId is sent in the request body

    try {
        const client = await pool.connect();

        // Check if the schedule exists
        const checkQuery = 'SELECT * FROM schedules WHERE id = $1';
        const checkResult = await client.query(checkQuery, [scheduleId]);
        const existingSchedule = checkResult.rows[0];
        if (!existingSchedule) {
            client.release();
            return res.status(404).json({ error: 'Schedule not found' });
        }

        // Update the member_id of the schedule
        const updateQuery = 'UPDATE schedules SET member_id = $1 WHERE id = $2';
        await client.query(updateQuery, [userId, scheduleId]);

        client.release();
        res.sendStatus(200); // Send success response
    } catch (error) {
        console.error('Error updating schedule:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Equipment
// API Endpoint to get all equipment
app.get('/api/equipment', async (req, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id, name, last_maintenance, last_maintenance + INTERVAL \'1 month\' AS next_maintenance FROM Equipment');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching equipment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to add new equipment
app.post('/api/equipment', async (req, res) => {
    const { name, last_maintenance } = req.body;
    try {
        const client = await pool.connect();
        const query = 'INSERT INTO Equipment (name, last_maintenance) VALUES ($1, $2) RETURNING *';
        const result = await client.query(query, [name, last_maintenance]);
        client.release();
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding equipment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to update equipment
app.put('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    const { name, last_maintenance } = req.body;
    try {
        const client = await pool.connect();
        const query = 'UPDATE Equipment SET name = $1, last_maintenance = $2 WHERE id = $3 RETURNING *';
        const result = await client.query(query, [name, last_maintenance, id]);
        client.release();
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        console.error('Error updating equipment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// API Endpoint to delete equipment
app.delete('/api/equipment/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const client = await pool.connect();
        const query = 'DELETE FROM Equipment WHERE id = $1 RETURNING *';
        const result = await client.query(query, [id]);
        client.release();
        if (result.rows.length > 0) {
            res.json({ message: 'Equipment deleted successfully' });
        } else {
            res.status(404).json({ message: 'Equipment not found' });
        }
    } catch (error) {
        console.error('Error deleting equipment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get all rooms
app.get('/api/rooms', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Room ORDER BY RoomID');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching rooms:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Add a new room
app.post('/api/rooms', async (req, res) => {
    const { roomName } = req.body;
    try {
        const result = await pool.query('INSERT INTO Room (RoomName) VALUES ($1) RETURNING *', [roomName]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding room:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Create a new Group Fitness Class
app.post('/api/groupfitness', async (req, res) => {
    const { className, startTime, endTime, roomID } = req.body;

    // Validate the input
    if (!className || !startTime || !endTime || !roomID) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format the dates or validate them
    if (isNaN(new Date(startTime).getTime()) || isNaN(new Date(endTime).getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
    }

    try {
        const result = await pool.query(
            'INSERT INTO GroupFitness (ClassName, StartTime, EndTime, RoomID) VALUES ($1, $2, $3, $4) RETURNING *',
            [className, startTime, endTime, roomID]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error adding group fitness class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


//Get all group classes
app.get('/api/groupfitness', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM GroupFitness ORDER BY StartTime');

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching group fitness classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Update a Group Fitness Class
app.put('/api/groupfitness/:id', async (req, res) => {
    const { id } = req.params;
    const { className, startTime, endTime, roomID } = req.body;
    try {
        const result = await pool.query(
            'UPDATE GroupFitness SET ClassName = $1, StartTime = $2, EndTime = $3, RoomID = $4 WHERE GroupFitnessID = $5 RETURNING *',
            [className, startTime, endTime, roomID, id]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).json({ message: 'Group Fitness class not found' });
        }
    } catch (error) {
        console.error('Error updating group fitness class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Delete a Group Fitness Class
app.delete('/api/groupfitness/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM GroupFitness WHERE GroupFitnessID = $1 RETURNING *', [id]);
        if (result.rows.length > 0) {
            res.json({ message: 'Group Fitness class deleted successfully' });
        } else {
            res.status(404).json({ message: 'Group Fitness class not found' });
        }
    } catch (error) {
        console.error('Error deleting group fitness class:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// Delete a time slot from the schedule
app.delete('/api/schedule/delete-session', async (req, res) => {
    const { dayOfWeek, timeSlot } = req.body;
    try {
        const query = 'DELETE FROM schedules WHERE day_of_week = $1 AND time_slot = $2';

        const values = [dayOfWeek, timeSlot];

        // Execute the DELETE query
        const result = await pool.query(query, values);

        if (result.rowCount > 0) {
            // If one or more rows are affected, respond with success
            res.json({ success: true, message: 'Time slot deleted successfully' });
        } else {
            // If no rows are affected, respond with a not found message
            res.status(404).json({ success: false, message: 'Time slot not found' });
        }
    } catch (error) {
        console.error('Error deleting time slot:', error);
        // If an error occurs, respond with an error message
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// API endpoint to get available group fitness classes
app.get('/api/groupfitness/registered/:userId', async (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT gf.GroupFitnessID, gf.ClassName, gf.StartTime, gf.EndTime, gf.RoomID
        FROM GroupFitness gf
        JOIN GroupFitnessMembers gfm ON gf.GroupFitnessID = gfm.GroupFitnessID
        WHERE gfm.MemberID = $1;
    `;

    try {
        const client = await pool.connect();
        const result = await client.query(query, [userId]);
        client.release();

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching registered classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.get('/api/groupfitness/non-registered/:userId', async (req, res) => {
    const userId = parseInt(req.params.userId);
    const query = `
        SELECT gf.GroupFitnessID, gf.ClassName, gf.StartTime, gf.EndTime, gf.RoomID
        FROM GroupFitness gf
        LEFT JOIN GroupFitnessMembers gfm ON gf.GroupFitnessID = gfm.GroupFitnessID AND gfm.MemberID = $1
        WHERE gfm.MemberID IS NULL;
    `;

    try {
        const client = await pool.connect();
        const result = await client.query(query, [userId]);
        client.release();

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching non-registered classes:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post('/api/groupfitness/register/:groupId/:userId', async (req, res) => {
    const { groupId, userId } = req.params;

    try {
        const client = await pool.connect();

        // Example SQL statement, adjust accordingly
        const insertQuery = `
            INSERT INTO GroupFitnessMembers (GroupFitnessID, MemberID)
            VALUES ($1, $2)
            ON CONFLICT (GroupFitnessID, MemberID) DO NOTHING;
        `;

        // Log the query to see exactly what is being executed
        console.log("Executing SQL:", insertQuery);
        console.log("Parameters:", [groupId, userId]);

        await client.query(insertQuery, [groupId, userId]);
        client.release();

        res.status(201).json({ message: 'User registered successfully for the class.' });
    } catch (error) {
        console.error('Failed to register user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get group classses happening in room with roomID
app.get('/api/groupfitness/classes/:roomID', async (req, res) => {
    const { roomID } = req.params; // Get the roomID from the route parameter

    try {
        let query = `SELECT ClassName, StartTime, EndTime, RoomID FROM GroupFitness WHERE RoomID = $1`;
        const values = [roomID]; // Use roomID as a parameter to avoid SQL injection

        const result = await pool.query(query, values);

        if (result.rows.length > 0) {
            res.json(result.rows); // Send back the results if classes are found
        } else {
            res.status(404).json({ message: 'No fitness classes found for the specified room.' });
        }
    } catch (error) {
        console.error('Error fetching fitness classes for the room:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});

//Give back number of personal training session and group session that all user have
app.get('/api/user-training-sessions', async (req, res) => {
    try {
        const query = `
            SELECT up.user_id, up.username,
                COUNT(DISTINCT st.id) AS personal_training_sessions,
                COUNT(DISTINCT gf.GroupFitnessID) AS group_fitness_classes
            FROM UserProfiles up
            LEFT JOIN schedules st ON up.user_id = st.member_id
            LEFT JOIN GroupFitnessMembers gfm ON up.user_id = gfm.MemberID
            LEFT JOIN GroupFitness gf ON gfm.GroupFitnessID = gf.GroupFitnessID
            GROUP BY up.user_id, up.username
        `;

        const result = await pool.query(query);

        if (result.rows.length > 0) {
            res.json(result.rows); // Send back the results if user training sessions are found
        } else {
            res.status(404).json({ message: 'No user training sessions found.' });
        }
    } catch (error) {
        console.error('Error fetching user training sessions:', error);
        res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});


