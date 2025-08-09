// Rule of 72 Calculator Script

let rule72Chart = null;

// Input elements
const annualInterestRateInput = document.getElementById('annualInterestRate');
const annualInterestRateSlider = document.getElementById('annualInterestRateSlider');
const yearsToDoubleInput = document.getElementById('yearsToDouble');
const yearsToDoubleSlider = document.getElementById('yearsToDoubleSlider');
const showExactCalculationToggle = document.getElementById('showExactCalculation');

// Mode elements
const modeInterestRate = document.getElementById('modeInterestRate');
const modeYearsToDouble = document.getElementById('modeYearsToDouble');
const interestRateGroup = document.getElementById('interestRateGroup');
const yearsToDoubleGroup = document.getElementById('yearsToDoubleGroup');

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    setupRule72Sliders();
    addRule72EventListeners();
    initialSyncRule72Values();
    calculateAndUpdateRule72Results();
    setupRule72MegaMenu();
    setupCalculationMode();
});

function setupRule72Sliders() {
    syncRule72Inputs(annualInterestRateInput, annualInterestRateSlider);
    syncRule72Inputs(yearsToDoubleInput, yearsToDoubleSlider);
}

function initialSyncRule72Values() {
    // Ensure initial values are properly synchronized
    annualInterestRateSlider.value = annualInterestRateInput.value;
    yearsToDoubleSlider.value = yearsToDoubleInput.value;
}

function syncRule72Inputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateRule72Results();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateRule72Results();
    });

    // Add change event for input field to handle direct typing
    input.addEventListener('change', function() {
        const value = parseFloat(this.value) || 0;
        const minVal = parseFloat(slider.min);
        const maxVal = parseFloat(slider.max);
        
        if (value < minVal) {
            this.value = minVal;
            slider.value = minVal;
        } else if (value > maxVal) {
            this.value = maxVal;
            slider.value = maxVal;
        } else {
            slider.value = value;
        }
        calculateAndUpdateRule72Results();
    });
}

function addRule72EventListeners() {
    // Add change listeners for all inputs
    [annualInterestRateInput, yearsToDoubleInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateRule72Results);
        input.addEventListener('keyup', calculateAndUpdateRule72Results);
    });

    // Add input listeners for sliders
    [annualInterestRateSlider, yearsToDoubleSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateRule72Results);
    });

    // Add listener for exact calculation toggle
    showExactCalculationToggle.addEventListener('change', function() {
        updateResultsDisplay();
        updateRule72Chart();
    });

    // Add listeners for calculation mode
    [modeInterestRate, modeYearsToDouble].forEach(radio => {
        radio.addEventListener('change', switchCalculationMode);
    });
}

function setupCalculationMode() {
    // Initially set up the mode
    switchCalculationMode();
}

function switchCalculationMode() {
    if (modeInterestRate.checked) {
        // Show interest rate input, hide years to double input
        interestRateGroup.classList.remove('hidden');
        yearsToDoubleGroup.classList.add('hidden');
    } else {
        // Show years to double input, hide interest rate input
        interestRateGroup.classList.add('hidden');
        yearsToDoubleGroup.classList.remove('hidden');
    }
    calculateAndUpdateRule72Results();
}

function calculateAndUpdateRule72Results() {
    const isInterestRateMode = modeInterestRate.checked;
    
    let requestData = {};
    
    if (isInterestRateMode) {
        const interestRate = parseFloat(annualInterestRateInput.value) || 0;
        
        if (interestRate <= 0 || interestRate > 100) {
            showRule72Error('Interest rate must be between 0.1% and 100%');
            return;
        }
        
        requestData.interest_rate = interestRate;
    } else {
        const yearsToDouble = parseFloat(yearsToDoubleInput.value) || 0;
        
        if (yearsToDouble <= 0 || yearsToDouble > 200) {
            showRule72Error('Years to double must be between 0.1 and 200 years');
            return;
        }
        
        requestData.years_to_double = yearsToDouble;
    }

    // Send calculation request to backend
    fetch('/calculate-rule-of-72', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === 'error') {
            showRule72Error(result.error);
            return;
        }
        
        // Update display
        updateRule72ResultsDisplay(result);
        updateRule72Chart(result);
        clearRule72Error();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateRule72ClientSide(requestData);
        updateRule72ResultsDisplay(result);
        updateRule72Chart(result);
    });
}

function calculateRule72ClientSide(data) {
    // Client-side Rule of 72 calculation as fallback
    const results = {};
    
    if (data.interest_rate !== undefined) {
        const rate = data.interest_rate;
        const rule72Years = 72 / rate;
        const exactYears = Math.log(2) / Math.log(1 + rate/100);
        const accuracy = 100 - (Math.abs(rule72Years - exactYears) / exactYears * 100);
        
        results.years_to_double_rule_72 = Math.round(rule72Years * 100) / 100;
        results.years_to_double_exact = Math.round(exactYears * 100) / 100;
        results.interest_rate = rate;
        results.accuracy_percentage = Math.round(accuracy * 10) / 10;
        results.summary_message = `At ${rate}% annual interest, your money will double in ${Math.round(rule72Years * 10) / 10} years.`;
    }
    
    if (data.years_to_double !== undefined) {
        const years = data.years_to_double;
        const rule72Rate = 72 / years;
        const exactRate = (Math.pow(2, 1/years) - 1) * 100;
        
        results.required_rate_rule_72 = Math.round(rule72Rate * 100) / 100;
        results.required_rate_exact = Math.round(exactRate * 100) / 100;
        results.years_to_double = years;
        results.summary_message = `To double your money in ${years} years, you need an annual return of ${Math.round(rule72Rate * 10) / 10}%.`;
    }
    
    return results;
}

function updateRule72ResultsDisplay(result) {
    const isInterestRateMode = modeInterestRate.checked;
    const showExact = showExactCalculationToggle.checked;
    
    if (isInterestRateMode) {
        // Display years to double results
        const rule72Value = result.years_to_double_rule_72;
        const exactValue = result.years_to_double_exact;
        
        document.getElementById('rule72Result').textContent = `${rule72Value} Years`;
        document.getElementById('exactResult').textContent = `${exactValue} Years`;
        document.getElementById('accuracyResult').textContent = `${result.accuracy_percentage || 100}%`;
        
        // Update card labels
        document.querySelector('.rule-72-card .card-label').textContent = 'Rule of 72 Estimate';
        document.querySelector('.exact-card .card-label').textContent = 'Exact Calculation';
    } else {
        // Display required rate results
        const rule72Value = result.required_rate_rule_72;
        const exactValue = result.required_rate_exact;
        
        document.getElementById('rule72Result').textContent = `${rule72Value}%`;
        document.getElementById('exactResult').textContent = `${exactValue}%`;
        document.getElementById('accuracyResult').textContent = 'N/A';
        
        // Update card labels
        document.querySelector('.rule-72-card .card-label').textContent = 'Rule of 72 Rate';
        document.querySelector('.exact-card .card-label').textContent = 'Exact Required Rate';
    }
    
    // Update summary message
    document.getElementById('summaryMessage').textContent = result.summary_message || '';
    
    // Show/hide exact calculation card based on toggle
    const exactCard = document.querySelector('.exact-card');
    const accuracyCard = document.querySelector('.accuracy-card');
    
    if (showExact) {
        exactCard.style.display = 'block';
        if (isInterestRateMode && result.accuracy_percentage !== undefined) {
            accuracyCard.style.display = 'block';
        } else {
            accuracyCard.style.display = 'none';
        }
    } else {
        exactCard.style.display = 'none';
        accuracyCard.style.display = 'none';
    }
}

function updateRule72Chart(result) {
    const ctx = document.getElementById('rule72Chart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (rule72Chart) {
        rule72Chart.destroy();
    }
    
    const isInterestRateMode = modeInterestRate.checked;
    const showExact = showExactCalculationToggle.checked;
    
    let chartData, chartTitle;
    
    if (isInterestRateMode) {
        // Years to double chart
        chartTitle = 'Years to Double Money';
        
        if (showExact) {
            chartData = {
                labels: ['Rule of 72', 'Exact Calculation'],
                datasets: [{
                    label: 'Years',
                    data: [
                        result.years_to_double_rule_72,
                        result.years_to_double_exact
                    ],
                    backgroundColor: [
                        'rgba(52, 130, 206, 0.8)',
                        'rgba(39, 174, 96, 0.8)'
                    ],
                    borderColor: [
                        'rgba(52, 130, 206, 1)',
                        'rgba(39, 174, 96, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            };
        } else {
            chartData = {
                labels: ['Rule of 72'],
                datasets: [{
                    label: 'Years',
                    data: [result.years_to_double_rule_72],
                    backgroundColor: ['rgba(52, 130, 206, 0.8)'],
                    borderColor: ['rgba(52, 130, 206, 1)'],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            };
        }
    } else {
        // Required rate chart
        chartTitle = 'Required Annual Return (%)';
        
        if (showExact) {
            chartData = {
                labels: ['Rule of 72', 'Exact Calculation'],
                datasets: [{
                    label: 'Rate (%)',
                    data: [
                        result.required_rate_rule_72,
                        result.required_rate_exact
                    ],
                    backgroundColor: [
                        'rgba(52, 130, 206, 0.8)',
                        'rgba(39, 174, 96, 0.8)'
                    ],
                    borderColor: [
                        'rgba(52, 130, 206, 1)',
                        'rgba(39, 174, 96, 1)'
                    ],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            };
        } else {
            chartData = {
                labels: ['Rule of 72'],
                datasets: [{
                    label: 'Rate (%)',
                    data: [result.required_rate_rule_72],
                    backgroundColor: ['rgba(52, 130, 206, 0.8)'],
                    borderColor: ['rgba(52, 130, 206, 1)'],
                    borderWidth: 2,
                    borderRadius: 4
                }]
            };
        }
    }
    
    rule72Chart = new Chart(ctx, {
        type: 'bar',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: chartTitle,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#374151'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#6b7280',
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 800,
                easing: 'easeInOutQuart'
            }
        }
    });
}

function updateResultsDisplay() {
    // Trigger a recalculation to update the display
    calculateAndUpdateRule72Results();
}

function showRule72Error(message) {
    // Create or update error message
    let errorDiv = document.getElementById('rule72ErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'rule72ErrorMessage';
        errorDiv.className = 'error-message';
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearRule72Error() {
    const errorDiv = document.getElementById('rule72ErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupRule72MegaMenu() {
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

// Helper functions
function formatRule72Currency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function formatRule72Number(number, decimals = 2) {
    return Number(number).toFixed(decimals);
}

function formatRule72Percentage(percentage) {
    return Number(percentage).toFixed(1) + '%';
}

// Calculate compound interest for visualization
function calculateCompoundGrowth(principal, rate, years) {
    return principal * Math.pow(1 + rate / 100, years);
}

// Generate sample data for growth visualization
function generateGrowthData(rate, years) {
    const data = [];
    const principal = 100000; // ₹1,00,000 for example
    
    for (let year = 0; year <= years; year++) {
        const value = calculateCompoundGrowth(principal, rate, year);
        data.push({
            year: year,
            value: Math.round(value)
        });
    }
    
    return data;
}

// Validate input ranges
function validateRule72Inputs() {
    const isInterestRateMode = modeInterestRate.checked;
    
    if (isInterestRateMode) {
        const rate = parseFloat(annualInterestRateInput.value) || 0;
        if (rate <= 0 || rate > 100) {
            showRule72Error('Interest rate must be between 0.1% and 100%');
            return false;
        }
    } else {
        const years = parseFloat(yearsToDoubleInput.value) || 0;
        if (years <= 0 || years > 200) {
            showRule72Error('Years to double must be between 0.1 and 200 years');
            return false;
        }
    }
    
    clearRule72Error();
    return true;
}

// Add keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Tab key navigation enhancement
    if (e.key === 'Tab') {
        const focusableElements = document.querySelectorAll(
            'input[type="number"], input[type="range"], input[type="radio"], input[type="checkbox"], button, a[href]'
        );
        
        const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement);
        
        if (e.shiftKey) {
            // Shift + Tab (previous)
            if (focusedIndex > 0) {
                e.preventDefault();
                focusableElements[focusedIndex - 1].focus();
            }
        } else {
            // Tab (next)
            if (focusedIndex >= 0 && focusedIndex < focusableElements.length - 1) {
                e.preventDefault();
                focusableElements[focusedIndex + 1].focus();
            }
        }
    }
    
    // Enter key to trigger calculation
    if (e.key === 'Enter' && document.activeElement.type === 'number') {
        calculateAndUpdateRule72Results();
    }
});

// Add touch support for mobile devices
function addTouchSupport() {
    const sliders = document.querySelectorAll('.custom-slider');
    
    sliders.forEach(slider => {
        slider.addEventListener('touchstart', function(e) {
            e.preventDefault();
        });
        
        slider.addEventListener('touchmove', function(e) {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.getBoundingClientRect();
            const percent = (touch.clientX - rect.left) / rect.width;
            const min = parseFloat(this.min);
            const max = parseFloat(this.max);
            const value = min + (max - min) * percent;
            
            this.value = Math.max(min, Math.min(max, value));
            
            // Trigger input event
            const inputEvent = new Event('input', { bubbles: true });
            this.dispatchEvent(inputEvent);
        });
    });
}

// Initialize touch support on load
document.addEventListener('DOMContentLoaded', addTouchSupport);

// Performance optimization: Debounce rapid input changes
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Apply debouncing to calculation function for performance
const debouncedCalculation = debounce(calculateAndUpdateRule72Results, 100);

// Replace direct calculation calls with debounced version for rapid input changes
document.addEventListener('DOMContentLoaded', function() {
    [annualInterestRateInput, yearsToDoubleInput].forEach(input => {
        input.addEventListener('input', debouncedCalculation);
    });
});
