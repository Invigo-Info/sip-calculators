// RBI Floating Rate Savings Bonds Calculator Script

let rbiBondChart = null;

// Input elements
const rbiBondInvestmentAmountInput = document.getElementById('rbiBondInvestmentAmount');
const rbiBondInvestmentAmountSlider = document.getElementById('rbiBondInvestmentAmountSlider');
const rbiBondInterestRateInput = document.getElementById('rbiBondInterestRate');
const rbiBondInterestRateSlider = document.getElementById('rbiBondInterestRateSlider');
const rbiBondTenureInput = document.getElementById('rbiBondTenure');

// Custom Chart.js plugin to display Principal in center (for doughnut chart)
const rbiBondCenterTextPlugin = {
    id: 'rbiBondCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.rbiBondCenterText && chart.config.options.plugins.rbiBondCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Principal Amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.rbiBondCenterText.text, centerX, centerY - 10);
            
            // Draw "Principal Amount" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Principal Amount', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(rbiBondCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupRbiBondSliders();
    addRbiBondEventListeners();
    initialSyncRbiBondValues();
    calculateAndUpdateRbiBondResults();
    setupRbiBondMegaMenu();
    setupRbiBondTableToggle();
});

function setupRbiBondSliders() {
    syncRbiBondInputs(rbiBondInvestmentAmountInput, rbiBondInvestmentAmountSlider);
    syncRbiBondInputs(rbiBondInterestRateInput, rbiBondInterestRateSlider);
}

function initialSyncRbiBondValues() {
    // Ensure initial values are properly synchronized
    rbiBondInvestmentAmountSlider.value = rbiBondInvestmentAmountInput.value;
    rbiBondInterestRateSlider.value = rbiBondInterestRateInput.value;
}

function syncRbiBondInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateRbiBondResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateRbiBondResults();
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
        calculateAndUpdateRbiBondResults();
    });
}

function addRbiBondEventListeners() {
    // Add change listeners for all inputs
    [rbiBondInvestmentAmountInput, rbiBondInterestRateInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateRbiBondResults);
        input.addEventListener('keyup', calculateAndUpdateRbiBondResults);
    });

    // Add input listeners for sliders
    [rbiBondInvestmentAmountSlider, rbiBondInterestRateSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateRbiBondResults);
    });
}

function calculateAndUpdateRbiBondResults() {
    const investmentAmount = parseFloat(rbiBondInvestmentAmountInput.value) || 0;
    const interestRate = parseFloat(rbiBondInterestRateInput.value) || 8.05;
    const bondTenureYears = parseInt(rbiBondTenureInput.value) || 7;

    // Validate inputs
    if (investmentAmount < 1000) {
        showRbiBondError('Minimum investment amount is ₹1,000');
        return;
    }

    if (interestRate <= 0 || interestRate > 20) {
        showRbiBondError('Interest rate must be between 0% and 20%');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-rbi-floating-rate-bonds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            investment_amount: investmentAmount,
            interest_rate: interestRate,
            bond_tenure_years: bondTenureYears
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showRbiBondError(result.error);
            return;
        }
        
        // Update display
        updateRbiBondResultsDisplay(result);
        updateRbiBondChart(result);
        updateRbiBondTable(result);
        clearRbiBondError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateRbiBondReturnsClientSide(investmentAmount, interestRate, bondTenureYears);
        updateRbiBondResultsDisplay(result);
        updateRbiBondChart(result);
        updateRbiBondTable(result);
    });
}

function calculateRbiBondReturnsClientSide(investmentAmount, interestRate, bondTenureYears) {
    // Client-side RBI bond calculation as fallback
    const annualInterestRate = interestRate / 100;
    const halfYearlyRate = annualInterestRate / 2;
    
    const totalInterestPerYear = investmentAmount * annualInterestRate;
    const halfYearlyPayout = investmentAmount * halfYearlyRate;
    const totalInterestOverTenure = totalInterestPerYear * bondTenureYears;
    const maturityAmount = investmentAmount + totalInterestOverTenure;
    
    // Generate year-wise and half-yearly breakdown
    const yearlyData = [];
    const halfYearlyData = [];
    let cumulativeInterest = 0;
    
    for (let year = 1; year <= bondTenureYears; year++) {
        const yearInterest = totalInterestPerYear;
        cumulativeInterest += yearInterest;
        
        yearlyData.push({
            year: year,
            interest_earned: Math.round(yearInterest),
            cumulative_interest: Math.round(cumulativeInterest),
            principal_outstanding: investmentAmount
        });
        
        // Half-yearly breakdown for this year
        for (let halfYear = 1; halfYear <= 2; halfYear++) {
            const payoutNumber = (year - 1) * 2 + halfYear;
            halfYearlyData.push({
                payout_number: payoutNumber,
                year: year,
                half_year: halfYear,
                payout_amount: Math.round(halfYearlyPayout),
                cumulative_interest: Math.round(payoutNumber * halfYearlyPayout)
            });
        }
    }
    
    // Calculate next rate revision date
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    let nextRevisionDate;
    
    if (currentMonth <= 6) {
        nextRevisionDate = `Jul 1, ${currentYear}`;
    } else {
        nextRevisionDate = `Jan 1, ${currentYear + 1}`;
    }
    
    return {
        investment_amount: Math.round(investmentAmount),
        interest_rate: interestRate,
        bond_tenure_years: bondTenureYears,
        total_interest_per_year: Math.round(totalInterestPerYear),
        half_yearly_payout: Math.round(halfYearlyPayout),
        total_interest_over_tenure: Math.round(totalInterestOverTenure),
        maturity_amount: Math.round(maturityAmount),
        yearly_data: yearlyData,
        half_yearly_data: halfYearlyData,
        next_revision_date: nextRevisionDate,
        summary_text: `For an investment of ₹${Math.round(investmentAmount).toLocaleString()} at ${interestRate}% interest, you will receive ₹${Math.round(halfYearlyPayout).toLocaleString()} every 6 months for 7 years.`
    };
}

function updateRbiBondResultsDisplay(result) {
    // Add animation class and update values
    const resultElements = [
        'rbiBondInvestmentResult',
        'rbiBondHalfYearlyPayoutResult',
        'rbiBondYearlyInterestResult',
        'rbiBondTotalInterestResult',
        'rbiBondMaturityValueResult'
    ];
    
    resultElements.forEach(elementId => {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add('result-updated');
            setTimeout(() => element.classList.remove('result-updated'), 600);
        }
    });
    
    document.getElementById('rbiBondInvestmentResult').textContent = formatRbiBondCurrency(result.investment_amount);
    document.getElementById('rbiBondHalfYearlyPayoutResult').textContent = formatRbiBondCurrency(result.half_yearly_payout);
    document.getElementById('rbiBondYearlyInterestResult').textContent = formatRbiBondCurrency(result.total_interest_per_year);
    document.getElementById('rbiBondTotalInterestResult').textContent = formatRbiBondCurrency(result.total_interest_over_tenure);
    document.getElementById('rbiBondMaturityValueResult').textContent = formatRbiBondCurrency(result.maturity_amount);
    
    // Update summary text
    document.getElementById('rbiBondSummaryText').textContent = result.summary_text;
    
    // Update next revision date
    document.getElementById('rbiBondNextRevision').textContent = result.next_revision_date;
    
    // Update chart summary
    document.getElementById('rbiBondPrincipalDisplay').textContent = formatRbiBondCurrency(result.investment_amount);
    document.getElementById('rbiBondInterestDisplay').textContent = formatRbiBondCurrency(result.total_interest_over_tenure);
}

function updateRbiBondChart(result) {
    const ctx = document.getElementById('rbiBondChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (rbiBondChart) {
        rbiBondChart.destroy();
    }
    
    // Create bar chart showing yearly payouts
    const years = result.yearly_data.map(data => `Year ${data.year}`);
    const yearlyInterest = result.yearly_data.map(data => data.interest_earned);
    
    const data = {
        labels: years,
        datasets: [{
            label: 'Annual Interest (₹)',
            data: yearlyInterest,
            backgroundColor: '#3498db',
            borderColor: '#2980b9',
            borderWidth: 1,
            borderRadius: 4
        }]
    };
    
    rbiBondChart = new Chart(ctx, {
        type: 'bar',
        data: data,
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
                            return `Annual Interest: ${formatRbiBondCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toLocaleString();
                        }
                    }
                },
                x: {
                    ticks: {
                        maxRotation: 45
                    }
                }
            }
        }
    });
}

function updateRbiBondTable(result) {
    if (result.half_yearly_data) {
        updateRbiBondPayoutTable(result.half_yearly_data, result.investment_amount);
    }
}

function updateRbiBondPayoutTable(halfYearlyData, principalAmount) {
    const tableBody = document.getElementById('rbiBondPayoutTableBody');
    tableBody.innerHTML = '';
    
    halfYearlyData.forEach(data => {
        const row = tableBody.insertRow();
        const halfYearText = data.half_year === 1 ? 'H1' : 'H2';
        
        row.innerHTML = `
            <td>${data.payout_number}</td>
            <td>${data.year}</td>
            <td>${halfYearText}</td>
            <td>${formatRbiBondCurrency(data.payout_amount)}</td>
            <td>${formatRbiBondCurrency(data.cumulative_interest)}</td>
            <td>${formatRbiBondCurrency(principalAmount)}</td>
        `;
    });
}

function formatRbiBondCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showRbiBondError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('rbiBondErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'rbiBondErrorMessage';
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

function clearRbiBondError() {
    const errorDiv = document.getElementById('rbiBondErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupRbiBondMegaMenu() {
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

function setupRbiBondTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('rbiBondTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleRbiBondTable() {
    const tableSection = document.getElementById('rbiBondTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadRbiBondPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('RBI Floating Rate Savings Bonds Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const investmentAmount = parseFloat(rbiBondInvestmentAmountInput.value) || 0;
    const interestRate = parseFloat(rbiBondInterestRateInput.value) || 8.05;
    const bondTenureYears = parseInt(rbiBondTenureInput.value) || 7;
    
    doc.text(`Investment Amount: ${formatRbiBondCurrency(investmentAmount)}`, 20, 40);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 50);
    doc.text(`Bond Tenure: ${bondTenureYears} years`, 20, 60);
    doc.text(`Interest Payout: Half-Yearly`, 20, 70);
    
    // Add results
    const result = calculateRbiBondReturnsClientSide(investmentAmount, interestRate, bondTenureYears);
    doc.text(`Half-Yearly Payout: ${formatRbiBondCurrency(result.half_yearly_payout)}`, 20, 90);
    doc.text(`Total Interest per Year: ${formatRbiBondCurrency(result.total_interest_per_year)}`, 20, 100);
    doc.text(`Total Interest Over Tenure: ${formatRbiBondCurrency(result.total_interest_over_tenure)}`, 20, 110);
    doc.text(`Maturity Amount: ${formatRbiBondCurrency(result.maturity_amount)}`, 20, 120);
    doc.text(`Next Rate Revision: ${result.next_revision_date}`, 20, 130);
    
    // Add summary
    doc.setFontSize(10);
    doc.text('Summary:', 20, 150);
    doc.text(result.summary_text, 20, 160, { maxWidth: 170 });
    
    // Add half-yearly payout breakdown header
    doc.setFontSize(14);
    doc.text('Half-Yearly Payout Schedule:', 20, 180);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 190;
    doc.text('Payout', 20, yPos);
    doc.text('Year', 45, yPos);
    doc.text('Half', 65, yPos);
    doc.text('Amount', 85, yPos);
    doc.text('Cumulative', 115, yPos);
    doc.text('Principal', 150, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 payouts to fit on page)
    result.half_yearly_data.slice(0, 10).forEach(data => {
        const halfYearText = data.half_year === 1 ? 'H1' : 'H2';
        doc.text(data.payout_number.toString(), 20, yPos);
        doc.text(data.year.toString(), 45, yPos);
        doc.text(halfYearText, 65, yPos);
        doc.text(formatRbiBondCurrency(data.payout_amount), 85, yPos);
        doc.text(formatRbiBondCurrency(data.cumulative_interest), 115, yPos);
        doc.text(formatRbiBondCurrency(investmentAmount), 150, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('rbi-floating-rate-savings-bonds-report.pdf');
}

// Helper function to format numbers for display
function formatNumberForDisplay(num, decimals = 0) {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    });
}

// Helper function to format percentage for display
function formatPercentage(num, decimals = 2) {
    return num.toLocaleString('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }) + '%';
}