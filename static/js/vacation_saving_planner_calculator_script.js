// Vacation Saving Planner Calculator Script

let vacationChart = null;

// Input elements
const vacationCostInput = document.getElementById('vacationCost');
const vacationCostSlider = document.getElementById('vacationCostSlider');
const monthsUntilVacationInput = document.getElementById('monthsUntilVacation');
const monthsUntilVacationSlider = document.getElementById('monthsUntilVacationSlider');
const currentSavingsInput = document.getElementById('currentSavings');
const currentSavingsSlider = document.getElementById('currentSavingsSlider');
const expectedReturnInput = document.getElementById('expectedReturn');
const expectedReturnSlider = document.getElementById('expectedReturnSlider');
const expectedInflationInput = document.getElementById('expectedInflation');
const expectedInflationSlider = document.getElementById('expectedInflationSlider');
const vacationDateInput = document.getElementById('vacationDate');

// Custom Chart.js plugin to display center text
const vacationCenterTextPlugin = {
    id: 'vacationCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.vacationCenterText && chart.config.options.plugins.vacationCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw main value
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.vacationCenterText.text, centerX, centerY - 10);
            
            // Draw label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText(chart.config.options.plugins.vacationCenterText.label, centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(vacationCenterTextPlugin);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupVacationSliders();
    addVacationEventListeners();
    initialSyncVacationValues();
    setMinimumDate();
    calculateAndUpdateVacationResults();
    setupVacationMegaMenu();
    setupVacationTableToggle();
});

function setupVacationSliders() {
    syncVacationInputs(vacationCostInput, vacationCostSlider);
    syncVacationInputs(monthsUntilVacationInput, monthsUntilVacationSlider);
    syncVacationInputs(currentSavingsInput, currentSavingsSlider);
    syncVacationInputs(expectedReturnInput, expectedReturnSlider);
    syncVacationInputs(expectedInflationInput, expectedInflationSlider);
}

function initialSyncVacationValues() {
    // Ensure initial values are properly synchronized
    vacationCostSlider.value = vacationCostInput.value;
    monthsUntilVacationSlider.value = monthsUntilVacationInput.value;
    currentSavingsSlider.value = currentSavingsInput.value;
    expectedReturnSlider.value = expectedReturnInput.value;
    expectedInflationSlider.value = expectedInflationInput.value;
}

function setMinimumDate() {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    vacationDateInput.min = tomorrow.toISOString().split('T')[0];
}

function syncVacationInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateVacationResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateVacationResults();
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
        calculateAndUpdateVacationResults();
    });
}

function addVacationEventListeners() {
    // Add change listeners for all inputs
    [vacationCostInput, monthsUntilVacationInput, currentSavingsInput, expectedReturnInput, expectedInflationInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateVacationResults);
        input.addEventListener('keyup', calculateAndUpdateVacationResults);
    });

    // Add input listeners for sliders
    [vacationCostSlider, monthsUntilVacationSlider, currentSavingsSlider, expectedReturnSlider, expectedInflationSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateVacationResults);
    });

    // Add listener for vacation date
    vacationDateInput.addEventListener('change', function() {
        updateMonthsFromDate();
        calculateAndUpdateVacationResults();
    });
}

function updateMonthsFromDate() {
    if (vacationDateInput.value) {
        const selectedDate = new Date(vacationDateInput.value);
        const currentDate = new Date();
        
        // Calculate months difference
        const yearDiff = selectedDate.getFullYear() - currentDate.getFullYear();
        const monthDiff = selectedDate.getMonth() - currentDate.getMonth();
        const totalMonths = Math.max(1, yearDiff * 12 + monthDiff);
        
        // Update months input and slider
        monthsUntilVacationInput.value = totalMonths;
        monthsUntilVacationSlider.value = Math.min(totalMonths, 60); // Cap at slider max
        
        // Update date info
        document.getElementById('dateInfo').textContent = 
            `Vacation in ${totalMonths} month${totalMonths > 1 ? 's' : ''} (${selectedDate.toLocaleDateString()})`;
    } else {
        document.getElementById('dateInfo').textContent = 'Select a date to auto-calculate months';
    }
}

function calculateAndUpdateVacationResults() {
    const vacationCost = parseFloat(vacationCostInput.value) || 0;
    const monthsUntilVacation = parseInt(monthsUntilVacationInput.value) || 1;
    const currentSavings = parseFloat(currentSavingsInput.value) || 0;
    const expectedReturn = parseFloat(expectedReturnInput.value) || 0;
    const expectedInflation = parseFloat(expectedInflationInput.value) || 0;

    // Validate inputs
    if (vacationCost <= 0) {
        showVacationError('Vacation cost must be greater than 0');
        return;
    }

    if (monthsUntilVacation <= 0) {
        showVacationError('Months until vacation must be greater than 0');
        return;
    }

    if (currentSavings > vacationCost) {
        showVacationError('Current savings cannot exceed vacation cost');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-vacation-savings', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            vacation_cost: vacationCost,
            months_until_vacation: monthsUntilVacation,
            current_savings: currentSavings,
            expected_return: expectedReturn,
            expected_inflation: expectedInflation
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showVacationError(result.error);
            return;
        }
        
        // Update display
        updateVacationResultsDisplay(result);
        updateVacationChart(result);
        updateVacationTable(result);
        updateProgressBar(result);
        clearVacationError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateVacationSavingsClientSide(vacationCost, monthsUntilVacation, currentSavings, expectedReturn, expectedInflation);
        updateVacationResultsDisplay(result);
        updateVacationChart(result);
        updateVacationTable(result);
        updateProgressBar(result);
    });
}

function calculateVacationSavingsClientSide(vacationCost, monthsUntilVacation, currentSavings, expectedReturn, expectedInflation = 0) {
    // Client-side vacation savings calculation with inflation
    const yearsUntilVacation = monthsUntilVacation / 12;
    const inflationAdjustedCost = vacationCost * Math.pow(1 + expectedInflation / 100, yearsUntilVacation);
    const remainingAmount = inflationAdjustedCost - currentSavings;
    const monthlyRate = expectedReturn / 12 / 100;
    
    let monthlySavingsNeeded;
    let estimatedAccumulatedValue;
    let totalInvestmentReturns = 0;
    
    if (expectedReturn > 0 && monthsUntilVacation > 1) {
        // Use compound interest formula for monthly investments
        // PMT = [PV * r] / [(1 + r)^n - 1]
        const futureValueOfCurrentSavings = currentSavings * Math.pow(1 + monthlyRate, monthsUntilVacation);
        const remainingNeeded = inflationAdjustedCost - futureValueOfCurrentSavings;
        
        if (remainingNeeded > 0) {
            monthlySavingsNeeded = (remainingNeeded * monthlyRate) / (Math.pow(1 + monthlyRate, monthsUntilVacation) - 1);
        } else {
            monthlySavingsNeeded = 0;
        }
        
        // Calculate estimated accumulated value
        const futureValueOfMonthlySavings = monthlySavingsNeeded * ((Math.pow(1 + monthlyRate, monthsUntilVacation) - 1) / monthlyRate);
        estimatedAccumulatedValue = futureValueOfCurrentSavings + futureValueOfMonthlySavings;
        
        // Calculate investment returns
        const totalContributions = currentSavings + (monthlySavingsNeeded * monthsUntilVacation);
        totalInvestmentReturns = estimatedAccumulatedValue - totalContributions;
    } else {
        // Simple calculation without returns
        monthlySavingsNeeded = remainingAmount / monthsUntilVacation;
        estimatedAccumulatedValue = inflationAdjustedCost;
        totalInvestmentReturns = 0;
    }
    
    // Generate month-wise data
    const monthWiseData = [];
    let cumulativeSavings = currentSavings;
    let totalInvestmentGrowth = 0;
    
    for (let month = 1; month <= monthsUntilVacation; month++) {
        const monthlyContribution = monthlySavingsNeeded;
        const previousBalance = cumulativeSavings + totalInvestmentGrowth;
        
        // Add monthly savings
        cumulativeSavings += monthlyContribution;
        
        // Calculate investment growth
        const monthlyGrowth = expectedReturn > 0 ? (previousBalance + monthlyContribution) * monthlyRate : 0;
        totalInvestmentGrowth += monthlyGrowth;
        
        const totalAmount = cumulativeSavings + totalInvestmentGrowth;
        const progress = Math.min((totalAmount / inflationAdjustedCost) * 100, 100);
        
        monthWiseData.push({
            month: month,
            monthly_savings: Math.round(monthlyContribution),
            cumulative_savings: Math.round(cumulativeSavings),
            investment_growth: Math.round(totalInvestmentGrowth),
            total_amount: Math.round(totalAmount),
            progress: Math.round(progress * 10) / 10
        });
    }
    
    return {
        vacation_cost: vacationCost,
        inflation_adjusted_cost: Math.round(inflationAdjustedCost),
        months_until_vacation: monthsUntilVacation,
        current_savings: currentSavings,
        expected_return: expectedReturn,
        expected_inflation: expectedInflation,
        remaining_amount: Math.round(remainingAmount),
        monthly_savings_needed: Math.round(monthlySavingsNeeded),
        estimated_accumulated_value: Math.round(estimatedAccumulatedValue),
        total_investment_returns: Math.round(totalInvestmentReturns),
        month_wise_data: monthWiseData
    };
}

function updateVacationResultsDisplay(result) {
    document.getElementById('inflationAdjustedCostResult').textContent = formatVacationCurrency(result.inflation_adjusted_cost);
    document.getElementById('remainingAmountResult').textContent = formatVacationCurrency(result.remaining_amount);
    document.getElementById('monthlySavingsResult').textContent = formatVacationCurrency(result.monthly_savings_needed);
    document.getElementById('accumulatedValueResult').textContent = formatVacationCurrency(result.estimated_accumulated_value);
    
    // Update chart summary
    document.getElementById('monthlySavingsDisplay').textContent = formatVacationCurrency(result.monthly_savings_needed);
    document.getElementById('currentSavingsDisplay').textContent = formatVacationCurrency(result.current_savings);
    document.getElementById('returnsDisplay').textContent = formatVacationCurrency(result.total_investment_returns);
    
    // Update summary text
    const summaryText = `Save ${formatVacationCurrency(result.monthly_savings_needed)} per month to reach ${formatVacationCurrency(result.inflation_adjusted_cost)} in ${result.months_until_vacation} month${result.months_until_vacation > 1 ? 's' : ''}`;
    document.getElementById('summaryText').textContent = summaryText;
    
    const summaryDetails = `Inflation-adjusted cost: ${formatVacationCurrency(result.inflation_adjusted_cost)} • Current savings: ${formatVacationCurrency(result.current_savings)} • Timeline: ${result.months_until_vacation} month${result.months_until_vacation > 1 ? 's' : ''} • Inflation: ${result.expected_inflation}%`;
    document.getElementById('summaryDetails').textContent = summaryDetails;
    
    // Show/hide investment returns in chart
    const returnsItem = document.getElementById('returnsSummaryItem');
    if (result.total_investment_returns > 0) {
        returnsItem.style.display = 'flex';
    } else {
        returnsItem.style.display = 'none';
    }
}

function updateVacationChart(result) {
    const ctx = document.getElementById('vacationChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (vacationChart) {
        vacationChart.destroy();
    }
    
    const totalMonthlySavings = result.monthly_savings_needed * result.months_until_vacation;
    const data = {
        labels: result.total_investment_returns > 0 ? 
            ['Monthly Savings', 'Current Savings', 'Investment Returns'] : 
            ['Monthly Savings', 'Current Savings'],
        datasets: [{
            data: result.total_investment_returns > 0 ? 
                [totalMonthlySavings, result.current_savings, result.total_investment_returns] :
                [totalMonthlySavings, result.current_savings],
            backgroundColor: result.total_investment_returns > 0 ? 
                ['#3b82f6', '#10b981', '#f59e0b'] :
                ['#3b82f6', '#10b981'],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    vacationChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                vacationCenterText: {
                    display: true,
                    text: formatVacationCurrency(result.inflation_adjusted_cost),
                    label: 'Vacation Goal'
                }
            },
            cutout: '60%'
        }
    });
}

function updateVacationTable(result) {
    if (result.month_wise_data) {
        updateVacationTimelineTable(result.month_wise_data);
    }
}

function updateVacationTimelineTable(monthWiseData) {
    const tableBody = document.getElementById('vacationTimelineTableBody');
    tableBody.innerHTML = '';
    
    monthWiseData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.month}</td>
            <td>${formatVacationCurrency(data.monthly_savings)}</td>
            <td>${formatVacationCurrency(data.cumulative_savings)}</td>
            <td>${formatVacationCurrency(data.investment_growth)}</td>
            <td>${formatVacationCurrency(data.total_amount)}</td>
            <td>${data.progress}%</td>
        `;
    });
}

function updateProgressBar(result) {
    const progressFill = document.getElementById('progressFill');
    const progressCurrent = document.getElementById('progressCurrent');
    const progressGoal = document.getElementById('progressGoal');
    
    const progress = (result.current_savings / result.inflation_adjusted_cost) * 100;
    progressFill.style.width = `${Math.min(progress, 100)}%`;
    progressCurrent.textContent = formatVacationCurrency(result.current_savings);
    progressGoal.textContent = formatVacationCurrency(result.inflation_adjusted_cost);
}

function formatVacationCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showVacationError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('vacationErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'vacationErrorMessage';
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

function clearVacationError() {
    const errorDiv = document.getElementById('vacationErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupVacationMegaMenu() {
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

function setupVacationTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('vacationTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleVacationTable() {
    const tableSection = document.getElementById('vacationTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadVacationPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Vacation Saving Planner Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const vacationCost = parseFloat(vacationCostInput.value) || 0;
    const monthsUntilVacation = parseInt(monthsUntilVacationInput.value) || 1;
    const currentSavings = parseFloat(currentSavingsInput.value) || 0;
    const expectedReturn = parseFloat(expectedReturnInput.value) || 0;
    const expectedInflation = parseFloat(expectedInflationInput.value) || 0;
    
    doc.text(`Vacation Cost: ${formatVacationCurrency(vacationCost)}`, 20, 40);
    doc.text(`Months Until Vacation: ${monthsUntilVacation}`, 20, 50);
    doc.text(`Current Savings: ${formatVacationCurrency(currentSavings)}`, 20, 60);
    doc.text(`Expected Annual Return: ${expectedReturn}%`, 20, 70);
    doc.text(`Expected Inflation: ${expectedInflation}%`, 20, 80);
    
    // Add results
    const result = calculateVacationSavingsClientSide(vacationCost, monthsUntilVacation, currentSavings, expectedReturn, expectedInflation);
    doc.text(`Inflation-Adjusted Cost: ${formatVacationCurrency(result.inflation_adjusted_cost)}`, 20, 100);
    doc.text(`Remaining to Save: ${formatVacationCurrency(result.remaining_amount)}`, 20, 110);
    doc.text(`Monthly Savings Needed: ${formatVacationCurrency(result.monthly_savings_needed)}`, 20, 120);
    doc.text(`Estimated Future Value: ${formatVacationCurrency(result.estimated_accumulated_value)}`, 20, 130);
    
    if (result.total_investment_returns > 0) {
        doc.text(`Investment Returns: ${formatVacationCurrency(result.total_investment_returns)}`, 20, 140);
    }
    
    // Add month-wise breakdown header
    doc.setFontSize(14);
    doc.text('Month-wise Savings Timeline:', 20, 160);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 170;
    doc.text('Month', 20, yPos);
    doc.text('Monthly Savings', 45, yPos);
    doc.text('Cumulative', 85, yPos);
    doc.text('Growth', 125, yPos);
    doc.text('Total', 155, yPos);
    doc.text('Progress', 180, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 months to fit on page)
    result.month_wise_data.slice(0, 10).forEach(data => {
        doc.text(data.month.toString(), 20, yPos);
        doc.text(formatVacationCurrency(data.monthly_savings), 45, yPos);
        doc.text(formatVacationCurrency(data.cumulative_savings), 85, yPos);
        doc.text(formatVacationCurrency(data.investment_growth), 125, yPos);
        doc.text(formatVacationCurrency(data.total_amount), 155, yPos);
        doc.text(data.progress + '%', 180, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('vacation-savings-plan.pdf');
}
