// ULIP Return Calculator Script

let ulipChart = null;

// Input elements
const ulipInvestmentTenureInput = document.getElementById('ulipInvestmentTenure');
const ulipInvestmentTenureSlider = document.getElementById('ulipInvestmentTenureSlider');
const ulipExpectedReturnInput = document.getElementById('ulipExpectedReturn');
const ulipExpectedReturnSlider = document.getElementById('ulipExpectedReturnSlider');
const ulipExistingInvestmentInput = document.getElementById('ulipExistingInvestment');
const ulipExistingInvestmentSlider = document.getElementById('ulipExistingInvestmentSlider');
const ulipMonthlyInvestmentInput = document.getElementById('ulipMonthlyInvestment');
const ulipMonthlyInvestmentSlider = document.getElementById('ulipMonthlyInvestmentSlider');
const ulipPeriodicTopupInput = document.getElementById('ulipPeriodicTopup');
const ulipPeriodicTopupSlider = document.getElementById('ulipPeriodicTopupSlider');
const ulipLumpSumInput = document.getElementById('ulipLumpSum');
const ulipLumpSumSlider = document.getElementById('ulipLumpSumSlider');

// Mode elements
const ulipRegularModeRadio = document.getElementById('ulipRegularMode');
const ulipOneTimeModeRadio = document.getElementById('ulipOneTimeMode');
const ulipRegularInputsDiv = document.getElementById('ulipRegularInputs');
const ulipOneTimeInputsDiv = document.getElementById('ulipOneTimeInputs');

// Custom Chart.js plugin to display Total Investment in center
const ulipCenterTextPlugin = {
    id: 'ulipCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.ulipCenterText && chart.config.options.plugins.ulipCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Investment
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.ulipCenterText.text, centerX, centerY - 10);
            
            // Draw "Total Investment" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Investment', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(ulipCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupULIPSliders();
    addULIPEventListeners();
    initialSyncULIPValues();
    setupULIPModeToggle();
    calculateAndUpdateULIPResults();
    setupULIPMegaMenu();
});

function setupULIPSliders() {
    syncULIPInputs(ulipInvestmentTenureInput, ulipInvestmentTenureSlider);
    syncULIPInputs(ulipExpectedReturnInput, ulipExpectedReturnSlider);
    syncULIPInputs(ulipExistingInvestmentInput, ulipExistingInvestmentSlider);
    syncULIPInputs(ulipMonthlyInvestmentInput, ulipMonthlyInvestmentSlider);
    syncULIPInputs(ulipPeriodicTopupInput, ulipPeriodicTopupSlider);
    syncULIPInputs(ulipLumpSumInput, ulipLumpSumSlider);
}

function initialSyncULIPValues() {
    // Ensure initial values are properly synchronized
    ulipInvestmentTenureSlider.value = ulipInvestmentTenureInput.value;
    ulipExpectedReturnSlider.value = ulipExpectedReturnInput.value;
    ulipExistingInvestmentSlider.value = ulipExistingInvestmentInput.value;
    ulipMonthlyInvestmentSlider.value = ulipMonthlyInvestmentInput.value;
    ulipPeriodicTopupSlider.value = ulipPeriodicTopupInput.value;
    ulipLumpSumSlider.value = ulipLumpSumInput.value;
}

function syncULIPInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateULIPResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateULIPResults();
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
        calculateAndUpdateULIPResults();
    });
}

function addULIPEventListeners() {
    // Add change listeners for all inputs
    [ulipInvestmentTenureInput, ulipExpectedReturnInput, ulipExistingInvestmentInput,
     ulipMonthlyInvestmentInput, ulipPeriodicTopupInput, ulipLumpSumInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateULIPResults);
        input.addEventListener('keyup', calculateAndUpdateULIPResults);
    });

    // Add input listeners for sliders
    [ulipInvestmentTenureSlider, ulipExpectedReturnSlider, ulipExistingInvestmentSlider,
     ulipMonthlyInvestmentSlider, ulipPeriodicTopupSlider, ulipLumpSumSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateULIPResults);
    });

    // Add listeners for mode toggle
    ulipRegularModeRadio.addEventListener('change', handleULIPModeChange);
    ulipOneTimeModeRadio.addEventListener('change', handleULIPModeChange);
}

function setupULIPModeToggle() {
    // Initially show regular investment inputs
    showULIPRegularInputs();
}

function handleULIPModeChange() {
    if (ulipRegularModeRadio.checked) {
        showULIPRegularInputs();
    } else {
        showULIPOneTimeInputs();
    }
    calculateAndUpdateULIPResults();
}

function showULIPRegularInputs() {
    ulipRegularInputsDiv.style.display = 'block';
    ulipOneTimeInputsDiv.style.display = 'none';
}

function showULIPOneTimeInputs() {
    ulipRegularInputsDiv.style.display = 'none';
    ulipOneTimeInputsDiv.style.display = 'block';
}

function calculateAndUpdateULIPResults() {
    const mode = ulipRegularModeRadio.checked ? 'Regular Investment' : 'One-time Investment';
    const tenureYears = parseInt(ulipInvestmentTenureInput.value) || 15;
    const expectedReturn = parseFloat(ulipExpectedReturnInput.value) || 10;
    const existingInvestment = parseFloat(ulipExistingInvestmentInput.value) || 0;
    const monthlyInvestment = parseFloat(ulipMonthlyInvestmentInput.value) || 0;
    const periodicTopup = parseFloat(ulipPeriodicTopupInput.value) || 0;
    const lumpSum = parseFloat(ulipLumpSumInput.value) || 0;

    // Validate inputs
    if (tenureYears < 1 || tenureYears > 30) {
        showULIPError('Investment tenure must be between 1 and 30 years');
        return;
    }

    if (expectedReturn < 1 || expectedReturn > 20) {
        showULIPError('Expected return must be between 1% and 20%');
        return;
    }

    if (mode === 'Regular Investment' && monthlyInvestment <= 0) {
        showULIPError('Monthly investment must be greater than 0 for regular investment mode');
        return;
    }

    if (mode === 'One-time Investment' && lumpSum <= 0) {
        showULIPError('Lump sum must be greater than 0 for one-time investment mode');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-ulip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            mode: mode,
            tenure_years: tenureYears,
            expected_return: expectedReturn,
            existing_investment: existingInvestment,
            monthly_investment: monthlyInvestment,
            periodic_topup: periodicTopup,
            lump_sum: lumpSum
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showULIPError(result.error);
            return;
        }
        
        // Update display
        updateULIPResultsDisplay(result);
        updateULIPChart(result);
        clearULIPError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateULIPReturnsClientSide(mode, tenureYears, expectedReturn, existingInvestment, monthlyInvestment, periodicTopup, lumpSum);
        updateULIPResultsDisplay(result);
        updateULIPChart(result);
    });
}

function calculateULIPReturnsClientSide(mode, tenureYears, expectedReturn, existingInvestment, monthlyInvestment, periodicTopup, lumpSum) {
    // Client-side ULIP calculation as fallback
    const monthlyRate = (expectedReturn / 12) / 100;
    const months = tenureYears * 12;
    
    let fvContrib = 0;
    let totalInvested = 0;
    
    if (mode === 'Regular Investment') {
        const baseMonthly = monthlyInvestment + periodicTopup;
        
        if (monthlyRate > 0) {
            fvContrib = baseMonthly * (((1 + monthlyRate) ** months - 1) / monthlyRate) * (1 + monthlyRate);
        } else {
            fvContrib = baseMonthly * months;
        }
        
        totalInvested = (monthlyInvestment + periodicTopup) * months + existingInvestment;
    } else {
        fvContrib = lumpSum * ((1 + monthlyRate) ** months);
        totalInvested = lumpSum + existingInvestment;
    }
    
    const fvExisting = existingInvestment * ((1 + monthlyRate) ** months);
    const projectedMaturityValue = fvContrib + fvExisting;
    
    let absoluteReturnPct = 0;
    if (totalInvested > 0) {
        absoluteReturnPct = ((projectedMaturityValue - totalInvested) / totalInvested) * 100;
    }
    
    // Create summary message
    let investmentAmount, frequencyText;
    if (mode === 'Regular Investment') {
        investmentAmount = monthlyInvestment + periodicTopup;
        frequencyText = 'monthly';
    } else {
        investmentAmount = lumpSum;
        frequencyText = 'one-time';
    }
    
    const summaryMessage = `If you invest ₹${investmentAmount.toLocaleString('en-IN')} ${frequencyText} for ${tenureYears} years at ${expectedReturn}% p.a., you may get ₹${Math.round(projectedMaturityValue).toLocaleString('en-IN')}.`;
    
    return {
        projected_maturity_value: Math.round(projectedMaturityValue),
        total_invested: Math.round(totalInvested),
        absolute_return_pct: Math.round(absoluteReturnPct * 100) / 100,
        summary_message: summaryMessage,
        mode: mode,
        tenure_years: tenureYears,
        expected_return: expectedReturn,
        existing_investment: existingInvestment,
        fv_contrib: Math.round(fvContrib),
        fv_existing: Math.round(fvExisting)
    };
}

function updateULIPResultsDisplay(result) {
    document.getElementById('ulipMaturityValueResult').textContent = formatULIPCurrency(result.projected_maturity_value);
    document.getElementById('ulipTotalInvestedResult').textContent = formatULIPCurrency(result.total_invested);
    document.getElementById('ulipAbsoluteReturnResult').textContent = result.absolute_return_pct + '%';
    document.getElementById('ulipSummaryText').textContent = result.summary_message;
    
    // Update chart summary
    document.getElementById('ulipInvestedDisplay').textContent = formatULIPCurrency(result.total_invested);
    const estimatedReturns = result.projected_maturity_value - result.total_invested;
    document.getElementById('ulipReturnsDisplay').textContent = formatULIPCurrency(estimatedReturns);
}

function updateULIPChart(result) {
    const ctx = document.getElementById('ulipChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (ulipChart) {
        ulipChart.destroy();
    }
    
    const estimatedReturns = result.projected_maturity_value - result.total_invested;
    
    const data = {
        labels: ['Total Invested', 'Estimated Returns'],
        datasets: [{
            data: [
                result.total_invested,
                estimatedReturns
            ],
            backgroundColor: [
                '#3498db',
                '#e67e22'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    ulipChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                ulipCenterText: {
                    display: true,
                    text: formatULIPCurrency(result.total_invested)
                }
            },
            cutout: '60%'
        }
    });
}

function formatULIPCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showULIPError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('ulipErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'ulipErrorMessage';
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
        document.querySelector('.ulip-input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearULIPError() {
    const errorDiv = document.getElementById('ulipErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupULIPMegaMenu() {
    const megaMenuBtn = document.querySelector('.ulip-mega-menu-btn');
    const megaMenu = document.querySelector('.ulip-mega-menu');
    
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
        const megaLinks = document.querySelectorAll('.ulip-mega-link');
        megaLinks.forEach(link => {
            link.addEventListener('click', function() {
                megaMenu.classList.remove('open');
            });
        });
    }
}

function downloadULIPPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ULIP Return Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const mode = ulipRegularModeRadio.checked ? 'Regular Investment' : 'One-time Investment';
    const tenureYears = parseInt(ulipInvestmentTenureInput.value) || 15;
    const expectedReturn = parseFloat(ulipExpectedReturnInput.value) || 10;
    const existingInvestment = parseFloat(ulipExistingInvestmentInput.value) || 0;
    const monthlyInvestment = parseFloat(ulipMonthlyInvestmentInput.value) || 0;
    const periodicTopup = parseFloat(ulipPeriodicTopupInput.value) || 0;
    const lumpSum = parseFloat(ulipLumpSumInput.value) || 0;
    
    doc.text(`Investment Mode: ${mode}`, 20, 40);
    doc.text(`Investment Tenure: ${tenureYears} years`, 20, 50);
    doc.text(`Expected Return: ${expectedReturn}% p.a.`, 20, 60);
    doc.text(`Existing Investment: ${formatULIPCurrency(existingInvestment)}`, 20, 70);
    
    if (mode === 'Regular Investment') {
        doc.text(`Monthly Investment: ${formatULIPCurrency(monthlyInvestment)}`, 20, 80);
        doc.text(`Periodic Top-up: ${formatULIPCurrency(periodicTopup)}/month`, 20, 90);
    } else {
        doc.text(`Lump Sum Investment: ${formatULIPCurrency(lumpSum)}`, 20, 80);
    }
    
    // Add results
    const result = calculateULIPReturnsClientSide(mode, tenureYears, expectedReturn, existingInvestment, monthlyInvestment, periodicTopup, lumpSum);
    doc.text(`Projected Maturity Value: ${formatULIPCurrency(result.projected_maturity_value)}`, 20, 120);
    doc.text(`Total Invested: ${formatULIPCurrency(result.total_invested)}`, 20, 130);
    doc.text(`Estimated Absolute Return: ${result.absolute_return_pct}%`, 20, 140);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Investment Summary:', 20, 170);
    doc.setFontSize(10);
    
    // Split long summary text into multiple lines
    const summaryLines = doc.splitTextToSize(result.summary_message, 170);
    let yPos = 180;
    summaryLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 8;
    });
    
    // Add disclaimer
    yPos += 10;
    doc.setFontSize(8);
    doc.text('Disclaimer: Market-linked returns are not guaranteed. ULIP NAV reflects charges;', 20, yPos);
    yPos += 6;
    doc.text('this tool uses expected net return for projection purposes only.', 20, yPos);
    
    // Save the PDF
    doc.save('ulip-return-calculator-report.pdf');
}

// Format frequency for display
function formatULIPFrequency(mode) {
    return mode === 'Regular Investment' ? 'Monthly' : 'One-time';
}

// Helper function to get current investment mode
function getCurrentULIPMode() {
    return ulipRegularModeRadio.checked ? 'Regular Investment' : 'One-time Investment';
}
