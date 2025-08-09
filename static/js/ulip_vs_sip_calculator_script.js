// ULIP vs SIP Calculator Script

let ulipSipComparisonChart = null;

// Input elements
const monthlyInvestmentInputUlipSip = document.getElementById('monthlyInvestmentUlipSip');
const monthlyInvestmentSliderUlipSip = document.getElementById('monthlyInvestmentSliderUlipSip');
const tenureYearsInputUlipSip = document.getElementById('tenureYearsUlipSip');
const tenureSliderUlipSip = document.getElementById('tenureSliderUlipSip');
const sipReturnRateInputUlipSip = document.getElementById('sipReturnRateUlipSip');
const sipReturnSliderUlipSip = document.getElementById('sipReturnSliderUlipSip');
const sipExpenseRatioInputUlipSip = document.getElementById('sipExpenseRatioUlipSip');
const sipExpenseSliderUlipSip = document.getElementById('sipExpenseSliderUlipSip');
const ulipReturnRateInputUlipSip = document.getElementById('ulipReturnRateUlipSip');
const ulipReturnSliderUlipSip = document.getElementById('ulipReturnSliderUlipSip');
const ulipFMCInputUlipSip = document.getElementById('ulipFMCUlipSip');
const ulipFMCSliderUlipSip = document.getElementById('ulipFMCSliderUlipSip');
const ulipOtherChargesInputUlipSip = document.getElementById('ulipOtherChargesUlipSip');
const ulipOtherSliderUlipSip = document.getElementById('ulipOtherSliderUlipSip');
const includeTermCheckboxUlipSip = document.getElementById('includeTermUlipSip');
const termPremiumInputUlipSip = document.getElementById('termPremiumUlipSip');
const termPremiumSliderUlipSip = document.getElementById('termPremiumSliderUlipSip');
const taxModelSelectUlipSip = document.getElementById('taxModelUlipSip');

// Initialize calculator on DOM content loaded
document.addEventListener('DOMContentLoaded', function() {
    setupUlipSipSliders();
    addUlipSipEventListeners();
    initialSyncUlipSipValues();
    updateTermPremiumVisibility();
    calculateAndUpdateUlipSipResults();
    setupUlipSipMegaMenu();
    setupUlipSipTableToggle();
});

function setupUlipSipSliders() {
    syncUlipSipInputs(monthlyInvestmentInputUlipSip, monthlyInvestmentSliderUlipSip);
    syncUlipSipInputs(tenureYearsInputUlipSip, tenureSliderUlipSip);
    syncUlipSipInputs(sipReturnRateInputUlipSip, sipReturnSliderUlipSip);
    syncUlipSipInputs(sipExpenseRatioInputUlipSip, sipExpenseSliderUlipSip);
    syncUlipSipInputs(ulipReturnRateInputUlipSip, ulipReturnSliderUlipSip);
    syncUlipSipInputs(ulipFMCInputUlipSip, ulipFMCSliderUlipSip);
    syncUlipSipInputs(ulipOtherChargesInputUlipSip, ulipOtherSliderUlipSip);
    syncUlipSipInputs(termPremiumInputUlipSip, termPremiumSliderUlipSip);
}

function initialSyncUlipSipValues() {
    // Ensure initial values are properly synchronized
    monthlyInvestmentSliderUlipSip.value = monthlyInvestmentInputUlipSip.value;
    tenureSliderUlipSip.value = tenureYearsInputUlipSip.value;
    sipReturnSliderUlipSip.value = sipReturnRateInputUlipSip.value;
    sipExpenseSliderUlipSip.value = sipExpenseRatioInputUlipSip.value;
    ulipReturnSliderUlipSip.value = ulipReturnRateInputUlipSip.value;
    ulipFMCSliderUlipSip.value = ulipFMCInputUlipSip.value;
    ulipOtherSliderUlipSip.value = ulipOtherChargesInputUlipSip.value;
    termPremiumSliderUlipSip.value = termPremiumInputUlipSip.value;
}

function syncUlipSipInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateUlipSipResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateUlipSipResults();
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
        calculateAndUpdateUlipSipResults();
    });
}

function addUlipSipEventListeners() {
    // Add change listeners for all inputs
    const allInputs = [
        monthlyInvestmentInputUlipSip, tenureYearsInputUlipSip, sipReturnRateInputUlipSip,
        sipExpenseRatioInputUlipSip, ulipReturnRateInputUlipSip, ulipFMCInputUlipSip,
        ulipOtherChargesInputUlipSip, termPremiumInputUlipSip
    ];
    
    allInputs.forEach(input => {
        input.addEventListener('change', calculateAndUpdateUlipSipResults);
        input.addEventListener('keyup', calculateAndUpdateUlipSipResults);
    });

    // Add input listeners for sliders
    const allSliders = [
        monthlyInvestmentSliderUlipSip, tenureSliderUlipSip, sipReturnSliderUlipSip,
        sipExpenseSliderUlipSip, ulipReturnSliderUlipSip, ulipFMCSliderUlipSip,
        ulipOtherSliderUlipSip, termPremiumSliderUlipSip
    ];
    
    allSliders.forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateUlipSipResults);
    });

    // Add listener for term insurance checkbox
    includeTermCheckboxUlipSip.addEventListener('change', function() {
        updateTermPremiumVisibility();
        calculateAndUpdateUlipSipResults();
    });

    // Add listener for tax model dropdown
    taxModelSelectUlipSip.addEventListener('change', calculateAndUpdateUlipSipResults);
}

function updateTermPremiumVisibility() {
    const termPremiumGroup = document.getElementById('termPremiumGroupUlipSip');
    const sipTermCard = document.getElementById('sipTermCardUlipSip');
    
    if (includeTermCheckboxUlipSip.checked) {
        termPremiumGroup.classList.remove('hidden');
        sipTermCard.classList.remove('hidden');
    } else {
        termPremiumGroup.classList.add('hidden');
        sipTermCard.classList.add('hidden');
    }
}

function calculateAndUpdateUlipSipResults() {
    const monthlyInvestment = parseFloat(monthlyInvestmentInputUlipSip.value) || 10000;
    const tenureYears = parseInt(tenureYearsInputUlipSip.value) || 15;
    const sipReturnRate = parseFloat(sipReturnRateInputUlipSip.value) || 12;
    const sipExpenseRatio = parseFloat(sipExpenseRatioInputUlipSip.value) || 1;
    const ulipReturnRate = parseFloat(ulipReturnRateInputUlipSip.value) || 12;
    const ulipFMC = parseFloat(ulipFMCInputUlipSip.value) || 1.35;
    const ulipOtherCharges = parseFloat(ulipOtherChargesInputUlipSip.value) || 1.0;
    const includeTerm = includeTermCheckboxUlipSip.checked;
    const termPremium = parseFloat(termPremiumInputUlipSip.value) || 700;
    const taxModel = taxModelSelectUlipSip.value;

    // Validate inputs
    if (monthlyInvestment < 500 || monthlyInvestment > 100000) {
        showUlipSipError('Monthly investment must be between ₹500 and ₹1,00,000');
        return;
    }

    if (tenureYears < 5 || tenureYears > 30) {
        showUlipSipError('Investment tenure must be between 5 and 30 years');
        return;
    }

    if (sipReturnRate < 1 || sipReturnRate > 25) {
        showUlipSipError('SIP return rate must be between 1% and 25%');
        return;
    }

    if (ulipReturnRate < 1 || ulipReturnRate > 25) {
        showUlipSipError('ULIP return rate must be between 1% and 25%');
        return;
    }

    // Calculate results
    const result = calculateUlipSipComparison(
        monthlyInvestment, tenureYears, sipReturnRate, sipExpenseRatio,
        ulipReturnRate, ulipFMC, ulipOtherCharges, includeTerm, termPremium, taxModel
    );

    // Update display
    updateUlipSipResultsDisplay(result);
    updateUlipSipChart(result);
    updateUlipSipTable(result);
    clearUlipSipError();
}

function calculateUlipSipComparison(monthlyInvestment, tenureYears, sipReturnRate, sipExpenseRatio, 
                                   ulipReturnRate, ulipFMC, ulipOtherCharges, includeTerm, termPremium, taxModel) {
    
    const months = tenureYears * 12;
    
    // SIP Calculations
    const sipNetReturn = sipReturnRate - sipExpenseRatio;
    const sipMonthlyRate = sipNetReturn / 12 / 100;
    const sipFutureValue = monthlyInvestment * (((Math.pow(1 + sipMonthlyRate, months) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
    const sipTotalInvested = monthlyInvestment * months;
    const sipGain = sipFutureValue - sipTotalInvested;
    
    // SIP Tax Calculation
    let sipTax = 0;
    if (taxModel === 'equity') {
        sipTax = Math.max(0, sipGain - 100000) * 0.10; // LTCG 10% on gains > 1L
    } else if (taxModel === 'debt') {
        sipTax = sipGain * 0.20; // Simplified debt MF taxation
    }
    const sipPostTaxValue = sipFutureValue - sipTax;
    
    // SIP + Term Calculations (if enabled)
    let sipTermResults = null;
    if (includeTerm) {
        const effectiveMonthlyInvestment = monthlyInvestment - termPremium;
        const sipTermFutureValue = effectiveMonthlyInvestment * (((Math.pow(1 + sipMonthlyRate, months) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
        const sipTermTotalInvested = effectiveMonthlyInvestment * months;
        const sipTermGain = sipTermFutureValue - sipTermTotalInvested;
        
        let sipTermTax = 0;
        if (taxModel === 'equity') {
            sipTermTax = Math.max(0, sipTermGain - 100000) * 0.10;
        } else if (taxModel === 'debt') {
            sipTermTax = sipTermGain * 0.20;
        }
        const sipTermPostTaxValue = sipTermFutureValue - sipTermTax;
        
        sipTermResults = {
            totalInvested: sipTermTotalInvested,
            futureValue: sipTermFutureValue,
            estimatedTax: sipTermTax,
            postTaxValue: sipTermPostTaxValue
        };
    }
    
    // ULIP Calculations
    const ulipNetReturn = ulipReturnRate - ulipFMC - ulipOtherCharges;
    const ulipMonthlyRate = ulipNetReturn / 12 / 100;
    const ulipFutureValue = monthlyInvestment * (((Math.pow(1 + ulipMonthlyRate, months) - 1) / ulipMonthlyRate) * (1 + ulipMonthlyRate));
    const ulipTotalPremiums = monthlyInvestment * months;
    const ulipGain = ulipFutureValue - ulipTotalPremiums;
    
    // ULIP Tax Calculation
    let ulipTax = 0;
    let ulipTaxNote = '₹0 (Exempt)';
    if (taxModel === 'ulip_exempt') {
        ulipTax = 0;
        ulipTaxNote = '₹0 (10(10D) Exempt)';
    } else {
        ulipTax = ulipGain * 0.10; // Simplified CG tax
        ulipTaxNote = formatUlipSipCurrency(ulipTax) + ' (CG Tax)';
    }
    const ulipNetPayout = ulipFutureValue - ulipTax;
    
    // Comparison
    const bestSipValue = includeTerm && sipTermResults ? sipTermResults.postTaxValue : sipPostTaxValue;
    const costDrag = bestSipValue - ulipNetPayout;
    const costDragPercentage = (costDrag / bestSipValue) * 100;
    
    let bestOption = 'SIP Investment';
    if (includeTerm && sipTermResults && sipTermResults.postTaxValue > sipPostTaxValue && sipTermResults.postTaxValue > ulipNetPayout) {
        bestOption = 'SIP + Term Plan';
    } else if (ulipNetPayout > sipPostTaxValue && (!includeTerm || !sipTermResults || ulipNetPayout > sipTermResults.postTaxValue)) {
        bestOption = 'ULIP Investment';
    }
    
    // Generate year-wise data for table
    const yearWiseData = generateUlipSipYearWiseData(
        monthlyInvestment, tenureYears, sipMonthlyRate, ulipMonthlyRate,
        sipExpenseRatio, ulipFMC, ulipOtherCharges, includeTerm, termPremium, taxModel
    );
    
    return {
        sip: {
            totalInvested: sipTotalInvested,
            futureValue: sipFutureValue,
            estimatedTax: sipTax,
            postTaxValue: sipPostTaxValue
        },
        sipTerm: sipTermResults,
        ulip: {
            totalPremiums: ulipTotalPremiums,
            futureValue: ulipFutureValue,
            taxNote: ulipTaxNote,
            netPayout: ulipNetPayout
        },
        comparison: {
            bestOption: bestOption,
            costDrag: costDrag,
            costDragPercentage: costDragPercentage
        },
        yearWiseData: yearWiseData
    };
}

function generateUlipSipYearWiseData(monthlyInvestment, tenureYears, sipMonthlyRate, ulipMonthlyRate,
                                    sipExpenseRatio, ulipFMC, ulipOtherCharges, includeTerm, termPremium, taxModel) {
    const yearWiseData = [];
    let sipBalance = 0;
    let ulipBalance = 0;
    let sipTermBalance = 0;
    
    const effectiveMonthlyInvestment = includeTerm ? monthlyInvestment - termPremium : monthlyInvestment;
    
    for (let year = 1; year <= tenureYears; year++) {
        // Calculate values for this year
        const monthsElapsed = year * 12;
        
        // SIP calculations
        sipBalance = monthlyInvestment * (((Math.pow(1 + sipMonthlyRate, monthsElapsed) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
        const sipGain = sipBalance - (monthlyInvestment * monthsElapsed);
        let sipTax = 0;
        if (taxModel === 'equity') {
            sipTax = Math.max(0, sipGain - 100000) * 0.10;
        } else if (taxModel === 'debt') {
            sipTax = sipGain * 0.20;
        }
        const sipPostTax = sipBalance - sipTax;
        
        // SIP + Term calculations
        let sipTermPostTax = 0;
        if (includeTerm) {
            sipTermBalance = effectiveMonthlyInvestment * (((Math.pow(1 + sipMonthlyRate, monthsElapsed) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
            const sipTermGain = sipTermBalance - (effectiveMonthlyInvestment * monthsElapsed);
            let sipTermTax = 0;
            if (taxModel === 'equity') {
                sipTermTax = Math.max(0, sipTermGain - 100000) * 0.10;
            } else if (taxModel === 'debt') {
                sipTermTax = sipTermGain * 0.20;
            }
            sipTermPostTax = sipTermBalance - sipTermTax;
        }
        
        // ULIP calculations
        ulipBalance = monthlyInvestment * (((Math.pow(1 + ulipMonthlyRate, monthsElapsed) - 1) / ulipMonthlyRate) * (1 + ulipMonthlyRate));
        const ulipGain = ulipBalance - (monthlyInvestment * monthsElapsed);
        let ulipTax = 0;
        if (taxModel !== 'ulip_exempt') {
            ulipTax = ulipGain * 0.10;
        }
        const ulipNet = ulipBalance - ulipTax;
        
        // Determine best option for this year
        let bestOption = 'SIP';
        let bestValue = sipPostTax;
        if (includeTerm && sipTermPostTax > bestValue) {
            bestOption = 'SIP+Term';
            bestValue = sipTermPostTax;
        }
        if (ulipNet > bestValue) {
            bestOption = 'ULIP';
        }
        
        yearWiseData.push({
            year: year,
            sipValue: Math.round(sipBalance),
            sipPostTax: Math.round(sipPostTax),
            sipTermValue: includeTerm ? Math.round(sipTermBalance) : null,
            sipTermPostTax: includeTerm ? Math.round(sipTermPostTax) : null,
            ulipValue: Math.round(ulipNet),
            bestOption: bestOption
        });
    }
    
    return yearWiseData;
}

function updateUlipSipResultsDisplay(result) {
    // Update SIP results
    document.getElementById('sipTotalInvestedUlipSip').textContent = formatUlipSipCurrency(result.sip.totalInvested);
    document.getElementById('sipFutureValueUlipSip').textContent = formatUlipSipCurrency(result.sip.futureValue);
    document.getElementById('sipEstimatedTaxUlipSip').textContent = formatUlipSipCurrency(result.sip.estimatedTax);
    document.getElementById('sipPostTaxValueUlipSip').textContent = formatUlipSipCurrency(result.sip.postTaxValue);
    
    // Update SIP + Term results (if enabled)
    if (result.sipTerm) {
        document.getElementById('sipTermInvestedUlipSip').textContent = formatUlipSipCurrency(result.sipTerm.totalInvested);
        document.getElementById('sipTermFutureValueUlipSip').textContent = formatUlipSipCurrency(result.sipTerm.futureValue);
        document.getElementById('sipTermEstimatedTaxUlipSip').textContent = formatUlipSipCurrency(result.sipTerm.estimatedTax);
        document.getElementById('sipTermPostTaxValueUlipSip').textContent = formatUlipSipCurrency(result.sipTerm.postTaxValue);
    }
    
    // Update ULIP results
    document.getElementById('ulipTotalPremiumsUlipSip').textContent = formatUlipSipCurrency(result.ulip.totalPremiums);
    document.getElementById('ulipFutureValueUlipSip').textContent = formatUlipSipCurrency(result.ulip.futureValue);
    document.getElementById('ulipTaxNoteUlipSip').textContent = result.ulip.taxNote;
    document.getElementById('ulipNetPayoutUlipSip').textContent = formatUlipSipCurrency(result.ulip.netPayout);
    
    // Update comparison
    document.getElementById('bestOptionUlipSip').textContent = result.comparison.bestOption;
    const costDragText = (result.comparison.costDrag >= 0 ? '+' : '') + formatUlipSipCurrency(result.comparison.costDrag) + 
                        ' (' + (result.comparison.costDrag >= 0 ? '+' : '') + result.comparison.costDragPercentage.toFixed(2) + '%)';
    document.getElementById('costDragUlipSip').textContent = costDragText;
    
    // Update best option styling
    const bestOptionElement = document.getElementById('bestOptionUlipSip');
    bestOptionElement.className = 'comparison-value best-option';
    if (result.comparison.bestOption.includes('ULIP')) {
        bestOptionElement.style.color = '#f39c12';
    } else {
        bestOptionElement.style.color = '#059669';
    }
}

function updateUlipSipChart(result) {
    const ctx = document.getElementById('ulipSipComparisonChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (ulipSipComparisonChart) {
        ulipSipComparisonChart.destroy();
    }
    
    const datasets = [
        {
            label: 'SIP (Post-Tax)',
            data: [result.sip.postTaxValue],
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 2
        },
        {
            label: 'ULIP (Net)',
            data: [result.ulip.netPayout],
            backgroundColor: '#f39c12',
            borderColor: '#e67e22',
            borderWidth: 2
        }
    ];
    
    // Add SIP + Term if enabled
    if (result.sipTerm) {
        datasets.splice(1, 0, {
            label: 'SIP + Term (Post-Tax)',
            data: [result.sipTerm.postTaxValue],
            backgroundColor: '#27ae60',
            borderColor: '#229954',
            borderWidth: 2
        });
    }
    
    const labels = datasets.map(dataset => dataset.label);
    const data = datasets.map(dataset => dataset.data[0]);
    
    ulipSipComparisonChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: datasets.map(d => d.backgroundColor),
                borderColor: datasets.map(d => d.borderColor),
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return formatUlipSipCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatUlipSipCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function updateUlipSipTable(result) {
    if (result.yearWiseData) {
        updateUlipSipYearlyTable(result.yearWiseData);
    }
}

function updateUlipSipYearlyTable(yearlyData) {
    const tableBody = document.getElementById('ulipSipYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatUlipSipCurrency(data.sipValue)}</td>
            <td>${formatUlipSipCurrency(data.sipPostTax)}</td>
            <td>${data.sipTermValue ? formatUlipSipCurrency(data.sipTermValue) : 'N/A'}</td>
            <td>${data.sipTermPostTax ? formatUlipSipCurrency(data.sipTermPostTax) : 'N/A'}</td>
            <td>${formatUlipSipCurrency(data.ulipValue)}</td>
            <td>${data.bestOption}</td>
        `;
    });
}

function formatUlipSipCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showUlipSipError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('ulipSipErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'ulipSipErrorMessage';
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

function clearUlipSipError() {
    const errorDiv = document.getElementById('ulipSipErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupUlipSipMegaMenu() {
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

function setupUlipSipTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('ulipSipTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleUlipSipTable() {
    const tableSection = document.getElementById('ulipSipTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadUlipSipPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ULIP vs SIP Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const monthlyInvestment = parseFloat(monthlyInvestmentInputUlipSip.value) || 10000;
    const tenureYears = parseInt(tenureYearsInputUlipSip.value) || 15;
    const sipReturnRate = parseFloat(sipReturnRateInputUlipSip.value) || 12;
    const sipExpenseRatio = parseFloat(sipExpenseRatioInputUlipSip.value) || 1;
    const ulipReturnRate = parseFloat(ulipReturnRateInputUlipSip.value) || 12;
    const ulipFMC = parseFloat(ulipFMCInputUlipSip.value) || 1.35;
    const ulipOtherCharges = parseFloat(ulipOtherChargesInputUlipSip.value) || 1.0;
    const includeTerm = includeTermCheckboxUlipSip.checked;
    const termPremium = parseFloat(termPremiumInputUlipSip.value) || 700;
    const taxModel = taxModelSelectUlipSip.value;
    
    // Input parameters
    doc.text('Investment Parameters:', 20, 40);
    doc.text(`Monthly Investment: ${formatUlipSipCurrency(monthlyInvestment)}`, 20, 50);
    doc.text(`Investment Tenure: ${tenureYears} years`, 20, 60);
    doc.text(`SIP Expected Return: ${sipReturnRate}%`, 20, 70);
    doc.text(`SIP Expense Ratio: ${sipExpenseRatio}%`, 20, 80);
    doc.text(`ULIP Expected Return: ${ulipReturnRate}%`, 20, 90);
    doc.text(`ULIP FMC: ${ulipFMC}%`, 20, 100);
    doc.text(`ULIP Other Charges: ${ulipOtherCharges}%`, 20, 110);
    doc.text(`Include Term Insurance: ${includeTerm ? 'Yes' : 'No'}`, 20, 120);
    if (includeTerm) {
        doc.text(`Term Premium: ${formatUlipSipCurrency(termPremium)}/month`, 20, 130);
    }
    doc.text(`Tax Model: ${getTaxModelDisplayName(taxModel)}`, 20, 140);
    
    // Calculate results
    const result = calculateUlipSipComparison(
        monthlyInvestment, tenureYears, sipReturnRate, sipExpenseRatio,
        ulipReturnRate, ulipFMC, ulipOtherCharges, includeTerm, termPremium, taxModel
    );
    
    // Add results
    doc.setFontSize(14);
    doc.text('Investment Comparison Results:', 20, 170);
    
    doc.setFontSize(12);
    let yPos = 180;
    
    // SIP Results
    doc.text('SIP Investment:', 20, yPos);
    doc.text(`Total Invested: ${formatUlipSipCurrency(result.sip.totalInvested)}`, 25, yPos + 10);
    doc.text(`Future Value: ${formatUlipSipCurrency(result.sip.futureValue)}`, 25, yPos + 20);
    doc.text(`Estimated Tax: ${formatUlipSipCurrency(result.sip.estimatedTax)}`, 25, yPos + 30);
    doc.text(`Post-Tax Value: ${formatUlipSipCurrency(result.sip.postTaxValue)}`, 25, yPos + 40);
    yPos += 50;
    
    // SIP + Term Results (if enabled)
    if (result.sipTerm) {
        doc.text('SIP + Term Plan:', 20, yPos);
        doc.text(`Total Invested: ${formatUlipSipCurrency(result.sipTerm.totalInvested)}`, 25, yPos + 10);
        doc.text(`Future Value: ${formatUlipSipCurrency(result.sipTerm.futureValue)}`, 25, yPos + 20);
        doc.text(`Estimated Tax: ${formatUlipSipCurrency(result.sipTerm.estimatedTax)}`, 25, yPos + 30);
        doc.text(`Post-Tax Value: ${formatUlipSipCurrency(result.sipTerm.postTaxValue)}`, 25, yPos + 40);
        yPos += 50;
    }
    
    // ULIP Results
    doc.text('ULIP Investment:', 20, yPos);
    doc.text(`Total Premiums: ${formatUlipSipCurrency(result.ulip.totalPremiums)}`, 25, yPos + 10);
    doc.text(`Future Value: ${formatUlipSipCurrency(result.ulip.futureValue)}`, 25, yPos + 20);
    doc.text(`Tax Note: ${result.ulip.taxNote}`, 25, yPos + 30);
    doc.text(`Net Payout: ${formatUlipSipCurrency(result.ulip.netPayout)}`, 25, yPos + 40);
    yPos += 50;
    
    // Comparison
    doc.setFontSize(14);
    doc.text('Conclusion:', 20, yPos);
    doc.setFontSize(12);
    doc.text(`Best Option: ${result.comparison.bestOption}`, 25, yPos + 10);
    const costDragText = `Cost Difference: ${formatUlipSipCurrency(Math.abs(result.comparison.costDrag))} (${Math.abs(result.comparison.costDragPercentage).toFixed(2)}%)`;
    doc.text(costDragText, 25, yPos + 20);
    
    // Save the PDF
    doc.save('ulip-vs-sip-calculator-report.pdf');
}

function getTaxModelDisplayName(taxModel) {
    const taxModels = {
        'equity': 'Equity MF (LTCG 10% > ₹1L gain)',
        'debt': 'Debt MF',
        'ulip_exempt': 'ULIP Exempt (10(10D))'
    };
    return taxModels[taxModel] || 'Equity MF (LTCG 10% > ₹1L gain)';
}
