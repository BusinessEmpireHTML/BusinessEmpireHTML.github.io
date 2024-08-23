let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];

function updateStats() {
    document.querySelectorAll('#cash').forEach(el => el.textContent = cash.toFixed(2));
    document.getElementById('hourlyIncome').textContent = hourlyIncome.toFixed(2);
    document.getElementById('clickValue').textContent = clickValue.toFixed(2);
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
    localStorage.setItem('businesses', JSON.stringify(businesses.map(b => ({
        ...b,
        upgrading: b.upgrading || false,
        upgradeStartTime: b.upgradeStartTime || null,
        upgradeEndTime: b.upgradeEndTime || null
    }))));
}


function calculateOfflineIncome() {
    let now = Date.now();
    let diffInMinutes = (now - lastUpdate.getTime()) / 60000;
    let income = (hourlyIncome / 60) * diffInMinutes;
    cash += income;

    // Check for any upgrades that should be completed
    businesses.forEach((business, index) => {
        if (business.upgrading && now >= business.upgradeEndTime) {
            completeUpgrade(index);
        }
    });

    lastUpdate = new Date(now);
    saveProgress();
}


function openTab(tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

function openBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'block';
}

function closeBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'none';
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
            income: 100,
            baseCost: 500,
            upgradeCost: 500 * 0.5,
            upgradeMultiplier: 1.5,
            maxLevel: 10,
            imageSrc: 'images/LemonadeStand.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else if (type === 'carWash' && cash >= 12500) {
        cash -= 12500;
        const business = {
            name: 'Car Wash',
            level: 1,
            income: 4000,
            baseCost: 12500,
            upgradeCost: 12500 * 0.5,
            upgradeMultiplier: 1.25,
            maxLevel: 10,
            imageSrc: 'images/CarWash.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else if (type === 'localShop' && cash >= 45000) {
        cash -= 45000;
        const business = {
            name: 'Local Shop',
            level: 1,
            income: 32500,
            baseCost: 45000,
            upgradeCost: 45000 * 0.5,
            upgradeMultiplier: 1.25,
            maxLevel: 10,
            imageSrc: 'images/LocalShop.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else {
        alert('Not enough cash!');
        return;
    }
    saveProgress();
    updateStats();
    renderBusinesses();
    closeBuyBusinessPopup();
}

function renderBusinesses() {
    const businessList = document.getElementById('business-list');
    businessList.innerHTML = '';
    businesses.forEach((business, index) => {
        const businessDiv = document.createElement('div');
        businessDiv.className = 'business-card';
        
        const businessImg = document.createElement('img');
        businessImg.src = business.imageSrc;
        businessImg.alt = `${business.name} Image`;
        businessImg.className = 'business-image';
        
        const businessInfo = document.createElement('div');
        businessInfo.className = 'business-info';
        businessInfo.innerHTML = `<strong>${business.name}</strong><br>$${business.income.toFixed(2)} per hour`;
        
        businessDiv.appendChild(businessImg);
        businessDiv.appendChild(businessInfo);
        businessDiv.onclick = () => openUpgradeBusinessPopup(index);
        
        businessList.appendChild(businessDiv);
    });
}


function upgradeBusiness(index) {
    const business = businesses[index];
    
    // Check if the business is eligible for an upgrade
    if (business.upgrading) {
        alert('This business is already being upgraded!');
        return;
    }

    if (cash >= business.upgradeCost && business.level < business.maxLevel) {
        cash -= business.upgradeCost;
        business.upgrading = true; // Mark the business as being upgraded
        saveProgress();
        updateStats();
        renderBusinesses();

        // Set upgrade time based on business type
        let upgradeTime; // in milliseconds
        if (business.name === 'Lemonade Stand') {
            upgradeTime = 30 * 60 * 1000; // 30 minutes
        } else if (business.name === 'Car Wash') {
            upgradeTime = 60 * 60 * 1000; // 1 hour
        } else if (business.name === 'Local Shop') {
            upgradeTime = 120 * 60 * 1000; // 2 hours
        }

        // Save the upgrade start time
        business.upgradeStartTime = Date.now();
        business.upgradeEndTime = business.upgradeStartTime + upgradeTime;

        // Update the localStorage
        saveProgress();

        // Schedule the upgrade completion
        setTimeout(() => completeUpgrade(index), upgradeTime);
    } else {
        alert('Not enough cash or max level reached!');
    }
}

// New function to complete the upgrade
function completeUpgrade(index) {
    const business = businesses[index];
    if (!business.upgrading) return; // If the business is not upgrading, do nothing

    business.upgrading = false; // Mark the business as not upgrading
    business.level += 1;
    business.income *= business.upgradeMultiplier;
    business.upgradeCost = business.baseCost * 0.5 * Math.pow(1.2, business.level - 1);

    hourlyIncome = businesses.reduce((total, b) => total + b.income, 0);

    saveProgress();
    updateStats();
    renderBusinesses();
}

// When loading the game, check if any upgrades need to be completed
function checkUpgradeCompletion() {
    const now = Date.now();
    businesses.forEach((business, index) => {
        if (business.upgrading && now >= business.upgradeEndTime) {
            completeUpgrade(index);
        }
    });
}

// Call this function on game load
checkUpgradeCompletion();


function closeBusiness(index) {
    const business = businesses[index];
    if (confirm(`Are you sure you want to close the ${business.name}?`)) {
        hourlyIncome -= business.income;
        businesses.splice(index, 1);
        saveProgress();
        updateStats();
        renderBusinesses();
        closeUpgradeBusinessPopup();
    }
}

function openUpgradeBusinessPopup(index) {
    const business = businesses[index];
    document.getElementById('business-name').textContent = business.name;
    document.getElementById('business-level').textContent = business.level;
    document.getElementById('business-income').textContent = business.income.toFixed(2);
    document.getElementById('business-upgrade-cost').textContent = business.upgradeCost.toFixed(2);
    document.getElementById('upgrade-button').setAttribute('onclick', `upgradeBusiness(${index})`);
    document.getElementById('close-button').setAttribute('onclick', `closeBusiness(${index})`);
    document.getElementById('upgrade-business-popup').style.display = 'block';

    // Make the upgrade button blue if enough money
    document.getElementById('upgrade-button').style.backgroundColor = cash >= business.upgradeCost ? 'blue' : 'grey';
}



function calculateIncome() {
    saveProgress();
    updateStats();
}

setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash += minuteIncome;
    calculateIncome();
}, 60000);

calculateOfflineIncome();
openTab('clicker');
updateStats();
renderBusinesses();
