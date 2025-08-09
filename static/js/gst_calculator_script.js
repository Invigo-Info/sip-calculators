// GST Calculator Script

let gstChart = null;

// Input elements
const gstAmountInput = document.getElementById('gstAmount');
const gstAmountSlider = document.getElementById('gstAmountSlider');
const gstRateSelect = document.getElementById('gstRate');
const addGstRadio = document.getElementById('addGst');
const removeGstRadio = document.getElementById('removeGst');

// Custom Chart.js plugin to display Base Amount in center
const gstCenterTextPlugin = {
    id: 'gstCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.gstCenterText && chart.config.options.plugins.gstCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Base Amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.gstCenterText.text, centerX, centerY - 10);
            
            // Draw "Base Amount" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Base Amount', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(gstCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupGstSliders();
    addGstEventListeners();
    initialSyncGstValues();
    calculateAndUpdateGstResults();
    setupGstMegaMenu();
    setupGstHistoryToggle();
    loadGstHistory();
});

function setupGstSliders() {
    syncGstInputs(gstAmountInput, gstAmountSlider);
}

function initialSyncGstValues() {
    // Ensure initial values are properly synchronized
    gstAmountSlider.value = gstAmountInput.value;
}

function syncGstInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateGstResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateGstResults();
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
        calculateAndUpdateGstResults();
    });
}

function addGstEventListeners() {
    // Add change listeners for amount input
    gstAmountInput.addEventListener('change', calculateAndUpdateGstResults);
    gstAmountInput.addEventListener('keyup', calculateAndUpdateGstResults);

    // Add input listener for slider
    gstAmountSlider.addEventListener('input', calculateAndUpdateGstResults);

    // Add listener for GST rate
    gstRateSelect.addEventListener('change', calculateAndUpdateGstResults);

    // Add listeners for radio buttons
    addGstRadio.addEventListener('change', calculateAndUpdateGstResults);
    removeGstRadio.addEventListener('change', calculateAndUpdateGstResults);
}

function calculateAndUpdateGstResults() {
    const amount = parseFloat(gstAmountInput.value) || 0;
    const gstRate = parseFloat(gstRateSelect.value) || 0;
    const calculationType = addGstRadio.checked ? 'add' : 'remove';

    // Validate inputs
    if (amount < 0) {
        showGstError('Amount cannot be negative');
        return;
    }

    if (amount > 20000000) { // 2 crore limit
        showGstError('Amount cannot exceed ₹2,00,00,000');
        return;
    }

    // Calculate GST
    const result = calculateGstAmounts(amount, gstRate, calculationType);
    
    // Update display
    updateGstResultsDisplay(result);
    updateGstChart(result);
    updateGstBreakdownText(result);
    saveGstCalculation(result);
    clearGstError();
}

function calculateGstAmounts(amount, gstRate, calculationType) {
    let baseAmount, gstAmount, totalAmount;
    
    if (calculationType === 'add') {
        // Add GST: amount is exclusive of GST
        baseAmount = amount;
        gstAmount = amount * (gstRate / 100);
        totalAmount = amount + gstAmount;
    } else {
        // Remove GST: amount is inclusive of GST
        totalAmount = amount;
        gstAmount = amount * (gstRate / (100 + gstRate));
        baseAmount = amount - gstAmount;
    }
    
    return {
        original_amount: amount,
        base_amount: Math.round(baseAmount * 100) / 100,
        gst_amount: Math.round(gstAmount * 100) / 100,
        total_amount: Math.round(totalAmount * 100) / 100,
        gst_rate: gstRate,
        calculation_type: calculationType,
        timestamp: new Date().toISOString()
    };
}

function updateGstResultsDisplay(result) {
    document.getElementById('baseAmountResult').textContent = formatGstCurrency(result.base_amount);
    document.getElementById('gstAmountResult').textContent = formatGstCurrency(result.gst_amount);
    document.getElementById('totalAmountResult').textContent = formatGstCurrency(result.total_amount);
    
    // Update chart summary
    document.getElementById('baseAmountDisplay').textContent = formatGstCurrency(result.base_amount);
    document.getElementById('gstAmountDisplay').textContent = formatGstCurrency(result.gst_amount);
}

function updateGstChart(result) {
    const ctx = document.getElementById('gstChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (gstChart) {
        gstChart.destroy();
    }
    
    const data = {
        labels: ['Base Amount', 'GST Amount'],
        datasets: [{
            data: [
                result.base_amount,
                result.gst_amount
            ],
            backgroundColor: [
                '#3498db',
                '#f39c12'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    gstChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                gstCenterText: {
                    display: true,
                    text: formatGstCurrency(result.base_amount)
                }
            },
            cutout: '60%'
        }
    });
}

function updateGstBreakdownText(result) {
    const typeText = result.calculation_type === 'add' ? 'Add GST' : 'Remove GST';
    const breakdownElement = document.getElementById('gstBreakdownText');
    
    breakdownElement.innerHTML = `
        For an amount of ${formatGstCurrency(result.original_amount)} with ${result.gst_rate}% GST (${typeText}):<br>
        • Base Amount: ${formatGstCurrency(result.base_amount)}<br>
        • GST Amount: ${formatGstCurrency(result.gst_amount)}<br>
        • Total Amount: ${formatGstCurrency(result.total_amount)}
    `;
}

function formatGstCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount * 100) / 100;
    return '₹' + formatted.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });
}

function showGstError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('gstErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'gstErrorMessage';
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

function clearGstError() {
    const errorDiv = document.getElementById('gstErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupGstMegaMenu() {
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

function setupGstHistoryToggle() {
    // Initially hide history
    const historySection = document.getElementById('gstHistorySection');
    if (historySection) {
        historySection.classList.add('hidden');
    }
}

function toggleGstHistory() {
    const historySection = document.getElementById('gstHistorySection');
    if (historySection) {
        historySection.classList.toggle('hidden');
        if (!historySection.classList.contains('hidden')) {
            loadGstHistory(); // Refresh history when showing
        }
    }
}

// Local Storage Functions
function saveGstCalculation(result) {
    try {
        let history = JSON.parse(localStorage.getItem('gstCalculationHistory') || '[]');
        
        // Add current calculation with timestamp
        const calculationRecord = {
            ...result,
            datetime: new Date().toLocaleString('en-IN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            })
        };
        
        history.unshift(calculationRecord); // Add to beginning
        
        // Keep only last 50 calculations
        if (history.length > 50) {
            history = history.slice(0, 50);
        }
        
        localStorage.setItem('gstCalculationHistory', JSON.stringify(history));
    } catch (error) {
        console.error('Error saving GST calculation:', error);
    }
}

function loadGstHistory() {
    try {
        const history = JSON.parse(localStorage.getItem('gstCalculationHistory') || '[]');
        updateGstHistoryTable(history);
    } catch (error) {
        console.error('Error loading GST history:', error);
        updateGstHistoryTable([]);
    }
}

function updateGstHistoryTable(history) {
    const tableBody = document.getElementById('gstHistoryTableBody');
    tableBody.innerHTML = '';
    
    if (history.length === 0) {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td colspan="7" style="text-align: center; padding: 20px; color: #6b7280;">
                No calculations found. Start calculating to see your history.
            </td>
        `;
        return;
    }
    
    history.forEach(data => {
        const row = tableBody.insertRow();
        const typeText = data.calculation_type === 'add' ? 'Add GST' : 'Remove GST';
        
        row.innerHTML = `
            <td>${data.datetime}</td>
            <td>${formatGstCurrency(data.original_amount)}</td>
            <td>${data.gst_rate}%</td>
            <td>${typeText}</td>
            <td>${formatGstCurrency(data.base_amount)}</td>
            <td>${formatGstCurrency(data.gst_amount)}</td>
            <td>${formatGstCurrency(data.total_amount)}</td>
        `;
    });
}

function clearGstHistory() {
    if (confirm('Are you sure you want to clear all calculation history?')) {
        try {
            localStorage.removeItem('gstCalculationHistory');
            loadGstHistory(); // Refresh the table
        } catch (error) {
            console.error('Error clearing GST history:', error);
        }
    }
}

function downloadGstPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('GST Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const amount = parseFloat(gstAmountInput.value) || 0;
    const gstRate = parseFloat(gstRateSelect.value) || 0;
    const calculationType = addGstRadio.checked ? 'add' : 'remove';
    
    const result = calculateGstAmounts(amount, gstRate, calculationType);
    const typeText = calculationType === 'add' ? 'Add GST (Exclusive)' : 'Remove GST (Inclusive)';
    
    doc.text(`Original Amount: ${formatGstCurrency(result.original_amount)}`, 20, 40);
    doc.text(`GST Rate: ${result.gst_rate}%`, 20, 50);
    doc.text(`Calculation Type: ${typeText}`, 20, 60);
    doc.text(`Generated on: ${new Date().toLocaleString('en-IN')}`, 20, 70);
    
    // Add results
    doc.text(`Base Amount: ${formatGstCurrency(result.base_amount)}`, 20, 100);
    doc.text(`GST Amount: ${formatGstCurrency(result.gst_amount)}`, 20, 110);
    doc.text(`Total Amount: ${formatGstCurrency(result.total_amount)}`, 20, 120);
    
    // Add breakdown
    doc.setFontSize(14);
    doc.text('Calculation Breakdown:', 20, 150);
    
    doc.setFontSize(10);
    let yPos = 160;
    
    if (calculationType === 'add') {
        doc.text('GST Amount = Base Amount × (GST Rate / 100)', 20, yPos);
        yPos += 10;
        doc.text(`GST Amount = ${formatGstCurrency(result.base_amount)} × (${result.gst_rate} / 100)`, 20, yPos);
        yPos += 10;
        doc.text(`GST Amount = ${formatGstCurrency(result.gst_amount)}`, 20, yPos);
        yPos += 10;
        doc.text(`Total Amount = Base Amount + GST Amount`, 20, yPos);
        yPos += 10;
        doc.text(`Total Amount = ${formatGstCurrency(result.base_amount)} + ${formatGstCurrency(result.gst_amount)} = ${formatGstCurrency(result.total_amount)}`, 20, yPos);
    } else {
        doc.text('GST Amount = Total Amount × (GST Rate / (100 + GST Rate))', 20, yPos);
        yPos += 10;
        doc.text(`GST Amount = ${formatGstCurrency(result.total_amount)} × (${result.gst_rate} / (100 + ${result.gst_rate}))`, 20, yPos);
        yPos += 10;
        doc.text(`GST Amount = ${formatGstCurrency(result.gst_amount)}`, 20, yPos);
        yPos += 10;
        doc.text(`Base Amount = Total Amount - GST Amount`, 20, yPos);
        yPos += 10;
        doc.text(`Base Amount = ${formatGstCurrency(result.total_amount)} - ${formatGstCurrency(result.gst_amount)} = ${formatGstCurrency(result.base_amount)}`, 20, yPos);
    }
    
    // Add recent history if available
    try {
        const history = JSON.parse(localStorage.getItem('gstCalculationHistory') || '[]');
        if (history.length > 0) {
            doc.setFontSize(14);
            doc.text('Recent Calculations:', 20, yPos + 30);
            
            doc.setFontSize(8);
            yPos += 45;
            
            // Table headers
            doc.text('Date & Time', 20, yPos);
            doc.text('Amount', 70, yPos);
            doc.text('Rate', 100, yPos);
            doc.text('Type', 120, yPos);
            doc.text('Base', 140, yPos);
            doc.text('GST', 160, yPos);
            doc.text('Total', 180, yPos);
            
            yPos += 8;
            
            // Add up to 15 recent calculations
            history.slice(0, 15).forEach(data => {
                if (yPos > 280) return; // Avoid going off page
                
                const typeShort = data.calculation_type === 'add' ? 'Add' : 'Remove';
                doc.text(data.datetime.substring(0, 16), 20, yPos);
                doc.text(formatGstCurrency(data.original_amount).substring(0, 12), 70, yPos);
                doc.text(`${data.gst_rate}%`, 100, yPos);
                doc.text(typeShort, 120, yPos);
                doc.text(formatGstCurrency(data.base_amount).substring(0, 12), 140, yPos);
                doc.text(formatGstCurrency(data.gst_amount).substring(0, 12), 160, yPos);
                doc.text(formatGstCurrency(data.total_amount).substring(0, 12), 180, yPos);
                yPos += 6;
            });
        }
    } catch (error) {
        console.error('Error adding history to PDF:', error);
    }
    
    // Save the PDF
    doc.save('gst-calculator-report.pdf');
}

// Utility function to get GST rate description
function getGstRateDescription(rate) {
    const descriptions = {
        0: 'Essential goods (0%)',
        5: 'Essential items (5%)',
        12: 'Standard items (12%)',
        18: 'Services & goods (18%)',
        28: 'Luxury items (28%)'
    };
    return descriptions[rate] || `${rate}% GST`;
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Alt + C to clear amount
    if (e.altKey && e.key === 'c') {
        e.preventDefault();
        gstAmountInput.value = 0;
        gstAmountSlider.value = 0;
        calculateAndUpdateGstResults();
    }
    
    // Alt + H to toggle history
    if (e.altKey && e.key === 'h') {
        e.preventDefault();
        toggleGstHistory();
    }
    
    // Alt + D to download PDF
    if (e.altKey && e.key === 'd') {
        e.preventDefault();
        downloadGstPDF();
    }
});

// Add tooltips for better UX
function addGstTooltips() {
    const tooltips = [
        {
            element: '#addGst',
            text: 'Use this when the amount entered does not include GST. GST will be added to get the final amount.'
        },
        {
            element: '#removeGst', 
            text: 'Use this when the amount entered already includes GST. The base amount will be calculated by removing GST.'
        },
        {
            element: '#gstRate',
            text: 'Select the applicable GST rate based on the type of goods or services.'
        }
    ];
    
    tooltips.forEach(tooltip => {
        const element = document.querySelector(tooltip.element);
        if (element) {
            element.title = tooltip.text;
        }
    });
}

// Initialize tooltips on load
document.addEventListener('DOMContentLoaded', addGstTooltips);