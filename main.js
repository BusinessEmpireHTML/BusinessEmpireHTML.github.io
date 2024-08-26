// main.js

// Variables
let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];
let selectedBusinesses = [];

// Functions
function roundToHundredths(value) {
    return parseFloat(value.toFixed(2));
}

function updateStats() {
    // Round and format cash, hourlyIncome, and clickValue
    document.getElementById('cash-clicker').textContent = roundToHundredths(cash).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('cash-profile').textContent = roundToHundredths(cash).toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById('hourlyIncome-clicker').textContent = roundToHundredths(hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('hourlyIncome-profile').textContent = roundToHundredths(hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById('clickValue').textContent = roundToHundredths(clickValue).toLocaleString(undefined, { minimumFractionDigits: 2 });
}

function earnMoney() {
    cash = roundToHundredths(cash + clickValue);
    clicks++;
    clickValue = roundToHundredths(Math.min(1 + Math.sqrt(clicks) / 10, 100));
    saveProgress();
    updateStats();
}

function saveProgress() {
    localStorage.setItem('cash', cash);
    localStorage.setItem('hourlyIncome', hourlyIncome);
    localStorage.setItem('clickValue', clickValue);
    localStorage.setItem('clicks', clicks);
    localStorage.setItem('lastUpdate', new Date());
    localStorage.setItem('businesses', JSON.stringify(businesses));
}

function loadProgress() {
    cash = parseFloat(localStorage.getItem('cash')) || 0;
    hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
    clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
    clicks = parseInt(localStorage.getItem('clicks')) || 0;
    lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
    businesses = JSON.parse(localStorage.getItem('businesses')) || [];

    // Ensure backward compatibility
    businesses.forEach(business => {
        if (!business.merged) business.merged = false;
    });

    calculateOfflineIncome();
    updateStats();
    renderBusinesses();
}

function calculateOfflineIncome() {
    let now = new Date();
    let diffInMinutes = (now - lastUpdate) / 60000;
    let income = roundToHundredths((hourlyIncome / 60) * diffInMinutes);
    cash = roundToHundredths(cash + income);
    lastUpdate = now;
    saveProgress();
}

function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

function calculateIncome() {
    saveProgress();
    updateStats();
}

// Set intervals for automatic income calculation
setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash = roundToHundredths(cash + minuteIncome);
    calculateIncome();
}, 60000); // 1 minute in milliseconds

// Initialize game on load
window.onload = function() {
    loadProgress();
    openTab('clicker');
    updateStats();
    renderBusinesses();
    calculateOfflineIncome();
};
