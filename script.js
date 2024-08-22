let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];

function updateStats() {
    document.querySelectorAll('#cash').forEach(el => el.textContent = cash.toFixed(2));
    document.getElementById('hourlyIncome').textContent = hourlyIncome.toFixed(2);
    document.getElementById('clickValue').textContent = clickValue.toFixed(2); // Update click value display
}

function earnMoney() {
    cash += clickValue;
    clicks++;
    clickValue = Math.min(1 + Math.sqrt(clicks) / 10, 100);
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

function calculateOfflineIncome() {
    let now = new Date();
    let diffInMinutes = (now - lastUpdate) / 60000;
    let income = (hourlyIncome / 60) * diffInMinutes;
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

function openBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'block';
}

function closeBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'none';
}

function openUpgradeBusinessPopup(index) {
    const business = businesses[index];
    document.getElementById('business-name').textContent = business.name;
    document.getElementById('business-level').textContent = business.level;
    document.getElementById('business-income').textContent = (business.income).toFixed(2);
    document.getElementById('upgrade-button').setAttribute('onclick', `upgradeBusiness(${index})`);
    document.getElementById('upgrade-business-popup').style.display = 'block';
}

function closeUpgradeBusinessPopup() {
    document.getElementById('upgrade-business-popup').style.display = 'none';
}

function buyBusiness(type) {
    if (type === 'lemonadeStand' && cash >= 500) {
        cash -= 500;
        const business = {
            name: 'Lemonade Stand',
            level: 1,
            income: 100
        };
        businesses.push(business);
        hourlyIncome += business.income;
        saveProgress();
        updateStats();
        renderBusinesses();
        closeBuyBusinessPopup();
    } else if (type === 'carWash' && cash >= 12500) {
        cash -= 12500;
        const business = {
            name: 'Car Wash',
            level: 1,
            income: 4000
        };
        businesses.push(business);
        hourlyIncome += business.income;
        saveProgress();
        updateStats();
        renderBusinesses();
        closeBuyBusinessPopup();
    } else {
        alert('Not enough cash!');
    }
}

function upgradeBusiness(index) {
    const business = businesses[index];
    let upgradeCost = 0;
    let incomeIncreaseFactor = 0;

    function buyBusiness(type) {
        if (type === 'lemonadeStand' && cash >= 500) {
            cash -= 500;
            const business = {
                name: 'Lemonade Stand',
                level: 1,
                income: 100
            };
            businesses.push(business);
            hourlyIncome += business.income;
            saveProgress();
            updateStats();
            renderBusinesses();
            closeBuyBusinessPopup();
        } else if (type === 'carWash' && cash >= 12500) {
            cash -= 12500;
            const business = {
                name: 'Car Wash',
                level: 1,
                income: 4000
            };
            businesses.push(business);
            hourlyIncome += business.income;
            saveProgress();
            updateStats();
            renderBusinesses();
            closeBuyBusinessPopup();
        } else {
            alert('Not enough cash!');
        }
    }
    
}

function renderBusinesses() {
    const businessList = document.getElementById('business-list');
    businessList.innerHTML = '';
    businesses.forEach((business, index) => {
        const businessButton = document.createElement('button');
        businessButton.textContent = `${business.name} (Level ${business.level}) - $${business.income.toFixed(2)} per hour`;
        businessButton.onclick = () => openUpgradeBusinessPopup(index);
        businessList.appendChild(businessButton);
    });
}

calculateOfflineIncome();

setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash += minuteIncome;
    saveProgress();
    updateStats();
}, 60000);

openTab('clicker');
updateStats();
renderBusinesses();
