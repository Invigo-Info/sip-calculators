// PPF Calculator Script

let ppfChart = null;

// Input elements
const annualContributionInput = document.getElementById('annualContribution');
const annualContributionSlider = document.getElementById('annualContributionSlider');
const investmentDurationInput = document.getElementById('investmentDuration');
const investmentDurationSlider = document.getElementById('investmentDurationSlider');
const interestRateInput = document.getElementById('interestRate');
const interestRateSlider = document.getElementById('interestRateSlider');
const contributionFrequencySelect = document.getElementById('contributionFrequency');

// Custom Chart.js plugin to display Total Investment in center
const ppfCenterTextPlugin = {
    id: 'ppfCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.ppfCenterText && chart.config.options.plugins.ppfCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Investment
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.ppfCenterText.text, centerX, centerY - 10);
            
            // Draw "Total Investment" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Investment', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(ppfCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupPPFSliders();
    addPPFEventListeners();
    initialSyncPPFValues();
    calculateAndUpdatePPFResults();
    setupPPFMegaMenu();
    setupPPFTableToggle();
});

function setupPPFSliders() {
    syncPPFInputs(annualContributionInput, annualContributionSlider);
    syncPPFInputs(investmentDurationInput, investmentDurationSlider);
    syncPPFInputs(interestRateInput, interestRateSlider);
}

function initialSyncPPFValues() {
    // Ensure initial values are properly synchronized
    annualContributionSlider.value = annualContributionInput.value;
    investmentDurationSlider.value = investmentDurationInput.value;
    interestRateSlider.value = interestRateInput.value;
}

function syncPPFInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdatePPFResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdatePPFResults();
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
        calculateAndUpdatePPFResults();
    });
}

function addPPFEventListeners() {
    // Add change listeners for all inputs
    [annualContributionInput, investmentDurationInput, interestRateInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdatePPFResults);
        input.addEventListener('keyup', calculateAndUpdatePPFResults);
    });

    // Add input listeners for sliders
    [annualContributionSlider, investmentDurationSlider, interestRateSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdatePPFResults);
    });

    // Add listener for contribution frequency
    contributionFrequencySelect.addEventListener('change', calculateAndUpdatePPFResults);
}

function calculateAndUpdatePPFResults() {
    const annualContribution = parseFloat(annualContributionInput.value) || 0;
    const investmentDuration = parseInt(investmentDurationInput.value) || 15;
    const interestRate = parseFloat(interestRateInput.value) || 7.1;
    const contributionFrequency = contributionFrequencySelect.value;

    // Validate inputs
    if (annualContribution < 500 || annualContribution > 150000) {
        showPPFError('Annual contribution must be between ₹500 and ₹1,50,000');
        return;
    }

    if (investmentDuration < 15 || investmentDuration > 30) {
        showPPFError('Investment duration must be between 15 and 30 years');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-ppf', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            annual_contribution: annualContribution,
            duration_years: investmentDuration,
            interest_rate: interestRate,
            contribution_frequency: contributionFrequency
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showPPFError(result.error);
            return;
        }
        
        // Update display
        updatePPFResultsDisplay(result);
        updatePPFChart(result);
        updatePPFTable(result);
        clearPPFError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculatePPFReturnsClientSide(annualContribution, investmentDuration, interestRate, contributionFrequency);
        updatePPFResultsDisplay(result);
        updatePPFChart(result);
        updatePPFTable(result);
    });
}

function calculatePPFReturnsClientSide(annualContribution, durationYears, interestRate, contributionFrequency) {
    // Client-side PPF calculation as fallback
    const annualRate = interestRate / 100;
    let totalInvestment = 0;
    let maturityValue = 0;
    const yearWiseData = [];
    
    for (let year = 1; year <= durationYears; year++) {
        totalInvestment += annualContribution;
        const openingBalance = maturityValue;
        const closingBalance = (openingBalance + annualContribution) * (1 + annualRate);
        const interestEarned = closingBalance - openingBalance - annualContribution;
        maturityValue = closingBalance;
        
        yearWiseData.push({
            year: year,
            annual_contribution: annualContribution,
            opening_balance: Math.round(openingBalance),
            interest_earned: Math.round(interestEarned),
            closing_balance: Math.round(closingBalance),
            total_invested_till_date: Math.round(totalInvestment)
        });
    }
    
    const totalInterest = maturityValue - totalInvestment;
    
    return {
        total_investment: Math.round(totalInvestment),
        total_interest: Math.round(totalInterest),
        maturity_value: Math.round(maturityValue),
        investment_duration: durationYears,
        annual_contribution: annualContribution,
        contribution_frequency: contributionFrequency,
        interest_rate: interestRate,
        year_wise_data: yearWiseData
    };
}

function updatePPFResultsDisplay(result) {
    document.getElementById('totalInvestmentResult').textContent = formatPPFCurrency(result.total_investment);
    document.getElementById('interestEarnedResult').textContent = formatPPFCurrency(result.total_interest);
    document.getElementById('maturityValueResult').textContent = formatPPFCurrency(result.maturity_value);
    
    // Update chart summary
    document.getElementById('totalInvestmentDisplay').textContent = formatPPFCurrency(result.total_investment);
    document.getElementById('interestEarnedDisplay').textContent = formatPPFCurrency(result.total_interest);
}

function updatePPFChart(result) {
    const ctx = document.getElementById('ppfChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (ppfChart) {
        ppfChart.destroy();
    }
    
    const data = {
        labels: ['Total Investment', 'Interest Earned'],
        datasets: [{
            data: [
                result.total_investment,
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
    
    ppfChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                ppfCenterText: {
                    display: true,
                    text: formatPPFCurrency(result.total_investment)
                }
            },
            cutout: '60%'
        }
    });
}

function updatePPFTable(result) {
    if (result.year_wise_data) {
        updatePPFYearlyTable(result.year_wise_data);
    }
}

function updatePPFYearlyTable(yearlyData) {
    const tableBody = document.getElementById('ppfYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatPPFCurrency(data.annual_contribution)}</td>
            <td>${formatPPFCurrency(data.opening_balance)}</td>
            <td>${formatPPFCurrency(data.interest_earned)}</td>
            <td>${formatPPFCurrency(data.closing_balance)}</td>
            <td>${formatPPFCurrency(data.total_invested_till_date)}</td>
        `;
    });
}

function formatPPFCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showPPFError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('ppfErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'ppfErrorMessage';
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

function clearPPFError() {
    const errorDiv = document.getElementById('ppfErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupPPFMegaMenu() {
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

function setupPPFTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('ppfTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function togglePPFTable() {
    const tableSection = document.getElementById('ppfTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadPPFPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('PPF Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const annualContribution = parseFloat(annualContributionInput.value) || 0;
    const investmentDuration = parseInt(investmentDurationInput.value) || 15;
    const interestRate = parseFloat(interestRateInput.value) || 7.1;
    const contributionFrequency = contributionFrequencySelect.value;
    
    doc.text(`Annual Contribution: ${formatPPFCurrency(annualContribution)}`, 20, 40);
    doc.text(`Investment Duration: ${investmentDuration} years`, 20, 50);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 60);
    doc.text(`Contribution Frequency: ${contributionFrequency}`, 20, 70);
    
    // Add results
    const result = calculatePPFReturnsClientSide(annualContribution, investmentDuration, interestRate, contributionFrequency);
    doc.text(`Total Investment: ${formatPPFCurrency(result.total_investment)}`, 20, 100);
    doc.text(`Interest Earned: ${formatPPFCurrency(result.total_interest)}`, 20, 110);
    doc.text(`Maturity Value: ${formatPPFCurrency(result.maturity_value)}`, 20, 120);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Breakdown:', 20, 150);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 160;
    doc.text('Year', 20, yPos);
    doc.text('Contribution', 45, yPos);
    doc.text('Opening Balance', 80, yPos);
    doc.text('Interest', 125, yPos);
    doc.text('Closing Balance', 150, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.year_wise_data.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatPPFCurrency(data.annual_contribution), 45, yPos);
        doc.text(formatPPFCurrency(data.opening_balance), 80, yPos);
        doc.text(formatPPFCurrency(data.interest_earned), 125, yPos);
        doc.text(formatPPFCurrency(data.closing_balance), 150, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('ppf-calculator-report.pdf');
}

// Monthly contribution calculation helper
function getMonthlyContribution(annualContribution, frequency) {
    switch (frequency) {
        case 'monthly':
            return annualContribution / 12;
        case 'quarterly':
            return annualContribution / 4;
        case 'annually':
            return annualContribution;
        default:
            return annualContribution / 12;
    }
}

// Format frequency for display
function formatFrequency(frequency) {
    const frequencies = {
        'monthly': 'Monthly',
        'quarterly': 'Quarterly',
        'annually': 'Annually'
    };
    return frequencies[frequency] || 'Monthly';
}