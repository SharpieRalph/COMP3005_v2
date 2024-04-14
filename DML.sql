-- Insert equipment records into the Equipment table
INSERT INTO Equipment (name, last_maintenance) VALUES ('Treadmill 1', '2024-03-15');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Elliptical 1', '2024-03-20');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Stationary Bike 1', '2024-03-25');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Rowing Machine 1', '2024-03-30');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Leg Press Machine', '2024-04-01');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Smith Machine', '2024-04-05');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Cable Crossover Machine', '2024-04-10');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Treadmill 2', '2024-03-17');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Elliptical 2', '2024-03-22');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Stationary Bike 2', '2024-03-27');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Rowing Machine 2', '2024-04-02');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Dumbbell Set', '2024-04-07');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Barbell Set', '2024-04-12');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Bench Press', '2024-03-19');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Power Rack', '2024-03-24');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Leg Curl Machine', '2024-03-29');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Lat Pulldown Machine', '2024-04-03');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Peck Deck Machine', '2024-04-08');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Hyperextension Bench', '2024-04-13');
INSERT INTO Equipment (name, last_maintenance) VALUES ('Medicine Balls', '2024-04-18');


--Insert rooms
INSERT INTO Room (RoomName) VALUES ('Cycling');
INSERT INTO Room (RoomName) VALUES ('Yoga');
INSERT INTO Room (RoomName) VALUES ('Pilates');
INSERT INTO Room (RoomName) VALUES ('Pool');
INSERT INTO Room (RoomName) VALUES ('Zumba');


-- Insert fitness classes
INSERT INTO GroupFitness (ClassName, StartTime, EndTime, RoomID) VALUES
('Morning Cycling', '2024-04-01 06:00:00', '2024-04-01 07:00:00', 1),
('Evening Yoga', '2024-04-01 18:00:00', '2024-04-01 19:30:00', 2),
('Afternoon Pilates', '2024-04-01 12:00:00', '2024-04-01 13:00:00', 3),
('Lunchtime Yoga', '2024-04-02 12:00:00', '2024-04-02 13:00:00', 2),
('Early Bird Swimming', '2024-04-01 05:00:00', '2024-04-01 06:00:00', 4), -- Assuming RoomID 4 is a Pool
('Nighttime Zumba', '2024-04-01 20:00:00', '2024-04-01 21:00:00', 5); -- Assuming RoomID 5 is a Multi-purpose Room

-- Upload members
INSERT INTO UserProfiles (username, password, height, weight, goal1, goal2, goal3) VALUES
    ('john_doe', 'password123', 180, 75, 'Lose weight', 'Improve fitness', 'Eat healthier'),
    ('jane_smith', 'abc123', 165, 60, 'Build muscle', 'Improve flexibility', 'Increase endurance'),
    ('sam_wilson', 'sammy456', 175, 70, 'Train for marathon', 'Improve cardiovascular health', 'Stay active'),
    ('emily_jones', 'password456', 160, 55, 'Gain strength', 'Improve posture', 'Reduce stress');
