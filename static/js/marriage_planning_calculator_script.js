// Marriage Planning Calculator Script

let marriagePlanChart = null;

// Input elements
const currentMarriageCostInput = document.getElementById('currentMarriageCost');
const currentMarriageCostSlider = document.getElementById('currentMarriageCostSlider');
const inflationRateInput = document.getElementById('inflationRate');
const inflationRateSlider = document.getElementById('inflationRateSlider');
const currentAgeInput = document.getElementById('currentAge');
const currentAgeSlider = document.getElementById('currentAgeSlider');
const marriageAgeInput = document.getElementById('marriageAge');
const marriageAgeSlider = document.getElementById('marriageAgeSlider');
const expectedReturnInput = document.getElementById('expectedReturn');
const expectedReturnSlider = document.getElementById('expectedReturnSlider');
const existingSavingsInput = document.getElementById('existingSavings');
const existingSavingsSlider = document.getElementById('existingSavingsSlider');

// Custom Chart.js plugin to display Total Investment in center
const marriagePlanCenterTextPlugin = {
    id: 'marriagePlanCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.marriagePlanCenterText && chart.config.options.plugins.marriagePlanCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Investment
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.marriagePlanCenterText.text, centerX, centerY - 10);
            
            // Draw "Total Investment" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Investment', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(marriagePlanCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupMarriagePlanSliders();
    addMarriagePlanEventListeners();
    initialSyncMarriagePlanValues();
    calculateAndUpdateMarriagePlanResults();
    setupMarriagePlanMegaMenu();
    setupMarriagePlanTableToggle();
});

function setupMarriagePlanSliders() {
    syncMarriagePlanInputs(currentMarriageCostInput, currentMarriageCostSlider);
    syncMarriagePlanInputs(inflationRateInput, inflationRateSlider);
    syncMarriagePlanInputs(currentAgeInput, currentAgeSlider);
    syncMarriagePlanInputs(marriageAgeInput, marriageAgeSlider);
    syncMarriagePlanInputs(expectedReturnInput, expectedReturnSlider);
    syncMarriagePlanInputs(existingSavingsInput, existingSavingsSlider);
}

function initialSyncMarriagePlanValues() {
    // Ensure initial values are properly synchronized
    currentMarriageCostSlider.value = currentMarriageCostInput.value;
    inflationRateSlider.value = inflationRateInput.value;
    currentAgeSlider.value = currentAgeInput.value;
    marriageAgeSlider.value = marriageAgeInput.value;
    expectedReturnSlider.value = expectedReturnInput.value;
    existingSavingsSlider.value = existingSavingsInput.value;
}

function syncMarriagePlanInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateMarriagePlanResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateMarriagePlanResults();
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
        calculateAndUpdateMarriagePlanResults();
    });
}

function addMarriagePlanEventListeners() {
    // Add change listeners for all inputs
    [currentMarriageCostInput, inflationRateInput, currentAgeInput, marriageAgeInput, expectedReturnInput, existingSavingsInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateMarriagePlanResults);
        input.addEventListener('keyup', calculateAndUpdateMarriagePlanResults);
    });

    // Add input listeners for sliders
    [currentMarriageCostSlider, inflationRateSlider, currentAgeSlider, marriageAgeSlider, expectedReturnSlider, existingSavingsSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateMarriagePlanResults);
    });
}

function calculateAndUpdateMarriagePlanResults() {
    const currentCost = parseFloat(currentMarriageCostInput.value) || 500000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const currentAge = parseInt(currentAgeInput.value) || 5;
    const marriageAge = parseInt(marriageAgeInput.value) || 25;
    const expectedReturn = parseFloat(expectedReturnInput.value) || 8;
    const existingSavings = parseFloat(existingSavingsInput.value) || 0;

    // Validate inputs
    if (marriageAge <= currentAge) {
        showMarriagePlanError('Marriage age must be greater than current age');
        return;
    }

    if (currentAge < 0 || currentAge > 25) {
        showMarriagePlanError('Current age must be between 0 and 25 years');
        return;
    }

    if (marriageAge < 18 || marriageAge > 35) {
        showMarriagePlanError('Marriage age must be between 18 and 35 years');
        return;
    }

    if (inflationRate < 3 || inflationRate > 12) {
        showMarriagePlanError('Inflation rate must be between 3% and 12%');
        return;
    }

    if (expectedReturn < 4 || expectedReturn > 20) {
        showMarriagePlanError('Expected return must be between 4% and 20%');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-marriage-planning', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_marriage_cost: currentCost,
            inflation_rate: inflationRate,
            current_age: currentAge,
            marriage_age: marriageAge,
            expected_return: expectedReturn,
            existing_savings: existingSavings
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showMarriagePlanError(result.error);
            return;
        }
        
        // Update display
        updateMarriagePlanResultsDisplay(result);
        updateMarriagePlanChart(result);
        updateMarriagePlanTable(result);
        clearMarriagePlanError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateMarriagePlanClientSide(currentCost, inflationRate, currentAge, marriageAge, expectedReturn, existingSavings);
        updateMarriagePlanResultsDisplay(result);
        updateMarriagePlanChart(result);
        updateMarriagePlanTable(result);
    });
}

function calculateMarriagePlanClientSide(currentCost, inflationRate, currentAge, marriageAge, expectedReturn, existingSavings) {
    // Client-side marriage planning calculation as fallback
    const yearsUntilMarriage = marriageAge - currentAge;
    
    // Calculate future marriage cost
    const futureCost = currentCost * Math.pow(1 + inflationRate / 100, yearsUntilMarriage);
    
    // Calculate growth of existing savings
    const futureValueOfExistingSavings = existingSavings * Math.pow(1 + expectedReturn / 100, yearsUntilMarriage);
    
    // Calculate required corpus (considering existing savings growth)
    const requiredCorpus = Math.max(0, futureCost - futureValueOfExistingSavings);
    
    // Calculate monthly investment required using SIP formula
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = yearsUntilMarriage * 12;
    
    let monthlyInvestment = 0;
    if (requiredCorpus > 0 && totalMonths > 0) {
        if (monthlyRate > 0) {
            monthlyInvestment = requiredCorpus * monthlyRate / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        } else {
            monthlyInvestment = requiredCorpus / totalMonths;
        }
    }
    
    // Calculate yearly breakdown for table
    const yearWiseData = [];
    let totalInvested = 0;
    let portfolioValue = existingSavings;
    
    for (let year = 1; year <= yearsUntilMarriage; year++) {
        const annualInvestment = monthlyInvestment * 12;
        const openingBalance = portfolioValue;
        const returns = (openingBalance + annualInvestment / 2) * (expectedReturn / 100); // Simplified returns calculation
        const closingBalance = openingBalance + annualInvestment + returns;
        
        totalInvested += annualInvestment;
        portfolioValue = closingBalance;
        
        yearWiseData.push({
            year: year,
            annual_investment: annualInvestment,
            opening_balance: Math.round(openingBalance),
            returns_earned: Math.round(returns),
            closing_balance: Math.round(closingBalance),
            total_invested_till_date: Math.round(totalInvested)
        });
    }
    
    const totalGrowth = portfolioValue - totalInvested - existingSavings;
    
    return {
        future_marriage_cost: Math.round(futureCost),
        monthly_investment_required: Math.round(monthlyInvestment),
        total_corpus_required: Math.round(requiredCorpus),
        years_until_marriage: yearsUntilMarriage,
        total_investment: Math.round(totalInvested),
        investment_growth: Math.round(totalGrowth),
        existing_savings: existingSavings,
        future_value_existing_savings: Math.round(futureValueOfExistingSavings),
        year_wise_data: yearWiseData
    };
}

function updateMarriagePlanResultsDisplay(result) {
    document.getElementById('futureMarriageCostResult').textContent = formatMarriagePlanCurrency(result.future_marriage_cost);
    document.getElementById('monthlyInvestmentResult').textContent = formatMarriagePlanCurrency(result.monthly_investment_required);
    document.getElementById('totalCorpusResult').textContent = formatMarriagePlanCurrency(result.total_corpus_required);
    
    // Update summary text
    const summaryText = `To afford ${formatMarriagePlanCurrency(result.future_marriage_cost)} in ${result.years_until_marriage} years, you need to invest ${formatMarriagePlanCurrency(result.monthly_investment_required)} per month.`;
    document.getElementById('summaryText').textContent = summaryText;
    
    // Update chart summary
    document.getElementById('totalInvestmentDisplay').textContent = formatMarriagePlanCurrency(result.total_investment);
    document.getElementById('growthAmountDisplay').textContent = formatMarriagePlanCurrency(result.investment_growth);
}

function updateMarriagePlanChart(result) {
    const ctx = document.getElementById('marriagePlanChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (marriagePlanChart) {
        marriagePlanChart.destroy();
    }
    
    const data = {
        labels: ['Total Investment', 'Investment Growth'],
        datasets: [{
            data: [
                result.total_investment,
                result.investment_growth
            ],
            backgroundColor: [
                '#3498db',
                '#27ae60'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    marriagePlanChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                marriagePlanCenterText: {
                    display: true,
                    text: formatMarriagePlanCurrency(result.total_investment)
                }
            },
            cutout: '60%'
        }
    });
}

function updateMarriagePlanTable(result) {
    if (result.year_wise_data) {
        updateMarriagePlanYearlyTable(result.year_wise_data);
    }
}

function updateMarriagePlanYearlyTable(yearlyData) {
    const tableBody = document.getElementById('marriagePlanYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatMarriagePlanCurrency(data.annual_investment)}</td>
            <td>${formatMarriagePlanCurrency(data.opening_balance)}</td>
            <td>${formatMarriagePlanCurrency(data.returns_earned)}</td>
            <td>${formatMarriagePlanCurrency(data.closing_balance)}</td>
            <td>${formatMarriagePlanCurrency(data.total_invested_till_date)}</td>
        `;
    });
}

function formatMarriagePlanCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showMarriagePlanError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('marriagePlanErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'marriagePlanErrorMessage';
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

function clearMarriagePlanError() {
    const errorDiv = document.getElementById('marriagePlanErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupMarriagePlanMegaMenu() {
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

function setupMarriagePlanTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('marriagePlanTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleMarriagePlanTable() {
    const tableSection = document.getElementById('marriagePlanTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadMarriagePlanPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Marriage Planning Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const currentCost = parseFloat(currentMarriageCostInput.value) || 500000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const currentAge = parseInt(currentAgeInput.value) || 5;
    const marriageAge = parseInt(marriageAgeInput.value) || 25;
    const expectedReturn = parseFloat(expectedReturnInput.value) || 8;
    const existingSavings = parseFloat(existingSavingsInput.value) || 0;
    
    doc.text(`Current Marriage Cost: ${formatMarriagePlanCurrency(currentCost)}`, 20, 40);
    doc.text(`Expected Inflation Rate: ${inflationRate}%`, 20, 50);
    doc.text(`Child's Current Age: ${currentAge} years`, 20, 60);
    doc.text(`Child's Age at Marriage: ${marriageAge} years`, 20, 70);
    doc.text(`Expected Annual Return: ${expectedReturn}%`, 20, 80);
    doc.text(`Existing Savings: ${formatMarriagePlanCurrency(existingSavings)}`, 20, 90);
    
    // Add results
    const result = calculateMarriagePlanClientSide(currentCost, inflationRate, currentAge, marriageAge, expectedReturn, existingSavings);
    doc.text(`Future Marriage Cost: ${formatMarriagePlanCurrency(result.future_marriage_cost)}`, 20, 110);
    doc.text(`Monthly Investment Required: ${formatMarriagePlanCurrency(result.monthly_investment_required)}`, 20, 120);
    doc.text(`Total Corpus Required: ${formatMarriagePlanCurrency(result.total_corpus_required)}`, 20, 130);
    doc.text(`Years Until Marriage: ${result.years_until_marriage} years`, 20, 140);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Investment Breakdown:', 20, 160);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 170;
    doc.text('Year', 20, yPos);
    doc.text('Investment', 45, yPos);
    doc.text('Opening Balance', 80, yPos);
    doc.text('Returns', 125, yPos);
    doc.text('Closing Balance', 150, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.year_wise_data.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatMarriagePlanCurrency(data.annual_investment), 45, yPos);
        doc.text(formatMarriagePlanCurrency(data.opening_balance), 80, yPos);
        doc.text(formatMarriagePlanCurrency(data.returns_earned), 125, yPos);
        doc.text(formatMarriagePlanCurrency(data.closing_balance), 150, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('marriage-planning-calculator-report.pdf');
}

// Utility functions for localStorage scenarios (bonus feature)
function saveMarriagePlanScenario(name) {
    const scenario = {
        name: name,
        currentMarriageCost: currentMarriageCostInput.value,
        inflationRate: inflationRateInput.value,
        currentAge: currentAgeInput.value,
        marriageAge: marriageAgeInput.value,
        expectedReturn: expectedReturnInput.value,
        existingSavings: existingSavingsInput.value,
        timestamp: new Date().toISOString()
    };
    
    let scenarios = JSON.parse(localStorage.getItem('marriagePlanScenarios') || '[]');
    scenarios.push(scenario);
    localStorage.setItem('marriagePlanScenarios', JSON.stringify(scenarios));
    
    return scenarios;
}

function loadMarriagePlanScenario(scenario) {
    currentMarriageCostInput.value = scenario.currentMarriageCost;
    currentMarriageCostSlider.value = scenario.currentMarriageCost;
    inflationRateInput.value = scenario.inflationRate;
    inflationRateSlider.value = scenario.inflationRate;
    currentAgeInput.value = scenario.currentAge;
    currentAgeSlider.value = scenario.currentAge;
    marriageAgeInput.value = scenario.marriageAge;
    marriageAgeSlider.value = scenario.marriageAge;
    expectedReturnInput.value = scenario.expectedReturn;
    expectedReturnSlider.value = scenario.expectedReturn;
    existingSavingsInput.value = scenario.existingSavings;
    existingSavingsSlider.value = scenario.existingSavings;
    
    calculateAndUpdateMarriagePlanResults();
}

function getMarriagePlanScenarios() {
    return JSON.parse(localStorage.getItem('marriagePlanScenarios') || '[]');
}

function deleteMarriagePlanScenario(index) {
    let scenarios = getMarriagePlanScenarios();
    scenarios.splice(index, 1);
    localStorage.setItem('marriagePlanScenarios', JSON.stringify(scenarios));
    return scenarios;
}
