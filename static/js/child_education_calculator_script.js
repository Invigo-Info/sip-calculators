// Child Education Calculator Script

let educationChart = null;

// Input elements
const currentAgeInput = document.getElementById('currentAge');
const currentAgeSlider = document.getElementById('currentAgeSlider');
const collegeAgeInput = document.getElementById('collegeAge');
const collegeAgeSlider = document.getElementById('collegeAgeSlider');
const currentCostInput = document.getElementById('currentCost');
const currentCostSlider = document.getElementById('currentCostSlider');
const inflationRateInput = document.getElementById('inflationRate');
const inflationRateSlider = document.getElementById('inflationRateSlider');
const returnRateInput = document.getElementById('returnRate');
const returnRateSlider = document.getElementById('returnRateSlider');
const currentSavingsInput = document.getElementById('currentSavings');
const currentSavingsSlider = document.getElementById('currentSavingsSlider');

// Custom Chart.js plugin to display Future Cost in center
const educationCenterTextPlugin = {
    id: 'educationCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.educationCenterText && chart.config.options.plugins.educationCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Future Cost
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.educationCenterText.text, centerX, centerY - 8);
            
            // Draw "Future Cost" label
            ctx.font = '13px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Future Cost', centerX, centerY + 12);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(educationCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEducationSliders();
    addEducationEventListeners();
    initialSyncEducationValues();
    calculateAndUpdateEducationResults();
    setupEducationMegaMenu();
    setupEducationTableToggle();
});

function setupEducationSliders() {
    syncEducationInputs(currentAgeInput, currentAgeSlider);
    syncEducationInputs(collegeAgeInput, collegeAgeSlider);
    syncEducationInputs(currentCostInput, currentCostSlider);
    syncEducationInputs(inflationRateInput, inflationRateSlider);
    syncEducationInputs(returnRateInput, returnRateSlider);
    syncEducationInputs(currentSavingsInput, currentSavingsSlider);
}

function initialSyncEducationValues() {
    // Ensure initial values are properly synchronized
    currentAgeSlider.value = currentAgeInput.value;
    collegeAgeSlider.value = collegeAgeInput.value;
    currentCostSlider.value = currentCostInput.value;
    inflationRateSlider.value = inflationRateInput.value;
    returnRateSlider.value = returnRateInput.value;
    currentSavingsSlider.value = currentSavingsInput.value;
}

function syncEducationInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateEducationResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateEducationResults();
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
        calculateAndUpdateEducationResults();
    });
}

function addEducationEventListeners() {
    // Add change listeners for all inputs
    [currentAgeInput, collegeAgeInput, currentCostInput, inflationRateInput, returnRateInput, currentSavingsInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateEducationResults);
        input.addEventListener('keyup', calculateAndUpdateEducationResults);
    });

    // Add input listeners for sliders
    [currentAgeSlider, collegeAgeSlider, currentCostSlider, inflationRateSlider, returnRateSlider, currentSavingsSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateEducationResults);
    });
}

function calculateAndUpdateEducationResults() {
    const currentAge = parseInt(currentAgeInput.value) || 5;
    const collegeAge = parseInt(collegeAgeInput.value) || 18;
    const currentCost = parseFloat(currentCostInput.value) || 500000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6.0;
    const returnRate = parseFloat(returnRateInput.value) || 12.0;
    const currentSavings = parseFloat(currentSavingsInput.value) || 0;

    // Validate inputs
    if (collegeAge <= currentAge) {
        showEducationError('College start age must be greater than current age');
        return;
    }

    if (currentAge < 1 || currentAge > 17) {
        showEducationError('Child\'s current age must be between 1 and 17 years');
        return;
    }

    if (collegeAge < 16 || collegeAge > 25) {
        showEducationError('College start age must be between 16 and 25 years');
        return;
    }

    if (currentCost < 100000 || currentCost > 5000000) {
        showEducationError('Current education cost must be between ₹1L and ₹50L');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-child-education/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            current_age: currentAge,
            college_age: collegeAge,
            current_cost: currentCost,
            inflation_rate: inflationRate,
            return_rate: returnRate,
            current_savings: currentSavings
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showEducationError(result.error);
            return;
        }
        
        // Update display
        updateEducationResultsDisplay(result);
        updateEducationChart(result);
        updateEducationTable(result);
        clearEducationError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateEducationClientSide(currentAge, collegeAge, currentCost, inflationRate, returnRate, currentSavings);
        updateEducationResultsDisplay(result);
        updateEducationChart(result);
        updateEducationTable(result);
    });
}

function calculateEducationClientSide(currentAge, collegeAge, currentCost, inflationRate, returnRate, currentSavings) {
    // Client-side education calculation as fallback
    const yearsToCollege = collegeAge - currentAge;
    
    // Calculate future cost with inflation
    const futureCost = currentCost * Math.pow((1 + inflationRate / 100), yearsToCollege);
    
    // Calculate net amount needed after current savings
    const netAmountNeeded = Math.max(0, futureCost - currentSavings);
    
    // Calculate monthly SIP required
    const monthlyRate = returnRate / 12 / 100;
    const numMonths = yearsToCollege * 12;
    
    let monthlySip;
    if (monthlyRate > 0) {
        // PMT formula for monthly SIP
        monthlySip = netAmountNeeded * monthlyRate / (Math.pow(1 + monthlyRate, numMonths) - 1);
    } else {
        monthlySip = netAmountNeeded / numMonths;
    }
    
    // Calculate total investment required
    const totalInvestment = monthlySip * numMonths + currentSavings;
    
    return {
        current_age: currentAge,
        college_age: collegeAge,
        years_to_college: yearsToCollege,
        current_cost: currentCost,
        future_cost: Math.round(futureCost),
        current_savings: currentSavings,
        net_amount_needed: Math.round(netAmountNeeded),
        monthly_sip_required: Math.round(monthlySip),
        total_investment: Math.round(totalInvestment),
        inflation_rate: inflationRate,
        return_rate: returnRate
    };
}

function updateEducationResultsDisplay(result) {
    document.getElementById('futureCostResult').textContent = formatEducationCurrency(result.future_cost);
    document.getElementById('monthlySipResult').textContent = formatEducationCurrency(result.monthly_sip_required);
    document.getElementById('totalInvestmentResult').textContent = formatEducationCurrency(result.total_investment);
    document.getElementById('yearsRemainingResult').textContent = result.years_to_college + ' Years';
    
    // Update chart summary
    document.getElementById('currentCostDisplay').textContent = formatEducationCurrency(result.current_cost);
    const inflationImpact = result.future_cost - result.current_cost;
    document.getElementById('inflationImpactDisplay').textContent = formatEducationCurrency(inflationImpact);
    document.getElementById('currentSavingsDisplay').textContent = formatEducationCurrency(result.current_savings);
    
    // Update summary statement
    const summaryText = `To afford <strong>${formatEducationCurrency(result.future_cost)}</strong> by then, save <strong>${formatEducationCurrency(result.monthly_sip_required)}/month</strong> for the next <strong>${result.years_to_college} years</strong>.`;
    document.getElementById('summaryStatement').innerHTML = summaryText;
}

function updateEducationChart(result) {
    const ctx = document.getElementById('educationChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (educationChart) {
        educationChart.destroy();
    }
    
    const inflationImpact = result.future_cost - result.current_cost;
    
    const data = {
        labels: ['Current Cost', 'Inflation Impact', 'Current Savings'],
        datasets: [{
            data: [
                result.current_cost,
                inflationImpact,
                result.current_savings
            ],
            backgroundColor: [
                '#3498db',
                '#e74c3c',
                '#27ae60'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    educationChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                educationCenterText: {
                    display: true,
                    text: formatEducationCurrency(result.future_cost)
                }
            },
            cutout: '60%'
        }
    });
}

function updateEducationTable(result) {
    // Generate year-wise projection
    const yearlyData = generateEducationYearlyData(result);
    updateEducationYearlyTable(yearlyData);
}

function generateEducationYearlyData(result) {
    const yearlyData = [];
    const monthlyInvestment = result.monthly_sip_required;
    const annualInvestment = monthlyInvestment * 12;
    const monthlyReturnRate = result.return_rate / 12 / 100;
    
    let cumulativeInvestment = result.current_savings;
    let portfolioValue = result.current_savings;
    
    for (let year = 1; year <= result.years_to_college; year++) {
        const childAge = result.current_age + year;
        
        // Add annual investment
        cumulativeInvestment += annualInvestment;
        
        // Calculate portfolio growth
        if (monthlyReturnRate > 0) {
            // Compound monthly with monthly SIP
            let yearEndValue = portfolioValue;
            for (let month = 1; month <= 12; month++) {
                yearEndValue = (yearEndValue + monthlyInvestment) * (1 + monthlyReturnRate);
            }
            portfolioValue = yearEndValue;
        } else {
            portfolioValue = cumulativeInvestment;
        }
        
        const growth = portfolioValue - cumulativeInvestment;
        
        yearlyData.push({
            year: year,
            child_age: childAge,
            annual_investment: Math.round(annualInvestment),
            cumulative_investment: Math.round(cumulativeInvestment),
            portfolio_value: Math.round(portfolioValue),
            growth: Math.round(growth)
        });
    }
    
    return yearlyData;
}

function updateEducationYearlyTable(yearlyData) {
    const tableBody = document.getElementById('educationYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${data.child_age}</td>
            <td>${formatEducationCurrency(data.annual_investment)}</td>
            <td>${formatEducationCurrency(data.cumulative_investment)}</td>
            <td>${formatEducationCurrency(data.portfolio_value)}</td>
            <td>${formatEducationCurrency(data.growth)}</td>
        `;
    });
}

function formatEducationCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showEducationError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('educationErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'educationErrorMessage';
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

function clearEducationError() {
    const errorDiv = document.getElementById('educationErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupEducationMegaMenu() {
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

function setupEducationTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('educationTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleEducationTable() {
    const tableSection = document.getElementById('educationTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadEducationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Child Education Planning Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const currentAge = parseInt(currentAgeInput.value) || 5;
    const collegeAge = parseInt(collegeAgeInput.value) || 18;
    const currentCost = parseFloat(currentCostInput.value) || 500000;
    const inflationRate = parseFloat(inflationRateInput.value) || 6.0;
    const returnRate = parseFloat(returnRateInput.value) || 12.0;
    const currentSavings = parseFloat(currentSavingsInput.value) || 0;
    
    doc.text(`Child's Current Age: ${currentAge} years`, 20, 40);
    doc.text(`College Start Age: ${collegeAge} years`, 20, 50);
    doc.text(`Current Education Cost: ${formatEducationCurrency(currentCost)}`, 20, 60);
    doc.text(`Education Inflation Rate: ${inflationRate}%`, 20, 70);
    doc.text(`Expected Return Rate: ${returnRate}%`, 20, 80);
    doc.text(`Current Savings: ${formatEducationCurrency(currentSavings)}`, 20, 90);
    
    // Add results
    const result = calculateEducationClientSide(currentAge, collegeAge, currentCost, inflationRate, returnRate, currentSavings);
    doc.text(`Years to College: ${result.years_to_college} years`, 20, 110);
    doc.text(`Future Cost of Education: ${formatEducationCurrency(result.future_cost)}`, 20, 120);
    doc.text(`Monthly SIP Required: ${formatEducationCurrency(result.monthly_sip_required)}`, 20, 130);
    doc.text(`Total Investment Required: ${formatEducationCurrency(result.total_investment)}`, 20, 140);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Investment Projection:', 20, 170);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 180;
    doc.text('Year', 20, yPos);
    doc.text('Age', 40, yPos);
    doc.text('Annual Investment', 60, yPos);
    doc.text('Cumulative Investment', 110, yPos);
    doc.text('Portfolio Value', 155, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    const yearlyData = generateEducationYearlyData(result);
    yearlyData.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(data.child_age.toString(), 40, yPos);
        doc.text(formatEducationCurrency(data.annual_investment), 60, yPos);
        doc.text(formatEducationCurrency(data.cumulative_investment), 110, yPos);
        doc.text(formatEducationCurrency(data.portfolio_value), 155, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('child-education-planning-report.pdf');
}

// Helper functions for formatting
function formatAge(age) {
    return age + (age === 1 ? ' Year' : ' Years');
}

function formatYears(years) {
    return years + (years === 1 ? ' Year' : ' Years');
}

// Utility function to validate numeric inputs
function validateEducationInput(value, min, max, fieldName) {
    if (isNaN(value) || value === '') {
        return `Please enter a valid ${fieldName}`;
    }
    if (value < min) {
        return `${fieldName} cannot be less than ${min}`;
    }
    if (value > max) {
        return `${fieldName} cannot be more than ${max}`;
    }
    return null;
}

// Additional helper for percentage formatting
function formatPercentage(value) {
    return value.toFixed(1) + '%';
}
