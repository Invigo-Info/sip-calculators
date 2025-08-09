// Sovereign Gold Bonds Calculator Script

let sgbChart = null;

// Input elements
const sgbInvestmentQuantityInput = document.getElementById('sgbInvestmentQuantity');
const sgbInvestmentQuantitySlider = document.getElementById('sgbInvestmentQuantitySlider');
const sgbIssuePriceInput = document.getElementById('sgbIssuePrice');
const sgbIssuePriceSlider = document.getElementById('sgbIssuePriceSlider');
const sgbExpectedPriceInput = document.getElementById('sgbExpectedPrice');
const sgbExpectedPriceSlider = document.getElementById('sgbExpectedPriceSlider');
const sgbInterestRateInput = document.getElementById('sgbInterestRate');
const sgbInterestRateSlider = document.getElementById('sgbInterestRateSlider');
const sgbTenureInput = document.getElementById('sgbTenure');
const sgbTenureSlider = document.getElementById('sgbTenureSlider');

// Custom Chart.js plugin to display Total Investment in center
const sgbCenterTextPlugin = {
    id: 'sgbCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.sgbCenterText && chart.config.options.plugins.sgbCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Investment
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.sgbCenterText.text, centerX, centerY - 10);
            
            // Draw "Total Investment" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Investment', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(sgbCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupSgbSliders();
    addSgbEventListeners();
    initialSyncSgbValues();
    calculateAndUpdateSgbResults();
    setupSgbMegaMenu();
    setupSgbTableToggle();
});

function setupSgbSliders() {
    syncSgbInputs(sgbInvestmentQuantityInput, sgbInvestmentQuantitySlider);
    syncSgbInputs(sgbIssuePriceInput, sgbIssuePriceSlider);
    syncSgbInputs(sgbExpectedPriceInput, sgbExpectedPriceSlider);
    syncSgbInputs(sgbInterestRateInput, sgbInterestRateSlider);
    syncSgbInputs(sgbTenureInput, sgbTenureSlider);
}

function initialSyncSgbValues() {
    // Ensure initial values are properly synchronized
    sgbInvestmentQuantitySlider.value = sgbInvestmentQuantityInput.value;
    sgbIssuePriceSlider.value = sgbIssuePriceInput.value;
    sgbExpectedPriceSlider.value = sgbExpectedPriceInput.value;
    sgbInterestRateSlider.value = sgbInterestRateInput.value;
    sgbTenureSlider.value = sgbTenureInput.value;
}

function syncSgbInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateSgbResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateSgbResults();
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
        calculateAndUpdateSgbResults();
    });
}

function addSgbEventListeners() {
    // Add change listeners for all inputs
    [sgbInvestmentQuantityInput, sgbIssuePriceInput, sgbExpectedPriceInput, 
     sgbInterestRateInput, sgbTenureInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateSgbResults);
        input.addEventListener('keyup', calculateAndUpdateSgbResults);
    });

    // Add input listeners for sliders
    [sgbInvestmentQuantitySlider, sgbIssuePriceSlider, sgbExpectedPriceSlider, 
     sgbInterestRateSlider, sgbTenureSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateSgbResults);
    });
}

function calculateAndUpdateSgbResults() {
    const investmentQuantity = parseFloat(sgbInvestmentQuantityInput.value) || 1;
    const issuePrice = parseFloat(sgbIssuePriceInput.value) || 6000;
    const expectedPrice = parseFloat(sgbExpectedPriceInput.value) || 7500;
    const interestRate = parseFloat(sgbInterestRateInput.value) || 2.5;
    const tenure = parseInt(sgbTenureInput.value) || 8;

    // Validate inputs
    if (investmentQuantity <= 0) {
        showSgbError('Investment quantity must be greater than 0');
        return;
    }
    if (issuePrice <= 0) {
        showSgbError('Issue price must be greater than 0');
        return;
    }
    if (expectedPrice <= 0) {
        showSgbError('Expected gold price must be greater than 0');
        return;
    }
    if (interestRate < 0) {
        showSgbError('Interest rate cannot be negative');
        return;
    }
    if (tenure <= 0) {
        showSgbError('Tenure must be greater than 0');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-sgb', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            investment_quantity: investmentQuantity,
            issue_price_per_gram: issuePrice,
            expected_gold_price_maturity: expectedPrice,
            interest_rate: interestRate,
            tenure_years: tenure
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showSgbError(result.error);
            return;
        }
        
        // Update display
        updateSgbResultsDisplay(result);
        updateSgbChart(result);
        updateSgbTable(result);
        clearSgbError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateSgbReturnsClientSide(investmentQuantity, issuePrice, expectedPrice, interestRate, tenure);
        updateSgbResultsDisplay(result);
        updateSgbChart(result);
        updateSgbTable(result);
    });
}

function calculateSgbReturnsClientSide(investmentQuantity, issuePrice, expectedPrice, interestRate, tenure) {
    // Client-side SGB calculation as fallback
    const totalInvestment = investmentQuantity * issuePrice;
    const annualInterest = totalInvestment * (interestRate / 100);
    const totalInterestEarned = annualInterest * tenure;
    const maturityValue = investmentQuantity * expectedPrice;
    const capitalGain = maturityValue - totalInvestment;
    const totalReturn = maturityValue + totalInterestEarned;
    const totalGain = totalReturn - totalInvestment;
    
    // Calculate annualized return
    let annualizedReturn = 0;
    if (totalInvestment > 0 && tenure > 0) {
        annualizedReturn = Math.pow(totalReturn / totalInvestment, 1 / tenure) - 1;
        annualizedReturn *= 100;
    }
    
    // Generate year-wise data
    const yearWiseData = [];
    let cumulativeInterest = 0;
    
    for (let year = 1; year <= tenure; year++) {
        cumulativeInterest += annualInterest;
        const estimatedGoldValue = totalInvestment * (1 + ((expectedPrice - issuePrice) / issuePrice) * (year / tenure));
        
        yearWiseData.push({
            year: year,
            annual_interest: annualInterest,
            cumulative_interest: cumulativeInterest,
            investment_value: totalInvestment,
            estimated_gold_value: estimatedGoldValue,
            total_value_with_interest: estimatedGoldValue + cumulativeInterest
        });
    }
    
    return {
        investment_quantity: investmentQuantity,
        issue_price_per_gram: issuePrice,
        expected_gold_price_maturity: expectedPrice,
        interest_rate: interestRate,
        tenure_years: tenure,
        total_investment: Math.round(totalInvestment),
        total_interest_earned: Math.round(totalInterestEarned),
        maturity_value: Math.round(maturityValue),
        capital_gain: Math.round(capitalGain),
        total_return: Math.round(totalReturn),
        total_gain: Math.round(totalGain),
        annualized_return: Math.round(annualizedReturn * 100) / 100,
        annual_interest: Math.round(annualInterest),
        year_wise_data: yearWiseData
    };
}

function updateSgbResultsDisplay(result) {
    document.getElementById('sgbTotalInvestmentResult').textContent = formatSgbCurrency(result.total_investment);
    document.getElementById('sgbInterestEarnedResult').textContent = formatSgbCurrency(result.total_interest_earned);
    document.getElementById('sgbMaturityValueResult').textContent = formatSgbCurrency(result.maturity_value);
    document.getElementById('sgbCapitalGainResult').textContent = formatSgbCurrency(result.capital_gain);
    document.getElementById('sgbTotalReturnResult').textContent = formatSgbCurrency(result.total_return);
    document.getElementById('sgbAnnualizedReturnResult').textContent = result.annualized_return.toFixed(2) + '%';
    
    // Update chart summary
    document.getElementById('sgbTotalInvestmentDisplay').textContent = formatSgbCurrency(result.total_investment);
    document.getElementById('sgbInterestEarnedDisplay').textContent = formatSgbCurrency(result.total_interest_earned);
    document.getElementById('sgbCapitalGainDisplay').textContent = formatSgbCurrency(result.capital_gain);
}

function updateSgbChart(result) {
    const ctx = document.getElementById('sgbChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (sgbChart) {
        sgbChart.destroy();
    }
    
    const data = {
        labels: ['Total Investment', 'Interest Earned', 'Capital Gain'],
        datasets: [{
            data: [
                result.total_investment,
                result.total_interest_earned,
                result.capital_gain
            ],
            backgroundColor: [
                '#3498db',
                '#27ae60',
                '#f39c12'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    sgbChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                sgbCenterText: {
                    display: true,
                    text: formatSgbCurrency(result.total_investment)
                }
            },
            cutout: '60%'
        }
    });
}

function updateSgbTable(result) {
    if (result.year_wise_data) {
        updateSgbYearlyTable(result.year_wise_data);
    }
}

function updateSgbYearlyTable(yearlyData) {
    const tableBody = document.getElementById('sgbYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatSgbCurrency(data.annual_interest)}</td>
            <td>${formatSgbCurrency(data.cumulative_interest)}</td>
            <td>${formatSgbCurrency(data.investment_value)}</td>
            <td>${formatSgbCurrency(data.estimated_gold_value)}</td>
            <td>${formatSgbCurrency(data.total_value_with_interest)}</td>
        `;
    });
}

function formatSgbCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showSgbError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('sgbErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'sgbErrorMessage';
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

function clearSgbError() {
    const errorDiv = document.getElementById('sgbErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupSgbMegaMenu() {
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

function setupSgbTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('sgbTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleSgbTable() {
    const tableSection = document.getElementById('sgbTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadSgbPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Sovereign Gold Bonds Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const investmentQuantity = parseFloat(sgbInvestmentQuantityInput.value) || 1;
    const issuePrice = parseFloat(sgbIssuePriceInput.value) || 6000;
    const expectedPrice = parseFloat(sgbExpectedPriceInput.value) || 7500;
    const interestRate = parseFloat(sgbInterestRateInput.value) || 2.5;
    const tenure = parseInt(sgbTenureInput.value) || 8;
    
    doc.text(`Investment Quantity: ${investmentQuantity} grams`, 20, 40);
    doc.text(`Issue Price per gram: ${formatSgbCurrency(issuePrice)}`, 20, 50);
    doc.text(`Expected Gold Price at Maturity: ${formatSgbCurrency(expectedPrice)}`, 20, 60);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 70);
    doc.text(`Tenure: ${tenure} years`, 20, 80);
    
    // Add results
    const result = calculateSgbReturnsClientSide(investmentQuantity, issuePrice, expectedPrice, interestRate, tenure);
    doc.text(`Total Investment: ${formatSgbCurrency(result.total_investment)}`, 20, 110);
    doc.text(`Total Interest Earned: ${formatSgbCurrency(result.total_interest_earned)}`, 20, 120);
    doc.text(`Maturity Value: ${formatSgbCurrency(result.maturity_value)}`, 20, 130);
    doc.text(`Capital Gain: ${formatSgbCurrency(result.capital_gain)}`, 20, 140);
    doc.text(`Total Return: ${formatSgbCurrency(result.total_return)}`, 20, 150);
    doc.text(`Annualized Return: ${result.annualized_return.toFixed(2)}%`, 20, 160);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Breakdown:', 20, 190);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 200;
    doc.text('Year', 20, yPos);
    doc.text('Annual Interest', 45, yPos);
    doc.text('Cumulative Interest', 85, yPos);
    doc.text('Est. Gold Value', 130, yPos);
    doc.text('Total Value', 170, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.year_wise_data.slice(0, Math.min(10, result.year_wise_data.length)).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatSgbCurrency(data.annual_interest), 45, yPos);
        doc.text(formatSgbCurrency(data.cumulative_interest), 85, yPos);
        doc.text(formatSgbCurrency(data.estimated_gold_value), 130, yPos);
        doc.text(formatSgbCurrency(data.total_value_with_interest), 170, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('sgb-calculator-report.pdf');
}