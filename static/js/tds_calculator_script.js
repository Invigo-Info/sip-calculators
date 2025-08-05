// TDS Calculator Script

let tdsChart = null;

// Input elements
const categoryIndividual = document.getElementById('categoryIndividual');
const categoryOther = document.getElementById('categoryOther');
const regimeTypeSelect = document.getElementById('regimeType');
const panAvailableSelect = document.getElementById('panAvailable');
const paymentTypeSelect = document.getElementById('paymentType');
const paymentAmountInput = document.getElementById('paymentAmount');
const paymentAmountSlider = document.getElementById('paymentAmountSlider');

// Custom Chart.js plugin to display TDS Amount in center
const tdsCenterTextPlugin = {
    id: 'tdsCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.tdsCenterText && chart.config.options.plugins.tdsCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw TDS Amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.tdsCenterText.text, centerX, centerY - 10);
            
            // Draw "TDS Amount" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('TDS Amount', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(tdsCenterTextPlugin);

// Initialize calculator and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupTdsSliders();
    addTdsEventListeners();
    initialSyncTdsValues();
    calculateAndUpdateTdsResults();
    setupTdsMegaMenu();
    setupTdsInfoToggle();
});

function setupTdsSliders() {
    syncTdsInputs(paymentAmountInput, paymentAmountSlider);
}

function initialSyncTdsValues() {
    // Ensure initial values are properly synchronized
    paymentAmountSlider.value = paymentAmountInput.value;
}

function syncTdsInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateTdsResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateTdsResults();
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
        calculateAndUpdateTdsResults();
    });
}

function addTdsEventListeners() {
    // Add change listeners for all inputs
    [paymentAmountInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateTdsResults);
        input.addEventListener('keyup', calculateAndUpdateTdsResults);
    });

    // Add input listeners for sliders
    [paymentAmountSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateTdsResults);
    });

    // Add listeners for category radio buttons
    categoryIndividual.addEventListener('change', calculateAndUpdateTdsResults);
    categoryOther.addEventListener('change', calculateAndUpdateTdsResults);

    // Add listeners for dropdown selections
    regimeTypeSelect.addEventListener('change', calculateAndUpdateTdsResults);
    panAvailableSelect.addEventListener('change', calculateAndUpdateTdsResults);
    paymentTypeSelect.addEventListener('change', calculateAndUpdateTdsResults);
}

function getSelectedCategory() {
    return categoryIndividual.checked ? 'individual' : 'other';
}

function calculateAndUpdateTdsResults() {
    const category = getSelectedCategory();
    const regimeType = regimeTypeSelect.value;
    const panAvailable = panAvailableSelect.value;
    const paymentType = paymentTypeSelect.value;
    const paymentAmount = parseFloat(paymentAmountInput.value) || 0;

    // Validate inputs
    if (paymentAmount <= 0) {
        showTdsError('Please enter a valid payment amount');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-tds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            category: category,
            regime_type: regimeType,
            pan_available: panAvailable,
            payment_type: paymentType,
            payment_amount: paymentAmount
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showTdsError(result.error);
            return;
        }
        
        // Update display
        updateTdsResultsDisplay(result);
        updateTdsChart(result);
        clearTdsError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateTdsClientSide(category, regimeType, panAvailable, paymentType, paymentAmount);
        updateTdsResultsDisplay(result);
        updateTdsChart(result);
    });
}

function calculateTdsClientSide(category, regimeType, panAvailable, paymentType, paymentAmount) {
    // Client-side TDS calculation as fallback
    // Define TDS rates for old regime
    const oldRegimeTdsRates = {
        '192A': { pan_available: 10.0, pan_not_available: 20.0, threshold: 30000 },
        '194A': { pan_available: 10.0, pan_not_available: 20.0, threshold: 40000 },
        '194H': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194I': { pan_available: 10.0, pan_not_available: 20.0, threshold: 240000 },
        '194J': { pan_available: 10.0, pan_not_available: 20.0, threshold: 30000 },
        '194C': { pan_available: 1.0, pan_not_available: 20.0, threshold: 30000 },
        '194D': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194G': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194K': { pan_available: 10.0, pan_not_available: 20.0, threshold: 25000 },
        '194LA': { pan_available: 10.0, pan_not_available: 20.0, threshold: 250000 },
        '194M': { pan_available: 0.1, pan_not_available: 5.0, threshold: 500000 },
        '194N': { pan_available: 2.0, pan_not_available: 2.0, threshold: 1000000 },
        '194O': { pan_available: 1.0, pan_not_available: 5.0, threshold: 500000 }
    };

    // Define TDS rates for new regime (some rates may be different)
    const newRegimeTdsRates = {
        '192A': { pan_available: 10.0, pan_not_available: 20.0, threshold: 30000 },
        '194A': { 
            pan_available: 'slab', 
            pan_not_available: 20.0, 
            threshold: 50000,
            slabs: {
                pan_available: [
                    {min: 0, max: 50000, rate: 0.0},
                    {min: 50001, max: 500000, rate: 10.0},
                    {min: 500001, max: Infinity, rate: 15.0}
                ],
                pan_not_available: [
                    {min: 0, max: 50000, rate: 0.0},
                    {min: 50001, max: Infinity, rate: 20.0}
                ]
            }
        },
        '194H': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194I': { pan_available: 10.0, pan_not_available: 20.0, threshold: 240000 },
        '194J': { pan_available: 10.0, pan_not_available: 20.0, threshold: 30000 },
        '194C': { pan_available: 1.0, pan_not_available: 20.0, threshold: 30000 },
        '194D': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194G': { pan_available: 5.0, pan_not_available: 20.0, threshold: 15000 },
        '194K': { pan_available: 10.0, pan_not_available: 20.0, threshold: 25000 },
        '194LA': { pan_available: 10.0, pan_not_available: 20.0, threshold: 250000 },
        '194M': { pan_available: 0.1, pan_not_available: 5.0, threshold: 500000 },
        '194N': { pan_available: 2.0, pan_not_available: 2.0, threshold: 1000000 },
        '194O': { pan_available: 1.0, pan_not_available: 5.0, threshold: 500000 }
    };

    // Choose the appropriate rates based on regime type
    const tdsRates = regimeType === 'new' ? newRegimeTdsRates : oldRegimeTdsRates;

    const rateConfig = tdsRates[paymentType] || tdsRates['194A'];
    const threshold = rateConfig.threshold;
    
    let applicableRate, tdsAmount, thresholdMessage;
    const panKey = panAvailable === 'yes' ? 'pan_available' : 'pan_not_available';
    
    // Check if this section uses slab structure
    if (rateConfig.slabs && rateConfig[panKey] === 'slab') {
        // Slab-based calculation
        const slabs = rateConfig.slabs[panKey];
        tdsAmount = 0;
        applicableRate = 0;
        
        if (paymentAmount < threshold) {
            tdsAmount = 0;
            applicableRate = 0;
            thresholdMessage = `No TDS required as payment amount (₹${paymentAmount.toLocaleString()}) is below threshold (₹${threshold.toLocaleString()})`;
        } else {
            // Calculate TDS using slab structure
            for (const slab of slabs) {
                if (paymentAmount >= slab.min && paymentAmount <= slab.max) {
                    applicableRate = slab.rate;
                    tdsAmount = (paymentAmount * applicableRate) / 100;
                    
                    if (applicableRate === 0) {
                        thresholdMessage = `No TDS required as payment amount (₹${paymentAmount.toLocaleString()}) is below threshold (₹${threshold.toLocaleString()})`;
                    } else {
                        // Determine which slab this falls into for messaging
                        if (applicableRate === 15.0) {
                            thresholdMessage = `TDS at ${applicableRate}% as payment amount (₹${paymentAmount.toLocaleString()}) exceeds ₹5,00,000 slab (New Regime)`;
                        } else {
                            thresholdMessage = `TDS at ${applicableRate}% as payment amount (₹${paymentAmount.toLocaleString()}) exceeds threshold (₹${threshold.toLocaleString()})`;
                        }
                    }
                    break;
                }
            }
        }
    } else {
        // Traditional flat rate calculation
        if (panAvailable === 'yes') {
            applicableRate = rateConfig.pan_available;
        } else {
            applicableRate = rateConfig.pan_not_available;
        }

        if (paymentAmount < threshold) {
            tdsAmount = 0;
            applicableRate = 0;
            thresholdMessage = `No TDS required as payment amount (₹${paymentAmount.toLocaleString()}) is below threshold (₹${threshold.toLocaleString()})`;
        } else {
            tdsAmount = (paymentAmount * applicableRate) / 100;
            thresholdMessage = `TDS applicable as payment amount (₹${paymentAmount.toLocaleString()}) exceeds threshold (₹${threshold.toLocaleString()})`;
        }
    }

    const netAmount = paymentAmount - tdsAmount;

    return {
        payment_amount: paymentAmount,
        tds_amount: Math.round(tdsAmount * 100) / 100,
        net_amount: Math.round(netAmount * 100) / 100,
        applicable_rate: applicableRate,
        threshold: threshold,
        threshold_message: thresholdMessage,
        payment_type: paymentType,
        pan_available: panAvailable,
        category: category,
        regime_type: regimeType,
        tds_percentage: applicableRate
    };
}

function updateTdsResultsDisplay(result) {
    // Update result cards
    document.getElementById('tdsAmountResult').textContent = formatTdsCurrency(result.tds_amount);
    document.getElementById('netAmountResult').textContent = formatTdsCurrency(result.net_amount);
    document.getElementById('tdsRateResult').textContent = result.tds_percentage + '%';
    
    // Update info section
    document.getElementById('paymentTypeDisplay').textContent = getPaymentTypeDisplayText(result.payment_type);
    document.getElementById('regimeTypeDisplay').textContent = getRegimeTypeDisplayText(result.regime_type);
    document.getElementById('thresholdMessage').textContent = result.threshold_message;
    document.getElementById('paymentAmountDisplay').textContent = formatTdsCurrency(result.payment_amount);
    
    // Update chart summary
    document.getElementById('netAmountDisplay').textContent = formatTdsCurrency(result.net_amount);
    document.getElementById('tdsAmountDisplay').textContent = formatTdsCurrency(result.tds_amount);
}

function getPaymentTypeDisplayText(paymentType) {
    const paymentTypes = {
        '192A': '192A - Payment of accumulated balance due to an employee',
        '194A': '194A - Interest other than securities',
        '194H': '194H - Commission or brokerage',
        '194I': '194I - Rent (plant/machinery/building)',
        '194J': '194J - Fees for professional/technical services',
        '194C': '194C - Payment to contractors',
        '194D': '194D - Insurance commission',
        '194G': '194G - Commission on sale of lottery tickets',
        '194K': '194K - Payment in respect of units',
        '194LA': '194LA - Payment of compensation for compulsory acquisition',
        '194M': '194M - Payment of certain sums by e-commerce operator',
        '194N': '194N - Payment in respect of cash withdrawal',
        '194O': '194O - Payment by e-commerce operator to e-commerce participant'
    };
    
    return paymentTypes[paymentType] || paymentType;
}

function getRegimeTypeDisplayText(regimeType) {
    const regimeTypes = {
        'old': 'Old Tax Regime',
        'new': 'New Tax Regime'
    };
    
    return regimeTypes[regimeType] || 'Old Tax Regime';
}

function updateTdsChart(result) {
    const ctx = document.getElementById('tdsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (tdsChart) {
        tdsChart.destroy();
    }
    
    const data = {
        labels: ['Net Amount', 'TDS Amount'],
        datasets: [{
            data: [
                result.net_amount,
                result.tds_amount
            ],
            backgroundColor: [
                '#16a34a',
                '#dc2626'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    tdsChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tdsCenterText: {
                    display: true,
                    text: formatTdsCurrency(result.tds_amount)
                }
            },
            cutout: '60%'
        }
    });
}

function formatTdsCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showTdsError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('tdsErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'tdsErrorMessage';
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

function clearTdsError() {
    const errorDiv = document.getElementById('tdsErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupTdsMegaMenu() {
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

function setupTdsInfoToggle() {
    // Initially hide info section
    const infoSection = document.getElementById('tdsInfoSection');
    if (infoSection) {
        infoSection.classList.add('hidden');
    }
}

function toggleTdsInfo() {
    const infoSection = document.getElementById('tdsInfoSection');
    if (infoSection) {
        infoSection.classList.toggle('hidden');
    }
}

function downloadTdsPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('TDS Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const category = getSelectedCategory();
    const regimeType = regimeTypeSelect.value;
    const panAvailable = panAvailableSelect.value;
    const paymentType = paymentTypeSelect.value;
    const paymentAmount = parseFloat(paymentAmountInput.value) || 0;
    
    // Calculate TDS
    const result = calculateTdsClientSide(category, regimeType, panAvailable, paymentType, paymentAmount);
    
    doc.text(`Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`, 20, 40);
    doc.text(`Tax Regime: ${getRegimeTypeDisplayText(regimeType)}`, 20, 50);
    doc.text(`PAN Available: ${panAvailable.toUpperCase()}`, 20, 60);
    doc.text(`Payment Type: ${getPaymentTypeDisplayText(paymentType)}`, 20, 70);
    doc.text(`Payment Amount: ${formatTdsCurrency(paymentAmount)}`, 20, 80);
    
    // Add calculation details
    doc.setFontSize(14);
    doc.text('TDS Calculation Results:', 20, 110);
    
    doc.setFontSize(12);
    doc.text(`TDS Rate: ${result.tds_percentage}%`, 20, 130);
    doc.text(`TDS Amount: ${formatTdsCurrency(result.tds_amount)}`, 20, 140);
    doc.text(`Net Amount: ${formatTdsCurrency(result.net_amount)}`, 20, 150);
    doc.text(`Threshold: ${formatTdsCurrency(result.threshold)}`, 20, 160);
    
    // Add threshold message
    doc.setFontSize(10);
    const splitMessage = doc.splitTextToSize(result.threshold_message, 170);
    doc.text(splitMessage, 20, 180);
    
    // Add TDS section details
    doc.setFontSize(14);
    doc.text('TDS Section Information:', 20, 210);
    
    doc.setFontSize(10);
    doc.text('TDS is deducted at source as per Income Tax Act provisions.', 20, 230);
    doc.text(`The rate varies based on payment type, PAN availability, and tax regime (${getRegimeTypeDisplayText(regimeType)}).`, 20, 240);
    doc.text('Generated on: ' + new Date().toLocaleDateString('en-IN'), 20, 260);
    
    // Save the PDF
    doc.save('tds-calculator-report.pdf');
}

// Utility functions
function formatPaymentType(paymentType) {
    return getPaymentTypeDisplayText(paymentType);
}

function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatPanAvailability(panAvailable) {
    return panAvailable === 'yes' ? 'Yes' : 'No';
}

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateAndUpdateTdsResults();
    }
    
    // Ctrl/Cmd + D to download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadTdsPDF();
    }
});

// Initialize calculation on page load
window.addEventListener('load', function() {
    calculateAndUpdateTdsResults();
});