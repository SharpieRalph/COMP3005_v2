-- Create table for trainers
CREATE TABLE trainers (
	id SERIAL PRIMARY KEY,
    username VARCHAR(255) ,
	loginpass VARCHAR(255),
    name VARCHAR(255)
);


CREATE TABLE UserProfiles (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE,
    password VARCHAR(50),
    height INT,
    weight INT,
    goal1 VARCHAR(100),
    goal2 VARCHAR(100),
    goal3 VARCHAR(100)
);

-- Create table for schedules
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    day_of_week VARCHAR(20),
    time_slot TIME WITHOUT TIME ZONE,
    trainer_id INTEGER REFERENCES trainers(id),
    member_id INTEGER REFERENCES UserProfiles(user_id)
);



CREATE TABLE Achievements (
    user_id INT NOT NULL,
    achievement TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES UserProfiles(user_id)
);


CREATE TABLE Equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_maintenance DATE NOT NULL,
    next_maintenance DATE GENERATED ALWAYS AS (last_maintenance + INTERVAL '1 month') STORED
);


CREATE TABLE Room (
    RoomID SERIAL PRIMARY KEY,     -- Unique serial ID automatically increments
    RoomName varchar(255) NOT NULL -- String to represent the room name
);

CREATE TABLE GroupFitness (
    GroupFitnessID serial PRIMARY KEY,
    ClassName varchar(255) UNIQUE NOT NULL,
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP,
    RoomID int REFERENCES Room(RoomID)
);

CREATE TABLE GroupFitnessMembers (
    GroupFitnessID int REFERENCES GroupFitness(GroupFitnessID),
    MemberID int REFERENCES UserProfiles(user_id),
    PRIMARY KEY (GroupFitnessID, MemberID)
);

