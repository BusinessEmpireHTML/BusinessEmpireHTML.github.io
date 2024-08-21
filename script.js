let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();

function updateStats() {
    document.querySelectorAll('#cash').forEach(el => el.textContent = cash.toFixed(2));
    document.getElementById('hourlyIncome').textContent = hourlyIncome.toFixed(2);
    document.getElementById('clickValue').textContent = clickValue.toFixed(2);
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
        return;
    }
    saveProgress();
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
        return;
    }
    saveProgress();
    updateStats();
}

function earnMoney() {
    cash += clickValue;
    clicks++;
    clickValue = Math.min(1 + Math.sqrt(clicks) / 10, 100); // Increase click value at a slower rate
    saveProgress();
    updateStats();
}

function saveProgress() {
    localStorage.setItem('cash', cash);
    localStorage.setItem('hourlyIncome', hourlyIncome);
    localStorage.setItem('clickValue', clickValue);
    localStorage.setItem('clicks', clicks);
    localStorage.setItem('lastUpdate', new Date());
}

function calculateOfflineIncome() {
    let now = new Date();
    let diffInMinutes = (now - lastUpdate) / 60000; // Difference in minutes
    let income = (hourlyIncome / 60) * diffInMinutes; // Calculate income for the offline period
    cash += income;
    lastUpdate = now;
    saveProgress();
}

function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(tabName).style.display = 'block';
}

calculateOfflineIncome(); // Calculate income from offline period

setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash += minuteIncome;
    saveProgress();
    updateStats();
}, 60000); // 60000 milliseconds = 1 minute

// Show the clicker tab by default
openTab('clicker');
updateStats();
