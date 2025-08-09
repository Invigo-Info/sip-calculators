// Reverse GST Calculator Script

let reverseGstChart = null;

// Input elements
const reverseGstInclusiveAmountInput = document.getElementById('reverseGstInclusiveAmount');
const reverseGstInclusiveAmountSlider = document.getElementById('reverseGstInclusiveAmountSlider');
const reverseGstRateSelect = document.getElementById('reverseGstRate');
const reverseGstTransactionTypeRadios = document.querySelectorAll('input[name="reverseGstTransactionType"]');

// Result elements
const reverseGstBasePriceResult = document.getElementById('reverseGstBasePriceResult');
const reverseGstAmountResult = document.getElementById('reverseGstAmountResult');
const reverseGstCgstResult = document.getElementById('reverseGstCgstResult');
const reverseGstSgstResult = document.getElementById('reverseGstSgstResult');
const reverseGstIgstResult = document.getElementById('reverseGstIgstResult');
const reverseGstSummaryText = document.getElementById('reverseGstSummaryText');

// Card elements
const reverseGstCgstCard = document.getElementById('reverseGstCgstCard');
const reverseGstSgstCard = document.getElementById('reverseGstSgstCard');
const reverseGstIgstCard = document.getElementById('reverseGstIgstCard');

// Custom Chart.js plugin to display Base Price in center
const reverseGstCenterTextPlugin = {
    id: 'reverseGstCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.reverseGstCenterText && chart.config.options.plugins.reverseGstCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Base Price
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.reverseGstCenterText.text, centerX, centerY - 10);
            
            // Draw "Base Price" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Base Price', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(reverseGstCenterTextPlugin);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupReverseGstSliders();
    addReverseGstEventListeners();
    initialSyncReverseGstValues();
    updateSliderRange(parseFloat(reverseGstInclusiveAmountInput.value) || 11800);
    calculateAndUpdateReverseGstResults();
    setupReverseGstMegaMenu();
});

function setupReverseGstSliders() {
    syncReverseGstInputs(reverseGstInclusiveAmountInput, reverseGstInclusiveAmountSlider);
}

function initialSyncReverseGstValues() {
    // Ensure initial values are properly synchronized
    reverseGstInclusiveAmountSlider.value = reverseGstInclusiveAmountInput.value;
}

function syncReverseGstInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        updateSliderRange(value);
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateReverseGstResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateReverseGstResults();
    });

    // Add change event for input field to handle direct typing
    input.addEventListener('change', function() {
        const value = parseFloat(this.value) || 0;
        updateSliderRange(value);
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        } else if (value < parseFloat(slider.min)) {
            this.value = slider.min;
            slider.value = slider.min;
        } else if (value > parseFloat(slider.max)) {
            // Update slider max to accommodate larger values
            updateSliderRange(value);
            slider.value = value;
        }
        calculateAndUpdateReverseGstResults();
    });
}

function updateSliderRange(inputValue) {
    const slider = reverseGstInclusiveAmountSlider;
    const sliderLabels = document.querySelector('.slider-labels');
    
    // Determine appropriate range based on input value
    let newMin = 100;
    let newMax = 100000;
    let step = 100;
    let maxLabel = '₹1L';
    
    if (inputValue > 10000000) { // > 1 crore
        newMin = 1000000; // 10L
        newMax = Math.max(20000000, inputValue * 1.2); // 2 crore or 20% more than input
        step = 100000; // 1L steps
        maxLabel = newMax >= 10000000 ? `₹${Math.ceil(newMax/10000000)}Cr` : `₹${Math.ceil(newMax/100000)}L`;
    } else if (inputValue > 1000000) { // > 10L
        newMin = 100000; // 1L
        newMax = Math.max(10000000, inputValue * 1.5); // 1 crore or 50% more than input
        step = 50000; // 50K steps
        maxLabel = newMax >= 10000000 ? `₹${Math.ceil(newMax/10000000)}Cr` : `₹${Math.ceil(newMax/100000)}L`;
    } else if (inputValue > 100000) { // > 1L
        newMin = 10000; // 10K
        newMax = Math.max(1000000, inputValue * 2); // 10L or double the input
        step = 10000; // 10K steps
        maxLabel = `₹${Math.ceil(newMax/100000)}L`;
    }
    
    // Update slider properties
    slider.min = newMin;
    slider.max = newMax;
    slider.step = step;
    
    // Update slider labels
    if (sliderLabels) {
        const minLabel = newMin >= 1000000 ? `₹${Math.ceil(newMin/1000000)}Cr` : 
                        newMin >= 100000 ? `₹${Math.ceil(newMin/100000)}L` :
                        newMin >= 1000 ? `₹${Math.ceil(newMin/1000)}K` : `₹${newMin}`;
        
        sliderLabels.innerHTML = `<span>${minLabel}</span><span>${maxLabel}</span>`;
    }
}

function addReverseGstEventListeners() {
    // Add change listeners for all inputs
    reverseGstInclusiveAmountInput.addEventListener('change', calculateAndUpdateReverseGstResults);
    reverseGstInclusiveAmountInput.addEventListener('keyup', calculateAndUpdateReverseGstResults);
    
    // Add input listener for slider
    reverseGstInclusiveAmountSlider.addEventListener('input', calculateAndUpdateReverseGstResults);
    
    // Add listener for GST rate
    reverseGstRateSelect.addEventListener('change', calculateAndUpdateReverseGstResults);
    
    // Add listeners for transaction type radio buttons
    reverseGstTransactionTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            updateTransactionTypeDisplay();
            calculateAndUpdateReverseGstResults();
        });
    });
}

function getSelectedTransactionType() {
    const selectedRadio = document.querySelector('input[name="reverseGstTransactionType"]:checked');
    return selectedRadio ? selectedRadio.value : 'intra-state';
}

function updateTransactionTypeDisplay() {
    const transactionType = getSelectedTransactionType();
    const gstRate = parseFloat(reverseGstRateSelect.value) || 0;
    
    if (transactionType === 'intra-state') {
        // Show CGST and SGST cards, hide IGST
        reverseGstCgstCard.classList.remove('hidden');
        reverseGstSgstCard.classList.remove('hidden');
        reverseGstIgstCard.classList.add('hidden');
        
        // Update labels
        const halfRate = gstRate / 2;
        document.querySelector('#reverseGstCgstCard .card-label').textContent = `CGST (${halfRate}%)`;
        document.querySelector('#reverseGstSgstCard .card-label').textContent = `SGST (${halfRate}%)`;
    } else {
        // Show IGST card, hide CGST and SGST
        reverseGstCgstCard.classList.add('hidden');
        reverseGstSgstCard.classList.add('hidden');
        reverseGstIgstCard.classList.remove('hidden');
        
        // Update label
        document.querySelector('#reverseGstIgstCard .card-label').textContent = `IGST (${gstRate}%)`;
    }
}

function calculateAndUpdateReverseGstResults() {
    const inclusiveAmount = parseFloat(reverseGstInclusiveAmountInput.value) || 0;
    const gstRate = parseFloat(reverseGstRateSelect.value) || 0;
    const transactionType = getSelectedTransactionType();

    // Validate inputs
    if (inclusiveAmount <= 0) {
        showReverseGstError('Amount must be greater than 0');
        return;
    }

    if (gstRate < 0 || gstRate > 100) {
        showReverseGstError('GST rate must be between 0 and 100');
        return;
    }

    try {
        // Calculate reverse GST
        const result = calculateReverseGstAmounts(inclusiveAmount, gstRate, transactionType);
        
        // Update display
        updateReverseGstResultsDisplay(result);
        updateReverseGstChart(result);
        clearReverseGstError();
        updateTransactionTypeDisplay();
    } catch (error) {
        console.error('Error calculating reverse GST:', error);
        showReverseGstError('Error in calculation: ' + error.message);
    }
}

function calculateReverseGstAmounts(inclusiveAmount, gstRate, transactionType) {
    // Calculate base price and GST amount
    const basePrice = inclusiveAmount / (1 + (gstRate / 100));
    const gstAmount = inclusiveAmount - basePrice;
    
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    
    if (transactionType === 'intra-state') {
        // For intra-state: CGST + SGST = GST Amount
        cgst = gstAmount / 2;
        sgst = gstAmount / 2;
    } else {
        // For inter-state: IGST = GST Amount
        igst = gstAmount;
    }
    
    return {
        inclusive_amount: inclusiveAmount,
        base_price: basePrice,
        gst_amount: gstAmount,
        gst_rate: gstRate,
        transaction_type: transactionType,
        cgst: cgst,
        sgst: sgst,
        igst: igst
    };
}

function updateReverseGstResultsDisplay(result) {
    reverseGstBasePriceResult.textContent = formatReverseGstCurrency(result.base_price);
    reverseGstAmountResult.textContent = formatReverseGstCurrency(result.gst_amount);
    
    if (result.transaction_type === 'intra-state') {
        reverseGstCgstResult.textContent = formatReverseGstCurrency(result.cgst);
        reverseGstSgstResult.textContent = formatReverseGstCurrency(result.sgst);
    } else {
        reverseGstIgstResult.textContent = formatReverseGstCurrency(result.igst);
    }
    
    // Update chart summary
    document.getElementById('reverseGstBasePriceDisplay').textContent = formatReverseGstCurrency(result.base_price);
    document.getElementById('reverseGstAmountDisplay').textContent = formatReverseGstCurrency(result.gst_amount);
    
    // Update summary text
    reverseGstSummaryText.textContent = `₹${formatNumber(result.inclusive_amount)} includes ₹${formatNumber(result.gst_amount)} in GST at ${result.gst_rate}%.`;
}

function updateReverseGstChart(result) {
    const ctx = document.getElementById('reverseGstChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (reverseGstChart) {
        reverseGstChart.destroy();
    }
    
    const data = {
        labels: ['Base Price', 'GST Amount'],
        datasets: [{
            data: [
                result.base_price,
                result.gst_amount
            ],
            backgroundColor: [
                '#3498db',
                '#27ae60'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    reverseGstChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                reverseGstCenterText: {
                    display: true,
                    text: formatReverseGstCurrency(result.base_price)
                }
            },
            cutout: '60%'
        }
    });
}

function formatReverseGstCurrency(amount) {
    // Format to Indian rupee format with 2 decimal places (₹1,59,384.25)
    const formatted = amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    return '₹' + formatted;
}

function formatNumber(amount) {
    return amount.toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function showReverseGstError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('reverseGstErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'reverseGstErrorMessage';
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

function clearReverseGstError() {
    const errorDiv = document.getElementById('reverseGstErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupReverseGstMegaMenu() {
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

// Helper functions for potential backend integration
function sendReverseGstCalculationToBackend(data) {
    return fetch('/calculate-reverse-gst', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json());
}

// Export functions for potential use in other scripts
window.ReverseGstCalculator = {
    calculate: calculateReverseGstAmounts,
    formatCurrency: formatReverseGstCurrency,
    formatNumber: formatNumber
};