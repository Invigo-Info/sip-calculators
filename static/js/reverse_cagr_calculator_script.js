// Reverse CAGR Calculator Script

let reverseCagrBarChart = null;
let reverseCagrPieChart = null;

// Input elements
const reverseCagrTargetAmountInput = document.getElementById('reverseCagrTargetAmount');
const reverseCagrTargetAmountSlider = document.getElementById('reverseCagrTargetAmountSlider');
const reverseCagrExpectedReturnInput = document.getElementById('reverseCagrExpectedReturn');
const reverseCagrExpectedReturnSlider = document.getElementById('reverseCagrExpectedReturnSlider');
const reverseCagrInvestmentYearsInput = document.getElementById('reverseCagrInvestmentYears');
const reverseCagrInvestmentYearsSlider = document.getElementById('reverseCagrInvestmentYearsSlider');

// Chart plugins for center text in pie chart
const reverseCagrCenterTextPlugin = {
    id: 'reverseCagrCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.reverseCagrCenterText && chart.config.options.plugins.reverseCagrCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.reverseCagrCenterText.text, centerX, centerY - 10);
            
            // Draw "Target Amount" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Target Amount', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(reverseCagrCenterTextPlugin);

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupReverseCagrSliders();
    addReverseCagrEventListeners();
    initialSyncReverseCagrValues();
    calculateAndUpdateReverseCagrResults();
    setupReverseCagrMegaMenu();
    setupReverseCagrTableToggle();
    setupReverseCagrChartTabs();
    addReverseCagrTooltips();
});

function setupReverseCagrSliders() {
    syncReverseCagrInputs(reverseCagrTargetAmountInput, reverseCagrTargetAmountSlider);
    syncReverseCagrInputs(reverseCagrExpectedReturnInput, reverseCagrExpectedReturnSlider);
    syncReverseCagrInputs(reverseCagrInvestmentYearsInput, reverseCagrInvestmentYearsSlider);
}

function initialSyncReverseCagrValues() {
    // Ensure initial values are properly synchronized
    reverseCagrTargetAmountSlider.value = reverseCagrTargetAmountInput.value;
    reverseCagrExpectedReturnSlider.value = reverseCagrExpectedReturnInput.value;
    reverseCagrInvestmentYearsSlider.value = reverseCagrInvestmentYearsInput.value;
}

function syncReverseCagrInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateReverseCagrResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateReverseCagrResults();
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
        calculateAndUpdateReverseCagrResults();
    });
}

function addReverseCagrEventListeners() {
    // Add change listeners for all inputs
    [reverseCagrTargetAmountInput, reverseCagrExpectedReturnInput, reverseCagrInvestmentYearsInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateReverseCagrResults);
        input.addEventListener('keyup', calculateAndUpdateReverseCagrResults);
    });

    // Add input listeners for sliders
    [reverseCagrTargetAmountSlider, reverseCagrExpectedReturnSlider, reverseCagrInvestmentYearsSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateReverseCagrResults);
    });
}

function calculateAndUpdateReverseCagrResults() {
    const targetAmount = parseFloat(reverseCagrTargetAmountInput.value) || 0;
    const expectedCagr = parseFloat(reverseCagrExpectedReturnInput.value) || 12;
    const investmentYears = parseInt(reverseCagrInvestmentYearsInput.value) || 10;

    // Validate inputs
    if (targetAmount <= 0) {
        showReverseCagrError('Target amount must be greater than 0');
        return;
    }

    if (expectedCagr <= 0) {
        showReverseCagrError('Expected CAGR must be greater than 0');
        return;
    }

    if (investmentYears <= 0 || investmentYears > 50) {
        showReverseCagrError('Investment duration must be between 1 and 50 years');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-reverse-cagr', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            targetAmount: targetAmount,
            expectedCagr: expectedCagr,
            investmentYears: investmentYears
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'error') {
            showReverseCagrError(result.error);
            return;
        }
        
        // Update display
        updateReverseCagrResultsDisplay(result);
        updateReverseCagrCharts(result);
        updateReverseCagrTable(result);
        clearReverseCagrError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateReverseCagrClientSide(targetAmount, expectedCagr, investmentYears);
        updateReverseCagrResultsDisplay(result);
        updateReverseCagrCharts(result);
        updateReverseCagrTable(result);
    });
}

function calculateReverseCagrClientSide(targetAmount, expectedCagr, investmentYears) {
    // Client-side reverse CAGR calculation as fallback
    const growthRate = expectedCagr / 100;
    const initialInvestment = targetAmount / Math.pow(1 + growthRate, investmentYears);
    const totalGrowth = targetAmount - initialInvestment;
    
    // Generate growth table
    const growthTable = [];
    let currentValue = initialInvestment;
    
    for (let year = 1; year <= investmentYears; year++) {
        const previousValue = currentValue;
        currentValue = previousValue * (1 + growthRate);
        const growthAmount = currentValue - previousValue;
        
        growthTable.push({
            year: year,
            opening_balance: Math.round(previousValue),
            growth_amount: Math.round(growthAmount),
            closing_balance: Math.round(currentValue),
            cumulative_growth: Math.round(currentValue - initialInvestment)
        });
    }
    
    return {
        initial_investment: Math.round(initialInvestment),
        target_amount: Math.round(targetAmount),
        total_growth: Math.round(totalGrowth),
        expected_cagr: expectedCagr,
        investment_years: investmentYears,
        growth_table: growthTable
    };
}

function updateReverseCagrResultsDisplay(result) {
    document.getElementById('reverseCagrInitialInvestmentResult').textContent = formatReverseCagrCurrency(result.initial_investment);
    document.getElementById('reverseCagrTotalGrowthResult').textContent = formatReverseCagrCurrency(result.total_growth);
    document.getElementById('reverseCagrTargetAmountResult').textContent = formatReverseCagrCurrency(result.target_amount);
    
    // Update chart summary
    document.getElementById('reverseCagrInitialInvestmentDisplay').textContent = formatReverseCagrCurrency(result.initial_investment);
    document.getElementById('reverseCagrTotalGrowthDisplay').textContent = formatReverseCagrCurrency(result.total_growth);
    
    // Update summary text
    const summaryText = `To reach ${formatReverseCagrCurrency(result.target_amount)} in ${result.investment_years} years at ${result.expected_cagr}% CAGR, you need to invest ${formatReverseCagrCurrency(result.initial_investment)} now.`;
    document.getElementById('reverseCagrSummaryText').textContent = summaryText;
}

function updateReverseCagrCharts(result) {
    updateReverseCagrBarChart(result);
    updateReverseCagrPieChart(result);
}

function updateReverseCagrBarChart(result) {
    const ctx = document.getElementById('reverseCagrBarChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (reverseCagrBarChart) {
        reverseCagrBarChart.destroy();
    }
    
    const data = {
        labels: ['Required Investment', 'Target Amount'],
        datasets: [{
            label: 'Amount (₹)',
            data: [
                result.initial_investment,
                result.target_amount
            ],
            backgroundColor: [
                '#8b5cf6',
                '#f59e0b'
            ],
            borderColor: [
                '#7c3aed',
                '#d97706'
            ],
            borderWidth: 2,
            borderRadius: 6,
            borderSkipped: false,
        }]
    };
    
    reverseCagrBarChart = new Chart(ctx, {
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
                            return formatReverseCagrCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatReverseCagrCurrencyShort(value);
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

function updateReverseCagrPieChart(result) {
    const ctx = document.getElementById('reverseCagrPieChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (reverseCagrPieChart) {
        reverseCagrPieChart.destroy();
    }
    
    const data = {
        labels: ['Initial Investment', 'Growth'],
        datasets: [{
            data: [
                result.initial_investment,
                result.total_growth
            ],
            backgroundColor: [
                '#8b5cf6',
                '#10b981'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    reverseCagrPieChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                reverseCagrCenterText: {
                    display: true,
                    text: formatReverseCagrCurrency(result.target_amount)
                }
            },
            cutout: '60%'
        }
    });
}

function updateReverseCagrTable(result) {
    if (result.growth_table) {
        updateReverseCagrYearlyTable(result.growth_table);
    }
}

function updateReverseCagrYearlyTable(growthTable) {
    const tableBody = document.getElementById('reverseCagrYearlyTableBody');
    tableBody.innerHTML = '';
    
    growthTable.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatReverseCagrCurrency(data.opening_balance)}</td>
            <td>${formatReverseCagrCurrency(data.growth_amount)}</td>
            <td>${formatReverseCagrCurrency(data.closing_balance)}</td>
            <td>${formatReverseCagrCurrency(data.cumulative_growth)}</td>
        `;
    });
}

function formatReverseCagrCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function formatReverseCagrCurrencyShort(amount) {
    // Format for chart axes (₹1.59L)
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) {
        return '₹' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₹' + Math.round(amount);
}

function showReverseCagrError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('reverseCagrErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'reverseCagrErrorMessage';
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

function clearReverseCagrError() {
    const errorDiv = document.getElementById('reverseCagrErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupReverseCagrMegaMenu() {
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

function setupReverseCagrTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('reverseCagrTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function setupReverseCagrChartTabs() {
    const barChartTab = document.getElementById('reverseCagrBarChartTab');
    const pieChartTab = document.getElementById('reverseCagrPieChartTab');
    const barChartContainer = document.getElementById('reverseCagrBarChartContainer');
    const pieChartContainer = document.getElementById('reverseCagrPieChartContainer');
    
    if (barChartTab && pieChartTab) {
        barChartTab.addEventListener('click', function() {
            // Switch to bar chart
            barChartTab.classList.add('active');
            pieChartTab.classList.remove('active');
            barChartContainer.classList.remove('hidden');
            pieChartContainer.classList.add('hidden');
        });
        
        pieChartTab.addEventListener('click', function() {
            // Switch to pie chart
            pieChartTab.classList.add('active');
            barChartTab.classList.remove('active');
            pieChartContainer.classList.remove('hidden');
            barChartContainer.classList.add('hidden');
        });
    }
}

function addReverseCagrTooltips() {
    // Add tooltip functionality for CAGR explanation
    const tooltipTriggers = document.querySelectorAll('.tooltip-trigger');
    
    tooltipTriggers.forEach(trigger => {
        trigger.addEventListener('mouseenter', function() {
            showReverseCagrTooltip(this, this.getAttribute('title'));
        });
        
        trigger.addEventListener('mouseleave', function() {
            hideReverseCagrTooltip();
        });
    });
}

function showReverseCagrTooltip(element, text) {
    // Create tooltip if it doesn't exist
    let tooltip = document.getElementById('reverseCagrTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'reverseCagrTooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            max-width: 200px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease;
        `;
        document.body.appendChild(tooltip);
    }
    
    tooltip.textContent = text;
    tooltip.style.opacity = '1';
    
    // Position tooltip
    const rect = element.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.bottom + 5) + 'px';
}

function hideReverseCagrTooltip() {
    const tooltip = document.getElementById('reverseCagrTooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}

function toggleReverseCagrTable() {
    const tableSection = document.getElementById('reverseCagrTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
        
        // Update button text
        const button = document.querySelector('.table-btn');
        if (button) {
            if (tableSection.classList.contains('hidden')) {
                button.innerHTML = '<span class="btn-icon">📊</span>View Growth Table';
            } else {
                button.innerHTML = '<span class="btn-icon">📊</span>Hide Growth Table';
            }
        }
    }
}

function downloadReverseCagrPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Reverse CAGR Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const targetAmount = parseFloat(reverseCagrTargetAmountInput.value) || 0;
    const expectedCagr = parseFloat(reverseCagrExpectedReturnInput.value) || 12;
    const investmentYears = parseInt(reverseCagrInvestmentYearsInput.value) || 10;
    
    doc.text(`Target Amount: ${formatReverseCagrCurrency(targetAmount)}`, 20, 40);
    doc.text(`Expected CAGR: ${expectedCagr}% per annum`, 20, 50);
    doc.text(`Investment Duration: ${investmentYears} years`, 20, 60);
    
    // Calculate and add results
    const result = calculateReverseCagrClientSide(targetAmount, expectedCagr, investmentYears);
    doc.text(`Required Initial Investment: ${formatReverseCagrCurrency(result.initial_investment)}`, 20, 80);
    doc.text(`Total Growth: ${formatReverseCagrCurrency(result.total_growth)}`, 20, 90);
    doc.text(`Target Amount: ${formatReverseCagrCurrency(result.target_amount)}`, 20, 100);
    
    // Add summary
    doc.setFontSize(10);
    const summaryText = `To reach ${formatReverseCagrCurrency(result.target_amount)} in ${result.investment_years} years at ${result.expected_cagr}% CAGR, you need to invest ${formatReverseCagrCurrency(result.initial_investment)} now.`;
    const splitText = doc.splitTextToSize(summaryText, 170);
    doc.text(splitText, 20, 120);
    
    // Add growth table header
    doc.setFontSize(14);
    doc.text('Year-wise Growth Breakdown:', 20, 150);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 160;
    doc.text('Year', 20, yPos);
    doc.text('Opening Balance', 45, yPos);
    doc.text('Growth Amount', 90, yPos);
    doc.text('Closing Balance', 130, yPos);
    doc.text('Cumulative Growth', 170, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.growth_table.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatReverseCagrCurrency(data.opening_balance), 45, yPos);
        doc.text(formatReverseCagrCurrency(data.growth_amount), 90, yPos);
        doc.text(formatReverseCagrCurrency(data.closing_balance), 130, yPos);
        doc.text(formatReverseCagrCurrency(data.cumulative_growth), 170, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('reverse-cagr-calculator-report.pdf');
}