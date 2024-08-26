// Bank specific functions
function openBankPopup(index) {
    const bank = businesses[index];

    // Display bank information
    document.getElementById('bank-name').textContent = bank.name;
    document.getElementById('bank-vault').textContent = `$${roundToHundredths(bank.currentMoneyInVault).toLocaleString(undefined, { minimumFractionDigits: 2 })} / $${roundToHundredths(bank.maxVaultStorage).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
    document.getElementById('bank-hourly-income').textContent = `$${roundToHundredths(bank.hourlyIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })} per hour`;

    // Set button actions
    document.getElementById('collect-money-button').onclick = () => collectBankMoney(index);
    document.getElementById('close-bank-popup').onclick = closeBankPopup;

    // Show bank popup
    document.getElementById('bank-popup').style.display = 'block';
}

function collectBankMoney(index) {
    const bank = businesses[index];
    if (bank.currentMoneyInVault > 0) {
        cash = roundToHundredths(cash + bank.currentMoneyInVault);
        bank.currentMoneyInVault = 0;
        saveProgress();
        updateStats();
        closeBankPopup();
    } else {
        alert('No money in the vault to collect!');
    }
}

function closeBankPopup() {
    document.getElementById('bank-popup').style.display = 'none';
}
