document.addEventListener('DOMContentLoaded', async () => {
    try {
        await fetchTrainerData();
    } catch (error) {
        console.error('Failed to initialize trainer data:', error);
        // Implement any user-facing error reporting
    }
});

async function fetchTrainerData() {
    try {
        const trainerResponse = await fetch('/api/auth/current-trainer');
        if (!trainerResponse.ok) throw new Error('Failed to fetch trainer data');
        const trainerData = await trainerResponse.json();
        document.getElementById('trainer-name').textContent = trainerData.trainer.name;

        const membersResponse = await fetch('/api/members');
        if (!membersResponse.ok) throw new Error('Failed to fetch members data');
        const members = await membersResponse.json();
        const memberList = document.getElementById('member-list');
        memberList.innerHTML = '';
        members.forEach(member => {
            const listItem = document.createElement('li');
            listItem.textContent = member.name;
            memberList.appendChild(listItem);
        });

        // Assuming schedule is part of the trainerData object
        const scheduleData = trainerData.schedule;
        const scheduleBody = document.getElementById('schedule-body');
        scheduleBody.innerHTML = '';
        scheduleData.forEach(entry => {
            const row = document.createElement('tr');
            Object.entries(entry).forEach(([day, value]) => {
                if (day !== 'id') {
                    const cell = document.createElement('td');
                    cell.textContent = value;
                    row.appendChild(cell);
                }
            });
            scheduleBody.appendChild(row);
        });
    } catch (error) {
        console.error('Error in fetching data:', error);
        // Implement any user-facing error reporting
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('add-time').addEventListener('click', function() {
        document.getElementById('popup').style.display = 'block';
    });

    document.getElementById('add-session').addEventListener('click', async function() {
        const day = document.getElementById('day').value;
        const startTime = document.getElementById('start-time').value;
        const trainerId = sessionStorage.getItem('trainerId'); // Assuming you store the trainer ID in sessionStorage

        try {
            const response = await fetch('/api/schedule/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ day_of_week: day, time_slot: startTime, trainer_id: trainerId })
            });

            const result = await response.json();
            if (response.ok) {
                console.log('Session Added:', result);
                // Optionally refresh the schedule on the page or just close the popup
                document.getElementById('popup').style.display = 'none';
            } else {
                throw new Error('Failed to add session');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    });

    document.getElementById('close-popup').addEventListener('click', function() {
        document.getElementById('popup').style.display = 'none';
    });
});
