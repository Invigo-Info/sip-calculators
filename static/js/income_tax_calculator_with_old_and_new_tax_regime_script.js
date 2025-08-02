// Income Tax Calculator Script

// Input elements
const financialYearSelect = document.getElementById('financialYear');
const ageGroupSelect = document.getElementById('ageGroup');

// Income Details inputs
const salaryInput = document.getElementById('salary');
const exemptAllowancesInput = document.getElementById('exemptAllowances');
const selfOccupiedPropertyLossInput = document.getElementById('selfOccupiedPropertyLoss');
const rentalIncomeInput = document.getElementById('rentalIncome');
const digitalAssetIncomeInput = document.getElementById('digitalAssetIncome');
const interestHomeLoanLetoutInput = document.getElementById('interestHomeLoanLetout');
const otherIncomeInput = document.getElementById('otherIncome');

// Deductions inputs
const section80CInput = document.getElementById('section80C');
const section80DInput = document.getElementById('section80D');
const section80GInput = document.getElementById('section80G');
const section80TTAInput = document.getElementById('section80TTA');
const section80CCD1Input = document.getElementById('section80CCD1');
const section80CCD2Input = document.getElementById('section80CCD2');
const section80EEAInput = document.getElementById('section80EEA');
const otherDeductionsInput = document.getElementById('otherDeductions');

// Result elements
const oldRegimeTaxElement = document.getElementById('oldRegimeTax');
const newRegimeTaxElement = document.getElementById('newRegimeTax');
const oldRegimeTaxableIncomeElement = document.getElementById('oldRegimeTaxableIncome');
const newRegimeTaxableIncomeElement = document.getElementById('newRegimeTaxableIncome');
const oldRegimeDeductionsElement = document.getElementById('oldRegimeDeductions');
const newRegimeStandardDeductionElement = document.getElementById('newRegimeStandardDeduction');
const betterRegimeElement = document.getElementById('betterRegime');
const savingsAmountElement = document.getElementById('savingsAmount');
const savingsMessageElement = document.getElementById('savingsMessage');

// Mobile result elements
const mobileOldRegimeTaxElement = document.getElementById('mobileOldRegimeTax');
const mobileNewRegimeTaxElement = document.getElementById('mobileNewRegimeTax');
const mobileBetterRegimeElement = document.getElementById('mobileBetterRegime');
const mobileSavingsAmountElement = document.getElementById('mobileSavingsAmount');

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    setupIncomeTaxEventListeners();
    setupIncomeTaxMegaMenu();
    setupIncomeTaxValidation();
    // Show 0 values by default, but enable real-time calculation
    resetResultsToZero();
});

function setupIncomeTaxEventListeners() {
    // Add event listeners to all inputs for real-time calculation
    const allInputs = [
        financialYearSelect, ageGroupSelect,
        salaryInput, exemptAllowancesInput, selfOccupiedPropertyLossInput,
        rentalIncomeInput, digitalAssetIncomeInput, interestHomeLoanLetoutInput, otherIncomeInput,
        section80CInput, section80DInput, section80GInput, section80TTAInput,
        section80CCD1Input, section80CCD2Input, section80EEAInput, otherDeductionsInput
    ];

    allInputs.forEach(input => {
        if (input.tagName === 'SELECT') {
            input.addEventListener('change', calculateIncomeTaxRealTime);
        } else {
            input.addEventListener('input', calculateIncomeTaxRealTime);
            input.addEventListener('change', calculateIncomeTaxRealTime);
        }
    });

    // Age group change listener for updating 80D limits
    ageGroupSelect.addEventListener('change', function() {
        updateSection80DLimit();
        calculateIncomeTaxRealTime();
    });
}

function setupIncomeTaxValidation() {
    // Update Section 80D limit based on age group
    updateSection80DLimit();
    
    // Add input validation
    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value < 0) {
                this.value = 0;
            }
            
            // Apply specific limits
            if (this.id === 'section80C' && parseFloat(this.value) > 150000) {
                this.value = 150000;
            }
            if (this.id === 'section80TTA' && parseFloat(this.value) > 10000) {
                this.value = 10000;
            }
            if (this.id === 'section80CCD1' && parseFloat(this.value) > 50000) {
                this.value = 50000;
            }
            if (this.id === 'section80EEA' && parseFloat(this.value) > 150000) {
                this.value = 150000;
            }
        });
    });
}

function updateSection80DLimit() {
    const ageGroup = ageGroupSelect.value;
    let maxLimit;
    
    switch (ageGroup) {
        case '80+':
            maxLimit = 50000;
            break;
        case '60-80':
            maxLimit = 50000;
            break;
        case '0-60':
        default:
            maxLimit = 25000;
            break;
    }
    
    section80DInput.max = maxLimit;
    
    // Adjust current value if it exceeds the new limit
    if (parseFloat(section80DInput.value) > maxLimit) {
        section80DInput.value = maxLimit;
    }
    
    // Update the label to show the limit
    const label = document.querySelector('label[for="section80D"]') || 
                  document.querySelector('.input-label');
    if (label && label.textContent.includes('Section 80D')) {
        label.textContent = `Section 80D: Medical Insurance (Max ₹${formatIncomeTaxCurrency(maxLimit)})`;
    }
}

// Helper function to collect form data
function collectFormData() {
    return {
        financial_year: financialYearSelect.value,
        age_group: ageGroupSelect.value,
        salary: parseFloat(salaryInput.value) || 0,
        exempt_allowances: parseFloat(exemptAllowancesInput.value) || 0,
        self_occupied_property_loss: parseFloat(selfOccupiedPropertyLossInput.value) || 0,
        rental_income: parseFloat(rentalIncomeInput.value) || 0,
        digital_asset_income: parseFloat(digitalAssetIncomeInput.value) || 0,
        interest_home_loan_letout: parseFloat(interestHomeLoanLetoutInput.value) || 0,
        other_income: parseFloat(otherIncomeInput.value) || 0,
        section_80c: parseFloat(section80CInput.value) || 0,
        section_80d: parseFloat(section80DInput.value) || 0,
        section_80g: parseFloat(section80GInput.value) || 0,
        section_80tta: parseFloat(section80TTAInput.value) || 0,
        section_80ccd1: parseFloat(section80CCD1Input.value) || 0,
        section_80ccd2: parseFloat(section80CCD2Input.value) || 0,
        section_80eea: parseFloat(section80EEAInput.value) || 0,
        other_deductions: parseFloat(otherDeductionsInput.value) || 0
    };
}

// Real-time calculation function (updates basic results only)
function calculateIncomeTaxRealTime() {
    try {
        // Collect all input values
        const formData = collectFormData();
        
        // Use client-side calculation for real-time updates
        const result = calculateIncomeTaxClientSide(formData);
        updateIncomeTaxResults(result);
        clearIncomeTaxError();
        
    } catch (error) {
        console.error('Real-time calculation error:', error);
        // Don't show errors for real-time calculation
    }
}

// Full calculation function (for detailed results view)
function calculateIncomeTax() {
    try {
        // Collect all input values
        const formData = collectFormData();

        // Send calculation request to backend
        fetch('/calculate-income-tax-old-new-regime', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => response.json())
        .then(result => {
            if (result.error) {
                showIncomeTaxError(result.error);
                return;
            }
            
            // Update basic results and show detailed results page
            updateIncomeTaxResults(result);
            showDetailedResults(result);
            clearIncomeTaxError();
        })
        .catch(error => {
            console.error('Error:', error);
            // Fallback to client-side calculation
            const result = calculateIncomeTaxClientSide(formData);
            updateIncomeTaxResults(result);
            showDetailedResults(result);
        });
        
    } catch (error) {
        console.error('Calculation error:', error);
        showIncomeTaxError('Error calculating tax. Please check your inputs.');
    }
}

function calculateIncomeTaxClientSide(formData) {
    // Client-side fallback calculation
    const totalIncome = formData.salary + formData.rental_income + formData.digital_asset_income + 
                       formData.other_income - formData.exempt_allowances - formData.self_occupied_property_loss -
                       formData.interest_home_loan_letout;

    // Old regime calculation
    const totalDeductions = Math.min(formData.section_80c, 150000) + 
                           Math.min(formData.section_80d, get80DLimit(formData.age_group)) +
                           formData.section_80g + Math.min(formData.section_80tta, 10000) +
                           Math.min(formData.section_80ccd1, 50000) + formData.section_80ccd2 +
                           Math.min(formData.section_80eea, 150000) + formData.other_deductions;

    const oldRegimeTaxableIncome = Math.max(0, totalIncome - totalDeductions);
    const oldRegimeIncomeTax = calculateTaxSlabsOldRegime(oldRegimeTaxableIncome, formData.age_group);
    const oldRegimeTotalTax = oldRegimeIncomeTax * 1.04; // Add 4% cess

    // New regime calculation
    const newRegimeTaxableIncome = Math.max(0, totalIncome - 50000); // Standard deduction
    const newRegimeIncomeTax = calculateTaxSlabsNewRegime(newRegimeTaxableIncome);
    const newRegimeTotalTax = newRegimeIncomeTax * 1.04; // Add 4% cess

    // Determine better regime
    const savings = oldRegimeTotalTax - newRegimeTotalTax;
    let betterRegime = savings > 0 ? 'New Regime' : 'Old Regime';
    if (Math.abs(savings) < 100) {
        betterRegime = 'Both Similar';
    }

    return {
        total_income: totalIncome,
        old_regime: {
            taxable_income: oldRegimeTaxableIncome,
            total_deductions: totalDeductions,
            total_tax: oldRegimeTotalTax
        },
        new_regime: {
            taxable_income: newRegimeTaxableIncome,
            standard_deduction: 50000,
            total_tax: newRegimeTotalTax
        },
        savings_amount: Math.abs(savings),
        better_regime: betterRegime,
        financial_year: formData.financial_year,
        age_group: formData.age_group
    };
}

function calculateTaxSlabsOldRegime(taxableIncome, ageGroup) {
    if (ageGroup === '0-60') {
        if (taxableIncome <= 250000) return 0;
        if (taxableIncome <= 500000) return (taxableIncome - 250000) * 0.05;
        if (taxableIncome <= 1000000) return 12500 + (taxableIncome - 500000) * 0.20;
        return 112500 + (taxableIncome - 1000000) * 0.30;
    } else if (ageGroup === '60-80') {
        if (taxableIncome <= 300000) return 0;
        if (taxableIncome <= 500000) return (taxableIncome - 300000) * 0.05;
        if (taxableIncome <= 1000000) return 10000 + (taxableIncome - 500000) * 0.20;
        return 110000 + (taxableIncome - 1000000) * 0.30;
    } else { // 80+
        if (taxableIncome <= 500000) return 0;
        if (taxableIncome <= 1000000) return (taxableIncome - 500000) * 0.20;
        return 100000 + (taxableIncome - 1000000) * 0.30;
    }
}

function calculateTaxSlabsNewRegime(taxableIncome) {
    if (taxableIncome <= 300000) return 0;
    if (taxableIncome <= 600000) return (taxableIncome - 300000) * 0.05;
    if (taxableIncome <= 900000) return 15000 + (taxableIncome - 600000) * 0.10;
    if (taxableIncome <= 1200000) return 45000 + (taxableIncome - 900000) * 0.15;
    if (taxableIncome <= 1500000) return 90000 + (taxableIncome - 1200000) * 0.20;
    return 150000 + (taxableIncome - 1500000) * 0.30;
}

function get80DLimit(ageGroup) {
    if (ageGroup === '80+' || ageGroup === '60-80') return 50000;
    return 25000;
}

function updateIncomeTaxResults(result) {
    // Update desktop results
    oldRegimeTaxElement.textContent = formatIncomeTaxCurrency(result.old_regime.total_tax);
    newRegimeTaxElement.textContent = formatIncomeTaxCurrency(result.new_regime.total_tax);
    oldRegimeTaxableIncomeElement.textContent = formatIncomeTaxCurrency(result.old_regime.taxable_income);
    newRegimeTaxableIncomeElement.textContent = formatIncomeTaxCurrency(result.new_regime.taxable_income);
    oldRegimeDeductionsElement.textContent = formatIncomeTaxCurrency(result.old_regime.total_deductions);
    newRegimeStandardDeductionElement.textContent = formatIncomeTaxCurrency(result.new_regime.standard_deduction);
    
    betterRegimeElement.textContent = result.better_regime;
    savingsAmountElement.textContent = formatIncomeTaxCurrency(result.savings_amount);
    
    // Update mobile results
    if (mobileOldRegimeTaxElement) {
        mobileOldRegimeTaxElement.textContent = formatIncomeTaxCurrency(result.old_regime.total_tax);
    }
    if (mobileNewRegimeTaxElement) {
        mobileNewRegimeTaxElement.textContent = formatIncomeTaxCurrency(result.new_regime.total_tax);
    }
    if (mobileBetterRegimeElement) {
        mobileBetterRegimeElement.textContent = result.better_regime;
    }
    if (mobileSavingsAmountElement) {
        mobileSavingsAmountElement.textContent = formatIncomeTaxCurrency(result.savings_amount);
    }
    
    // Update savings message
    let message = '';
    if (result.better_regime === 'Old Regime') {
        message = 'Old regime is better for you due to available deductions';
    } else if (result.better_regime === 'New Regime') {
        message = 'New regime is better with lower tax rates and no deduction hassles';
    } else {
        message = 'Both regimes result in similar tax liability';
    }
    savingsMessageElement.textContent = message;
    
    // Update card styling based on better regime
    updateCardStyling(result.better_regime);
}

function updateCardStyling(betterRegime) {
    const oldCard = document.querySelector('.old-regime-card');
    const newCard = document.querySelector('.new-regime-card');
    
    // Reset styling
    oldCard.style.border = '1px solid #e2e8f0';
    newCard.style.border = '1px solid #e2e8f0';
    oldCard.style.boxShadow = 'none';
    newCard.style.boxShadow = 'none';
    
    // Highlight better option
    if (betterRegime === 'Old Regime') {
        oldCard.style.border = '2px solid #059669';
        oldCard.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.15)';
    } else if (betterRegime === 'New Regime') {
        newCard.style.border = '2px solid #059669';
        newCard.style.boxShadow = '0 4px 16px rgba(5, 150, 105, 0.15)';
    }
}

function formatIncomeTaxCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showIncomeTaxError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('incomeTaxErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'incomeTaxErrorMessage';
        errorDiv.className = 'error-message';
        const activeTab = document.querySelector('.tab-content.active');
        if (activeTab) {
            activeTab.appendChild(errorDiv);
        }
    }
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearIncomeTaxError() {
    const errorDiv = document.getElementById('incomeTaxErrorMessage');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

// Tab switching functionality
function switchToTab(tabId) {
    // Update tab buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // Activate selected tab
    const targetButton = document.querySelector(`[data-tab="${tabId}"]`);
    const targetContent = document.getElementById(tabId);
    
    if (targetButton && targetContent) {
        targetButton.classList.add('active');
        targetContent.classList.add('active');
    }
    
    // Clear any existing errors when switching tabs
    clearIncomeTaxError();
}

// Tab button click handlers
document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchToTab(tabId);
        });
    });
});

// Mobile results toggle
function toggleMobileResults() {
    const mobileResultsSection = document.getElementById('mobileResultsSection');
    const toggleButton = document.querySelector('.mobile-toggle-btn');
    
    if (mobileResultsSection && toggleButton) {
        mobileResultsSection.classList.toggle('hidden');
        toggleButton.classList.toggle('open');
        
        const buttonText = toggleButton.querySelector('.btn-text');
        if (mobileResultsSection.classList.contains('hidden')) {
            buttonText.textContent = 'View Tax Summary';
        } else {
            buttonText.textContent = 'Hide Tax Summary';
        }
    }
}

// Reset calculator
function resetIncomeTaxCalculator() {
    // Reset all inputs to default values
    financialYearSelect.value = 'FY 2024-2025';
    ageGroupSelect.value = '0-60';
    
    // Income details
    salaryInput.value = '1200000';
    exemptAllowancesInput.value = '50000';
    selfOccupiedPropertyLossInput.value = '0';
    rentalIncomeInput.value = '0';
    digitalAssetIncomeInput.value = '0';
    interestHomeLoanLetoutInput.value = '0';
    otherIncomeInput.value = '0';
    
    // Deductions
    section80CInput.value = '150000';
    section80DInput.value = '25000';
    section80GInput.value = '0';
    section80TTAInput.value = '10000';
    section80CCD1Input.value = '50000';
    section80CCD2Input.value = '0';
    section80EEAInput.value = '0';
    otherDeductionsInput.value = '0';
    
    // Switch to basic details tab
    switchToTab('basic-details');
    
    // Update Section 80D limit
    updateSection80DLimit();
    
    // Reset results to 0 values
    resetResultsToZero();
    
    // Clear any errors
    clearIncomeTaxError();
}

// Reset results to show 0 values
function resetResultsToZero() {
    // Update desktop results
    oldRegimeTaxElement.textContent = '₹0';
    newRegimeTaxElement.textContent = '₹0';
    oldRegimeTaxableIncomeElement.textContent = '₹0';
    newRegimeTaxableIncomeElement.textContent = '₹0';
    oldRegimeDeductionsElement.textContent = '₹0';
    newRegimeStandardDeductionElement.textContent = '₹0';
    
    betterRegimeElement.textContent = 'Calculate to Compare';
    savingsAmountElement.textContent = '₹0';
    
    // Update mobile results
    if (mobileOldRegimeTaxElement) {
        mobileOldRegimeTaxElement.textContent = '₹0';
    }
    if (mobileNewRegimeTaxElement) {
        mobileNewRegimeTaxElement.textContent = '₹0';
    }
    if (mobileBetterRegimeElement) {
        mobileBetterRegimeElement.textContent = 'Calculate to Compare';
    }
    if (mobileSavingsAmountElement) {
        mobileSavingsAmountElement.textContent = '₹0';
    }
    
    // Update savings message
    savingsMessageElement.textContent = 'Enter your details and click "View Calculation" to compare tax regimes';
    
    // Reset card styling
    const oldCard = document.querySelector('.old-regime-card');
    const newCard = document.querySelector('.new-regime-card');
    
    if (oldCard && newCard) {
        oldCard.style.border = '1px solid #e2e8f0';
        newCard.style.border = '1px solid #e2e8f0';
        oldCard.style.boxShadow = 'none';
        newCard.style.boxShadow = 'none';
    }
}

// Download PDF functionality
function downloadIncomeTaxPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Income Tax Calculator Report', 20, 20);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.text(`${financialYearSelect.value} - ${ageGroupSelect.value} years`, 20, 35);
    
    // Add income details
    doc.setFontSize(14);
    doc.text('Income Details:', 20, 55);
    doc.setFontSize(10);
    let yPos = 65;
    
    const incomeDetails = [
        ['Salary Income:', formatIncomeTaxCurrency(parseFloat(salaryInput.value) || 0)],
        ['Exempt Allowances:', formatIncomeTaxCurrency(parseFloat(exemptAllowancesInput.value) || 0)],
        ['Rental Income:', formatIncomeTaxCurrency(parseFloat(rentalIncomeInput.value) || 0)],
        ['Digital Asset Income:', formatIncomeTaxCurrency(parseFloat(digitalAssetIncomeInput.value) || 0)],
        ['Other Income:', formatIncomeTaxCurrency(parseFloat(otherIncomeInput.value) || 0)]
    ];
    
    incomeDetails.forEach(([label, value]) => {
        doc.text(label, 20, yPos);
        doc.text(value, 120, yPos);
        yPos += 8;
    });
    
    // Add deductions
    yPos += 10;
    doc.setFontSize(14);
    doc.text('Deductions (Old Regime):', 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    
    const deductions = [
        ['Section 80C:', formatIncomeTaxCurrency(parseFloat(section80CInput.value) || 0)],
        ['Section 80D:', formatIncomeTaxCurrency(parseFloat(section80DInput.value) || 0)],
        ['Section 80G:', formatIncomeTaxCurrency(parseFloat(section80GInput.value) || 0)],
        ['Section 80TTA:', formatIncomeTaxCurrency(parseFloat(section80TTAInput.value) || 0)],
        ['Section 80CCD(1):', formatIncomeTaxCurrency(parseFloat(section80CCD1Input.value) || 0)],
        ['Section 80CCD(2):', formatIncomeTaxCurrency(parseFloat(section80CCD2Input.value) || 0)],
        ['Section 80EEA:', formatIncomeTaxCurrency(parseFloat(section80EEAInput.value) || 0)]
    ];
    
    deductions.forEach(([label, value]) => {
        doc.text(label, 20, yPos);
        doc.text(value, 120, yPos);
        yPos += 8;
    });
    
    // Add calculation results
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Tax Calculation Results:', 20, yPos);
    yPos += 10;
    doc.setFontSize(12);
    
    doc.text('Old Regime Tax:', 20, yPos);
    doc.text(oldRegimeTaxElement.textContent, 120, yPos);
    yPos += 10;
    
    doc.text('New Regime Tax:', 20, yPos);
    doc.text(newRegimeTaxElement.textContent, 120, yPos);
    yPos += 10;
    
    doc.text('Recommended Option:', 20, yPos);
    doc.text(betterRegimeElement.textContent, 120, yPos);
    yPos += 10;
    
    doc.text('Tax Savings:', 20, yPos);
    doc.text(savingsAmountElement.textContent, 120, yPos);
    
    // Add footer
    yPos += 20;
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos);
    doc.text('This is a computer-generated report for estimation purposes only.', 20, yPos + 8);
    
    // Save the PDF
    doc.save('income-tax-calculation-report.pdf');
}

// Mega menu functionality
function setupIncomeTaxMegaMenu() {
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

// Keyboard navigation for accessibility
document.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
        // Handle tab navigation between tabs
        const focusedElement = document.activeElement;
        if (focusedElement && focusedElement.classList.contains('tab-btn')) {
            if (e.shiftKey) {
                // Shift+Tab - go to previous tab
                const prevTab = focusedElement.previousElementSibling;
                if (prevTab && prevTab.classList.contains('tab-btn')) {
                    e.preventDefault();
                    prevTab.click();
                    prevTab.focus();
                }
            } else {
                // Tab - go to next tab
                const nextTab = focusedElement.nextElementSibling;
                if (nextTab && nextTab.classList.contains('tab-btn')) {
                    e.preventDefault();
                    nextTab.click();
                    nextTab.focus();
                }
            }
        }
    }
    
    if (e.key === 'Enter') {
        // Handle Enter key on buttons
        const focusedElement = document.activeElement;
        if (focusedElement && (focusedElement.classList.contains('continue-btn') || focusedElement.classList.contains('calculate-btn'))) {
            focusedElement.click();
        }
    }
});

// Input formatting for better UX
document.addEventListener('DOMContentLoaded', function() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        // Add thousand separators on blur
        input.addEventListener('blur', function() {
            if (this.value && !isNaN(this.value)) {
                const value = parseFloat(this.value);
                // Don't format while user is still typing
                if (document.activeElement !== this) {
                    this.setAttribute('data-value', value);
                }
            }
        });
        
        // Remove formatting on focus
        input.addEventListener('focus', function() {
            const value = this.getAttribute('data-value');
            if (value) {
                this.value = value;
            }
        });
    });
});

// Auto-save functionality (optional)
function saveToLocalStorage() {
    const formData = {
        financial_year: financialYearSelect.value,
        age_group: ageGroupSelect.value,
        salary: salaryInput.value,
        exempt_allowances: exemptAllowancesInput.value,
        self_occupied_property_loss: selfOccupiedPropertyLossInput.value,
        rental_income: rentalIncomeInput.value,
        digital_asset_income: digitalAssetIncomeInput.value,
        interest_home_loan_letout: interestHomeLoanLetoutInput.value,
        other_income: otherIncomeInput.value,
        section_80c: section80CInput.value,
        section_80d: section80DInput.value,
        section_80g: section80GInput.value,
        section_80tta: section80TTAInput.value,
        section_80ccd1: section80CCD1Input.value,
        section_80ccd2: section80CCD2Input.value,
        section_80eea: section80EEAInput.value,
        other_deductions: otherDeductionsInput.value
    };
    
    localStorage.setItem('incomeTaxCalculatorData', JSON.stringify(formData));
}

function loadFromLocalStorage() {
    const savedData = localStorage.getItem('incomeTaxCalculatorData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            
            // Only load if user wants to restore (could add a prompt here)
            financialYearSelect.value = formData.financial_year || 'FY 2024-2025';
            ageGroupSelect.value = formData.age_group || '0-60';
            salaryInput.value = formData.salary || '1200000';
            exemptAllowancesInput.value = formData.exempt_allowances || '50000';
            // ... load other fields
            
            updateSection80DLimit();
            calculateIncomeTax();
        } catch (error) {
            console.log('Error loading saved data:', error);
        }
    }
}

// Detailed Results Page Functions
let currentActiveRegime = 'new';
let currentDetailedResult = null;
let detailedChart = null;

function showDetailedResults(result) {
    currentDetailedResult = result;
    
    // Update basic information
    const fy = result.financial_year;
    const ay = fy === 'FY 2024-2025' ? '(AY 2025-2026)' : '(AY 2026-2027)';
    document.getElementById('detailedFY').textContent = fy;
    document.getElementById('detailedAY').textContent = ay;
    
    // Update filing due date
    const dueDate = fy === 'FY 2024-2025' ? 'July 31, 2025' : 'July 31, 2026';
    document.getElementById('filingDueDate').textContent = dueDate;
    
    // Set initial regime based on recommendation
    if (result.better_regime === 'New Regime') {
        currentActiveRegime = 'new';
        showNewRegimeBadge();
    } else if (result.better_regime === 'Old Regime') {
        currentActiveRegime = 'old';
        showOldRegimeBadge();
    } else {
        currentActiveRegime = 'new'; // Default to new regime
        hideRecommendationBadges();
    }
    
    // Update recommendation banner
    updateRecommendationBanner(result);
    
    // Update regime tabs
    updateRegimeTabs();
    
    // Update detailed breakdown
    updateDetailedBreakdown(result);
    
    // Create chart
    createDetailedChart(result);
    
    // Show the detailed results page
    document.getElementById('detailedResultsPage').classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function hideDetailedResults() {
    document.getElementById('detailedResultsPage').classList.add('hidden');
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Destroy chart if it exists
    if (detailedChart) {
        detailedChart.destroy();
        detailedChart = null;
    }
}

function updateRecommendationBanner(result) {
    const banner = document.getElementById('recommendationBanner');
    const text = document.getElementById('recommendationText');
    
    if (result.better_regime === 'New Regime') {
        banner.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        text.textContent = `New Tax Regime is recommended for you. It would save you ${formatIncomeTaxCurrency(result.savings_amount)} in taxes.`;
    } else if (result.better_regime === 'Old Regime') {
        banner.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        text.textContent = `Old Tax Regime is recommended for you. It would save you ${formatIncomeTaxCurrency(result.savings_amount)} in taxes.`;
    } else {
        banner.style.background = 'linear-gradient(135deg, #6b7280, #4b5563)';
        text.textContent = 'Both tax regimes result in similar tax liability. Choose based on your convenience.';
    }
}

function showNewRegimeBadge() {
    document.getElementById('newRegimeBadge').style.display = 'inline-block';
    const oldBadge = document.querySelector('[data-regime="old"] .recommended-badge');
    if (oldBadge) oldBadge.style.display = 'none';
}

function showOldRegimeBadge() {
    const newBadge = document.getElementById('newRegimeBadge');
    newBadge.style.display = 'none';
    
    // Create old regime badge if it doesn't exist
    let oldBadge = document.querySelector('[data-regime="old"] .recommended-badge');
    if (!oldBadge) {
        oldBadge = document.createElement('span');
        oldBadge.className = 'recommended-badge';
        oldBadge.textContent = 'Recommended';
        document.querySelector('[data-regime="old"]').appendChild(oldBadge);
    }
    oldBadge.style.display = 'inline-block';
}

function hideRecommendationBadges() {
    document.getElementById('newRegimeBadge').style.display = 'none';
    const oldBadge = document.querySelector('[data-regime="old"] .recommended-badge');
    if (oldBadge) oldBadge.style.display = 'none';
}

function switchRegimeTab(regime) {
    currentActiveRegime = regime;
    updateRegimeTabs();
    updateDetailedBreakdown(currentDetailedResult);
    createDetailedChart(currentDetailedResult);
}

function updateRegimeTabs() {
    const tabs = document.querySelectorAll('.regime-tab');
    tabs.forEach(tab => {
        if (tab.dataset.regime === currentActiveRegime) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
}

function updateDetailedBreakdown(result) {
    const regime = currentActiveRegime === 'new' ? result.new_regime : result.old_regime;
    
    // Update main values
    document.getElementById('detailedTotalIncome').textContent = formatIncomeTaxCurrency(result.total_income);
    document.getElementById('detailedTaxableIncome').textContent = formatIncomeTaxCurrency(regime.taxable_income);
    document.getElementById('detailedTaxPayable').textContent = formatIncomeTaxCurrency(regime.total_tax);
    
    // Update deductions section
    if (currentActiveRegime === 'new') {
        document.getElementById('detailedTotalDeductions').textContent = formatIncomeTaxCurrency(regime.standard_deduction);
        document.getElementById('deductionTypeLabel').textContent = 'Standard Deductions';
        document.getElementById('detailedStandardDeductions').textContent = formatIncomeTaxCurrency(regime.standard_deduction);
        document.getElementById('chapterDeductionsRow').style.display = 'none';
    } else {
        document.getElementById('detailedTotalDeductions').textContent = formatIncomeTaxCurrency(regime.total_deductions);
        document.getElementById('deductionTypeLabel').textContent = 'Chapter VI A Deductions';
        document.getElementById('detailedStandardDeductions').textContent = formatIncomeTaxCurrency(regime.total_deductions);
        document.getElementById('chapterDeductionsRow').style.display = 'flex';
        document.getElementById('detailedChapterDeductions').textContent = formatIncomeTaxCurrency(regime.total_deductions);
    }
    
    // Update exempt allowances (same for both regimes)
    const exemptAllowances = parseFloat(exemptAllowancesInput.value) || 0;
    document.getElementById('detailedExemptAllowances').textContent = formatIncomeTaxCurrency(exemptAllowances);
    
    // Update tax breakdown
    document.getElementById('detailedIncomeTax').textContent = formatIncomeTaxCurrency(regime.income_tax || 0);
    document.getElementById('detailedSurcharge').textContent = '₹0'; // Add surcharge calculation if needed
    document.getElementById('detailedCess').textContent = formatIncomeTaxCurrency(regime.cess || 0);
}

function createDetailedChart(result) {
    const ctx = document.getElementById('detailedTaxChart').getContext('2d');
    
    // Destroy existing chart
    if (detailedChart) {
        detailedChart.destroy();
    }
    
    const regime = currentActiveRegime === 'new' ? result.new_regime : result.old_regime;
    const deductions = currentActiveRegime === 'new' ? regime.standard_deduction : regime.total_deductions;
    
    const data = {
        labels: ['Total Income', 'Taxable Income', 'Deductions', 'Tax Payable'],
        datasets: [{
            data: [
                result.total_income,
                regime.taxable_income,
                deductions,
                regime.total_tax
            ],
            backgroundColor: [
                '#dbeafe',
                '#93c5fd', 
                '#1d4ed8',
                '#10b981'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    detailedChart = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + (value / 100000).toFixed(1) + 'L';
                        }
                    }
                }
            }
        }
    });
}

function downloadDetailedPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    if (!currentDetailedResult) {
        alert('No calculation data available');
        return;
    }
    
    const result = currentDetailedResult;
    const regime = currentActiveRegime === 'new' ? result.new_regime : result.old_regime;
    
    // Add title
    doc.setFontSize(20);
    doc.text('Income Tax Detailed Report', 20, 20);
    
    // Add subtitle
    doc.setFontSize(12);
    doc.text(`${result.financial_year} - ${result.age_group} years`, 20, 35);
    doc.text(`Regime: ${currentActiveRegime === 'new' ? 'New Tax Regime' : 'Old Tax Regime'}`, 20, 45);
    
    // Add recommendation
    doc.setFontSize(14);
    doc.text('Recommendation:', 20, 65);
    doc.setFontSize(10);
    doc.text(`${result.better_regime} is recommended`, 20, 75);
    doc.text(`Tax savings: ${formatIncomeTaxCurrency(result.savings_amount)}`, 20, 85);
    
    // Add breakdown
    let yPos = 105;
    doc.setFontSize(14);
    doc.text('Tax Breakdown:', 20, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    const breakdown = [
        ['Total Income:', formatIncomeTaxCurrency(result.total_income)],
        ['Taxable Income:', formatIncomeTaxCurrency(regime.taxable_income)],
        ['Total Deductions:', formatIncomeTaxCurrency(currentActiveRegime === 'new' ? regime.standard_deduction : regime.total_deductions)],
        ['Income Tax:', formatIncomeTaxCurrency(regime.income_tax || 0)],
        ['Health & Education Cess:', formatIncomeTaxCurrency(regime.cess || 0)],
        ['Total Tax Payable:', formatIncomeTaxCurrency(regime.total_tax)]
    ];
    
    breakdown.forEach(([label, value]) => {
        doc.text(label, 20, yPos);
        doc.text(value, 120, yPos);
        yPos += 10;
    });
    
    // Add comparison
    yPos += 15;
    doc.setFontSize(14);
    doc.text('Regime Comparison:', 20, yPos);
    yPos += 15;
    doc.setFontSize(10);
    
    doc.text('New Regime Tax:', 20, yPos);
    doc.text(formatIncomeTaxCurrency(result.new_regime.total_tax), 120, yPos);
    yPos += 10;
    
    doc.text('Old Regime Tax:', 20, yPos);
    doc.text(formatIncomeTaxCurrency(result.old_regime.total_tax), 120, yPos);
    yPos += 10;
    
    doc.text('Difference:', 20, yPos);
    doc.text(formatIncomeTaxCurrency(result.savings_amount), 120, yPos);
    
    // Add footer
    yPos += 20;
    doc.setFontSize(8);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-IN')}`, 20, yPos);
    doc.text('This is a computer-generated report for estimation purposes only.', 20, yPos + 8);
    
    // Save the PDF
    doc.save(`income-tax-detailed-report-${result.financial_year.replace(/\s+/g, '-').toLowerCase()}.pdf`);
}

// Optional: Auto-save every 30 seconds
// setInterval(saveToLocalStorage, 30000);