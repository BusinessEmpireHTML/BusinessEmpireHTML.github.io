let cash = parseFloat(localStorage.getItem('cash')) || 0;
let hourlyIncome = parseFloat(localStorage.getItem('hourlyIncome')) || 0;
let clickValue = parseFloat(localStorage.getItem('clickValue')) || 1;
let clicks = parseInt(localStorage.getItem('clicks')) || 0;
let lastUpdate = localStorage.getItem('lastUpdate') ? new Date(localStorage.getItem('lastUpdate')) : new Date();
let businesses = JSON.parse(localStorage.getItem('businesses')) || [];

window.onload = function() {
    loadProgress();
    calculateOfflineEarnings(); // Calculate offline earnings first
    openTab('clicker');
    updateStats();
    renderBusinesses();
};

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
    
        businesses.forEach(business => {
            if (!business.merged) business.merged = false;
            if (business.type === 'bank' && !business.currentMoneyInVault) {
                business.currentMoneyInVault = 0; // Initialize if missing
            }
        });
    
        calculateOfflineIncome(); // Moved to be before calculateOfflineEarnings
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

function openBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'block';
}

function closeBuyBusinessPopup() {
    document.getElementById('buy-business-popup').style.display = 'none';
}

function closeBankPopup() {
    document.getElementById('bank-popup').style.display = 'none';
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
            upgradeMultiplier: 1.15,
            maxLevel: 10,
            imageSrc: 'images/LegalClinic.jpg'
        };
        businesses.push(business);
        hourlyIncome += business.income;
    } else if (type === 'bank' && cash >= bank.baseCost) {
        cash -= bank.baseCost;
        businesses.push(bank);
        hourlyIncome += bank.hourlyIncome;
        saveProgress();
        updateStats();
        renderBusinesses();
        closeBuyBusinessPopup();
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

        if (business.type === 'bank') {
            businessInfo.innerHTML = `<strong>${business.name}</strong><br>
                $${roundToHundredths(business.hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour<br>
                Vault: $${roundToHundredths(business.currentMoneyInVault).toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${roundToHundredths(business.maxVaultStorage).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
        } else {
            businessInfo.innerHTML = `<strong>${business.name}</strong><br>$${roundToHundredths(business.income).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour`;
        }

        businessDiv.appendChild(businessImg);
        businessDiv.appendChild(businessInfo);

        if (business.type === 'bank') {
            businessDiv.onclick = () => openBankPopup(index);
        } else if (business.merged) {
            businessDiv.onclick = () => closeMergedBusiness(index);
        } else {
            businessDiv.onclick = () => openUpgradeBusinessPopup(index);
        }

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

let bank = {
    name: 'Bank',
    level: 1,
    baseCost: 10000000,
    currentMoneyInVault: 10000000,
    maxVaultStorage: 10000000,
    upgradeCost: 5000000, // 50% of base cost
    upgradeMultiplier: 1.5,
    maxLevel: 10, // Max level corresponds to 1 trillion vault storage
    hourlyIncome: 100000, // Starting income for a full vault
    imageSrc: 'images/Bank.jpg',
    type: 'bank'
};

let bankBalance = 10000000; // Example bank balance; adjust as needed

// Function to fill the vault with money from the bank balance
function fillVault() {
    const bank = businesses.find(business => business.type === 'bank');
    if (!bank) return; // Exit if no bank is found

    let amountNeeded = bank.maxVaultStorage - bank.currentMoneyInVault;

    if (bankBalance >= amountNeeded) {
        bank.currentMoneyInVault = bank.maxVaultStorage;
        bankBalance -= amountNeeded;
    } else {
        bank.currentMoneyInVault += bankBalance;
        bankBalance = 0;
    }

    // Ensure currentMoneyInVault does not exceed maxVaultStorage
    if (bank.currentMoneyInVault > bank.maxVaultStorage) {
        bank.currentMoneyInVault = bank.maxVaultStorage;
    }

    console.log(`Vault filled to ${bank.currentMoneyInVault}, Bank balance is now ${bankBalance}`);
}

function isVaultMaxed() {
    const bank = businesses.find(business => business.type === 'bank');
    return bank && bank.currentMoneyInVault >= bank.maxVaultStorage;
}


function openBankPopup(index) {
    const bank = businesses[index];
    document.getElementById('bank-upgrade-cost').textContent = roundToHundredths(bank.upgradeCost).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('bank-hourly-income').textContent = roundToHundredths(bank.hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('bank-vault-storage').textContent = `$${roundToHundredths(bank.currentMoneyInVault).toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${roundToHundredths(bank.maxVaultStorage).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    
    document.getElementById('bank-upgrade-button').disabled = cash < bank.upgradeCost;
    document.getElementById('bank-upgrade-button').onclick = () => upgradeBankVault(index);
    document.getElementById('bank-popup').style.display = 'block';
}

// Function to upgrade the Bank's vault storage
function upgradeBankVault(index) {
    const bank = businesses[index];
    if (cash >= bank.upgradeCost && bank.maxVaultStorage < 1e12) {
        cash = roundToHundredths(cash - bank.upgradeCost);
        bank.maxVaultStorage = roundToHundredths(bank.maxVaultStorage * bank.upgradeMultiplier);
        bank.upgradeCost = roundToHundredths(bank.upgradeCost * 1.15);
        saveProgress();
        updateStats();
        renderBusinesses();
        openBankPopup(index); // Refresh popup with new values
    } else {
        alert('Not enough cash or max storage reached!');
    }
}

// Function to calculate the hourly income for the bank
// Function to calculate the hourly income for the bank
function calculateBankIncome() {
    businesses.forEach(business => {
        if (business.type === 'bank') {
            let vaultFillRate = 1000000000; // 1 billion per hour fill rate
            if (business.currentMoneyInVault < business.maxVaultStorage) {
                business.currentMoneyInVault = Math.min(business.maxVaultStorage, business.currentMoneyInVault + vaultFillRate);
            }
            business.hourlyIncome = Math.floor(business.currentMoneyInVault / 1000); // $1 per $1000 in vault
        }
    });
    saveProgress(); // It's better to call saveProgress() after the loop
}

// Ensure all relevant intervals and game loops are correctly defined
setInterval(() => {
    calculateBankIncome();
    calculateIncome();
}, 1000); // 1 second in milliseconds

// Function to check if the vault is maxed out
function isVaultMaxed() {
    const bank = businesses.find(business => business.type === 'bank');
    return bank && bank.currentMoneyInVault === bank.maxVaultStorage;
}

// Example of using these functions
fillVault();
console.log(isVaultMaxed());

// Call fillVault on an interval or in your game loop
setInterval(() => {
    fillVault();
}, 1000); // Example: fill every hour

function calculateOfflineEarnings() {
    const lastOnline = localStorage.getItem('lastOnline');
    if (!lastOnline) return; // Exit if no last online time is found

    const now = Date.now();
    const elapsedTime = now - parseInt(lastOnline, 10); // Calculate elapsed time in milliseconds
    const elapsedHours = elapsedTime / (1000 * 60 * 60); // Convert to hours

    let totalOfflineIncome = hourlyIncome * elapsedHours; // Calculate potential earnings

    // Update cash with offline income
    cash = roundToHundredths(cash + totalOfflineIncome);

    // Fill the bank's vault
    const bank = businesses.find(business => business.type === 'bank');
    if (bank) {
        let amountNeeded = bank.maxVaultStorage - bank.currentMoneyInVault;

        if (totalOfflineIncome >= amountNeeded) {
            bank.currentMoneyInVault = bank.maxVaultStorage;
        } else {
            bank.currentMoneyInVault += totalOfflineIncome;
        }

        // Deduct the amount filled into the vault from totalOfflineIncome
        totalOfflineIncome = Math.max(totalOfflineIncome - amountNeeded, 0);
    }

    saveProgress(); // Save the progress after calculating offline earnings
}


// Save the current timestamp when going offline
window.addEventListener('beforeunload', function() {
    localStorage.setItem('lastOnline', Date.now());
});

// Calculate offline earnings when the player returns
calculateOfflineEarnings();

// Example of using these functions
fillVault();
console.log(isVaultMaxed());

function closeMergerPopup() {
    document.getElementById('business-merger-popup').style.display = 'none';
    selectedBusinesses = [];
    document.getElementById('merge-button').disabled = true;
}

let selectedBusinesses = []; // Initialize outside of the function

function toggleBusinessSelection(index) {
    const card = document.querySelectorAll('.merger-card')[index];
    
    if (selectedBusinesses.includes(index)) {
        // Deselect the business
        selectedBusinesses = selectedBusinesses.filter(i => i !== index);
        card.style.border = 'none';
    } else if (selectedBusinesses.length < 2) {
        // Select the business if less than 2 are selected
        selectedBusinesses.push(index);
        card.style.border = '2px solid green';
    }

    // Enable or disable the merge button based on selection
    document.getElementById('merge-button').disabled = selectedBusinesses.length !== 2;
}

function mergeSelectedBusinesses() {
    const [index1, index2] = selectedBusinesses.map(index => businesses[index]);

    if (isMergeCompatible(index1, index2)) {
        performMerge(index1, index2);
        alert('Businesses merged successfully!');
    } else {
        alert('Selected businesses are not compatible for merging!');
    }

    closeMergerPopup();
    saveProgress();
    updateStats();
    renderBusinesses();
}

const mergedBusinesses = [
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

function openMergerPopup() {
    document.getElementById('merger-business-list').innerHTML = '';
    businesses.forEach((business, index) => {
        // Allow both max-level and merged businesses to be shown in merger popup
        if ((business.level === business.maxLevel && !business.merged) || (business.merged && canMergeAgain(business))) {
            const businessDiv = document.createElement('div');
            businessDiv.className = 'business-card merger-card';
            businessDiv.textContent = business.name;
            businessDiv.onclick = () => toggleBusinessSelection(index);
            document.getElementById('merger-business-list').appendChild(businessDiv);
        }
    });
    document.getElementById('business-merger-popup').style.display = 'block';
}

// Helper function to check if a merged business can merge again
function canMergeAgain(business) {
    return business.name === 'Restaurant';  // Currently, only 'Restaurant' can merge further
}

function isMergeCompatible(business1, business2) {
    const mergedCombinations = {
        'Lemonade Stand+Factory': 'Lemonade Factory',
        'Local Shop+Factory': 'Restaurant',
        'Restaurant+Factory': 'Chain of Restaurants',
        'Car Wash+Factory': 'Car Dealership',
        'Legal Clinic+Bank': 'Law Firm'
    };

    const combination1 = `${business1.name}+${business2.name}`;
    const combination2 = `${business2.name}+${business1.name}`;

    return mergedCombinations[combination1] || mergedCombinations[combination2];
}

function performMerge(business1, business2) {
    const mergedName = isMergeCompatible(business1, business2);
    const newBusiness = mergedBusinesses.find(b => b.name === mergedName);

    if (newBusiness) {
        // Remove the old businesses from the array
        const index1 = businesses.indexOf(business1);
        const index2 = businesses.indexOf(business2);
        businesses.splice(index1, 1);
        businesses.splice(index2 > index1 ? index2 - 1 : index2, 1);

        // Add the merged business
        businesses.push({
            name: newBusiness.name,
            level: 1,
            income: newBusiness.income,
            baseCost: 0,  // Merged businesses may not have an initial cost
            upgradeCost: 0,  // Similarly, no upgrade costs if merged
            upgradeMultiplier: 1,
            maxLevel: 1,  // Assuming merged businesses do not upgrade further
            imageSrc: newBusiness.imageSrc,
            merged: true
        });

        // Update hourly income
        hourlyIncome = businesses.reduce((total, business) => total + business.income, 0);
        saveProgress();
        updateStats();
        renderBusinesses();
    }
}

function renderMergerBusinesses() {
    const mergerList = document.getElementById('merger-business-list');
    mergerList.innerHTML = ''; // Clear previous list

    businesses.forEach((business, index) => {
        if (business.level === business.maxLevel || (business.type === 'bank' && isVaultMaxed())) {
            const mergerCard = document.createElement('div');
            mergerCard.className = 'merger-card';
            mergerCard.textContent = `${business.name} (Level ${business.level})`;
            mergerCard.onclick = () => toggleBusinessSelection(index);

            mergerList.appendChild(mergerCard);
        }
    });
}



function closeMergedBusiness(index) {
    const business = businesses[index];
    if (confirm(`Are you sure you want to close the ${business.name}?`)) {
        hourlyIncome -= business.income;
        businesses.splice(index, 1);
        saveProgress();
        updateStats();
        renderBusinesses();
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
renderMergerBusinesses();