// Merging businesses
function mergeBusinesses(index1, index2) {
    const business1 = businesses[index1];
    const business2 = businesses[index2];

    if (business1.name !== business2.name || business1.level !== business2.level) {
        alert('Businesses must be of the same type and level to merge!');
        return;
    }

    // Calculate new income and upgrade costs
    const mergedIncome = roundToHundredths(business1.income * 2);
    const mergedUpgradeCost = roundToHundredths(business1.upgradeCost * 1.5);

    // Create new merged business
    const mergedBusiness = {
        name: business1.name,
        level: business1.level,
        income: mergedIncome,
        baseCost: business1.baseCost,
        upgradeCost: mergedUpgradeCost,
        upgradeMultiplier: business1.upgradeMultiplier,
        maxLevel: business1.maxLevel,
        imageSrc: business1.imageSrc,
        merged: true,
        type: business1.type
    };

    // Remove the original businesses and add the merged one
    businesses.splice(index2, 1);
    businesses[index1] = mergedBusiness;

    // Recalculate hourly income
    hourlyIncome = roundToHundredths(hourlyIncome - business1.income - business2.income + mergedIncome);

    saveProgress();
    updateStats();
    renderBusinesses();
}

function openMergeBusinessPopup(index) {
    selectedBusinesses.push(index);
    if (selectedBusinesses.length === 2) {
        mergeBusinesses(selectedBusinesses[0], selectedBusinesses[1]);
        selectedBusinesses = [];
        closeMergeBusinessPopup();
    }
}

function closeMergeBusinessPopup() {
    selectedBusinesses = [];
    document.getElementById('merge-popup').style.display = 'none';
}
