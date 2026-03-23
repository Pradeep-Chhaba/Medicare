document.addEventListener('DOMContentLoaded', async () => {
    // Verify session
    const res = await fetch('/api/session');
    const data = await res.json();
    if (!data.success) {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('welcomeMsg').innerText = `Welcome, ${data.username} 👋`;

    const dashboardCard = document.getElementById('dashboardCard');
    const addMedicineCard = document.getElementById('addMedicineCard');
    const viewMedicineCard = document.getElementById('viewMedicineCard');
    const caregiverCard = document.getElementById('caregiverCard');
    const reportsCard = document.getElementById('reportsCard');

    const showCard = (card) => {
        dashboardCard.style.display = 'none';
        addMedicineCard.style.display = 'none';
        viewMedicineCard.style.display = 'none';
        caregiverCard.style.display = 'none';
        reportsCard.style.display = 'none';
        card.style.display = 'block';
    };

    document.getElementById('showAddBtn').addEventListener('click', () => {
        showCard(addMedicineCard);
    });

    document.getElementById('showViewBtn').addEventListener('click', async () => {
        showCard(viewMedicineCard);
        await loadMedicines();
    });

    document.getElementById('showCaregiverBtn').addEventListener('click', async () => {
        showCard(caregiverCard);
        await loadCaregiverAdherence();
    });

    document.getElementById('showReportsBtn').addEventListener('click', async () => {
        showCard(reportsCard);
        await loadReports();
    });

    document.querySelectorAll('.backBtn').forEach(btn => {
        btn.addEventListener('click', () => {
            showCard(dashboardCard);
        });
    });

    document.getElementById('logoutBtn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = 'login.html';
    });

    document.getElementById('addMedicineForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            medicine: document.getElementById('medName').value,
            dosage: document.getElementById('medDosage').value,
            time: document.getElementById('medTime').value,
            expiry: document.getElementById('medExpiry').value
        };

        const res = await fetch('/api/medicines', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const result = await res.json();
        if (result.success) {
            alert('Medicine saved!');
            document.getElementById('addMedicineForm').reset();
            showCard(viewMedicineCard);
            await loadMedicines();
        } else {
            alert('Error saving medicine.');
        }
    });

    // Global medicines array for reminders
    let userMedicines = [];

    async function loadMedicines() {
        const listDiv = document.getElementById('medicinesList');
        listDiv.innerHTML = '<p>Loading...</p>';
        try {
            const res = await fetch('/api/medicines');
            const data = await res.json();
            if (data.success) {
                userMedicines = data.medicines; // Refresh for reminders

                if (data.medicines.length === 0) {
                    listDiv.innerHTML = '<p>No medicines found.</p>';
                    return;
                }

                let today = new Date();
                let tableHtml = '';

                data.medicines.forEach(m => {
                    let expiryDate = new Date(m.expiry_date);
                    let diffTime = expiryDate - today;
                    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    let expiryAlert = '';

                    if (diffDays <= 7 && diffDays >= 0) {
                        expiryAlert = `<span style="color:#dc3545; font-weight:bold; font-size: 0.9em; margin-left: 5px;">(Expiring Soon!)</span>`;
                    } else if (diffDays < 0) {
                        expiryAlert = `<span style="color:#dc3545; font-weight:bold; font-size: 0.9em; margin-left: 5px;">(Expired!)</span>`;
                    }

                    tableHtml += `
                        <p style="flex-direction:column; align-items:flex-start; gap: 5px; border-bottom: 1px solid #ccc; padding-bottom:10px;">
                            <strong>${m.medicine_name} ${expiryAlert}</strong>
                            <span>Dosage: ${m.dosage} | Time: ${m.schedule_time} | Expiry: ${m.expiry_date.substring(0, 10)}</span>
                        </p>
                    `;
                });
                listDiv.innerHTML = tableHtml;
            }
        } catch (e) {
            console.error(e);
            listDiv.innerHTML = '<p>Error loading.</p>';
        }
    }

    // Call loadMedicines initially just to populate userMedicines in the background smoothly
    // so reminders can pick them up even before viewing the "Your Medicines" card
    fetch('/api/medicines').then(r => r.json()).then(data => {
        if (data.success) { userMedicines = data.medicines; }
    });

    // Reminder Notification System
    let currentReminderMedId = null;
    let lastCheckedMinute = null;

    setInterval(() => {
        if (!userMedicines || userMedicines.length === 0) return;
        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, '0');
        const currentMinutes = String(now.getMinutes()).padStart(2, '0');
        const currentTime = `${currentHours}:${currentMinutes}`;

        if (lastCheckedMinute === currentTime) return; // Prevent multiple popups for the same minute
        lastCheckedMinute = currentTime;

        // Check if any medicine is scheduled for this minute
        const medToTake = userMedicines.find(m => m.schedule_time.substring(0, 5) === currentTime);
        if (medToTake) {
            currentReminderMedId = medToTake.id;
            document.getElementById('reminderMedName').innerText = `Time to take ${medToTake.medicine_name}!`;
            document.getElementById('reminderPopup').style.display = 'flex';
        }
    }, 10000); // Check every 10 seconds to not miss the minute boundary

    async function logMedicine(status) {
        if (!currentReminderMedId) return;
        try {
            await fetch('/api/medicines/log', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ medicine_id: currentReminderMedId, status })
            });
            document.getElementById('reminderPopup').style.display = 'none';
            currentReminderMedId = null;
        } catch (e) { console.error('Failed to log medicine'); }
    }

    document.getElementById('btnTaken').addEventListener('click', () => logMedicine('Taken'));
    document.getElementById('btnMissed').addEventListener('click', () => logMedicine('Missed'));
    document.getElementById('btnDismissPopup').addEventListener('click', () => {
        document.getElementById('reminderPopup').style.display = 'none';
        currentReminderMedId = null;
    });

    async function loadCaregiverAdherence() {
        const res = await fetch('/api/medicines/adherence');
        const data = await res.json();
        const statusDiv = document.getElementById('adherenceStatus');
        if (data.success) {
            let color = 'red';
            if (data.adherence > 75) color = 'green';
            else if (data.adherence > 50) color = 'orange';

            statusDiv.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h3>Patient Adherence</h3>
                    <div style="font-size: 48px; font-weight: bold; color: ${color};">
                        ${data.adherence}%
                    </div>
                    <p style="border:none;background:none;justify-content:center;">Total Doses Tracked: <strong>${data.total}</strong></p>
                </div>
            `;
        } else {
            statusDiv.innerHTML = '<p>Failed to load data.</p>';
        }
    }

    async function loadReports() {
        const listDiv = document.getElementById('historyList');
        listDiv.innerHTML = '<p>Loading...</p>';
        try {
            const res = await fetch('/api/medicines/history');
            const data = await res.json();
            if (data.success) {
                if (data.history.length === 0) {
                    listDiv.innerHTML = '<p>No history found.</p>';
                    return;
                }
                listDiv.innerHTML = data.history.map(h => {
                    const statusColor = h.status === 'Taken' ? 'green' : 'red';
                    return `
                    <p style="flex-direction:row; justify-content:space-between; border-bottom: 1px solid #ccc; padding: 10px 0;">
                        <span><strong>${h.medicine_name}</strong> - ${new Date(h.action_time).toLocaleString()}</span>
                        <strong style="color: ${statusColor}">${h.status}</strong>
                    </p>`;
                }).join('');
            } else {
                listDiv.innerHTML = '<p>Failed to load data from server. Please ensure the backend is restarted.</p>';
            }
        } catch (e) {
            console.error(e);
            listDiv.innerHTML = '<p>Error loading</p>';
        }
    }
});
