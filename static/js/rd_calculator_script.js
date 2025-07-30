// RD Calculator Script

let chart = null;

// Input elements
const monthlyDepositInput = document.getElementById('monthlyDeposit');
const monthlyDepositSlider = document.getElementById('monthlyDepositSlider');
const interestRateInput = document.getElementById('interestRate');
const interestRateSlider = document.getElementById('interestRateSlider');
const tenureYearsInput = document.getElementById('tenureYears');
const tenureYearsSlider = document.getElementById('tenureYearsSlider');
const compoundingFrequencySelect = document.getElementById('compoundingFrequency');

// Custom Chart.js plugin to display Total Return in center
const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.centerText && chart.config.options.plugins.centerText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Total Return value
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.centerText.text, centerX, centerY - 10);
            
            // Draw "Total Return" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Total Return', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(centerTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Check if all required elements exist
    if (!monthlyDepositInput || !monthlyDepositSlider || 
        !interestRateInput || !interestRateSlider || 
        !tenureYearsInput || !tenureYearsSlider || 
        !compoundingFrequencySelect) {
        console.error('Required elements not found');
        return;
    }
    
    setupSliders();
    addEventListeners();
    initialSyncValues(); // Add initial synchronization
    calculateAndUpdateResults();
    setupMegaMenu();
});

function setupSliders() {
    syncInputs(monthlyDepositInput, monthlyDepositSlider);
    syncInputs(interestRateInput, interestRateSlider);
    syncInputs(tenureYearsInput, tenureYearsSlider);
}

function initialSyncValues() {
    // Ensure initial values are properly synchronized
    monthlyDepositSlider.value = monthlyDepositInput.value;
    interestRateSlider.value = interestRateInput.value;
    tenureYearsSlider.value = tenureYearsInput.value;
}

function syncInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateResults();
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
        calculateAndUpdateResults();
    });
}

function addEventListeners() {
    // Add change listeners for all inputs
    [monthlyDepositInput, interestRateInput, tenureYearsInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateResults);
        input.addEventListener('keyup', calculateAndUpdateResults);
    });

    // Add input listeners for sliders
    [monthlyDepositSlider, interestRateSlider, tenureYearsSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateResults);
    });

    // Add listener for compounding frequency
    compoundingFrequencySelect.addEventListener('change', calculateAndUpdateResults);
}

function calculateAndUpdateResults() {
    const data = {
        monthly_deposit: parseFloat(monthlyDepositInput.value) || 0,
        annual_interest_rate: parseFloat(interestRateInput.value) || 0,
        tenure_years: parseInt(tenureYearsInput.value) || 0,
        compounding_frequency: compoundingFrequencySelect.value
    };

    // Validate inputs
    if (data.monthly_deposit <= 0 || data.annual_interest_rate <= 0 || data.tenure_years <= 0) {
        // Set default results when inputs are invalid
        const defaultResult = {
            total_deposits: 0,
            interest_earned: 0,
            maturity_amount: 0,
            total_return_percentage: 0
        };
        updateResultsDisplay(defaultResult);
        updateChart(defaultResult);
        return;
    }

    // Try server calculation first, fallback to client-side calculation
    fetch('/calculate-rd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Server calculation failed');
        }
        return response.json();
    })
    .then(result => {
        if (result.error) {
            throw new Error(result.error);
        }
        updateResultsDisplay(result);
        updateChart(result);
    })
    .catch(error => {
        console.warn('Server calculation failed, using client-side calculation:', error);
        // Fallback to client-side calculation
        const result = calculateRDLocally(data);
        updateResultsDisplay(result);
        updateChart(result);
    });
}

function calculateRDLocally(data) {
    const { monthly_deposit, annual_interest_rate, tenure_years, compounding_frequency } = data;
    
    // Convert annual rate to monthly rate (decimal)
    const monthlyRate = annual_interest_rate / 12 / 100;
    
    // Total number of months
    const totalMonths = tenure_years * 12;
    
    // Calculate total deposits
    const totalDeposits = monthly_deposit * totalMonths;
    
    let maturityAmount;
    
    if (monthlyRate === 0) {
        // If interest rate is 0, maturity amount is just total deposits
        maturityAmount = totalDeposits;
    } else {
        // RD compound interest formula
        // M = R * [((1+i)^n - 1) / i] * (1+i)
        const factor = ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate);
        maturityAmount = monthly_deposit * factor;
    }
    
    // Calculate interest earned
    const interestEarned = maturityAmount - totalDeposits;
    
    // Calculate total return percentage
    const totalReturnPercentage = totalDeposits > 0 ? (interestEarned / totalDeposits) * 100 : 0;
    
    return {
        monthly_deposit: monthly_deposit,
        annual_interest_rate: annual_interest_rate,
        tenure_years: tenure_years,
        compounding_frequency: compounding_frequency,
        total_deposits: Math.round(totalDeposits * 100) / 100,
        maturity_amount: Math.round(maturityAmount * 100) / 100,
        interest_earned: Math.round(interestEarned * 100) / 100,
        total_return_percentage: Math.round(totalReturnPercentage * 100) / 100
    };
}

function updateResultsDisplay(result) {
    // Safely update result elements
    const totalDepositsResult = document.getElementById('totalDepositsResult');
    const interestEarnedResult = document.getElementById('interestEarnedResult');
    const maturityAmountResult = document.getElementById('maturityAmountResult');
    const totalReturnResult = document.getElementById('totalReturnResult');
    const totalDepositsDisplay = document.getElementById('totalDepositsDisplay');
    const interestAmountDisplay = document.getElementById('interestAmountDisplay');
    
    if (totalDepositsResult) totalDepositsResult.textContent = formatCurrency(result.total_deposits);
    if (interestEarnedResult) interestEarnedResult.textContent = formatCurrency(result.interest_earned);
    if (maturityAmountResult) maturityAmountResult.textContent = formatCurrency(result.maturity_amount);
    if (totalReturnResult) totalReturnResult.textContent = `${result.total_return_percentage.toFixed(2)}%`;
    
    // Update chart summary
    if (totalDepositsDisplay) totalDepositsDisplay.textContent = formatCurrency(result.total_deposits);
    if (interestAmountDisplay) interestAmountDisplay.textContent = formatCurrency(result.interest_earned);
}

function updateChart(result) {
    const chartCanvas = document.getElementById('rdBreakupChart');
    if (!chartCanvas) {
        console.warn('Chart canvas not found');
        return;
    }
    
    const ctx = chartCanvas.getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Deposits', 'Interest Earned'],
            datasets: [{
                data: [result.total_deposits, result.interest_earned],
                backgroundColor: ['#10B981', '#F59E0B'],
                borderWidth: 3,
                borderColor: '#ffffff',
                cutout: '75%',
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#ffffff',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    displayColors: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = formatCurrency(context.parsed);
                            const percentage = ((context.parsed / (result.total_deposits + result.interest_earned)) * 100).toFixed(1);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                },
                centerText: {
                    display: true,
                    text: `${result.total_return_percentage.toFixed(2)}%`
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1200,
                easing: 'easeOutCubic'
            }
        }
    });
}

function formatCurrency(amount) {
    // Handle null, undefined, or non-numeric values
    if (amount === null || amount === undefined || isNaN(amount)) {
        amount = 0;
    }
    
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(Math.round(amount));
}

function setupMegaMenu() {
    const megaMenuBtn = document.querySelector('.mega-menu-btn');
    const megaMenu = document.querySelector('.mega-menu');
    
    if (megaMenuBtn && megaMenu) {
        megaMenuBtn.addEventListener('click', function() {
            megaMenu.classList.toggle('open');
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!megaMenu.contains(event.target)) {
                megaMenu.classList.remove('open');
            }
        });
    }
} 
