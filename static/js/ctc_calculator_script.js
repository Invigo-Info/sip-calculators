// CTC Calculator Script

let ctcChart = null;

// Input elements
const ctcAmountInput = document.getElementById('ctcAmount');
const ctcSlider = document.getElementById('ctcSlider');
const ctcFrequencyLabel = document.getElementById('ctcFrequencyLabel');
const monthlyToggle = document.getElementById('monthlyToggle');
const yearlyToggle = document.getElementById('yearlyToggle');
const ctcMinLabel = document.getElementById('ctcMinLabel');
const ctcMaxLabel = document.getElementById('ctcMaxLabel');
const basicSalaryPercentInput = document.getElementById('basicSalaryPercent');
const basicSalaryPercentSlider = document.getElementById('basicSalaryPercentSlider');
const hraPercentInput = document.getElementById('hraPercent');
const hraPercentSlider = document.getElementById('hraPercentSlider');
const specialAllowanceInput = document.getElementById('specialAllowance');
const bonusAmountInput = document.getElementById('bonusAmount');
const employerPfPercentInput = document.getElementById('employerPfPercent');
const employeePfPercentInput = document.getElementById('employeePfPercent');
const gratuityPercentInput = document.getElementById('gratuityPercent');
const professionalTaxInput = document.getElementById('professionalTax');

// Tax Regime elements
const oldRegimeBtn = document.getElementById('oldRegimeBtn');
const newRegimeBtn = document.getElementById('newRegimeBtn');
const taxDeductionsSection = document.getElementById('taxDeductionsSection');

// Tax deduction inputs
const metroCityInput = document.getElementById('metroCity');
const monthlyRentInput = document.getElementById('monthlyRent');
const section80CInput = document.getElementById('section80C');
const section80CCD1BInput = document.getElementById('section80CCD1B');
const section80DInput = document.getElementById('section80D');
const seniorCitizensInput = document.getElementById('seniorCitizens');
const includeParentsInput = document.getElementById('includeParents');
const section80TTAInput = document.getElementById('section80TTA');
const homeLoanInterestInput = document.getElementById('homeLoanInterest');
const propertyRentedOutInput = document.getElementById('propertyRentedOut');
const epfApplicableInput = document.getElementById('epfApplicable');
const professionalTaxApplicableInput = document.getElementById('professionalTaxApplicable');

// CTC frequency state
let currentCtcFrequency = 'monthly';
let currentTaxRegime = 'new';

// Advanced settings toggle
const advancedToggle = document.getElementById('advancedToggle');
const advancedContent = document.getElementById('advancedContent');

// Custom Chart.js plugin to display CTC in center
const ctcCenterTextPlugin = {
    id: 'ctcCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.ctcCenterText && chart.config.options.plugins.ctcCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw CTC value
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.ctcCenterText.text, centerX, centerY - 10);
            
            // Draw "Annual CTC" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Annual CTC', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(ctcCenterTextPlugin);

// Initialize calculator when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    setupCtcSliders();
    addCtcEventListeners();
    initialSyncCtcValues();
    setupCtcToggle();
    setupTaxRegimeToggle();
    setupCtcAdvancedToggle();
    calculateAndUpdateCtcResults();
    setupCtcMegaMenu();
    setupCtcTableToggle();
    
    // Add demo data for testing
    if (window.location.search.includes('demo=1')) {
        loadDemoData();
    }
});

function loadDemoData() {
    // Set demo values to show the difference between regimes
    ctcAmountInput.value = 100000; // ₹1L monthly = ₹12L annually
    ctcSlider.value = 100000;
    monthlyRentInput.value = 25000;
    section80CInput.value = 150000;
    section80DInput.value = 25000;
    metroCityInput.checked = true;
    
    // Switch to yearly mode first
    switchCtcFrequency('yearly');
    ctcAmountInput.value = 1200000;
    ctcSlider.value = 1200000;
    
    // Calculate for both regimes to show difference
    setTimeout(() => {
        switchTaxRegime('old');
        console.log('Demo loaded: Try switching between Old and New regime to see the difference!');
    }, 1000);
}

function setupCtcSliders() {
    syncCtcInputs(ctcAmountInput, ctcSlider);
    syncCtcInputs(basicSalaryPercentInput, basicSalaryPercentSlider);
    syncCtcInputs(hraPercentInput, hraPercentSlider);
}

function initialSyncCtcValues() {
    // Ensure initial values are properly synchronized
    ctcSlider.value = ctcAmountInput.value;
    basicSalaryPercentSlider.value = basicSalaryPercentInput.value;
    hraPercentSlider.value = hraPercentInput.value;
}

function setupCtcToggle() {
    // Monthly toggle click
    monthlyToggle.addEventListener('click', function() {
        if (currentCtcFrequency !== 'monthly') {
            switchCtcFrequency('monthly');
        }
    });
    
    // Yearly toggle click
    yearlyToggle.addEventListener('click', function() {
        if (currentCtcFrequency !== 'yearly') {
            switchCtcFrequency('yearly');
        }
    });
}

function switchCtcFrequency(newFrequency) {
    const currentValue = parseFloat(ctcAmountInput.value) || 0;
    let newValue;
    
    // Convert current value to new frequency
    if (currentCtcFrequency === 'monthly' && newFrequency === 'yearly') {
        newValue = currentValue * 12;
    } else if (currentCtcFrequency === 'yearly' && newFrequency === 'monthly') {
        newValue = currentValue / 12;
    } else {
        newValue = currentValue;
    }
    
    // Update frequency state
    currentCtcFrequency = newFrequency;
    
    // Update toggle buttons
    if (newFrequency === 'monthly') {
        monthlyToggle.classList.add('active');
        yearlyToggle.classList.remove('active');
        ctcFrequencyLabel.textContent = 'monthly';
        
        // Update input limits for monthly
        ctcAmountInput.min = '10000';
        ctcAmountInput.max = '1000000';
        ctcAmountInput.step = '1000';
        ctcSlider.min = '10000';
        ctcSlider.max = '1000000';
        ctcSlider.step = '1000';
        
        // Update labels
        ctcMinLabel.textContent = '₹10K';
        ctcMaxLabel.textContent = '₹10L';
    } else {
        yearlyToggle.classList.add('active');
        monthlyToggle.classList.remove('active');
        ctcFrequencyLabel.textContent = 'yearly';
        
        // Update input limits for yearly
        ctcAmountInput.min = '120000';
        ctcAmountInput.max = '12000000';
        ctcAmountInput.step = '10000';
        ctcSlider.min = '120000';
        ctcSlider.max = '12000000';
        ctcSlider.step = '10000';
        
        // Update labels
        ctcMinLabel.textContent = '₹1.2L';
        ctcMaxLabel.textContent = '₹1.2Cr';
    }
    
    // Update input and slider values
    ctcAmountInput.value = Math.round(newValue);
    ctcSlider.value = Math.round(newValue);
    
    // Recalculate results
    calculateAndUpdateCtcResults();
}

function syncCtcInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateCtcResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateCtcResults();
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
        calculateAndUpdateCtcResults();
    });
}

function setupTaxRegimeToggle() {
    // Old regime button click
    oldRegimeBtn.addEventListener('click', function() {
        if (currentTaxRegime !== 'old') {
            switchTaxRegime('old');
        }
    });
    
    // New regime button click
    newRegimeBtn.addEventListener('click', function() {
        if (currentTaxRegime !== 'new') {
            switchTaxRegime('new');
        }
    });
}

function switchTaxRegime(regime) {
    currentTaxRegime = regime;
    
    // Update toggle buttons
    if (regime === 'old') {
        oldRegimeBtn.classList.add('active');
        newRegimeBtn.classList.remove('active');
        taxDeductionsSection.classList.remove('hidden');
    } else {
        newRegimeBtn.classList.add('active');
        oldRegimeBtn.classList.remove('active');
        taxDeductionsSection.classList.add('hidden');
    }
    
    // Recalculate results
    calculateAndUpdateCtcResults();
}

function addCtcEventListeners() {
    // Add change listeners for all inputs
    [ctcAmountInput, basicSalaryPercentInput, hraPercentInput, specialAllowanceInput, 
     bonusAmountInput, employerPfPercentInput, employeePfPercentInput, gratuityPercentInput, 
     professionalTaxInput, monthlyRentInput, section80CInput, section80CCD1BInput, 
     section80DInput, section80TTAInput, homeLoanInterestInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateCtcResults);
        input.addEventListener('keyup', calculateAndUpdateCtcResults);
    });

    // Add input listeners for sliders
    [ctcSlider, basicSalaryPercentSlider, hraPercentSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateCtcResults);
    });

    // Add change listeners for checkboxes
    [metroCityInput, seniorCitizensInput, includeParentsInput, propertyRentedOutInput, 
     epfApplicableInput, professionalTaxApplicableInput].forEach(checkbox => {
        checkbox.addEventListener('change', calculateAndUpdateCtcResults);
    });
}

function setupCtcAdvancedToggle() {
    advancedToggle.addEventListener('click', function() {
        const isHidden = advancedContent.classList.contains('hidden');
        
        if (isHidden) {
            advancedContent.classList.remove('hidden');
            advancedToggle.classList.add('active');
        } else {
            advancedContent.classList.add('hidden');
            advancedToggle.classList.remove('active');
        }
    });
}

function calculateAndUpdateCtcResults() {
    const ctcAmount = parseFloat(ctcAmountInput.value) || 0;
    const basicSalaryPercent = parseFloat(basicSalaryPercentInput.value) || 40;
    const hraPercent = parseFloat(hraPercentInput.value) || 40;
    const specialAllowance = parseFloat(specialAllowanceInput.value) || 0;
    const bonusAmount = parseFloat(bonusAmountInput.value) || 0;
    const employerPfPercent = parseFloat(employerPfPercentInput.value) || 12;
    const employeePfPercent = parseFloat(employeePfPercentInput.value) || 12;
    const gratuityPercent = parseFloat(gratuityPercentInput.value) || 4.81;
    const professionalTax = parseFloat(professionalTaxInput.value) || 2400;

    // Convert to annual CTC if currently in monthly mode
    const annualCtc = currentCtcFrequency === 'monthly' ? ctcAmount * 12 : ctcAmount;

    // Validate inputs
    if (ctcAmount <= 0) {
        showCtcError('CTC amount must be greater than 0');
        return;
    }

    if (basicSalaryPercent < 30 || basicSalaryPercent > 60) {
        showCtcError('Basic Salary percentage should be between 30% and 60%');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-ctc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            annual_ctc: annualCtc,
            basic_salary_percent: basicSalaryPercent,
            hra_percent: hraPercent,
            special_allowance: specialAllowance,
            bonus_amount: bonusAmount,
            employer_pf_percent: employerPfPercent,
            employee_pf_percent: employeePfPercent,
            gratuity_percent: gratuityPercent,
            professional_tax: professionalTax,
            tax_regime: currentTaxRegime,
            metro_city: metroCityInput.checked,
            monthly_rent: parseFloat(monthlyRentInput.value) || 0,
            section_80c: parseFloat(section80CInput.value) || 0,
            section_80ccd1b: parseFloat(section80CCD1BInput.value) || 0,
            section_80d: parseFloat(section80DInput.value) || 0,
            senior_citizens: seniorCitizensInput.checked,
            include_parents: includeParentsInput.checked,
            section_80tta: parseFloat(section80TTAInput.value) || 0,
            home_loan_interest: parseFloat(homeLoanInterestInput.value) || 0,
            property_rented_out: propertyRentedOutInput.checked,
            epf_applicable: epfApplicableInput.checked,
            professional_tax_applicable: professionalTaxApplicableInput.checked
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showCtcError(result.error);
            return;
        }
        
        // Update display
        updateCtcResultsDisplay(result);
        updateCtcChart(result);
        updateCtcTable(result);
        clearCtcError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateCtcClientSide(annualCtc, basicSalaryPercent, hraPercent, 
            specialAllowance, bonusAmount, employerPfPercent, employeePfPercent, 
            gratuityPercent, professionalTax);
        updateCtcResultsDisplay(result);
        updateCtcChart(result);
        updateCtcTable(result);
    });
}

function calculateCtcClientSide(annualCtc, basicSalaryPercent, hraPercent, specialAllowance, 
    bonusAmount, employerPfPercent, employeePfPercent, gratuityPercent, professionalTax) {
    
    // Get tax regime and deduction values
    const taxRegime = currentTaxRegime;
    const metroCity = metroCityInput.checked;
    const monthlyRent = parseFloat(monthlyRentInput.value) || 0;
    const section80C = parseFloat(section80CInput.value) || 0;
    const section80CCD1B = parseFloat(section80CCD1BInput.value) || 0;
    const section80D = parseFloat(section80DInput.value) || 0;
    const seniorCitizens = seniorCitizensInput.checked;
    const includeParents = includeParentsInput.checked;
    const section80TTA = parseFloat(section80TTAInput.value) || 0;
    const homeLoanInterest = parseFloat(homeLoanInterestInput.value) || 0;
    const propertyRentedOut = propertyRentedOutInput.checked;
    const epfApplicable = epfApplicableInput.checked;
    const professionalTaxApplicable = professionalTaxApplicableInput.checked;
    
    // Calculate basic salary
    const basicSalaryAnnual = (annualCtc * basicSalaryPercent) / 100;
    const basicSalaryMonthly = basicSalaryAnnual / 12;
    
    // Calculate HRA
    const hraAnnual = (basicSalaryAnnual * hraPercent) / 100;
    const hraMonthly = hraAnnual / 12;
    
    // Calculate employer contributions
    const employerPfAnnual = (basicSalaryAnnual * employerPfPercent) / 100;
    const employerPfMonthly = employerPfAnnual / 12;
    
    const gratuityAnnual = (basicSalaryAnnual * gratuityPercent) / 100;
    const gratuityMonthly = gratuityAnnual / 12;
    
    // Calculate gross salary (CTC - employer contributions)
    const grossSalaryAnnual = annualCtc - employerPfAnnual - gratuityAnnual;
    const grossSalaryMonthly = grossSalaryAnnual / 12;
    
    // Calculate employee deductions
    const employeePfAnnual = epfApplicable ? (basicSalaryAnnual * employeePfPercent) / 100 : 0;
    const employeePfMonthly = employeePfAnnual / 12;
    
    const professionalTaxMonthly = professionalTaxApplicable ? professionalTax / 12 : 0;
    
    // Calculate HRA exemption for old regime
    let hraExemption = 0;
    if (taxRegime === 'old' && monthlyRent > 0) {
        const annualRent = monthlyRent * 12;
        const hraPercentLimit = metroCity ? 0.5 : 0.4;
        const hraLimitBasic = basicSalaryAnnual * hraPercentLimit;
        const rentMinus10PercentBasic = annualRent - (basicSalaryAnnual * 0.1);
        
        hraExemption = Math.min(hraAnnual, hraLimitBasic, Math.max(0, rentMinus10PercentBasic));
    }
    
    // Calculate income tax based on regime
    let incomeTaxAnnual = 0;
    let taxableIncome = 0;
    
    if (taxRegime === 'old') {
        // Old tax regime with deductions
        let totalDeductions = 0;
        
        // Standard deduction
        const standardDeduction = Math.min(50000, grossSalaryAnnual);
        totalDeductions += standardDeduction;
        
        // EPF deduction
        if (epfApplicable) {
            totalDeductions += employeePfAnnual;
        }
        
        // HRA exemption
        totalDeductions += hraExemption;
        
        // Section 80C (max 150000)
        totalDeductions += Math.min(section80C, 150000);
        
        // Section 80CCD(1B) - NPS (max 50000)
        totalDeductions += Math.min(section80CCD1B, 50000);
        
        // Section 80D - Health Insurance
        let healthInsuranceLimit = 25000;
        if (seniorCitizens) {
            healthInsuranceLimit = 50000;
        }
        if (includeParents) {
            healthInsuranceLimit += seniorCitizens ? 50000 : 25000;
        }
        totalDeductions += Math.min(section80D, healthInsuranceLimit);
        
        // Section 80TTA - Savings Interest (max 10000)
        totalDeductions += Math.min(section80TTA, 10000);
        
        // Home loan interest deduction
        const homeLoanLimit = propertyRentedOut ? 300000 : 200000;
        totalDeductions += Math.min(homeLoanInterest, homeLoanLimit);
        
        taxableIncome = Math.max(0, grossSalaryAnnual - totalDeductions);
        
        // Old regime tax slabs
        if (taxableIncome > 250000) {
            if (taxableIncome <= 500000) {
                incomeTaxAnnual = (taxableIncome - 250000) * 0.05;
            } else if (taxableIncome <= 1000000) {
                incomeTaxAnnual = 250000 * 0.05 + (taxableIncome - 500000) * 0.20;
            } else {
                incomeTaxAnnual = 250000 * 0.05 + 500000 * 0.20 + (taxableIncome - 1000000) * 0.30;
            }
        }
    } else {
        // New tax regime (no deductions except standard deduction and EPF)
        let totalDeductions = 0;
        
        // Standard deduction
        const standardDeduction = Math.min(50000, grossSalaryAnnual);
        totalDeductions += standardDeduction;
        
        // EPF deduction (always allowed)
        if (epfApplicable) {
            totalDeductions += employeePfAnnual;
        }
        
        taxableIncome = Math.max(0, grossSalaryAnnual - totalDeductions);
        
        // New regime tax slabs (2024-25)
        if (taxableIncome > 300000) {
            if (taxableIncome <= 600000) {
                incomeTaxAnnual = (taxableIncome - 300000) * 0.05;
            } else if (taxableIncome <= 900000) {
                incomeTaxAnnual = 300000 * 0.05 + (taxableIncome - 600000) * 0.10;
            } else if (taxableIncome <= 1200000) {
                incomeTaxAnnual = 300000 * 0.05 + 300000 * 0.10 + (taxableIncome - 900000) * 0.15;
            } else if (taxableIncome <= 1500000) {
                incomeTaxAnnual = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + (taxableIncome - 1200000) * 0.20;
            } else {
                incomeTaxAnnual = 300000 * 0.05 + 300000 * 0.10 + 300000 * 0.15 + 300000 * 0.20 + (taxableIncome - 1500000) * 0.30;
            }
        }
    }
    
    const incomeTaxMonthly = incomeTaxAnnual / 12;
    
    // Calculate take-home salary
    const totalDeductionsMonthly = employeePfMonthly + professionalTaxMonthly + incomeTaxMonthly;
    const totalDeductionsAnnual = totalDeductionsMonthly * 12;
    
    const takehomeMonthly = grossSalaryMonthly - totalDeductionsMonthly;
    const takehomeAnnual = takehomeMonthly * 12;
    
    const takehomePercentage = (takehomeAnnual / annualCtc) * 100;
    
    const totalContributionsMonthly = employerPfMonthly + gratuityMonthly;
    const totalContributionsAnnual = totalContributionsMonthly * 12;
    
    const bonusMonthly = bonusAmount / 12;
    const specialAllowanceMonthly = specialAllowance / 12;
    
    return {
        annual_ctc: annualCtc,
        monthly_gross: grossSalaryMonthly,
        monthly_takehome: takehomeMonthly,
        takehome_percentage: takehomePercentage,
        basic_salary_monthly: basicSalaryMonthly,
        hra_monthly: hraMonthly,
        special_allowance_monthly: specialAllowanceMonthly,
        bonus_monthly: bonusMonthly,
        gross_salary_monthly: grossSalaryMonthly,
        employee_pf_monthly: employeePfMonthly,
        professional_tax_monthly: professionalTaxMonthly,
        income_tax_monthly: incomeTaxMonthly,
        total_deductions_monthly: totalDeductionsMonthly,
        employer_pf_monthly: employerPfMonthly,
        gratuity_monthly: gratuityMonthly,
        total_contributions_monthly: totalContributionsMonthly,
        takehome_annual: takehomeAnnual,
        total_deductions_annual: totalDeductionsAnnual,
        total_contributions_annual: totalContributionsAnnual,
        tax_regime: taxRegime,
        hra_exemption: hraExemption,
        taxable_income: taxableIncome
    };
}

function updateCtcResultsDisplay(result) {
    document.getElementById('annualCtcResult').textContent = formatCtcCurrency(result.annual_ctc);
    document.getElementById('monthlyGrossResult').textContent = formatCtcCurrency(result.monthly_gross);
    document.getElementById('monthlyTakehomeResult').textContent = formatCtcCurrency(result.monthly_takehome);
    document.getElementById('takehomePercentageResult').textContent = result.takehome_percentage.toFixed(1) + '%';
    
    // Update tax regime display
    const taxRegimeText = result.tax_regime === 'old' ? 'Old Regime' : 'New Regime';
    document.getElementById('currentTaxRegimeResult').textContent = taxRegimeText;
    
    // Update breakdown
    document.getElementById('basicSalaryAmount').textContent = formatCtcCurrency(result.basic_salary_monthly);
    document.getElementById('hraAmount').textContent = formatCtcCurrency(result.hra_monthly);
    document.getElementById('specialAllowanceAmount').textContent = formatCtcCurrency(result.special_allowance_monthly);
    document.getElementById('bonusMonthlyAmount').textContent = formatCtcCurrency(result.bonus_monthly);
    document.getElementById('grossSalaryAmount').textContent = formatCtcCurrency(result.gross_salary_monthly);
    
    document.getElementById('employeePfAmount').textContent = formatCtcCurrency(result.employee_pf_monthly);
    document.getElementById('professionalTaxAmount').textContent = formatCtcCurrency(result.professional_tax_monthly);
    document.getElementById('incomeTaxAmount').textContent = formatCtcCurrency(result.income_tax_monthly || 0);
    document.getElementById('totalDeductionsAmount').textContent = formatCtcCurrency(result.total_deductions_monthly);
    
    document.getElementById('employerPfAmount').textContent = formatCtcCurrency(result.employer_pf_monthly);
    document.getElementById('gratuityAmount').textContent = formatCtcCurrency(result.gratuity_monthly);
    document.getElementById('totalContributionsAmount').textContent = formatCtcCurrency(result.total_contributions_monthly);
    
    // Update chart summary
    document.getElementById('takehomeDisplay').textContent = formatCtcCurrency(result.takehome_annual);
    document.getElementById('deductionsDisplay').textContent = formatCtcCurrency(result.total_deductions_annual);
    document.getElementById('contributionsDisplay').textContent = formatCtcCurrency(result.total_contributions_annual);
    
    // Update tax breakdown section
    updateTaxBreakdownSection(result);
    
    // Add visual feedback for tax savings in old regime
    if (result.tax_regime === 'old' && result.hra_exemption > 0) {
        showTaxSavingsMessage(`HRA Exemption: ${formatCtcCurrency(result.hra_exemption)}`);
    }
}

function updateTaxBreakdownSection(result) {
    const taxRegimeText = result.tax_regime === 'old' ? 'Old Regime' : 'New Regime';
    document.getElementById('currentRegimeDisplay').textContent = taxRegimeText;
    document.getElementById('taxableIncomeDisplay').textContent = formatCtcCurrency(result.taxable_income || 0);
    document.getElementById('annualIncomeTaxDisplay').textContent = formatCtcCurrency(result.income_tax_annual || 0);
    
    // Show/hide HRA exemption for old regime
    const hraExemptionInfo = document.getElementById('hraExemptionInfo');
    if (result.tax_regime === 'old') {
        hraExemptionInfo.classList.remove('hidden');
        document.getElementById('hraExemptionDisplay').textContent = formatCtcCurrency(result.hra_exemption || 0);
    } else {
        hraExemptionInfo.classList.add('hidden');
    }
    
    // Update regime switch advice
    const adviceElement = document.getElementById('regimeSwitchAdvice');
    if (result.tax_regime === 'old') {
        adviceElement.textContent = '✅ You are using Old Regime with tax deductions. Consider maximizing your investments for better tax savings.';
    } else {
        adviceElement.textContent = '💡 Switch to Old Regime if you have tax-saving investments to reduce your tax liability.';
    }
}

function updateCtcChart(result) {
    const ctx = document.getElementById('ctcChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (ctcChart) {
        ctcChart.destroy();
    }
    
    const data = {
        labels: ['Take-Home Salary', 'Employee Deductions', 'Employer Contributions'],
        datasets: [{
            data: [
                result.takehome_annual,
                result.total_deductions_annual,
                result.total_contributions_annual
            ],
            backgroundColor: [
                '#27ae60',
                '#e74c3c',
                '#3498db'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    ctcChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                ctcCenterText: {
                    display: true,
                    text: formatCtcCurrency(result.annual_ctc)
                }
            },
            cutout: '60%'
        }
    });
}

function updateCtcTable(result) {
    const tableBody = document.getElementById('ctcDetailTableBody');
    tableBody.innerHTML = '';
    
    const components = [
        { name: 'Basic Salary', monthly: result.basic_salary_monthly, annual: result.basic_salary_monthly * 12 },
        { name: 'HRA', monthly: result.hra_monthly, annual: result.hra_monthly * 12 },
        { name: 'Special Allowance', monthly: result.special_allowance_monthly, annual: result.special_allowance_monthly * 12 },
        { name: 'Bonus/Variable Pay', monthly: result.bonus_monthly, annual: result.bonus_monthly * 12 },
        { name: 'Employee PF (Deduction)', monthly: -result.employee_pf_monthly, annual: -result.employee_pf_monthly * 12 },
        { name: 'Professional Tax (Deduction)', monthly: -result.professional_tax_monthly, annual: -result.professional_tax_monthly * 12 },
        { name: 'Income Tax (Deduction)', monthly: -(result.income_tax_monthly || 0), annual: -(result.income_tax_monthly || 0) * 12 },
        { name: 'Employer PF Contribution', monthly: result.employer_pf_monthly, annual: result.employer_pf_monthly * 12 },
        { name: 'Gratuity', monthly: result.gratuity_monthly, annual: result.gratuity_monthly * 12 }
    ];
    
    components.forEach(component => {
        const row = tableBody.insertRow();
        const percentage = ((Math.abs(component.annual) / result.annual_ctc) * 100).toFixed(2);
        
        row.innerHTML = `
            <td>${component.name}</td>
            <td>${formatCtcCurrency(Math.abs(component.monthly))}</td>
            <td>${formatCtcCurrency(Math.abs(component.annual))}</td>
            <td>${percentage}%</td>
        `;
        
        // Style deduction rows differently
        if (component.name.includes('Deduction')) {
            row.style.color = '#e74c3c';
        } else if (component.name.includes('Contribution')) {
            row.style.color = '#3498db';
        }
    });
}

function formatCtcCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showCtcError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('ctcErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'ctcErrorMessage';
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

function clearCtcError() {
    const errorDiv = document.getElementById('ctcErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function showTaxSavingsMessage(message) {
    // Create or update tax savings message
    let savingsDiv = document.getElementById('ctcTaxSavingsMessage');
    if (!savingsDiv) {
        savingsDiv = document.createElement('div');
        savingsDiv.id = 'ctcTaxSavingsMessage';
        savingsDiv.style.cssText = `
            background: #d1f2eb;
            border: 1px solid #7dcea0;
            color: #1e6f42;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
            font-weight: 500;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        savingsDiv.innerHTML = '<span style="font-size: 16px;">💰</span> ' + message;
        document.querySelector('.results-section').appendChild(savingsDiv);
    } else {
        savingsDiv.innerHTML = '<span style="font-size: 16px;">💰</span> ' + message;
        savingsDiv.style.display = 'flex';
    }
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (savingsDiv) {
            savingsDiv.style.display = 'none';
        }
    }, 5000);
}

function setupCtcMegaMenu() {
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

function setupCtcTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('ctcTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleCtcTable() {
    const tableSection = document.getElementById('ctcTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadCtcPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('CTC Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const ctcAmount = parseFloat(ctcAmountInput.value) || 0;
    const annualCtc = currentCtcFrequency === 'monthly' ? ctcAmount * 12 : ctcAmount;
    const basicSalaryPercent = parseFloat(basicSalaryPercentInput.value) || 40;
    const hraPercent = parseFloat(hraPercentInput.value) || 40;
    const specialAllowance = parseFloat(specialAllowanceInput.value) || 0;
    const bonusAmount = parseFloat(bonusAmountInput.value) || 0;
    const employerPfPercent = parseFloat(employerPfPercentInput.value) || 12;
    const employeePfPercent = parseFloat(employeePfPercentInput.value) || 12;
    const gratuityPercent = parseFloat(gratuityPercentInput.value) || 4.81;
    const professionalTax = parseFloat(professionalTaxInput.value) || 2400;
    
    doc.text(`CTC (${currentCtcFrequency}): ${formatCtcCurrency(ctcAmount)}`, 20, 40);
    doc.text(`Annual CTC: ${formatCtcCurrency(annualCtc)}`, 20, 50);
    doc.text(`Basic Salary: ${basicSalaryPercent}% of CTC`, 20, 60);
    doc.text(`HRA: ${hraPercent}% of Basic`, 20, 70);
    doc.text(`Special Allowance: ${formatCtcCurrency(specialAllowance)}`, 20, 80);
    doc.text(`Bonus/Variable Pay: ${formatCtcCurrency(bonusAmount)}`, 20, 90);
    doc.text(`Employee PF: ${employeePfPercent}%`, 20, 100);
    doc.text(`Professional Tax: ${formatCtcCurrency(professionalTax)}`, 20, 110);
    
    // Calculate and add results
    const result = calculateCtcClientSide(annualCtc, basicSalaryPercent, hraPercent, 
        specialAllowance, bonusAmount, employerPfPercent, employeePfPercent, 
        gratuityPercent, professionalTax);
    
    doc.setFontSize(14);
    doc.text('Results:', 20, 130);
    
    doc.setFontSize(12);
    doc.text(`Monthly Take-Home: ${formatCtcCurrency(result.monthly_takehome)}`, 20, 140);
    doc.text(`Annual Take-Home: ${formatCtcCurrency(result.takehome_annual)}`, 20, 150);
    doc.text(`Take-Home Percentage: ${result.takehome_percentage.toFixed(1)}%`, 20, 160);
    doc.text(`Total Monthly Deductions: ${formatCtcCurrency(result.total_deductions_monthly)}`, 20, 170);
    doc.text(`Total Employer Contributions: ${formatCtcCurrency(result.total_contributions_monthly)}`, 20, 180);
    
    // Save the PDF
    doc.save('ctc-calculator-report.pdf');
}