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
            upgradeCost: 250, // 50% of base cost
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
            upgradeCost: 6250, // 50% of base cost
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
            income: 6000,
            baseCost: 45000,
            upgradeCost: 22500, // 50% of base cost
            upgradeMultiplier: 1.25,
            maxLevel: 10,
            imageSrc: 'images/LocalShop.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else if (type === 'factory' && cash >= 150000) { // New Factory Business
        cash -= 150000;
        const business = {
            name: 'Factory',
            level: 1,
            income: 15000,
            baseCost: 150000,
            upgradeCost: 75000, // 50% of base cost
            upgradeMultiplier: 1.2,
            maxLevel: 10,
            imageSrc: 'images/Factory.jpg'
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

        // Debugging: Log the image path to the console
        console.log(`Loading image for ${business.name}: ${business.imageSrc}`);
        
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
    if (cash >= business.upgradeCost && business.level < business.maxLevel) {
        cash -= business.upgradeCost;
        hourlyIncome -= business.income;
        business.level += 1;
        business.income *= business.upgradeMultiplier;
        business.upgradeCost *= 1.15; // Increase upgrade cost by 15% per level
        hourlyIncome += business.income;
        saveProgress();
        updateStats();
        renderBusinesses();
        closeUpgradeBusinessPopup();
    } else {
        alert('Not enough cash or max level reached!');
    }
}

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
    document.getElementById('upgrade-button').disabled = cash < business.upgradeCost;


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
