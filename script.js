let cash = 10000;
let hourlyIncome = 0;

function updateStats() {
    document.getElementById('cash').textContent = cash;
    document.getElementById('hourlyIncome').textContent = hourlyIncome;
}

function buyBusiness(type) {
    if (type === 'retail' && cash >= 5000) {
        cash -= 5000;
        hourlyIncome += 100;
    } else if (type === 'restaurant' && cash >= 10000) {
        cash -= 10000;
        hourlyIncome += 250;
    } else {
        alert('Not enough cash!');
    }
    updateStats();
}

function invest(type) {
    if (type === 'stock' && cash >= 2000) {
        cash -= 2000;
        hourlyIncome += 50;
    } else if (type === 'realEstate' && cash >= 8000) {
        cash -= 8000;
        hourlyIncome += 200;
    } else {
        alert('Not enough cash!');
    }
    updateStats();
}

setInterval(() => {
    cash += hourlyIncome;
    updateStats();
}, 3600000); // Simulate hourly income
