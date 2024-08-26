// business.js

// Business Functions
function buyBusiness(type) {
    let businessDetails = {
        lemonadeStand: { cost: 500, income: 100, upgradeMultiplier: 1.5, maxLevel: 10, imageSrc: 'images/LemonadeStand.jpg' },
        carWash: { cost: 12500, income: 4000, upgradeMultiplier: 1.25, maxLevel: 10, imageSrc: 'images/CarWash.jpg' },
        localShop: { cost: 45000, income: 6000, upgradeMultiplier: 1.25, maxLevel: 15, imageSrc: 'images/LocalShop.jpg' },
        factory: { cost: 150000, income: 15000, upgradeMultiplier: 1.2, maxLevel: 20, imageSrc: 'images/Factory.jpg' },
        legalClinic: { cost: 200000, income: 12000, upgradeMultiplier: 1.15, maxLevel: 10, imageSrc: 'images/LegalClinic.jpg' },
        bank: { cost: bank.baseCost, income: bank.hourlyIncome, upgradeMultiplier: 1.5, maxLevel: 10, imageSrc: 'images/Bank.jpg', type: 'bank' }
    };

    let selectedBusiness = businessDetails[type];

    if (cash >= selectedBusiness.cost) {
        cash -= selectedBusiness.cost;
        const newBusiness = {
            name: capitalizeFirstLetter(type.replace(/([A-Z])/g, ' $1')),
            level: 1,
            income: selectedBusiness.income,
            baseCost: selectedBusiness.cost,
            upgradeCost: selectedBusiness.cost / 2,
            upgradeMultiplier: selectedBusiness.upgradeMultiplier,
            maxLevel: selectedBusiness.maxLevel,
            imageSrc: selectedBusiness.imageSrc,
            type: selectedBusiness.type || type
        };

        businesses.push(newBusiness);
        hourlyIncome += newBusiness.income;
        saveProgress();
        updateStats();
        renderBusinesses();
        closeBuyBusinessPopup();
    } else {
        showAlert('Not enough cash!'); // Replace alert with a game-themed modal or div.
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
    document.getElementById('business-upgrade-cost').textContent = roundToHundredths(business.upgradeCost).toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('upgrade-button').onclick = () => upgradeBusiness(index);
    document.getElementById('close-upgrade-popup').onclick = closeUpgradeBusinessPopup;
    document.getElementById('upgrade-popup').style.display = 'block';
}

function closeUpgradeBusinessPopup() {
    document.getElementById('upgrade-popup').style.display = 'none';
}

// Closing businesses
function closeBusiness(index) {
    const business = businesses[index];

    if (confirm(`Are you sure you want to close ${business.name}?`)) {
        hourlyIncome = roundToHundredths(hourlyIncome - business.income);
        businesses.splice(index, 1);
        saveProgress();
        updateStats();
        renderBusinesses();
    }
}

function calculateUpgradeCost(baseCost, multiplier, level) {
    return roundToHundredths(baseCost * Math.pow(multiplier, level - 1));
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
