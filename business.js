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

let selectedBusinesses = [];