// Post Office RD Calculator Script

let postOfficeRdChart = null;

// Input elements
const postOfficeRdMonthlyAmountInput = document.getElementById('postOfficeRdMonthlyAmount');
const postOfficeRdMonthlyAmountSlider = document.getElementById('postOfficeRdMonthlyAmountSlider');
const postOfficeRdTenureYearsInput = document.getElementById('postOfficeRdTenureYears');
const postOfficeRdTenureYearsSlider = document.getElementById('postOfficeRdTenureYearsSlider');
const postOfficeRdInterestRateInput = document.getElementById('postOfficeRdInterestRate');
const postOfficeRdInterestRateSlider = document.getElementById('postOfficeRdInterestRateSlider');

// Custom Chart.js plugin to display Total Investment in center
const postOfficeRdCenterTextPlugin = {
    id: 'postOfficeRdCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.postOfficeRdCenterText && chart.config.options.plugins.postOfficeRdCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Investment
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.postOfficeRdCenterText.text, centerX, centerY - 10);
            
            // Draw "Total Investment" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Investment', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(postOfficeRdCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupPostOfficeRdSliders();
    addPostOfficeRdEventListeners();
    initialSyncPostOfficeRdValues();
    calculateAndUpdatePostOfficeRdResults();
    setupPostOfficeRdMegaMenu();
    setupPostOfficeRdTableToggle();
});

function setupPostOfficeRdSliders() {
    syncPostOfficeRdInputs(postOfficeRdMonthlyAmountInput, postOfficeRdMonthlyAmountSlider);
    syncPostOfficeRdInputs(postOfficeRdTenureYearsInput, postOfficeRdTenureYearsSlider);
    syncPostOfficeRdInputs(postOfficeRdInterestRateInput, postOfficeRdInterestRateSlider);
}

function initialSyncPostOfficeRdValues() {
    // Ensure initial values are properly synchronized
    postOfficeRdMonthlyAmountSlider.value = postOfficeRdMonthlyAmountInput.value;
    postOfficeRdTenureYearsSlider.value = postOfficeRdTenureYearsInput.value;
    postOfficeRdInterestRateSlider.value = postOfficeRdInterestRateInput.value;
}

function syncPostOfficeRdInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdatePostOfficeRdResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdatePostOfficeRdResults();
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
        calculateAndUpdatePostOfficeRdResults();
    });
}

function addPostOfficeRdEventListeners() {
    // Add change listeners for all inputs
    [postOfficeRdMonthlyAmountInput, postOfficeRdTenureYearsInput, postOfficeRdInterestRateInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdatePostOfficeRdResults);
        input.addEventListener('keyup', calculateAndUpdatePostOfficeRdResults);
    });

    // Add input listeners for sliders
    [postOfficeRdMonthlyAmountSlider, postOfficeRdTenureYearsSlider, postOfficeRdInterestRateSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdatePostOfficeRdResults);
    });
}

function calculateAndUpdatePostOfficeRdResults() {
    const monthlyAmount = parseFloat(postOfficeRdMonthlyAmountInput.value) || 0;
    const tenureYears = parseInt(postOfficeRdTenureYearsInput.value) || 1;
    const interestRate = parseFloat(postOfficeRdInterestRateInput.value) || 6.7;

    // Validation
    if (monthlyAmount < 100) {
        showPostOfficeRdError('Monthly deposit amount must be at least ₹100');
        return;
    }

    if (tenureYears < 1 || tenureYears > 30) {
        showPostOfficeRdError('Tenure must be between 1 and 30 years');
        return;
    }

    if (interestRate < 1.0 || interestRate > 15.0) {
        showPostOfficeRdError('Interest rate must be between 1% and 15%');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-post-office-rd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            monthly_amount: monthlyAmount,
            tenure_years: tenureYears,
            interest_rate: interestRate
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showPostOfficeRdError(result.error);
            return;
        }
        
        // Update display
        updatePostOfficeRdResultsDisplay(result);
        updatePostOfficeRdChart(result);
        updatePostOfficeRdTable(result);
        updatePostOfficeRdSummaryText(result);
        clearPostOfficeRdError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculatePostOfficeRdReturnsClientSide(monthlyAmount, tenureYears, interestRate);
        updatePostOfficeRdResultsDisplay(result);
        updatePostOfficeRdChart(result);
        updatePostOfficeRdTable(result);
        updatePostOfficeRdSummaryText(result);
    });
}

function calculatePostOfficeRdReturnsClientSide(monthlyAmount, tenureYears, interestRate) {
    // Post Office RD calculation using the formula:
    // M = R × [(1 + i)^n − 1] / [1 − (1 + i)^(-1/3)]
    // Where:
    // R = Monthly deposit
    // i = Interest rate per quarter = annual rate / 400
    // n = total quarters = years × 4
    
    const quarterlyRate = interestRate / 400; // Interest rate per quarter
    const totalQuarters = tenureYears * 4;
    const totalMonths = tenureYears * 12;
    
    let maturityValue;
    
    if (quarterlyRate === 0) {
        // If no interest
        maturityValue = monthlyAmount * totalMonths;
    } else {
        // Apply RD formula
        const numerator = Math.pow(1 + quarterlyRate, totalQuarters) - 1;
        const denominator = 1 - Math.pow(1 + quarterlyRate, -1/3);
        maturityValue = monthlyAmount * (numerator / denominator);
    }
    
    const totalInvestment = monthlyAmount * totalMonths;
    const totalInterest = maturityValue - totalInvestment;
    
    // Calculate maturity date
    const today = new Date();
    const maturityDate = new Date(today.getFullYear() + tenureYears, today.getMonth(), today.getDate());
    
    // Generate year-wise data
    const yearWiseData = [];
    let cumulativeInvestment = 0;
    let cumulativeValue = 0;
    
    for (let year = 1; year <= tenureYears; year++) {
        const yearlyDeposits = monthlyAmount * 12;
        cumulativeInvestment += yearlyDeposits;
        
        // Calculate value at end of year using compound growth
        const quartersCompleted = year * 4;
        let yearEndValue;
        
        if (quarterlyRate === 0) {
            yearEndValue = cumulativeInvestment;
        } else {
            const numeratorYear = Math.pow(1 + quarterlyRate, quartersCompleted) - 1;
            const denominatorYear = 1 - Math.pow(1 + quarterlyRate, -1/3);
            yearEndValue = monthlyAmount * (numeratorYear / denominatorYear);
        }
        
        const yearInterest = yearEndValue - cumulativeValue - yearlyDeposits;
        cumulativeValue = yearEndValue;
        
        yearWiseData.push({
            year: year,
            quarterly_deposits: yearlyDeposits / 4,
            opening_balance: cumulativeValue - yearEndValue + cumulativeValue - yearlyDeposits,
            interest_earned: Math.max(0, yearInterest),
            closing_balance: yearEndValue,
            total_invested: cumulativeInvestment
        });
    }
    
    return {
        total_investment: Math.round(totalInvestment),
        total_interest: Math.round(totalInterest),
        maturity_value: Math.round(maturityValue),
        maturity_date: maturityDate.toLocaleDateString('en-US', { 
            month: 'short', 
            year: 'numeric' 
        }),
        monthly_amount: monthlyAmount,
        tenure_years: tenureYears,
        interest_rate: interestRate,
        year_wise_data: yearWiseData
    };
}

function updatePostOfficeRdResultsDisplay(result) {
    document.getElementById('postOfficeRdTotalInvestmentResult').textContent = formatPostOfficeRdCurrency(result.total_investment);
    document.getElementById('postOfficeRdInterestEarnedResult').textContent = formatPostOfficeRdCurrency(result.total_interest);
    document.getElementById('postOfficeRdMaturityValueResult').textContent = formatPostOfficeRdCurrency(result.maturity_value);
    document.getElementById('postOfficeRdMaturityDateResult').textContent = result.maturity_date;
    
    // Update chart summary
    document.getElementById('postOfficeRdTotalInvestmentDisplay').textContent = formatPostOfficeRdCurrency(result.total_investment);
    document.getElementById('postOfficeRdInterestEarnedDisplay').textContent = formatPostOfficeRdCurrency(result.total_interest);
}

function updatePostOfficeRdSummaryText(result) {
    const summaryText = `By investing ₹${result.monthly_amount.toLocaleString()} monthly for ${result.tenure_years} ${result.tenure_years === 1 ? 'year' : 'years'} at ${result.interest_rate}% interest, you'll receive ${formatPostOfficeRdCurrency(result.maturity_value)} at maturity.`;
    document.getElementById('postOfficeRdSummaryText').textContent = summaryText;
}

function updatePostOfficeRdChart(result) {
    const ctx = document.getElementById('postOfficeRdChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (postOfficeRdChart) {
        postOfficeRdChart.destroy();
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
    
    postOfficeRdChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                postOfficeRdCenterText: {
                    display: true,
                    text: formatPostOfficeRdCurrency(result.total_investment)
                }
            },
            cutout: '60%'
        }
    });
}

function updatePostOfficeRdTable(result) {
    if (result.year_wise_data) {
        updatePostOfficeRdYearlyTable(result.year_wise_data);
    }
}

function updatePostOfficeRdYearlyTable(yearlyData) {
    const tableBody = document.getElementById('postOfficeRdYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatPostOfficeRdCurrency(data.quarterly_deposits * 4)}</td>
            <td>${formatPostOfficeRdCurrency(data.opening_balance)}</td>
            <td>${formatPostOfficeRdCurrency(data.interest_earned)}</td>
            <td>${formatPostOfficeRdCurrency(data.closing_balance)}</td>
            <td>${formatPostOfficeRdCurrency(data.total_invested)}</td>
        `;
    });
}

function formatPostOfficeRdCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showPostOfficeRdError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('postOfficeRdErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'postOfficeRdErrorMessage';
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

function clearPostOfficeRdError() {
    const errorDiv = document.getElementById('postOfficeRdErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupPostOfficeRdMegaMenu() {
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

function setupPostOfficeRdTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('postOfficeRdTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function togglePostOfficeRdTable() {
    const tableSection = document.getElementById('postOfficeRdTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadPostOfficeRdPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Post Office RD Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const monthlyAmount = parseFloat(postOfficeRdMonthlyAmountInput.value) || 0;
    const tenureYears = parseInt(postOfficeRdTenureYearsInput.value) || 1;
    const interestRate = parseFloat(postOfficeRdInterestRateInput.value) || 6.7;
    
    doc.text(`Monthly Deposit: ${formatPostOfficeRdCurrency(monthlyAmount)}`, 20, 40);
    doc.text(`Tenure: ${tenureYears} years`, 20, 50);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 60);
    
    // Add results
    const result = calculatePostOfficeRdReturnsClientSide(monthlyAmount, tenureYears, interestRate);
    doc.text(`Total Investment: ${formatPostOfficeRdCurrency(result.total_investment)}`, 20, 80);
    doc.text(`Interest Earned: ${formatPostOfficeRdCurrency(result.total_interest)}`, 20, 90);
    doc.text(`Maturity Value: ${formatPostOfficeRdCurrency(result.maturity_value)}`, 20, 100);
    doc.text(`Maturity Date: ${result.maturity_date}`, 20, 110);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Breakdown:', 20, 140);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 150;
    doc.text('Year', 20, yPos);
    doc.text('Annual Deposits', 45, yPos);
    doc.text('Opening Balance', 85, yPos);
    doc.text('Interest', 125, yPos);
    doc.text('Closing Balance', 150, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.year_wise_data.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatPostOfficeRdCurrency(data.quarterly_deposits * 4), 45, yPos);
        doc.text(formatPostOfficeRdCurrency(data.opening_balance), 85, yPos);
        doc.text(formatPostOfficeRdCurrency(data.interest_earned), 125, yPos);
        doc.text(formatPostOfficeRdCurrency(data.closing_balance), 150, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('post-office-rd-calculator-report.pdf');
}