// LTCG Calculator Script

// Input elements
const ltcgAssetTypeSelect = document.getElementById('ltcgAssetType');
const ltcgPurchaseDateInput = document.getElementById('ltcgPurchaseDate');
const ltcgSaleDateInput = document.getElementById('ltcgSaleDate');
const ltcgPurchaseValueInput = document.getElementById('ltcgPurchaseValue');
const ltcgPurchaseValueSlider = document.getElementById('ltcgPurchaseValueSlider');
const ltcgSaleValueInput = document.getElementById('ltcgSaleValue');
const ltcgSaleValueSlider = document.getElementById('ltcgSaleValueSlider');

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupLTCGSliders();
    addLTCGEventListeners();
    initialSyncLTCGValues();
    calculateAndUpdateLTCGResults();
    setupLTCGMegaMenu();
});

function setupLTCGSliders() {
    syncLTCGInputs(ltcgPurchaseValueInput, ltcgPurchaseValueSlider);
    syncLTCGInputs(ltcgSaleValueInput, ltcgSaleValueSlider);
}

function initialSyncLTCGValues() {
    // Ensure initial values are properly synchronized
    ltcgPurchaseValueSlider.value = ltcgPurchaseValueInput.value;
    ltcgSaleValueSlider.value = ltcgSaleValueInput.value;
}

function syncLTCGInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateLTCGResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateLTCGResults();
    });

    // Add change event for input field to handle direct typing
    input.addEventListener('change', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        } else if (value < parseFloat(slider.min)) {
            this.value = slider.min;
            slider.value = slider.min;
        } else if (value > parseFloat(slider.max)) {
            this.value = slider.max;
            slider.value = slider.max;
        }
        calculateAndUpdateLTCGResults();
    });
}

function addLTCGEventListeners() {
    // Add change listeners for all inputs
    [ltcgAssetTypeSelect, ltcgPurchaseDateInput, ltcgSaleDateInput, 
     ltcgPurchaseValueInput, ltcgSaleValueInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateLTCGResults);
        if (input.type !== 'date' && input.tagName !== 'SELECT') {
            input.addEventListener('keyup', calculateAndUpdateLTCGResults);
        }
    });

    // Add input listeners for sliders
    [ltcgPurchaseValueSlider, ltcgSaleValueSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateLTCGResults);
    });
}

function calculateAndUpdateLTCGResults() {
    const assetType = ltcgAssetTypeSelect.value;
    const purchaseDate = new Date(ltcgPurchaseDateInput.value);
    const saleDate = new Date(ltcgSaleDateInput.value);
    const purchaseValue = parseFloat(ltcgPurchaseValueInput.value) || 0;
    const saleValue = parseFloat(ltcgSaleValueInput.value) || 0;

    // Validate inputs
    if (!ltcgPurchaseDateInput.value || !ltcgSaleDateInput.value) {
        showLTCGError('Please enter both purchase and sale dates');
        return;
    }

    if (saleDate <= purchaseDate) {
        showLTCGError('Sale date must be after purchase date');
        return;
    }

    if (purchaseValue <= 0 || saleValue <= 0) {
        showLTCGError('Purchase and sale values must be greater than 0');
        return;
    }

    if (purchaseValue > 100000000 || saleValue > 100000000) {
        showLTCGError('Values cannot exceed ₹10 crores');
        return;
    }

    // Perform LTCG calculation
    const result = calculateLTCGTax(assetType, purchaseDate, saleDate, purchaseValue, saleValue);
    
    // Update display
    updateLTCGResultsDisplay(result);
    updateLTCGBreakdown(result);
    clearLTCGError();
}

function calculateLTCGTax(assetType, purchaseDate, saleDate, purchaseValue, saleValue) {
    // 1) Calculate holding period in days
    const holdingDays = Math.floor((saleDate - purchaseDate) / (1000 * 60 * 60 * 24));
    
    // 2) Classify as STCG or LTCG
    const isLTCG = holdingDays >= 365;
    const classification = isLTCG ? 'LTCG' : 'STCG';
    
    // 3) Calculate net gain
    const netGain = saleValue - purchaseValue;
    
    // 4) Determine tax regime based on sale date
    const taxRegime = getTaxRegime(saleDate);
    
    // 5) Calculate tax
    let exemption = 0;
    let taxableGain = 0;
    let taxRate = 0;
    let tax = 0;
    
    if (netGain <= 0) {
        // No tax on losses
        tax = 0;
        taxableGain = 0;
    } else if (isLTCG) {
        // LTCG calculation
        exemption = taxRegime.ltcgExemption;
        taxableGain = Math.max(0, netGain - exemption);
        taxRate = taxRegime.ltcgRate;
        tax = taxableGain * (taxRate / 100);
    } else {
        // STCG calculation
        taxableGain = netGain;
        taxRate = taxRegime.stcgRate;
        tax = netGain * (taxRate / 100);
    }
    
    // 6) Calculate effective tax percentage
    const effectiveTaxPercent = netGain > 0 ? (tax / netGain) * 100 : 0;
    
    return {
        assetType,
        purchaseDate,
        saleDate,
        purchaseValue,
        saleValue,
        holdingDays,
        classification,
        netGain,
        exemption,
        taxableGain,
        taxRate,
        tax,
        effectiveTaxPercent,
        taxRegime
    };
}

function getTaxRegime(saleDate) {
    // July 23, 2024 rule change
    const cutoffDate = new Date('2024-07-23');
    
    if (saleDate >= cutoffDate) {
        // New regime from July 23, 2024
        return {
            name: 'New Regime (From 23-Jul-2024)',
            stcgRate: 20,
            ltcgExemption: 125000,
            ltcgRate: 12.5
        };
    } else {
        // Old regime before July 23, 2024
        return {
            name: 'Old Regime (Before 23-Jul-2024)',
            stcgRate: 15,
            ltcgExemption: 100000,
            ltcgRate: 10
        };
    }
}

function updateLTCGResultsDisplay(result) {
    // Update result cards
    document.getElementById('ltcgHoldingPeriodResult').textContent = 
        `${result.holdingDays} Days (${result.classification})`;
    
    document.getElementById('ltcgNetGainResult').textContent = 
        formatLTCGCurrency(result.netGain);
    
    document.getElementById('ltcgExemptionResult').textContent = 
        formatLTCGCurrency(result.exemption);
    
    document.getElementById('ltcgTaxableGainResult').textContent = 
        formatLTCGCurrency(result.taxableGain);
    
    document.getElementById('ltcgApplicableRateResult').textContent = 
        `${result.taxRate}%`;
    
    document.getElementById('ltcgTaxPayableResult').textContent = 
        formatLTCGCurrency(result.tax);
    
    document.getElementById('ltcgEffectiveTaxResult').textContent = 
        `${result.effectiveTaxPercent.toFixed(2)}%`;
    
    // Update tax regime information
    document.getElementById('ltcgRegimeSaleDate').textContent = 
        formatLTCGDate(result.saleDate);
    
    document.getElementById('ltcgRegimeName').textContent = 
        result.taxRegime.name;
    
    document.getElementById('ltcgRegimeStcgRate').textContent = 
        `${result.taxRegime.stcgRate}%`;
    
    document.getElementById('ltcgRegimeLtcgExemption').textContent = 
        formatLTCGCurrency(result.taxRegime.ltcgExemption);
    
    document.getElementById('ltcgRegimeLtcgRate').textContent = 
        `${result.taxRegime.ltcgRate}%`;
    
    // Show/hide exemption card based on classification
    const exemptionCard = document.getElementById('ltcgExemptionCard');
    if (result.classification === 'LTCG') {
        exemptionCard.classList.remove('hidden');
    } else {
        exemptionCard.classList.add('hidden');
    }
}

function updateLTCGBreakdown(result) {
    // Step 1: Holding Period
    document.getElementById('ltcgStepHolding').textContent = 
        `Sale Date (${formatLTCGDate(result.saleDate)}) - Purchase Date (${formatLTCGDate(result.purchaseDate)}) = ${result.holdingDays} Days`;
    
    document.getElementById('ltcgStepHoldingResult').innerHTML = 
        `${result.holdingDays} Days ${result.holdingDays >= 365 ? '≥' : '<'} 365 Days → <strong>${result.classification} (${result.classification === 'LTCG' ? 'Long' : 'Short'} Term Capital Gains)</strong>`;
    
    // Step 2: Net Gain
    document.getElementById('ltcgStepGain').textContent = 
        `Net Gain = Sale Value - Purchase Value = ${formatLTCGCurrency(result.saleValue)} - ${formatLTCGCurrency(result.purchaseValue)} = ${formatLTCGCurrency(result.netGain)}`;
    
    // Step 3: Exemption (only for LTCG)
    const exemptionDiv = document.getElementById('ltcgStepExemptionDiv');
    const taxStepNumber = document.getElementById('ltcgStepTaxNumber');
    
    if (result.classification === 'LTCG') {
        exemptionDiv.classList.remove('hidden');
        taxStepNumber.textContent = '4';
        
        document.getElementById('ltcgStepExemption').textContent = 
            `Available Exemption = ${formatLTCGCurrency(result.exemption)} (${result.taxRegime.name})`;
        
        document.getElementById('ltcgStepExemptionResult').textContent = 
            `Taxable Gain = max(0, ${formatLTCGCurrency(result.netGain)} - ${formatLTCGCurrency(result.exemption)}) = ${formatLTCGCurrency(result.taxableGain)}`;
    } else {
        exemptionDiv.classList.add('hidden');
        taxStepNumber.textContent = '3';
    }
    
    // Step 4/3: Tax Calculation
    document.getElementById('ltcgStepTax').textContent = 
        `Tax = Taxable Gain × Tax Rate = ${formatLTCGCurrency(result.taxableGain)} × ${result.taxRate}% = ${formatLTCGCurrency(result.tax)}`;
    
    document.getElementById('ltcgStepTaxResult').textContent = 
        `Effective Tax Rate = ${formatLTCGCurrency(result.tax)} ÷ ${formatLTCGCurrency(Math.max(1, result.netGain))} × 100 = ${result.effectiveTaxPercent.toFixed(2)}%`;
}

function formatLTCGCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const absAmount = Math.abs(amount);
    const formatted = Math.round(absAmount).toLocaleString('en-IN');
    const prefix = amount < 0 ? '-₹' : '₹';
    return prefix + formatted;
}

function formatLTCGDate(date) {
    // Format date as DD-MMM-YYYY
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

function showLTCGError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('ltcgErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'ltcgErrorMessage';
        errorDiv.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
            font-weight: 500;
        `;
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearLTCGError() {
    const errorDiv = document.getElementById('ltcgErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupLTCGMegaMenu() {
    const megaMenuBtn = document.querySelector('.mega-menu-btn');
    const megaMenu = document.querySelector('.mega-menu');
    
    if (megaMenuBtn && megaMenu) {
        megaMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            megaMenu.classList.toggle('open');
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!megaMenu.contains(e.target)) {
                megaMenu.classList.remove('open');
            }
        });
        
        // Close menu when clicking on a link
        const megaLinks = document.querySelectorAll('.mega-link');
        megaLinks.forEach(link => {
            link.addEventListener('click', function() {
                megaMenu.classList.remove('open');
            });
        });
    }
}

// Utility functions for date validation
function isValidDate(dateString) {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
}

function getDaysDifference(date1, date2) {
    const timeDifference = date2.getTime() - date1.getTime();
    return Math.ceil(timeDifference / (1000 * 3600 * 24));
}

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        calculateLTCGTax,
        getTaxRegime,
        formatLTCGCurrency,
        formatLTCGDate
    };
}
