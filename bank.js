
let vaultCapacity = 1000000; // Example initial capacity; adjust as needed
let vaultCurrent = 0;        // Current amount in the vault
let bankBalance = 10000000;  // Example bank balance; adjust as needed
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
function calculateBankIncome() {
    businesses.forEach(business => {
        if (business.type === 'bank') {
            let vaultFillRate = 1000000000; // 1 billion per hour fill rate
            if (business.currentMoneyInVault < business.maxVaultStorage) {
                business.currentMoneyInVault = Math.min(business.maxVaultStorage, business.currentMoneyInVault + vaultFillRate);
            }
            business.hourlyIncome = Math.floor(business.currentMoneyInVault / 100); // $1 per $100 in vault
        }
    });

    saveProgress(); // It's better to call saveProgress() after the loop
}

// Ensure all relevant intervals and game loops are correctly defined
setInterval(() => {
    calculateBankIncome(); // Calculate bank's income first
    calculateIncome(); // Then update total income
}, 1000); // 1 second in milliseconds

// Adjust the fillVault function to manage the bank vault correctly
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
    return vault.currentCapacity === vault.maxCapacity;
}

// Call fillVault on an interval or in your game loop
setInterval(() => {
    fillVault();
}, 3600000); // Example: fill every hour
