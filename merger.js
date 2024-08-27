

function closeMergerPopup() {
    document.getElementById('business-merger-popup').style.display = 'none';
    selectedBusinesses = [];
    document.getElementById('merge-button').disabled = true;
}

function toggleBusinessSelection(index) {
    const businessIndex = selectedBusinesses.indexOf(index);
    if (businessIndex === -1) {
        if (selectedBusinesses.length < 2) {
            selectedBusinesses.push(index);
        }
    } else {
        selectedBusinesses.splice(businessIndex, 1);
    }

    document.querySelectorAll('.merger-card').forEach((card, i) => {
        if (selectedBusinesses.includes(i)) {
            card.style.border = '2px solid green';
        } else {
            card.style.border = 'none';
        }
    });

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
        // Check if the business is eligible for merging
        const isEligibleForMerging = (business.level === business.maxLevel && !business.merged) || 
                                      (business.merged && canMergeAgain(business));
        
        // Check if it's a bank and if the vault is maxed out
        const isBankWithMaxVault = business.type === 'bank' && business.currentMoneyInVault === business.maxVaultStorage;
        
        if (isEligibleForMerging || isBankWithMaxVault) {
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

setInterval(() => {
    let minuteIncome = hourlyIncome / 60;
    cash = roundToHundredths(cash + minuteIncome);
    calculateIncome();
}, 60000);

calculateOfflineIncome();
openTab('clicker');
updateStats();
renderBusinesses();