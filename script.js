// Initialization
let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];
let selectedBusinesses = [];

// Utility Functions
const roundToHundredths = value => parseFloat(value.toFixed(2));

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
    businesses.forEach(business => {
        if (!business.merged) business.merged = false;
        if (business.type === 'bank' && !business.currentMoneyInVault) business.currentMoneyInVault = 0;
    });
    calculateOfflineEarnings();
    updateStats();
    renderBusinesses();
    renderMergedBusinesses();
}

function updateStats() {
    const formattedCash = roundToHundredths(cash).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const formattedIncome = roundToHundredths(hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 });
    const formattedClickValue = roundToHundredths(clickValue).toLocaleString(undefined, { minimumFractionDigits: 2 });

    document.getElementById('cash-clicker').textContent = formattedCash;
    document.getElementById('cash-profile').textContent = formattedCash;
    document.getElementById('hourlyIncome-clicker').textContent = formattedIncome;
    document.getElementById('hourlyIncome-profile').textContent = formattedIncome;
    document.getElementById('clickValue').textContent = formattedClickValue;
}

function earnMoney() {
    cash = roundToHundredths(cash + clickValue);
    clicks++;
    clickValue = roundToHundredths(Math.min(1 + Math.sqrt(clicks) / 10, 100));
    saveProgress();
    updateStats();
}

function calculateOfflineEarnings() {
    const lastOnline = localStorage.getItem('lastOnline');
    if (!lastOnline) return;

    const now = Date.now();
    const elapsedTime = now - parseInt(lastOnline, 10);
    const elapsedHours = elapsedTime / (1000 * 60 * 60);
    let totalOfflineIncome = hourlyIncome * elapsedHours;

    cash = roundToHundredths(cash + totalOfflineIncome);

    const bank = businesses.find(business => business.type === 'bank');
    if (bank) {
        let amountNeeded = bank.maxVaultStorage - bank.currentMoneyInVault;
        if (totalOfflineIncome >= amountNeeded) {
            bank.currentMoneyInVault = bank.maxVaultStorage;
        } else {
            bank.currentMoneyInVault += totalOfflineIncome;
        }
        totalOfflineIncome = Math.max(totalOfflineIncome - amountNeeded, 0);
    }

    saveProgress();
}

// Event Listeners
window.addEventListener('beforeunload', () => localStorage.setItem('lastOnline', Date.now()));

// Tab Management
function openTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
    document.getElementById(tabName).style.display = 'block';
}

// Popup Management
function togglePopup(popupId, show = true) {
    document.getElementById(popupId).style.display = show ? 'block' : 'none';
}

// Business Management
function buyBusiness(type) {
    const businessTypes = {
        lemonadeStand: { name: 'Lemonade Stand', baseCost: 500, income: 100, upgradeMultiplier: 1.5, maxLevel: 10, imageSrc: 'images/LemonadeStand.jpg' },
        carWash: { name: 'Car Wash', baseCost: 12500, income: 4000, upgradeMultiplier: 1.25, maxLevel: 10, imageSrc: 'images/CarWash.jpg' },
        localShop: { name: 'Local Shop', baseCost: 45000, income: 6000, upgradeMultiplier: 1.25, maxLevel: 15, imageSrc: 'images/LocalShop.jpg' },
        factory: { name: 'Factory', baseCost: 150000, income: 15000, upgradeMultiplier: 1.2, maxLevel: 20, imageSrc: 'images/Factory.jpg' },
        legalClinic: { name: 'Legal Clinic', baseCost: 200000, income: 12000, upgradeMultiplier: 1.15, maxLevel: 10, imageSrc: 'images/LegalClinic.jpg' },
        bank: { name: 'Bank', baseCost: 10000000, income: 100000, upgradeMultiplier: 1.5, maxLevel: 10, imageSrc: 'images/Bank.jpg', type: 'bank', currentMoneyInVault: 10000000, maxVaultStorage: 10000000 }
    };

    function upgradeBankVault() {
        const bank = businesses.find(business => business.type === 'bank');
        if (bank) {
            const upgradeCost = bank.maxVaultStorage * 0.5; // Example upgrade cost calculation
            if (cash >= upgradeCost && bank.maxVaultStorage < 1000000000) { // Assuming 1 billion is max upgrade
                cash -= upgradeCost;
                bank.maxVaultStorage *= 2; // Example: doubling the storage capacity with each upgrade
                saveProgress();
                updateStats();
                renderBusinesses(); // Update display with new values
                togglePopup('bank-popup', false); // Close popup after upgrade
            } else {
                alert('Not enough cash or maximum vault capacity reached!');
            }
        }
    }
    
    const businessConfig = businessTypes[type];
    if (cash >= businessConfig.baseCost) {
        cash -= businessConfig.baseCost;
        const business = { ...businessConfig, level: 1, upgradeCost: businessConfig.baseCost * 0.5 };
        businesses.push(business);
        hourlyIncome += business.income;
        saveProgress();
        updateStats();
        renderBusinesses();
        togglePopup('buy-business-popup', false);
    } else {
        alert('Not enough cash!');
    }
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

        if (business.type === 'bank') {
            businessInfo.innerHTML = `<strong>${business.name}</strong><br>
                $${roundToHundredths(business.hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour<br>
                Vault: $${roundToHundredths(business.currentMoneyInVault).toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${roundToHundredths(business.maxVaultStorage).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        } else {
            businessInfo.innerHTML = `<strong>${business.name}</strong><br>$${roundToHundredths(business.income).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour`;
        }

        businessDiv.appendChild(businessImg);
        businessDiv.appendChild(businessInfo);

        businessDiv.onclick = () => {
            if (business.type === 'bank') {
                openBankPopup(index);
            } else if (business.merged) {
                closeMergedBusiness(index);
            } else {
                openUpgradeBusinessPopup(index);
            }
        };

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
        togglePopup('upgrade-business-popup', false);
    } else {
        alert('Not enough cash or max level reached!');
    }
}

function openUpgradeBusinessPopup(index) {
    const business = businesses[index];
    const businessInfo = document.getElementById('business-info');
    const businessUpgradeCost = document.getElementById('business-upgrade-cost');
    const businessUpgradeIncome = document.getElementById('business-upgrade-income');

    businessInfo.textContent = `${business.name} (Level ${business.level})`;
    businessUpgradeCost.textContent = `Upgrade Cost: $${roundToHundredths(business.upgradeCost).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    businessUpgradeIncome.textContent = `Income After Upgrade: $${roundToHundredths(business.income * business.upgradeMultiplier).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

    document.getElementById('upgrade-business-popup').style.display = 'block';

    document.getElementById('upgrade-business-button').onclick = () => upgradeBusiness(index);
}

// Merging Businesses
function mergeBusinesses(type) {
    const businessTypes = [
        {
            name: 'Lemonade Factory',
            income: 600000,
            imageSrc: 'images/LemonadeFactory.jpg',
        },
        {
            name: 'Restaurant',
            income: 800000,
            imageSrc: 'images/Restaurant.jpg',
        },
        {
            name: 'Chain of Restaurants',
            income: 2400000,  // Triple the income of "Restaurant"
            imageSrc: 'images/ChainOfRestaurants.jpg',
        },
        {
            name: 'Car Dealership',
            income: 500000,  // New Car Dealership business income
            imageSrc: 'images/CarDealership.jpg',
        },
        {
            name: 'Law Firm',
            income: 25000000000,  // New Car Dealership business income
            imageSrc: 'images/LawFirm.jpg',
        }
    ];

    const mergerConfig = businessTypes[type];
    const canMerge = mergerConfig.requiredTypes.every(requiredType => {
        return businesses.some(business => business.type === requiredType && business.level === business.maxLevel && !business.merged);
    });

    if (canMerge) {
        selectedBusinesses = businesses.filter(business => mergerConfig.requiredTypes.includes(business.type) && business.level === business.maxLevel && !business.merged);
        selectedBusinesses.forEach(business => business.merged = true);

        const mergedBusiness = { ...mergerConfig, level: 1, merged: true };
        businesses.push(mergedBusiness);
        hourlyIncome = roundToHundredths(hourlyIncome + mergedBusiness.hourlyIncome);

        saveProgress();
        updateStats();
        renderMergedBusinesses();
        renderBusinesses();
        togglePopup('merge-business-popup', false);
    } else {
        alert('Required businesses are not available for merger!');
    }
}

function renderMergedBusinesses() {
    const mergedBusinessList = document.getElementById('merged-business-list');
    mergedBusinessList.innerHTML = '';
    businesses.forEach((business, index) => {
        if (business.merged) {
            const businessDiv = document.createElement('div');
            businessDiv.className = 'merged-business-card';
            businessDiv.innerHTML = `
                <strong>${business.name}</strong><br>
                $${roundToHundredths(business.hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour`;
            mergedBusinessList.appendChild(businessDiv);
        }
    });
}

function openBankPopup(index) {
    const bank = businesses[index];
    const vaultInfo = document.getElementById('bank-vault-storage');
    const incomeInfo = document.getElementById('bank-hourly-income');
    const upgradeCostInfo = document.getElementById('bank-upgrade-cost');

    vaultInfo.textContent = `$${roundToHundredths(bank.currentMoneyInVault).toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${roundToHundredths(bank.maxVaultStorage).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    incomeInfo.textContent = `$${roundToHundredths(bank.income).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    upgradeCostInfo.textContent = `$${roundToHundredths(bank.maxVaultStorage * 0.5).toLocaleString(undefined, { minimumFractionDigits: 2 })}`; // Example upgrade cost

    document.getElementById('bank-popup').style.display = 'block';
}


function closeMergedBusiness(index) {
    const mergedBusiness = businesses[index];
    if (confirm(`Are you sure you want to close the merged business: ${mergedBusiness.name}?`)) {
        hourlyIncome = roundToHundredths(hourlyIncome - mergedBusiness.hourlyIncome);
        businesses.splice(index, 1);
        saveProgress();
        updateStats();
        renderMergedBusinesses();
        renderBusinesses();
    }
}

// Load progress on page load
window.onload = loadProgress;
