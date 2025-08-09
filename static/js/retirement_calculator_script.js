// Retirement Calculator Script

let retirementChart = null;

// Input elements
const currentAgeInput = document.getElementById('currentAge');
const currentAgeSlider = document.getElementById('currentAgeSlider');
const retirementAgeInput = document.getElementById('retirementAge');
const retirementAgeSlider = document.getElementById('retirementAgeSlider');
const lifeExpectancyInput = document.getElementById('lifeExpectancy');
const lifeExpectancySlider = document.getElementById('lifeExpectancySlider');
const monthlyIncomeDesiredInput = document.getElementById('monthlyIncomeDesired');
const monthlyIncomeDesiredSlider = document.getElementById('monthlyIncomeDesiredSlider');
const inflationRateInput = document.getElementById('inflationRate');
const inflationRateSlider = document.getElementById('inflationRateSlider');
const preRetirementReturnInput = document.getElementById('preRetirementReturn');
const preRetirementReturnSlider = document.getElementById('preRetirementReturnSlider');
const postRetirementReturnInput = document.getElementById('postRetirementReturn');
const postRetirementReturnSlider = document.getElementById('postRetirementReturnSlider');
const currentSavingsInput = document.getElementById('currentSavings');
const currentSavingsSlider = document.getElementById('currentSavingsSlider');

// Custom Chart.js plugin to display corpus amount in center
const retirementCenterTextPlugin = {
    id: 'retirementCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.retirementCenterText && chart.config.options.plugins.retirementCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Required Corpus
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.retirementCenterText.text, centerX, centerY - 10);
            
            // Draw "Required Corpus" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Required Corpus', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(retirementCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupRetirementSliders();
    addRetirementEventListeners();
    initialSyncRetirementValues();
    calculateAndUpdateRetirementResults();
    setupRetirementMegaMenu();
    setupTooltips();
    loadSavedScenarios();
});

function setupRetirementSliders() {
    syncRetirementInputs(currentAgeInput, currentAgeSlider);
    syncRetirementInputs(retirementAgeInput, retirementAgeSlider);
    syncRetirementInputs(lifeExpectancyInput, lifeExpectancySlider);
    syncRetirementInputs(monthlyIncomeDesiredInput, monthlyIncomeDesiredSlider);
    syncRetirementInputs(inflationRateInput, inflationRateSlider);
    syncRetirementInputs(preRetirementReturnInput, preRetirementReturnSlider);
    syncRetirementInputs(postRetirementReturnInput, postRetirementReturnSlider);
    syncRetirementInputs(currentSavingsInput, currentSavingsSlider);
}

function initialSyncRetirementValues() {
    // Ensure initial values are properly synchronized
    currentAgeSlider.value = currentAgeInput.value;
    retirementAgeSlider.value = retirementAgeInput.value;
    lifeExpectancySlider.value = lifeExpectancyInput.value;
    monthlyIncomeDesiredSlider.value = monthlyIncomeDesiredInput.value;
    inflationRateSlider.value = inflationRateInput.value;
    preRetirementReturnSlider.value = preRetirementReturnInput.value;
    postRetirementReturnSlider.value = postRetirementReturnInput.value;
    currentSavingsSlider.value = currentSavingsInput.value;
}

function syncRetirementInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateRetirementResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateRetirementResults();
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
        calculateAndUpdateRetirementResults();
    });
}

function addRetirementEventListeners() {
    // Add change listeners for all inputs
    const allInputs = [
        currentAgeInput, retirementAgeInput, lifeExpectancyInput, monthlyIncomeDesiredInput,
        inflationRateInput, preRetirementReturnInput, postRetirementReturnInput, currentSavingsInput
    ];
    
    allInputs.forEach(input => {
        input.addEventListener('change', calculateAndUpdateRetirementResults);
        input.addEventListener('keyup', calculateAndUpdateRetirementResults);
    });

    // Add input listeners for sliders
    const allSliders = [
        currentAgeSlider, retirementAgeSlider, lifeExpectancySlider, monthlyIncomeDesiredSlider,
        inflationRateSlider, preRetirementReturnSlider, postRetirementReturnSlider, currentSavingsSlider
    ];
    
    allSliders.forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateRetirementResults);
    });
}

function calculateAndUpdateRetirementResults() {
    const currentAge = parseInt(currentAgeInput.value) || 30;
    const retirementAge = parseInt(retirementAgeInput.value) || 60;
    const lifeExpectancy = parseInt(lifeExpectancyInput.value) || 80;
    const monthlyIncomeDesired = parseFloat(monthlyIncomeDesiredInput.value) || 50000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const preRetirementReturn = parseFloat(preRetirementReturnInput.value) || 8;
    const postRetirementReturn = parseFloat(postRetirementReturnInput.value) || 6;
    const currentSavings = parseFloat(currentSavingsInput.value) || 100000;

    // Validate inputs
    if (currentAge <= 0 || retirementAge <= currentAge || lifeExpectancy <= retirementAge) {
        showRetirementError('Please check your age inputs. Retirement age must be greater than current age, and life expectancy must be greater than retirement age.');
        return;
    }

    if (monthlyIncomeDesired <= 0 || inflationRate < 0 || preRetirementReturn <= 0 || postRetirementReturn <= 0) {
        showRetirementError('Please check your financial inputs. All values must be positive.');
        return;
    }

    if (currentSavings < 0) {
        showRetirementError('Current savings cannot be negative.');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-retirement', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_age: currentAge,
            retirement_age: retirementAge,
            life_expectancy: lifeExpectancy,
            monthly_income_desired: monthlyIncomeDesired,
            inflation_rate: inflationRate,
            pre_retirement_return: preRetirementReturn,
            post_retirement_return: postRetirementReturn,
            current_savings: currentSavings
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showRetirementError(result.error);
            return;
        }
        
        // Update display
        updateRetirementResultsDisplay(result);
        updateRetirementChart(result);
        updateRetirementSummary(result);
        clearRetirementError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateRetirementClientSide(
            currentAge, retirementAge, lifeExpectancy, monthlyIncomeDesired,
            inflationRate, preRetirementReturn, postRetirementReturn, currentSavings
        );
        updateRetirementResultsDisplay(result);
        updateRetirementChart(result);
        updateRetirementSummary(result);
    });
}

function calculateRetirementClientSide(currentAge, retirementAge, lifeExpectancy, monthlyIncomeDesired, inflationRate, preRetirementReturn, postRetirementReturn, currentSavings) {
    // Client-side retirement calculation as fallback
    const yearsToRetirement = retirementAge - currentAge;
    const yearsInRetirement = lifeExpectancy - retirementAge;
    
    // Convert percentages to decimals
    const inflationDecimal = inflationRate / 100;
    const preRetirementDecimal = preRetirementReturn / 100;
    const postRetirementDecimal = postRetirementReturn / 100;
    
    // Calculate inflated monthly income needed at retirement
    const inflatedMonthlyIncome = monthlyIncomeDesired * Math.pow(1 + inflationDecimal, yearsToRetirement);
    const annualRetirementIncome = inflatedMonthlyIncome * 12;
    
    // Calculate corpus needed at retirement using annuity formula
    let corpusNeeded;
    if (postRetirementDecimal > 0) {
        corpusNeeded = annualRetirementIncome * ((1 - Math.pow(1 + postRetirementDecimal, -yearsInRetirement)) / postRetirementDecimal);
    } else {
        corpusNeeded = annualRetirementIncome * yearsInRetirement;
    }
    
    // Calculate how much current savings will grow
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + preRetirementDecimal, yearsToRetirement);
    
    // Calculate additional corpus needed
    const additionalCorpusNeeded = Math.max(0, corpusNeeded - futureValueCurrentSavings);
    
    // Calculate monthly savings required
    let monthlySavingsNeeded = 0;
    if (additionalCorpusNeeded > 0 && preRetirementDecimal > 0) {
        const monthlyPreRetirementReturn = preRetirementDecimal / 12;
        const totalMonths = yearsToRetirement * 12;
        
        if (monthlyPreRetirementReturn > 0) {
            monthlySavingsNeeded = additionalCorpusNeeded / ((Math.pow(1 + monthlyPreRetirementReturn, totalMonths) - 1) / monthlyPreRetirementReturn);
        } else {
            monthlySavingsNeeded = additionalCorpusNeeded / totalMonths;
        }
    }
    
    return {
        required_retirement_corpus: Math.round(corpusNeeded),
        monthly_savings_required: Math.round(monthlySavingsNeeded),
        annual_retirement_income_needed: Math.round(annualRetirementIncome),
        inflated_monthly_income: Math.round(inflatedMonthlyIncome),
        years_to_retirement: yearsToRetirement,
        years_in_retirement: yearsInRetirement,
        future_value_current_savings: Math.round(futureValueCurrentSavings),
        additional_corpus_needed: Math.round(additionalCorpusNeeded),
        current_age: currentAge,
        retirement_age: retirementAge,
        life_expectancy: lifeExpectancy,
        monthly_income_desired: monthlyIncomeDesired,
        inflation_rate: inflationRate,
        pre_retirement_return: preRetirementReturn,
        post_retirement_return: postRetirementReturn,
        current_savings: currentSavings
    };
}

function updateRetirementResultsDisplay(result) {
    document.getElementById('requiredCorpusResult').textContent = formatRetirementCurrency(result.required_retirement_corpus);
    document.getElementById('monthlySavingsResult').textContent = formatRetirementCurrency(result.monthly_savings_required);
    document.getElementById('annualIncomeResult').textContent = formatRetirementCurrency(result.annual_retirement_income_needed);
    
    // Update chart summary
    document.getElementById('currentSavingsDisplay').textContent = formatRetirementCurrency(result.future_value_current_savings);
    document.getElementById('additionalNeededDisplay').textContent = formatRetirementCurrency(result.additional_corpus_needed);
}

function updateRetirementChart(result) {
    const ctx = document.getElementById('retirementChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (retirementChart) {
        retirementChart.destroy();
    }
    
    const data = {
        labels: ['Current Savings Growth', 'Additional Corpus Needed'],
        datasets: [{
            data: [
                result.future_value_current_savings,
                result.additional_corpus_needed
            ],
            backgroundColor: [
                '#10b981',
                '#f59e0b'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    retirementChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                retirementCenterText: {
                    display: true,
                    text: formatRetirementCurrency(result.required_retirement_corpus)
                }
            },
            cutout: '60%'
        }
    });
}

function updateRetirementSummary(result) {
    const summaryText = `To have ${formatRetirementCurrency(result.monthly_income_desired)}/month at retirement, you need a corpus of ${formatRetirementCurrency(result.required_retirement_corpus)} and must save ${formatRetirementCurrency(result.monthly_savings_required)}/month.`;
    document.getElementById('retirementSummary').textContent = summaryText;
}

function formatRetirementCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showRetirementError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('retirementErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'retirementErrorMessage';
        errorDiv.className = 'error-message';
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
}

function clearRetirementError() {
    const errorDiv = document.getElementById('retirementErrorMessage');
    if (errorDiv) {
        errorDiv.classList.remove('show');
    }
}

function setupRetirementMegaMenu() {
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

function setupTooltips() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    const tooltip = document.getElementById('tooltip');
    
    tooltipIcons.forEach(icon => {
        icon.addEventListener('mouseenter', function(e) {
            const tooltipText = this.getAttribute('data-tooltip');
            if (tooltipText) {
                tooltip.textContent = tooltipText;
                tooltip.classList.add('show');
                
                // Position tooltip
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + 'px';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 10) + 'px';
            }
        });
        
        icon.addEventListener('mouseleave', function() {
            tooltip.classList.remove('show');
        });
    });
}

function downloadRetirementPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Retirement Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const currentAge = parseInt(currentAgeInput.value) || 30;
    const retirementAge = parseInt(retirementAgeInput.value) || 60;
    const lifeExpectancy = parseInt(lifeExpectancyInput.value) || 80;
    const monthlyIncomeDesired = parseFloat(monthlyIncomeDesiredInput.value) || 50000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6;
    const preRetirementReturn = parseFloat(preRetirementReturnInput.value) || 8;
    const postRetirementReturn = parseFloat(postRetirementReturnInput.value) || 6;
    const currentSavings = parseFloat(currentSavingsInput.value) || 100000;
    
    doc.text(`Current Age: ${currentAge} years`, 20, 40);
    doc.text(`Retirement Age: ${retirementAge} years`, 20, 50);
    doc.text(`Life Expectancy: ${lifeExpectancy} years`, 20, 60);
    doc.text(`Monthly Income Desired: ${formatRetirementCurrency(monthlyIncomeDesired)}`, 20, 70);
    doc.text(`Expected Inflation Rate: ${inflationRate}%`, 20, 80);
    doc.text(`Pre-retirement Return: ${preRetirementReturn}%`, 20, 90);
    doc.text(`Post-retirement Return: ${postRetirementReturn}%`, 20, 100);
    doc.text(`Current Savings: ${formatRetirementCurrency(currentSavings)}`, 20, 110);
    
    // Add results
    const result = calculateRetirementClientSide(
        currentAge, retirementAge, lifeExpectancy, monthlyIncomeDesired,
        inflationRate, preRetirementReturn, postRetirementReturn, currentSavings
    );
    
    doc.setFontSize(14);
    doc.text('Retirement Planning Results:', 20, 140);
    
    doc.setFontSize(12);
    doc.text(`Required Retirement Corpus: ${formatRetirementCurrency(result.required_retirement_corpus)}`, 20, 160);
    doc.text(`Monthly Savings Required: ${formatRetirementCurrency(result.monthly_savings_required)}`, 20, 170);
    doc.text(`Annual Retirement Income: ${formatRetirementCurrency(result.annual_retirement_income_needed)}`, 20, 180);
    doc.text(`Years to Retirement: ${result.years_to_retirement}`, 20, 190);
    doc.text(`Years in Retirement: ${result.years_in_retirement}`, 20, 200);
    doc.text(`Future Value of Current Savings: ${formatRetirementCurrency(result.future_value_current_savings)}`, 20, 210);
    
    // Add summary
    doc.setFontSize(14);
    doc.text('Summary:', 20, 240);
    
    doc.setFontSize(10);
    const summaryText = `To have ${formatRetirementCurrency(monthlyIncomeDesired)}/month at retirement, you need a corpus of ${formatRetirementCurrency(result.required_retirement_corpus)} and must save ${formatRetirementCurrency(result.monthly_savings_required)}/month.`;
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, 255);
    
    // Save the PDF
    doc.save('retirement-calculator-report.pdf');
}

function saveRetirementScenario() {
    const scenario = {
        name: prompt('Enter scenario name:') || `Scenario ${Date.now()}`,
        timestamp: new Date().toISOString(),
        data: {
            current_age: currentAgeInput.value,
            retirement_age: retirementAgeInput.value,
            life_expectancy: lifeExpectancyInput.value,
            monthly_income_desired: monthlyIncomeDesiredInput.value,
            inflation_rate: inflationRateInput.value,
            pre_retirement_return: preRetirementReturnInput.value,
            post_retirement_return: postRetirementReturnInput.value,
            current_savings: currentSavingsInput.value
        }
    };
    
    // Get existing scenarios
    const savedScenarios = JSON.parse(localStorage.getItem('retirementScenarios') || '[]');
    
    // Add new scenario
    savedScenarios.push(scenario);
    
    // Keep only last 10 scenarios
    if (savedScenarios.length > 10) {
        savedScenarios.shift();
    }
    
    // Save to localStorage
    localStorage.setItem('retirementScenarios', JSON.stringify(savedScenarios));
    
    alert('Scenario saved successfully!');
}

function loadRetirementScenario() {
    const savedScenarios = JSON.parse(localStorage.getItem('retirementScenarios') || '[]');
    
    if (savedScenarios.length === 0) {
        alert('No saved scenarios found.');
        return;
    }
    
    // Create selection dialog
    let scenarioList = 'Select a scenario to load:\n\n';
    savedScenarios.forEach((scenario, index) => {
        scenarioList += `${index + 1}. ${scenario.name} (${new Date(scenario.timestamp).toLocaleDateString()})\n`;
    });
    
    const selection = prompt(scenarioList + '\nEnter the number of the scenario to load:');
    const index = parseInt(selection) - 1;
    
    if (index >= 0 && index < savedScenarios.length) {
        const scenario = savedScenarios[index];
        
        // Load data into inputs
        currentAgeInput.value = scenario.data.current_age;
        retirementAgeInput.value = scenario.data.retirement_age;
        lifeExpectancyInput.value = scenario.data.life_expectancy;
        monthlyIncomeDesiredInput.value = scenario.data.monthly_income_desired;
        inflationRateInput.value = scenario.data.inflation_rate;
        preRetirementReturnInput.value = scenario.data.pre_retirement_return;
        postRetirementReturnInput.value = scenario.data.post_retirement_return;
        currentSavingsInput.value = scenario.data.current_savings;
        
        // Sync sliders
        initialSyncRetirementValues();
        
        // Recalculate results
        calculateAndUpdateRetirementResults();
        
        alert('Scenario loaded successfully!');
    } else {
        alert('Invalid selection.');
    }
}

function loadSavedScenarios() {
    // Initialize localStorage with demo scenario if empty
    const savedScenarios = JSON.parse(localStorage.getItem('retirementScenarios') || '[]');
    
    if (savedScenarios.length === 0) {
        const demoScenario = {
            name: 'Conservative Plan',
            timestamp: new Date().toISOString(),
            data: {
                current_age: 25,
                retirement_age: 60,
                life_expectancy: 80,
                monthly_income_desired: 40000,
                inflation_rate: 6,
                pre_retirement_return: 8,
                post_retirement_return: 6,
                current_savings: 50000
            }
        };
        
        localStorage.setItem('retirementScenarios', JSON.stringify([demoScenario]));
    }
}

// Utility functions for validation
function validateAgeInputs() {
    const currentAge = parseInt(currentAgeInput.value);
    const retirementAge = parseInt(retirementAgeInput.value);
    const lifeExpectancy = parseInt(lifeExpectancyInput.value);
    
    if (retirementAge <= currentAge) {
        retirementAgeInput.value = currentAge + 10;
        retirementAgeSlider.value = currentAge + 10;
    }
    
    if (lifeExpectancy <= retirementAge) {
        lifeExpectancyInput.value = retirementAge + 10;
        lifeExpectancySlider.value = retirementAge + 10;
    }
}

// Add age validation listeners
currentAgeInput.addEventListener('change', validateAgeInputs);
retirementAgeInput.addEventListener('change', validateAgeInputs);
lifeExpectancyInput.addEventListener('change', validateAgeInputs);
