// Future Value Calculator Script

let fvChart = null;

// Input elements
const fvPrincipalInput = document.getElementById('fvPrincipalAmount');
const fvPrincipalSlider = document.getElementById('fvPrincipalSlider');
const fvInterestRateInput = document.getElementById('fvInterestRate');
const fvInterestRateSlider = document.getElementById('fvInterestRateSlider');
const fvTimePeriodInput = document.getElementById('fvTimePeriod');
const fvTimePeriodSlider = document.getElementById('fvTimePeriodSlider');
const fvCompoundingFrequencySelect = document.getElementById('fvCompoundingFrequency');

// Custom Chart.js plugin to display Future Value in center
const fvCenterTextPlugin = {
    id: 'fvCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.fvCenterText && chart.config.options.plugins.fvCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Future Value
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.fvCenterText.text, centerX, centerY - 10);
            
            // Draw "Future Value" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Future Value', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(fvCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupFVSliders();
    addFVEventListeners();
    initialSyncFVValues();
    calculateAndUpdateFVResults();
    setupFVMegaMenu();
    setupFVTableToggle();
});

function setupFVSliders() {
    syncFVInputs(fvPrincipalInput, fvPrincipalSlider);
    syncFVInputs(fvInterestRateInput, fvInterestRateSlider);
    syncFVInputs(fvTimePeriodInput, fvTimePeriodSlider);
}

function initialSyncFVValues() {
    // Ensure initial values are properly synchronized
    fvPrincipalSlider.value = fvPrincipalInput.value;
    fvInterestRateSlider.value = fvInterestRateInput.value;
    fvTimePeriodSlider.value = fvTimePeriodInput.value;
}

function syncFVInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateFVResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateFVResults();
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
        calculateAndUpdateFVResults();
    });
}

function addFVEventListeners() {
    // Add change listeners for all inputs
    [fvPrincipalInput, fvInterestRateInput, fvTimePeriodInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateFVResults);
        input.addEventListener('keyup', calculateAndUpdateFVResults);
    });

    // Add input listeners for sliders
    [fvPrincipalSlider, fvInterestRateSlider, fvTimePeriodSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateFVResults);
    });

    // Add listener for compounding frequency
    fvCompoundingFrequencySelect.addEventListener('change', calculateAndUpdateFVResults);
}

function calculateAndUpdateFVResults() {
    const principal = parseFloat(fvPrincipalInput.value) || 0;
    const annualRate = parseFloat(fvInterestRateInput.value) || 8;
    const timeYears = parseFloat(fvTimePeriodInput.value) || 5;
    const compoundingFrequency = fvCompoundingFrequencySelect.value;

    // Validate inputs
    if (principal <= 0) {
        showFVError('Principal amount must be greater than 0');
        return;
    }

    if (annualRate < 0) {
        showFVError('Interest rate cannot be negative');
        return;
    }

    if (timeYears <= 0) {
        showFVError('Time period must be greater than 0');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-future-value', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            principal: principal,
            annual_rate: annualRate,
            time_years: timeYears,
            compounding_frequency: compoundingFrequency
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showFVError(result.error);
            return;
        }
        
        // Update display
        updateFVResultsDisplay(result);
        updateFVChart(result);
        updateFVTable(result);
        clearFVError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateFVReturnsClientSide(principal, annualRate, timeYears, compoundingFrequency);
        updateFVResultsDisplay(result);
        updateFVChart(result);
        updateFVTable(result);
    });
}

function calculateFVReturnsClientSide(principal, annualRate, timeYears, compoundingFrequency) {
    // Client-side FV calculation as fallback
    const frequencyMapping = {
        'annually': 1,
        'semi-annually': 2,
        'quarterly': 4,
        'monthly': 12,
        'daily': 365
    };
    
    const n = frequencyMapping[compoundingFrequency] || 12;
    const r = annualRate / 100;
    
    // Calculate future value using compound interest formula
    const futureValue = principal * Math.pow((1 + r / n), (n * timeYears));
    const totalInterest = futureValue - principal;
    
    // Generate year-wise breakdown
    const yearWiseData = [];
    for (let year = 1; year <= Math.floor(timeYears); year++) {
        const yearFV = principal * Math.pow((1 + r / n), (n * year));
        const yearInterest = yearFV - principal;
        
        yearWiseData.push({
            year: year,
            principal: Math.round(principal),
            interest_earned: Math.round(yearInterest),
            future_value: Math.round(yearFV),
            growth_rate: Math.round(((yearFV - principal) / principal) * 100 * 100) / 100
        });
    }
    
    const effectiveAnnualRate = Math.pow((1 + r / n), n) - 1;
    
    return {
        principal: Math.round(principal),
        future_value: Math.round(futureValue),
        total_interest: Math.round(totalInterest),
        annual_rate: annualRate,
        time_years: timeYears,
        compounding_frequency: compoundingFrequency,
        compounding_periods_per_year: n,
        effective_annual_rate: Math.round(effectiveAnnualRate * 10000) / 100,
        year_wise_data: yearWiseData
    };
}

function updateFVResultsDisplay(result) {
    document.getElementById('fvPrincipalResult').textContent = formatFVCurrency(result.principal);
    document.getElementById('fvInterestEarnedResult').textContent = formatFVCurrency(result.total_interest);
    document.getElementById('fvFutureValueResult').textContent = formatFVCurrency(result.future_value);
    
    // Update chart summary
    document.getElementById('fvPrincipalDisplay').textContent = formatFVCurrency(result.principal);
    document.getElementById('fvInterestEarnedDisplay').textContent = formatFVCurrency(result.total_interest);
    
    // Update summary text
    const summaryText = `Your ${formatFVCurrency(result.principal)} will grow to ${formatFVCurrency(result.future_value)} in ${result.time_years} years with compound interest at ${result.annual_rate}%.`;
    document.getElementById('fvSummaryText').textContent = summaryText;
    
    // Update effective rate text
    const effectiveRateText = `Effective Annual Rate: ${result.effective_annual_rate}%`;
    document.getElementById('fvEffectiveRateText').textContent = effectiveRateText;
}

function updateFVChart(result) {
    const ctx = document.getElementById('fvChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (fvChart) {
        fvChart.destroy();
    }
    
    const data = {
        labels: ['Principal Amount', 'Interest Earned'],
        datasets: [{
            data: [
                result.principal,
                result.total_interest
            ],
            backgroundColor: [
                '#3498db',
                '#27ae60'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    fvChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                fvCenterText: {
                    display: true,
                    text: formatFVCurrency(result.future_value)
                }
            },
            cutout: '60%'
        }
    });
}

function updateFVTable(result) {
    if (result.year_wise_data) {
        updateFVYearlyTable(result.year_wise_data);
    }
}

function updateFVYearlyTable(yearlyData) {
    const tableBody = document.getElementById('fvYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatFVCurrency(data.principal)}</td>
            <td>${formatFVCurrency(data.interest_earned)}</td>
            <td>${formatFVCurrency(data.future_value)}</td>
            <td>${data.growth_rate}%</td>
        `;
    });
}

function formatFVCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showFVError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('fvErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'fvErrorMessage';
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

function clearFVError() {
    const errorDiv = document.getElementById('fvErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupFVMegaMenu() {
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

function setupFVTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('fvTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleFVTable() {
    const tableSection = document.getElementById('fvTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
        
        // Update button text
        const tableBtn = document.querySelector('.table-btn');
        if (tableBtn) {
            const isHidden = tableSection.classList.contains('hidden');
            tableBtn.innerHTML = `
                <span class="btn-icon">📊</span>
                ${isHidden ? 'View Details' : 'Hide Details'}
            `;
        }
    }
}

function downloadFVPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Future Value Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const principal = parseFloat(fvPrincipalInput.value) || 0;
    const annualRate = parseFloat(fvInterestRateInput.value) || 8;
    const timeYears = parseFloat(fvTimePeriodInput.value) || 5;
    const compoundingFrequency = fvCompoundingFrequencySelect.value;
    
    doc.text(`Principal Amount: ${formatFVCurrency(principal)}`, 20, 40);
    doc.text(`Interest Rate: ${annualRate}% per annum`, 20, 50);
    doc.text(`Time Period: ${timeYears} years`, 20, 60);
    doc.text(`Compounding Frequency: ${formatFrequency(compoundingFrequency)}`, 20, 70);
    
    // Calculate and add results
    const result = calculateFVReturnsClientSide(principal, annualRate, timeYears, compoundingFrequency);
    doc.text(`Principal Amount: ${formatFVCurrency(result.principal)}`, 20, 100);
    doc.text(`Total Interest Earned: ${formatFVCurrency(result.total_interest)}`, 20, 110);
    doc.text(`Future Value: ${formatFVCurrency(result.future_value)}`, 20, 120);
    doc.text(`Effective Annual Rate: ${result.effective_annual_rate}%`, 20, 130);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Growth Breakdown:', 20, 160);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 170;
    doc.text('Year', 20, yPos);
    doc.text('Principal', 45, yPos);
    doc.text('Interest Earned', 80, yPos);
    doc.text('Future Value', 125, yPos);
    doc.text('Growth Rate', 160, yPos);
    
    yPos += 10;
    
    // Add table data (first 15 years to fit on page)
    result.year_wise_data.slice(0, 15).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatFVCurrency(data.principal), 45, yPos);
        doc.text(formatFVCurrency(data.interest_earned), 80, yPos);
        doc.text(formatFVCurrency(data.future_value), 125, yPos);
        doc.text(data.growth_rate + '%', 160, yPos);
        yPos += 8;
        
        // Add page break if needed
        if (yPos > 270) {
            doc.addPage();
            yPos = 20;
        }
    });
    
    // Save the PDF
    doc.save('future-value-calculator-report.pdf');
}

// Format frequency for display
function formatFrequency(frequency) {
    const frequencies = {
        'annually': 'Annually',
        'semi-annually': 'Semi-Annually',
        'quarterly': 'Quarterly',
        'monthly': 'Monthly',
        'daily': 'Daily'
    };
    return frequencies[frequency] || 'Monthly';
}

// Add smooth transitions for result updates
function animateResultUpdate(elementId, newValue) {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.transform = 'scale(0.95)';
        element.style.opacity = '0.7';
        
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
            element.style.opacity = '1';
        }, 150);
    }
}

// Add real-time validation
function validateFVInputs() {
    const principal = parseFloat(fvPrincipalInput.value) || 0;
    const annualRate = parseFloat(fvInterestRateInput.value) || 0;
    const timeYears = parseFloat(fvTimePeriodInput.value) || 0;
    
    // Reset input styles
    [fvPrincipalInput, fvInterestRateInput, fvTimePeriodInput].forEach(input => {
        input.style.borderColor = '';
        input.parentElement.style.borderColor = '';
    });
    
    let isValid = true;
    
    if (principal <= 0) {
        fvPrincipalInput.parentElement.style.borderColor = '#ef4444';
        isValid = false;
    }
    
    if (annualRate < 0) {
        fvInterestRateInput.parentElement.style.borderColor = '#ef4444';
        isValid = false;
    }
    
    if (timeYears <= 0) {
        fvTimePeriodInput.parentElement.style.borderColor = '#ef4444';
        isValid = false;
    }
    
    return isValid;
}

// Enhanced input event listeners with validation
[fvPrincipalInput, fvInterestRateInput, fvTimePeriodInput].forEach(input => {
    input.addEventListener('blur', validateFVInputs);
    input.addEventListener('focus', function() {
        this.parentElement.style.borderColor = '#3182ce';
    });
});

// Add keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to calculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateAndUpdateFVResults();
    }
    
    // Escape to close mega menu
    if (e.key === 'Escape') {
        const megaMenu = document.querySelector('.mega-menu');
        if (megaMenu) {
            megaMenu.classList.remove('open');
        }
    }
});