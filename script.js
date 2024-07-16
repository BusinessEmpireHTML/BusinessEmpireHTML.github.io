let cash = 10000;
let hourlyIncome = 0;

function updateStats() {
    document.getElementById('cash').textContent = cash;
    document.getElementById('hourlyIncome').textContent = hourlyIncome;
}

function buyBusiness(type) {
    if (type === 'retail' && cash >= 5000) {
        cash -= 5000;
        hourlyIncome += 60; // $60 per hour
    } else if (type === 'restaurant' && cash >= 10000) {
        cash -= 10000;
        hourlyIncome += 150; // $150 per hour
    } else {
        alert('Not enough cash!');
    }
    updateStats();
}

function invest(type) {
    if (type === 'stock' && cash >= 2000) {
        cash -= 2000;
        hourlyIncome += 50; // $50 per hour
    } else if (type === 'realEstate' && cash >= 8000) {
        cash -= 8000;
        hourlyIncome += 120; // $120 per hour
    } else {
        alert('Not enough cash!');
    }
    updateStats();
}

// Calculate income every minute
setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash += minuteIncome;
    updateStats();
}, 60000); // 60000 milliseconds = 1 minute

updateStats();
