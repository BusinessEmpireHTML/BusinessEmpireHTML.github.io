let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];

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
            maxLevel: 15,
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
            maxLevel: 20,
            imageSrc: 'images/Factory.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else if (type === 'legalClinic' && cash >= 200000) {
        cash -= 200000;
        const business = {
            name: 'Legal Clinic',
            level: 1,
            income: 12000,
            baseCost: 200000,
            upgradeCost: 100000, // 50% of base cost
            upgradeMultiplier: 1.1,
            maxLevel: 10,
            imageSrc: 'images/LegalClinic.jpg'
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
        businessInfo.innerHTML = `<strong>${business.name}</strong><br>$${roundToHundredths(business.income).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour`;

        businessDiv.appendChild(businessImg);
        businessDiv.appendChild(businessInfo);
        businessDiv.onclick = () => openUpgradeBusinessPopup(index);

        businessList.appendChild(businessDiv);
    });
}



function upgradeBusiness(index) {
    const business = businesses[index];
    if (cash >= business.upgradeCost && business.level < business.maxLevel) {
        cash = roundToHundredths(cash - business.upgradeCost);
        hourlyIncome = roundToHundredths(hourlyIncome - business.income);
        business.level += 1;
        business.income = roundToHundredths(business.income * business.upgradeMultiplier);
        business.upgradeCost = roundToHundredths(business.upgradeCost * 1.15);
        hourlyIncome = roundToHundredths(hourlyIncome + business.income);
        saveProgress();
        updateStats();
        renderBusinesses();
        closeUpgradeBusinessPopup();
    } else {
        alert('Not enough cash or max level reached!');
    }
}

function openUpgradeBusinessPopup(index) {
    const business = businesses[index];
    document.getElementById('business-name').textContent = business.name;
    document.getElementById('business-level').textContent = business.level;
    document.getElementById('business-income').textContent = roundToHundredths(business.income).toLocaleString(undefined, { minimumFractionDigits: 2 });

    // Check if the business is at max level
    if (business.level >= business.maxLevel) {
        document.getElementById('business-upgrade-cost').textContent = 'MAX';
        document.getElementById('upgrade-button').disabled = true;
        document.getElementById('upgrade-button').style.backgroundColor = 'grey';
    } else {
        document.getElementById('business-upgrade-cost').textContent = roundToHundredths(business.upgradeCost).toLocaleString(undefined, { minimumFractionDigits: 2 });
        document.getElementById('upgrade-button').disabled = cash < business.upgradeCost;
        document.getElementById('upgrade-button').style.backgroundColor = cash >= business.upgradeCost ? 'blue' : 'grey';
    }

    document.getElementById('upgrade-button').setAttribute('onclick', `upgradeBusiness(${index})`);
    document.getElementById('close-button').setAttribute('onclick', `closeBusiness(${index})`);
    document.getElementById('upgrade-business-popup').style.display = 'block';
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




function calculateIncome() {
    saveProgress();
    updateStats();
}

setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash = roundToHundredths(cash + minuteIncome);
    calculateIncome();
}, 60000);

calculateOfflineIncome();
openTab('clicker');
updateStats();
renderBusinesses();