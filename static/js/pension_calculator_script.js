// Pension Calculator Script

let pensionChart = null;

// Input elements
const currentExpensesInput = document.getElementById('currentExpenses');
const currentExpensesSlider = document.getElementById('currentExpensesSlider');
const currentAgeInput = document.getElementById('currentAge');
const currentAgeSlider = document.getElementById('currentAgeSlider');
const retirementAgeInput = document.getElementById('retirementAge');
const retirementAgeSlider = document.getElementById('retirementAgeSlider');
const lifeExpectancyInput = document.getElementById('lifeExpectancy');
const lifeExpectancySlider = document.getElementById('lifeExpectancySlider');
const retirementExpenseRatioInput = document.getElementById('retirementExpenseRatio');
const retirementExpenseRatioSlider = document.getElementById('retirementExpenseRatioSlider');
const inflationRateInput = document.getElementById('inflationRate');
const inflationRateSlider = document.getElementById('inflationRateSlider');
const preRetirementReturnInput = document.getElementById('preRetirementReturn');
const preRetirementReturnSlider = document.getElementById('preRetirementReturnSlider');
const postRetirementReturnInput = document.getElementById('postRetirementReturn');
const postRetirementReturnSlider = document.getElementById('postRetirementReturnSlider');
const existingSavingsInput = document.getElementById('existingSavings');
const existingSavingsSlider = document.getElementById('existingSavingsSlider');

// Custom Chart.js plugin to display corpus amount in center
const pensionCenterTextPlugin = {
    id: 'pensionCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.pensionCenterText && chart.config.options.plugins.pensionCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Corpus Amount
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.pensionCenterText.text, centerX, centerY - 8);
            
            // Draw "Retirement Corpus" label
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Retirement Corpus', centerX, centerY + 12);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(pensionCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupPensionSliders();
    addPensionEventListeners();
    initialSyncPensionValues();
    calculateAndUpdatePensionResults();
    setupPensionMegaMenu();
    setupPensionTableToggle();
});

function setupPensionSliders() {
    syncPensionInputs(currentExpensesInput, currentExpensesSlider);
    syncPensionInputs(currentAgeInput, currentAgeSlider);
    syncPensionInputs(retirementAgeInput, retirementAgeSlider);
    syncPensionInputs(lifeExpectancyInput, lifeExpectancySlider);
    syncPensionInputs(retirementExpenseRatioInput, retirementExpenseRatioSlider);
    syncPensionInputs(inflationRateInput, inflationRateSlider);
    syncPensionInputs(preRetirementReturnInput, preRetirementReturnSlider);
    syncPensionInputs(postRetirementReturnInput, postRetirementReturnSlider);
    syncPensionInputs(existingSavingsInput, existingSavingsSlider);
}

function initialSyncPensionValues() {
    // Ensure initial values are properly synchronized
    currentExpensesSlider.value = currentExpensesInput.value;
    currentAgeSlider.value = currentAgeInput.value;
    retirementAgeSlider.value = retirementAgeInput.value;
    lifeExpectancySlider.value = lifeExpectancyInput.value;
    retirementExpenseRatioSlider.value = retirementExpenseRatioInput.value;
    inflationRateSlider.value = inflationRateInput.value;
    preRetirementReturnSlider.value = preRetirementReturnInput.value;
    postRetirementReturnSlider.value = postRetirementReturnInput.value;
    existingSavingsSlider.value = existingSavingsInput.value;
}

function syncPensionInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdatePensionResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdatePensionResults();
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
        calculateAndUpdatePensionResults();
    });
}

function addPensionEventListeners() {
    // Add change listeners for all inputs
    const allInputs = [
        currentExpensesInput, currentAgeInput, retirementAgeInput, lifeExpectancyInput,
        retirementExpenseRatioInput, inflationRateInput, preRetirementReturnInput,
        postRetirementReturnInput, existingSavingsInput
    ];
    
    allInputs.forEach(input => {
        input.addEventListener('change', calculateAndUpdatePensionResults);
        input.addEventListener('keyup', calculateAndUpdatePensionResults);
    });

    // Add input listeners for sliders
    const allSliders = [
        currentExpensesSlider, currentAgeSlider, retirementAgeSlider, lifeExpectancySlider,
        retirementExpenseRatioSlider, inflationRateSlider, preRetirementReturnSlider,
        postRetirementReturnSlider, existingSavingsSlider
    ];
    
    allSliders.forEach(slider => {
        slider.addEventListener('input', calculateAndUpdatePensionResults);
    });
}

function calculateAndUpdatePensionResults() {
    const currentExpenses = parseFloat(currentExpensesInput.value) || 0;
    const currentAge = parseInt(currentAgeInput.value) || 25;
    const retirementAge = parseInt(retirementAgeInput.value) || 60;
    const lifeExpectancy = parseInt(lifeExpectancyInput.value) || 85;
    const retirementExpenseRatio = parseFloat(retirementExpenseRatioInput.value) || 100;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const preRetirementReturn = parseFloat(preRetirementReturnInput.value) || 8;
    const postRetirementReturn = parseFloat(postRetirementReturnInput.value) || 6;
    const existingSavings = parseFloat(existingSavingsInput.value) || 0;

    // Validation
    if (currentAge >= retirementAge) {
        showPensionError('Current age must be less than retirement age');
        return;
    }

    if (retirementAge >= lifeExpectancy) {
        showPensionError('Retirement age must be less than life expectancy');
        return;
    }

    if (currentExpenses <= 0) {
        showPensionError('Current monthly expenses must be greater than 0');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-pension-requirements', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_expenses: currentExpenses,
            current_age: currentAge,
            retirement_age: retirementAge,
            life_expectancy: lifeExpectancy,
            retirement_expense_ratio: retirementExpenseRatio,
            inflation_rate: inflationRate,
            pre_retirement_return: preRetirementReturn,
            post_retirement_return: postRetirementReturn,
            existing_savings: existingSavings
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showPensionError(result.error);
            return;
        }
        
        // Update display
        updatePensionResultsDisplay(result);
        updatePensionChart(result);
        updatePensionTable(result);
        clearPensionError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculatePensionRequirementsClientSide(
            currentExpenses, currentAge, retirementAge, lifeExpectancy,
            retirementExpenseRatio, inflationRate, preRetirementReturn,
            postRetirementReturn, existingSavings
        );
        updatePensionResultsDisplay(result);
        updatePensionChart(result);
        updatePensionTable(result);
    });
}

function calculatePensionRequirementsClientSide(currentExpenses, currentAge, retirementAge, lifeExpectancy,
                                                retirementExpenseRatio, inflationRate, preRetirementReturn,
                                                postRetirementReturn, existingSavings) {
    // Client-side pension calculation as fallback
    const yearsToRetirement = retirementAge - currentAge;
    const retirementYears = lifeExpectancy - retirementAge;
    
    // Convert percentages to decimals
    const inflationRateDecimal = inflationRate / 100;
    const preRetirementReturnDecimal = preRetirementReturn / 100;
    const postRetirementReturnDecimal = postRetirementReturn / 100;
    const retirementExpenseRatioDecimal = retirementExpenseRatio / 100;
    
    // Calculate inflated monthly expenses at retirement
    const inflatedMonthlyExpenses = currentExpenses * Math.pow(1 + inflationRateDecimal, yearsToRetirement) * retirementExpenseRatioDecimal;
    
    // Calculate annual expenses at retirement
    const inflatedAnnualExpenses = inflatedMonthlyExpenses * 12;
    
    // Calculate retirement corpus needed using present value of annuity formula
    const realPostRetirementReturn = (1 + postRetirementReturnDecimal) / (1 + inflationRateDecimal) - 1;
    
    let retirementCorpusNeeded;
    if (realPostRetirementReturn <= 0) {
        retirementCorpusNeeded = inflatedAnnualExpenses * retirementYears;
    } else {
        const pvFactor = (1 - Math.pow(1 + realPostRetirementReturn, -retirementYears)) / realPostRetirementReturn;
        retirementCorpusNeeded = inflatedAnnualExpenses * pvFactor;
    }
    
    // Adjust corpus for existing savings growth
    const existingSavingsFutureValue = existingSavings * Math.pow(1 + preRetirementReturnDecimal, yearsToRetirement);
    const netCorpusNeeded = Math.max(0, retirementCorpusNeeded - existingSavingsFutureValue);
    
    // Calculate monthly savings required using future value of annuity formula
    let monthlySavingsRequired = 0;
    let annualSavingsRequired = 0;
    
    if (netCorpusNeeded > 0) {
        const monthlyReturn = preRetirementReturnDecimal / 12;
        const totalMonths = yearsToRetirement * 12;
        
        if (monthlyReturn <= 0) {
            monthlySavingsRequired = netCorpusNeeded / totalMonths;
        } else {
            const fvFactor = (Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn;
            monthlySavingsRequired = netCorpusNeeded / fvFactor;
        }
        
        annualSavingsRequired = monthlySavingsRequired * 12;
    }
    
    // Create year-wise breakdown for first 10 years
    const yearWiseData = [];
    let cumulativeSavings = existingSavings;
    
    for (let year = 1; year <= Math.min(yearsToRetirement, 10); year++) {
        const annualInvestment = annualSavingsRequired;
        const openingBalance = cumulativeSavings;
        const growth = openingBalance * preRetirementReturnDecimal;
        const closingBalance = openingBalance + annualInvestment + growth;
        
        yearWiseData.push({
            year: year,
            age: currentAge + year,
            annual_investment: Math.round(annualInvestment),
            opening_balance: Math.round(openingBalance),
            growth: Math.round(growth),
            closing_balance: Math.round(closingBalance),
            cumulative_investment: Math.round(annualInvestment * year + existingSavings)
        });
        
        cumulativeSavings = closingBalance;
    }
    
    // Summary calculation
    const totalInvestmentNeeded = annualSavingsRequired * yearsToRetirement;
    const summaryStatement = `To sustain ₹${formatCurrencySimple(inflatedMonthlyExpenses)}/month in retirement, you'll need a corpus of ₹${formatCurrencySimple(retirementCorpusNeeded)} and must save ₹${formatCurrencySimple(monthlySavingsRequired)}/month.`;
    
    return {
        current_expenses: Math.round(currentExpenses),
        current_age: currentAge,
        retirement_age: retirementAge,
        life_expectancy: lifeExpectancy,
        years_to_retirement: yearsToRetirement,
        retirement_years: retirementYears,
        inflated_monthly_expenses: Math.round(inflatedMonthlyExpenses),
        inflated_annual_expenses: Math.round(inflatedAnnualExpenses),
        retirement_corpus_needed: Math.round(retirementCorpusNeeded),
        existing_savings_future_value: Math.round(existingSavingsFutureValue),
        net_corpus_needed: Math.round(netCorpusNeeded),
        monthly_savings_required: Math.round(monthlySavingsRequired),
        annual_savings_required: Math.round(annualSavingsRequired),
        total_investment_needed: Math.round(totalInvestmentNeeded),
        summary_statement: summaryStatement,
        year_wise_data: yearWiseData,
        retirement_expense_ratio: retirementExpenseRatio,
        inflation_rate: inflationRate,
        pre_retirement_return: preRetirementReturn,
        post_retirement_return: postRetirementReturn
    };
}

function updatePensionResultsDisplay(result) {
    document.getElementById('corpusNeededResult').textContent = formatPensionCurrency(result.retirement_corpus_needed);
    document.getElementById('monthlySavingsResult').textContent = formatPensionCurrency(result.monthly_savings_required);
    document.getElementById('annualSavingsResult').textContent = formatPensionCurrency(result.annual_savings_required);
    document.getElementById('summaryResult').textContent = result.summary_statement;
    
    // Update chart summary
    document.getElementById('corpusNeededDisplay').textContent = formatPensionCurrency(result.retirement_corpus_needed);
    document.getElementById('totalSavingsDisplay').textContent = formatPensionCurrency(result.total_investment_needed);
}

function updatePensionChart(result) {
    const ctx = document.getElementById('pensionChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (pensionChart) {
        pensionChart.destroy();
    }
    
    const data = {
        labels: ['Retirement Corpus Needed', 'Total Savings Required'],
        datasets: [{
            data: [
                result.retirement_corpus_needed,
                result.total_investment_needed
            ],
            backgroundColor: [
                '#e74c3c',
                '#27ae60'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    pensionChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                pensionCenterText: {
                    display: true,
                    text: formatPensionCurrency(result.retirement_corpus_needed)
                }
            },
            cutout: '60%'
        }
    });
}

function updatePensionTable(result) {
    if (result.year_wise_data) {
        updatePensionYearlyTable(result.year_wise_data);
    }
}

function updatePensionYearlyTable(yearlyData) {
    const tableBody = document.getElementById('pensionYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${data.age}</td>
            <td>${formatPensionCurrency(data.annual_investment)}</td>
            <td>${formatPensionCurrency(data.opening_balance)}</td>
            <td>${formatPensionCurrency(data.growth)}</td>
            <td>${formatPensionCurrency(data.closing_balance)}</td>
            <td>${formatPensionCurrency(data.cumulative_investment)}</td>
        `;
    });
}

function formatPensionCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function formatCurrencySimple(amount) {
    if (amount >= 10000000) {  // 1 crore
        return `${(amount/10000000).toFixed(1)}Cr`;
    } else if (amount >= 100000) {  // 1 lakh
        return `${(amount/100000).toFixed(1)}L`;
    } else if (amount >= 1000) {  // 1 thousand
        return `${(amount/1000).toFixed(0)}K`;
    } else {
        return `${amount.toFixed(0)}`;
    }
}

function showPensionError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('pensionErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'pensionErrorMessage';
        errorDiv.className = 'error-message';
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearPensionError() {
    const errorDiv = document.getElementById('pensionErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupPensionMegaMenu() {
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

function setupPensionTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('pensionTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function togglePensionTable() {
    const tableSection = document.getElementById('pensionTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadPensionPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Pension Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const currentExpenses = parseFloat(currentExpensesInput.value) || 0;
    const currentAge = parseInt(currentAgeInput.value) || 25;
    const retirementAge = parseInt(retirementAgeInput.value) || 60;
    const lifeExpectancy = parseInt(lifeExpectancyInput.value) || 85;
    const retirementExpenseRatio = parseFloat(retirementExpenseRatioInput.value) || 100;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const preRetirementReturn = parseFloat(preRetirementReturnInput.value) || 8;
    const postRetirementReturn = parseFloat(postRetirementReturnInput.value) || 6;
    const existingSavings = parseFloat(existingSavingsInput.value) || 0;
    
    doc.text(`Current Monthly Expenses: ${formatPensionCurrency(currentExpenses)}`, 20, 40);
    doc.text(`Current Age: ${currentAge} years`, 20, 50);
    doc.text(`Retirement Age: ${retirementAge} years`, 20, 60);
    doc.text(`Life Expectancy: ${lifeExpectancy} years`, 20, 70);
    doc.text(`Retirement Expense Ratio: ${retirementExpenseRatio}%`, 20, 80);
    doc.text(`Inflation Rate: ${inflationRate}%`, 20, 90);
    doc.text(`Pre-Retirement Return: ${preRetirementReturn}%`, 20, 100);
    doc.text(`Post-Retirement Return: ${postRetirementReturn}%`, 20, 110);
    doc.text(`Existing Savings: ${formatPensionCurrency(existingSavings)}`, 20, 120);
    
    // Add results
    const result = calculatePensionRequirementsClientSide(
        currentExpenses, currentAge, retirementAge, lifeExpectancy,
        retirementExpenseRatio, inflationRate, preRetirementReturn,
        postRetirementReturn, existingSavings
    );
    
    doc.text(`Retirement Corpus Needed: ${formatPensionCurrency(result.retirement_corpus_needed)}`, 20, 150);
    doc.text(`Monthly Savings Required: ${formatPensionCurrency(result.monthly_savings_required)}`, 20, 160);
    doc.text(`Annual Savings Required: ${formatPensionCurrency(result.annual_savings_required)}`, 20, 170);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary:', 20, 190);
    doc.setFontSize(10);
    
    // Split summary text into multiple lines if needed
    const summaryText = result.summary_statement;
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, 200);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Breakdown:', 20, 230);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 240;
    doc.text('Year', 20, yPos);
    doc.text('Age', 35, yPos);
    doc.text('Investment', 50, yPos);
    doc.text('Opening Bal', 80, yPos);
    doc.text('Growth', 115, yPos);
    doc.text('Closing Bal', 140, yPos);
    doc.text('Cumulative', 170, yPos);
    
    yPos += 10;
    
    // Add table data (first 8 years to fit on page)
    result.year_wise_data.slice(0, 8).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(data.age.toString(), 35, yPos);
        doc.text(formatCurrencySimple(data.annual_investment), 50, yPos);
        doc.text(formatCurrencySimple(data.opening_balance), 80, yPos);
        doc.text(formatCurrencySimple(data.growth), 115, yPos);
        doc.text(formatCurrencySimple(data.closing_balance), 140, yPos);
        doc.text(formatCurrencySimple(data.cumulative_investment), 170, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('pension-calculator-report.pdf');
}

// Scenario management functions
function saveScenario() {
    const scenario = {
        name: `Scenario ${Date.now()}`,
        timestamp: new Date().toISOString(),
        inputs: {
            currentExpenses: currentExpensesInput.value,
            currentAge: currentAgeInput.value,
            retirementAge: retirementAgeInput.value,
            lifeExpectancy: lifeExpectancyInput.value,
            retirementExpenseRatio: retirementExpenseRatioInput.value,
            inflationRate: inflationRateInput.value,
            preRetirementReturn: preRetirementReturnInput.value,
            postRetirementReturn: postRetirementReturnInput.value,
            existingSavings: existingSavingsInput.value
        }
    };
    
    let scenarios = JSON.parse(localStorage.getItem('pensionCalculatorScenarios') || '[]');
    scenarios.push(scenario);
    localStorage.setItem('pensionCalculatorScenarios', JSON.stringify(scenarios));
    
    alert('Scenario saved successfully!');
}

function loadScenario(index) {
    const scenarios = JSON.parse(localStorage.getItem('pensionCalculatorScenarios') || '[]');
    if (scenarios[index]) {
        const scenario = scenarios[index];
        
        // Load all input values
        currentExpensesInput.value = scenario.inputs.currentExpenses;
        currentAgeInput.value = scenario.inputs.currentAge;
        retirementAgeInput.value = scenario.inputs.retirementAge;
        lifeExpectancyInput.value = scenario.inputs.lifeExpectancy;
        retirementExpenseRatioInput.value = scenario.inputs.retirementExpenseRatio;
        inflationRateInput.value = scenario.inputs.inflationRate;
        preRetirementReturnInput.value = scenario.inputs.preRetirementReturn;
        postRetirementReturnInput.value = scenario.inputs.postRetirementReturn;
        existingSavingsInput.value = scenario.inputs.existingSavings;
        
        // Sync sliders
        initialSyncPensionValues();
        
        // Recalculate
        calculateAndUpdatePensionResults();
    }
}

function getScenarios() {
    return JSON.parse(localStorage.getItem('pensionCalculatorScenarios') || '[]');
}

function clearScenarios() {
    localStorage.removeItem('pensionCalculatorScenarios');
    alert('All scenarios cleared!');
}

// Growth chart visualization function
function createGrowthChart() {
    const result = calculatePensionRequirementsClientSide(
        parseFloat(currentExpensesInput.value) || 0,
        parseInt(currentAgeInput.value) || 25,
        parseInt(retirementAgeInput.value) || 60,
        parseInt(lifeExpectancyInput.value) || 85,
        parseFloat(retirementExpenseRatioInput.value) || 100,
        parseFloat(inflationRateInput.value) || 6,
        parseFloat(preRetirementReturnInput.value) || 8,
        parseFloat(postRetirementReturnInput.value) || 6,
        parseFloat(existingSavingsInput.value) || 0
    );
    
    // This would create a line chart showing savings growth over time
    // Implementation would go here if we want to add this feature
    console.log('Growth chart data:', result.year_wise_data);
}
