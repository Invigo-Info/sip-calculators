// Daily Compound Interest Calculator Script

let compoundInterestChart = null;

// Input elements
const principalAmountInput = document.getElementById('principalAmount');
const principalAmountSlider = document.getElementById('principalAmountSlider');
const annualRateInput = document.getElementById('annualRate');
const annualRateSlider = document.getElementById('annualRateSlider');
const timePeriodInput = document.getElementById('timePeriod');
const timePeriodSlider = document.getElementById('timePeriodSlider');
const timePeriodUnitSelect = document.getElementById('timePeriodUnit');
const compoundingFrequencySelect = document.getElementById('compoundingFrequency');

// Custom Chart.js plugin to display Principal Amount in center
const compoundInterestCenterTextPlugin = {
    id: 'compoundInterestCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.compoundInterestCenterText && chart.config.options.plugins.compoundInterestCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Principal Amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.compoundInterestCenterText.text, centerX, centerY - 10);
            
            // Draw "Principal Amount" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Principal Amount', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(compoundInterestCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupCompoundInterestSliders();
    addCompoundInterestEventListeners();
    initialSyncCompoundInterestValues();
    updateTimePeriodLabelsAndLimits();
    calculateAndUpdateCompoundInterestResults();
    setupCompoundInterestMegaMenu();
    setupCompoundInterestTableToggle();
});

function setupCompoundInterestSliders() {
    syncCompoundInterestInputs(principalAmountInput, principalAmountSlider);
    syncCompoundInterestInputs(annualRateInput, annualRateSlider);
    syncCompoundInterestInputs(timePeriodInput, timePeriodSlider);
}

function initialSyncCompoundInterestValues() {
    // Ensure initial values are properly synchronized
    principalAmountSlider.value = principalAmountInput.value;
    annualRateSlider.value = annualRateInput.value;
    timePeriodSlider.value = timePeriodInput.value;
}

function syncCompoundInterestInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateCompoundInterestResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateCompoundInterestResults();
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
        calculateAndUpdateCompoundInterestResults();
    });
}

function addCompoundInterestEventListeners() {
    // Add change listeners for all inputs
    [principalAmountInput, annualRateInput, timePeriodInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateCompoundInterestResults);
        input.addEventListener('keyup', calculateAndUpdateCompoundInterestResults);
    });

    // Add input listeners for sliders
    [principalAmountSlider, annualRateSlider, timePeriodSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateCompoundInterestResults);
    });

    // Add listener for compounding frequency
    compoundingFrequencySelect.addEventListener('change', calculateAndUpdateCompoundInterestResults);
    
    // Add listener for time period unit
    timePeriodUnitSelect.addEventListener('change', function() {
        updateTimePeriodLabelsAndLimits();
        calculateAndUpdateCompoundInterestResults();
    });
}

function updateTimePeriodLabelsAndLimits() {
    const unit = timePeriodUnitSelect.value;
    const timePeriodLabel = document.getElementById('timePeriodLabel');
    const timePeriodSuffix = document.getElementById('timePeriodSuffix');
    const timePeriodMinLabel = document.getElementById('timePeriodMinLabel');
    const timePeriodMaxLabel = document.getElementById('timePeriodMaxLabel');
    
    let labelText, suffixText, minValue, maxValue, step, defaultValue;
    
    switch (unit) {
        case 'days':
            labelText = 'Total Time Period';
            suffixText = 'Day(s)';
            minValue = 1;
            maxValue = 3650; // 10 years
            step = 1;
            defaultValue = 1;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '3650';
            break;
        case 'weeks':
            labelText = 'Total Time Period';
            suffixText = 'Week(s)';
            minValue = 1;
            maxValue = 520; // 10 years
            step = 1;
            defaultValue = 4;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '520';
            break;
        case 'months':
            labelText = 'Total Time Period';
            suffixText = 'Month(s)';
            minValue = 1;
            maxValue = 120; // 10 years
            step = 1;
            defaultValue = 12;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '120';
            break;
        case 'quarters':
            labelText = 'Total Time Period';
            suffixText = 'Quarter(s)';
            minValue = 1;
            maxValue = 40; // 10 years
            step = 1;
            defaultValue = 4;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '40';
            break;
        case 'years':
            labelText = 'Total Time Period';
            suffixText = 'Year(s)';
            minValue = 1;
            maxValue = 50;
            step = 1;
            defaultValue = 5;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '50';
            break;
        default:
            labelText = 'Total Time Period';
            suffixText = 'Day(s)';
            minValue = 1;
            maxValue = 3650;
            step = 1;
            defaultValue = 1;
            timePeriodMinLabel.textContent = '1';
            timePeriodMaxLabel.textContent = '3650';
    }
    
    // Update labels
    timePeriodLabel.textContent = labelText;
    timePeriodSuffix.textContent = suffixText;
    
    // Update input and slider limits
    timePeriodInput.min = minValue;
    timePeriodInput.max = maxValue;
    timePeriodInput.step = step;
    timePeriodSlider.min = minValue;
    timePeriodSlider.max = maxValue;
    timePeriodSlider.step = step;
    
    // Set default value if current value is out of range
    const currentValue = parseFloat(timePeriodInput.value) || 0;
    if (currentValue < minValue || currentValue > maxValue) {
        timePeriodInput.value = defaultValue;
        timePeriodSlider.value = defaultValue;
    }
}

function calculateAndUpdateCompoundInterestResults() {
    const principal = parseFloat(principalAmountInput.value) || 0;
    const annualRate = parseFloat(annualRateInput.value) || 10;
    const timePeriodValue = parseFloat(timePeriodInput.value) || 1;
    const timePeriodUnit = timePeriodUnitSelect.value;
    const compoundingFrequency = compoundingFrequencySelect.value;
    
    // Convert time period to years
    let timeYears = timePeriodValue;
    switch (timePeriodUnit) {
        case 'days':
            timeYears = timePeriodValue / 365;
            break;
        case 'weeks':
            timeYears = timePeriodValue / 52;
            break;
        case 'months':
            timeYears = timePeriodValue / 12;
            break;
        case 'quarters':
            timeYears = timePeriodValue / 4;
            break;
        case 'years':
            timeYears = timePeriodValue;
            break;
        default:
            timeYears = timePeriodValue / 365;
    }

    // Validate inputs
    if (principal <= 0) {
        showCompoundInterestError('Principal amount must be greater than 0');
        return;
    }
    if (annualRate <= 0) {
        showCompoundInterestError('Interest rate must be greater than 0');
        return;
    }
    if (timeYears <= 0) {
        showCompoundInterestError('Time period must be greater than 0');
        return;
    }
    if (principal > 10000000) {
        showCompoundInterestError('Principal amount cannot exceed ₹1,00,00,000');
        return;
    }
    if (annualRate > 50) {
        showCompoundInterestError('Interest rate cannot exceed 50%');
        return;
    }
    if (timeYears > 50) {
        showCompoundInterestError('Time period cannot exceed 50 years');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-daily-compound-interest', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            principal: principal,
            annual_rate: annualRate,
            time_years: timeYears,
            time_period_value: timePeriodValue,
            time_period_unit: timePeriodUnit,
            compounding_frequency: compoundingFrequency
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showCompoundInterestError(result.error);
            return;
        }
        
        // Update display
        updateCompoundInterestResultsDisplay(result);
        updateCompoundInterestChart(result);
        updateCompoundInterestTable(result);
        clearCompoundInterestError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateCompoundInterestClientSide(principal, annualRate, timeYears, compoundingFrequency, timePeriodValue, timePeriodUnit);
        updateCompoundInterestResultsDisplay(result);
        updateCompoundInterestChart(result);
        updateCompoundInterestTable(result);
    });
}

function calculateCompoundInterestClientSide(principal, annualRate, timeYears, compoundingFrequency, timePeriodValue, timePeriodUnit) {
    // Client-side compound interest calculation as fallback
    const rateDecimal = annualRate / 100;
    
    // Define compounding frequencies
    const frequencyMap = {
        'daily': 365,
        'weekly': 52,
        'monthly': 12,
        'quarterly': 4,
        'half-yearly': 2,
        'annually': 1
    };
    
    const n = frequencyMap[compoundingFrequency] || 365;
    
    // Calculate future value using compound interest formula
    const futureValue = principal * Math.pow((1 + rateDecimal / n), (n * timeYears));
    const interestEarned = futureValue - principal;
    const effectiveRate = (Math.pow(futureValue / principal, 1 / timeYears) - 1) * 100;
    
    // Calculate comparison data for all frequencies
    const comparisonData = [];
    for (const [freqName, freqValue] of Object.entries(frequencyMap)) {
        const fv = principal * Math.pow((1 + rateDecimal / freqValue), (freqValue * timeYears));
        const interest = fv - principal;
        comparisonData.push({
            frequency: freqName.charAt(0).toUpperCase() + freqName.slice(1).replace('-', ' '),
            future_value: Math.round(fv * 100) / 100,
            interest_earned: Math.round(interest * 100) / 100,
            difference: Math.round((interest - interestEarned) * 100) / 100
        });
    }
    
    // Sort comparison data by interest earned (descending)
    comparisonData.sort((a, b) => b.interest_earned - a.interest_earned);
    
    // Create more descriptive summary text
    const unitText = timePeriodValue === 1 ? timePeriodUnit.slice(0, -1) : timePeriodUnit;
    const summaryText = `Investing ₹${principal.toLocaleString('en-IN')} at ${annualRate}% compounded ${compoundingFrequency} for ${timePeriodValue} ${unitText} will grow to ₹${futureValue.toLocaleString('en-IN', {maximumFractionDigits: 2})}.`;
    
    return {
        principal: Math.round(principal * 100) / 100,
        annual_rate: annualRate,
        time_years: timeYears,
        time_period_value: timePeriodValue,
        time_period_unit: timePeriodUnit,
        compounding_frequency: compoundingFrequency,
        future_value: Math.round(futureValue * 100) / 100,
        interest_earned: Math.round(interestEarned * 100) / 100,
        effective_rate: Math.round(effectiveRate * 100) / 100,
        comparison_data: comparisonData,
        summary_text: summaryText
    };
}

function updateCompoundInterestResultsDisplay(result) {
    document.getElementById('futureValueResult').textContent = formatCompoundInterestCurrency(result.future_value);
    document.getElementById('interestEarnedResult').textContent = formatCompoundInterestCurrency(result.interest_earned);
    document.getElementById('effectiveRateResult').textContent = result.effective_rate + '%';
    
    // Update chart summary
    document.getElementById('principalDisplay').textContent = formatCompoundInterestCurrency(result.principal);
    document.getElementById('interestDisplay').textContent = formatCompoundInterestCurrency(result.interest_earned);
    
    // Update summary text
    document.getElementById('summaryText').textContent = result.summary_text;
}

function updateCompoundInterestChart(result) {
    const ctx = document.getElementById('compoundInterestChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (compoundInterestChart) {
        compoundInterestChart.destroy();
    }
    
    const data = {
        labels: ['Principal Amount', 'Interest Earned'],
        datasets: [{
            data: [
                result.principal,
                result.interest_earned
            ],
            backgroundColor: [
                '#3182ce',
                '#10b981'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    compoundInterestChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                compoundInterestCenterText: {
                    display: true,
                    text: formatCompoundInterestCurrency(result.principal)
                }
            },
            cutout: '60%'
        }
    });
}

function updateCompoundInterestTable(result) {
    if (result.comparison_data) {
        updateCompoundInterestComparisonTable(result.comparison_data);
    }
}

function updateCompoundInterestComparisonTable(comparisonData) {
    const tableBody = document.getElementById('compoundInterestComparisonTableBody');
    tableBody.innerHTML = '';
    
    comparisonData.forEach(data => {
        const row = tableBody.insertRow();
        const differenceClass = data.difference >= 0 ? 'positive' : 'negative';
        const differenceSign = data.difference >= 0 ? '+' : '';
        
        row.innerHTML = `
            <td>${data.frequency}</td>
            <td>${formatCompoundInterestCurrency(data.future_value)}</td>
            <td>${formatCompoundInterestCurrency(data.interest_earned)}</td>
            <td class="${differenceClass}">${differenceSign}${formatCompoundInterestCurrency(Math.abs(data.difference))}</td>
        `;
    });
}

function formatCompoundInterestCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showCompoundInterestError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('compoundInterestErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'compoundInterestErrorMessage';
        errorDiv.style.cssText = `
            background: #fee2e2;
            border: 1px solid #fecaca;
            color: #991b1b;
            padding: 12px;
            border-radius: 6px;
            margin: 10px 0;
            font-size: 14px;
            font-weight: 500;
            animation: slideInDown 0.3s ease;
        `;
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearCompoundInterestError() {
    const errorDiv = document.getElementById('compoundInterestErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupCompoundInterestMegaMenu() {
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

function setupCompoundInterestTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('compoundInterestTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleCompoundInterestTable() {
    const tableSection = document.getElementById('compoundInterestTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
        
        // Add fade-in animation
        if (!tableSection.classList.contains('hidden')) {
            tableSection.style.opacity = '0';
            tableSection.style.transform = 'translateY(20px)';
            
            // Force reflow
            tableSection.offsetHeight;
            
            tableSection.style.transition = 'all 0.3s ease';
            tableSection.style.opacity = '1';
            tableSection.style.transform = 'translateY(0)';
        }
    }
}

function downloadCompoundInterestPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Daily Compound Interest Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const principal = parseFloat(principalAmountInput.value) || 0;
    const annualRate = parseFloat(annualRateInput.value) || 10;
    const timePeriodValue = parseFloat(timePeriodInput.value) || 1;
    const timePeriodUnit = timePeriodUnitSelect.value;
    const compoundingFrequency = compoundingFrequencySelect.value;
    
    // Convert time period to years
    let timeYears = timePeriodValue;
    switch (timePeriodUnit) {
        case 'days':
            timeYears = timePeriodValue / 365;
            break;
        case 'weeks':
            timeYears = timePeriodValue / 52;
            break;
        case 'months':
            timeYears = timePeriodValue / 12;
            break;
        case 'quarters':
            timeYears = timePeriodValue / 4;
            break;
        case 'years':
            timeYears = timePeriodValue;
            break;
        default:
            timeYears = timePeriodValue / 365;
    }
    
    doc.text(`Principal Amount: ${formatCompoundInterestCurrency(principal)}`, 20, 40);
    doc.text(`Annual Interest Rate: ${annualRate}%`, 20, 50);
    const unitText = timePeriodValue === 1 ? timePeriodUnit.slice(0, -1) : timePeriodUnit;
    doc.text(`Time Period: ${timePeriodValue} ${unitText}`, 20, 60);
    doc.text(`Compounding Frequency: ${compoundingFrequency.charAt(0).toUpperCase() + compoundingFrequency.slice(1)}`, 20, 70);
    
    // Add results
    const result = calculateCompoundInterestClientSide(principal, annualRate, timeYears, compoundingFrequency, timePeriodValue, timePeriodUnit);
    doc.text(`Future Value: ${formatCompoundInterestCurrency(result.future_value)}`, 20, 100);
    doc.text(`Interest Earned: ${formatCompoundInterestCurrency(result.interest_earned)}`, 20, 110);
    doc.text(`Effective Annual Rate: ${result.effective_rate}%`, 20, 120);
    
    // Add summary
    doc.setFontSize(10);
    const summaryLines = doc.splitTextToSize(result.summary_text, 170);
    doc.text(summaryLines, 20, 140);
    
    // Add comparison table header
    doc.setFontSize(14);
    doc.text('Compounding Frequency Comparison:', 20, 170);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 180;
    doc.text('Frequency', 20, yPos);
    doc.text('Future Value', 60, yPos);
    doc.text('Interest Earned', 110, yPos);
    doc.text('Difference', 160, yPos);
    
    yPos += 10;
    
    // Add table data
    result.comparison_data.forEach(data => {
        if (yPos > 270) return; // Stop if we run out of space
        
        doc.text(data.frequency, 20, yPos);
        doc.text(formatCompoundInterestCurrency(data.future_value), 60, yPos);
        doc.text(formatCompoundInterestCurrency(data.interest_earned), 110, yPos);
        const differenceSign = data.difference >= 0 ? '+' : '';
        doc.text(differenceSign + formatCompoundInterestCurrency(Math.abs(data.difference)), 160, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('daily-compound-interest-calculator-report.pdf');
}

// Format frequency for display
function formatFrequency(frequency) {
    const frequencies = {
        'daily': 'Daily',
        'weekly': 'Weekly',
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'half-yearly': 'Half-Yearly',
        'annually': 'Annually'
    };
    return frequencies[frequency] || 'Daily';
}

// Add CSS for table row styling
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .positive {
        color: #10b981;
        font-weight: 600;
    }
    
    .negative {
        color: #ef4444;
        font-weight: 600;
    }
`;
document.head.appendChild(style);