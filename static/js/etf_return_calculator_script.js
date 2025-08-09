// ETF Return Calculator Script

let etfChart = null;

// Input elements
const etfCustomInput = document.getElementById('etfCustomInput');
const etfDropdownToggle = document.getElementById('etfDropdownToggle');
const etfDropdown = document.getElementById('etfDropdown');
const etfInputWrapper = document.querySelector('.etf-input-wrapper');
const etfInfo = document.getElementById('etfInfo');
const investmentAmountInput = document.getElementById('investmentAmount');
const investmentAmountSlider = document.getElementById('investmentAmountSlider');
const timePeriodRadios = document.querySelectorAll('input[name="timePeriod"]');

// ETF Data - Mock historical data for demonstration
const etfData = {
    'NIFTY50': {
        name: 'Nifty 50 ETF',
        returns: {
            '1W': 1.2,
            '1M': 3.5,
            '1Y': 15.8,
            '3Y': 12.4,
            '5Y': 14.2
        },
        volatility: 18.5,
        description: 'Tracks the Nifty 50 index - India\'s top 50 companies'
    },
    'BANKNIFTY': {
        name: 'Bank Nifty ETF',
        returns: {
            '1W': 0.8,
            '1M': 4.2,
            '1Y': 18.5,
            '3Y': 10.8,
            '5Y': 16.3
        },
        volatility: 25.2,
        description: 'Tracks banking sector stocks'
    },
    'NIFTYIT': {
        name: 'Nifty IT ETF',
        returns: {
            '1W': 2.1,
            '1M': 6.8,
            '1Y': 22.4,
            '3Y': 18.7,
            '5Y': 20.1
        },
        volatility: 28.4,
        description: 'Tracks IT sector stocks'
    },
    'GOLDBEES': {
        name: 'Gold BeES',
        returns: {
            '1W': 0.3,
            '1M': 1.8,
            '1Y': 8.2,
            '3Y': 9.5,
            '5Y': 11.3
        },
        volatility: 12.8,
        description: 'Tracks gold prices'
    },
    'LIQUIDBEES': {
        name: 'Liquid BeES',
        returns: {
            '1W': 0.1,
            '1M': 0.4,
            '1Y': 4.8,
            '3Y': 4.2,
            '5Y': 4.5
        },
        volatility: 0.5,
        description: 'Tracks liquid fund returns'
    },
    'NIFTYNEXT50': {
        name: 'Nifty Next 50 ETF',
        returns: {
            '1W': 1.5,
            '1M': 4.1,
            '1Y': 19.2,
            '3Y': 14.8,
            '5Y': 16.7
        },
        volatility: 22.1,
        description: 'Tracks the next 50 largest companies after Nifty 50'
    },
    'NIFTYMIDCAP': {
        name: 'Nifty Midcap ETF',
        returns: {
            '1W': 1.8,
            '1M': 5.2,
            '1Y': 25.4,
            '3Y': 16.9,
            '5Y': 18.3
        },
        volatility: 26.8,
        description: 'Tracks mid-cap stocks'
    },
    'NIFTYSMLCAP': {
        name: 'Nifty Smallcap ETF',
        returns: {
            '1W': 2.2,
            '1M': 6.8,
            '1Y': 32.1,
            '3Y': 19.5,
            '5Y': 21.2
        },
        volatility: 32.5,
        description: 'Tracks small-cap stocks'
    }
};

// Initialize the calculator
document.addEventListener('DOMContentLoaded', function() {
    setupETFSliders();
    addETFEventListeners();
    initialSyncETFValues();
    setupETFDropdown();
    setDefaultETF();
    calculateAndUpdateETFResults();
    setupETFMegaMenu();
});

function setupETFSliders() {
    syncETFInputs(investmentAmountInput, investmentAmountSlider);
}

function initialSyncETFValues() {
    // Ensure initial values are properly synchronized
    investmentAmountSlider.value = investmentAmountInput.value;
}

function syncETFInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateETFResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateETFResults();
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
        calculateAndUpdateETFResults();
    });
}

function addETFEventListeners() {
    // Add change listeners for ETF custom input
    etfCustomInput.addEventListener('input', handleETFInputChange);
    etfCustomInput.addEventListener('focus', handleETFInputFocus);
    etfCustomInput.addEventListener('blur', handleETFInputBlur);
    
    // Add change listeners for investment amount
    investmentAmountInput.addEventListener('change', calculateAndUpdateETFResults);
    investmentAmountInput.addEventListener('keyup', calculateAndUpdateETFResults);
    
    // Add input listener for slider
    investmentAmountSlider.addEventListener('input', calculateAndUpdateETFResults);

    // Add listeners for time period radio buttons
    timePeriodRadios.forEach(radio => {
        radio.addEventListener('change', calculateAndUpdateETFResults);
    });
}

function getSelectedTimePeriod() {
    for (const radio of timePeriodRadios) {
        if (radio.checked) {
            return radio.value;
        }
    }
    return '1Y'; // Default
}

function calculateAndUpdateETFResults() {
    const selectedETF = getSelectedETFSymbol();
    const investmentAmount = parseFloat(investmentAmountInput.value) || 100000;
    const timePeriod = getSelectedTimePeriod();

    // Validate inputs
    if (investmentAmount < 1000) {
        showETFError('Investment amount must be at least ₹1,000');
        return;
    }

    if (investmentAmount > 10000000) {
        showETFError('Investment amount cannot exceed ₹1 Crore');
        return;
    }

    if (!selectedETF || selectedETF.trim() === '') {
        showETFError('Please enter an ETF symbol');
        return;
    }

    // Get ETF data (predefined or use defaults for custom ETFs)
    let etf = etfData[selectedETF.toUpperCase()];
    if (!etf) {
        // For custom ETFs, use default return assumptions
        etf = {
            name: selectedETF.toUpperCase(),
            returns: {
                '1W': 0.5,
                '1M': 2.0,
                '1Y': 12.0,
                '3Y': 10.5,
                '5Y': 11.8
            },
            volatility: 20.0,
            description: 'Custom ETF - Returns are estimated based on market averages'
        };
        updateETFInfo(`Custom ETF: ${selectedETF.toUpperCase()}`, etf.description, true);
    } else {
        updateETFInfo(etf.name, etf.description, false);
    }

    // Calculate returns
    const returnPercentage = etf.returns[timePeriod] || 0;
    const result = calculateETFReturnsData(investmentAmount, returnPercentage, timePeriod, etf);
    
    // Update display
    updateETFResultsDisplay(result);
    updateETFChart(result, timePeriod);
    clearETFError();
}

function calculateETFReturnsData(investmentAmount, returnPercentage, timePeriod, etfInfo) {
    // Calculate based on time period
    let multiplier = 1;
    let annualizedReturn = returnPercentage;
    
    // Convert return to appropriate time period
    switch (timePeriod) {
        case '1W':
            multiplier = 1 + (returnPercentage / 100);
            break;
        case '1M':
            multiplier = 1 + (returnPercentage / 100);
            break;
        case '1Y':
            multiplier = 1 + (returnPercentage / 100);
            annualizedReturn = returnPercentage;
            break;
        case '3Y':
            // 3-year return is typically annualized CAGR
            multiplier = Math.pow(1 + (returnPercentage / 100), 3);
            annualizedReturn = returnPercentage;
            break;
        case '5Y':
            // 5-year return is typically annualized CAGR
            multiplier = Math.pow(1 + (returnPercentage / 100), 5);
            annualizedReturn = returnPercentage;
            break;
        default:
            multiplier = 1 + (returnPercentage / 100);
    }

    const finalValue = Math.round(investmentAmount * multiplier);
    const absoluteReturn = finalValue - investmentAmount;
    
    // Generate chart data points for visualization
    const chartData = generateETFChartData(investmentAmount, returnPercentage, timePeriod);

    return {
        etf_name: etfInfo.name,
        investment_amount: investmentAmount,
        final_value: finalValue,
        absolute_return: absoluteReturn,
        return_percentage: returnPercentage,
        time_period: timePeriod,
        annualized_return: annualizedReturn,
        volatility: etfInfo.volatility,
        chart_data: chartData,
        description: etfInfo.description
    };
}

function generateETFChartData(initialAmount, returnPercentage, timePeriod) {
    const dataPoints = [];
    let numPoints = 10;
    
    // Determine number of data points based on time period
    switch (timePeriod) {
        case '1W':
            numPoints = 7; // Daily for a week
            break;
        case '1M':
            numPoints = 30; // Daily for a month
            break;
        case '1Y':
            numPoints = 12; // Monthly for a year
            break;
        case '3Y':
            numPoints = 36; // Monthly for 3 years
            break;
        case '5Y':
            numPoints = 60; // Monthly for 5 years
            break;
    }

    const finalMultiplier = timePeriod === '3Y' ? Math.pow(1 + (returnPercentage / 100), 3) :
                           timePeriod === '5Y' ? Math.pow(1 + (returnPercentage / 100), 5) :
                           1 + (returnPercentage / 100);

    for (let i = 0; i <= numPoints; i++) {
        const progress = i / numPoints;
        const currentMultiplier = 1 + (finalMultiplier - 1) * progress;
        
        // Add some volatility simulation for visual appeal
        const volatilityFactor = 1 + (Math.sin(i * 0.5) * 0.02 * Math.random());
        const value = Math.round(initialAmount * currentMultiplier * volatilityFactor);
        
        dataPoints.push({
            x: i,
            y: value,
            label: getTimePeriodLabel(i, timePeriod, numPoints)
        });
    }

    return dataPoints;
}

function getTimePeriodLabel(index, timePeriod, totalPoints) {
    const progress = index / totalPoints;
    
    switch (timePeriod) {
        case '1W':
            return `Day ${index + 1}`;
        case '1M':
            return `Day ${Math.round(progress * 30) + 1}`;
        case '1Y':
            return `Month ${Math.round(progress * 12) + 1}`;
        case '3Y':
            return `Month ${Math.round(progress * 36) + 1}`;
        case '5Y':
            return `Month ${Math.round(progress * 60) + 1}`;
        default:
            return `Point ${index + 1}`;
    }
}

function updateETFResultsDisplay(result) {
    document.getElementById('totalInvestmentResult').textContent = formatETFCurrency(result.investment_amount);
    document.getElementById('finalValueResult').textContent = formatETFCurrency(result.final_value);
    document.getElementById('absoluteReturnResult').textContent = formatETFCurrency(result.absolute_return);
    document.getElementById('returnPercentageResult').textContent = result.return_percentage.toFixed(2) + '%';
    
    // Update chart summary
    document.getElementById('etfPriceDisplay').textContent = `${result.etf_name} Performance`;
    document.getElementById('investmentGrowthDisplay').textContent = formatETFCurrency(result.final_value);
}

function updateETFChart(result, timePeriod) {
    const ctx = document.getElementById('etfChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (etfChart) {
        etfChart.destroy();
    }

    const chartData = result.chart_data;
    const labels = chartData.map(point => point.label);
    const values = chartData.map(point => point.y);

    // Create gradient for the line
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(49, 130, 206, 0.8)');
    gradient.addColorStop(1, 'rgba(49, 130, 206, 0.1)');

    etfChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Investment Value (₹)',
                data: values,
                borderColor: '#3182ce',
                backgroundColor: gradient,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#3182ce',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                intersect: false,
                mode: 'index'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#ffffff',
                    bodyColor: '#ffffff',
                    borderColor: '#3182ce',
                    borderWidth: 1,
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                        title: function(context) {
                            return context[0].label;
                        },
                        label: function(context) {
                            return `Value: ${formatETFCurrency(context.parsed.y)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxTicksLimit: 6,
                        color: '#6b7280'
                    }
                },
                y: {
                    display: true,
                    grid: {
                        color: '#f1f5f9'
                    },
                    ticks: {
                        color: '#6b7280',
                        callback: function(value) {
                            return formatETFCurrency(value);
                        }
                    }
                }
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

function formatETFCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showETFError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('etfErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'etfErrorMessage';
        errorDiv.className = 'error-message';
        document.querySelector('.input-sections').appendChild(errorDiv);
    }
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function clearETFError() {
    const errorDiv = document.getElementById('etfErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupETFMegaMenu() {
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

// Export function for the calculate button
function calculateETFReturns() {
    calculateAndUpdateETFResults();
    showETFSuccess('ETF returns recalculated successfully!');
}

function showETFSuccess(message) {
    // Create or update success message
    let successDiv = document.getElementById('etfSuccessMessage');
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.id = 'etfSuccessMessage';
        successDiv.className = 'success-message';
        document.querySelector('.input-sections').appendChild(successDiv);
    }
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successDiv.style.display = 'none';
    }, 3000);
}

function downloadETFPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ETF Return Calculator Report', 20, 20);
    
    // Get current values
    const selectedETF = getSelectedETFSymbol();
    const investmentAmount = parseFloat(investmentAmountInput.value) || 100000;
    const timePeriod = getSelectedTimePeriod();
    
    // Get ETF info (predefined or custom)
    let etfInfo = etfData[selectedETF];
    if (!etfInfo) {
        etfInfo = {
            name: selectedETF,
            returns: {
                '1W': 0.5,
                '1M': 2.0,
                '1Y': 12.0,
                '3Y': 10.5,
                '5Y': 11.8
            },
            volatility: 20.0,
            description: 'Custom ETF - Returns are estimated based on market averages'
        };
    }
    
    const returnPercentage = etfInfo.returns[timePeriod] || 0;
    const result = calculateETFReturnsData(investmentAmount, returnPercentage, timePeriod, etfInfo);
    
    // Add ETF details
    doc.setFontSize(12);
    doc.text(`ETF Selected: ${etfInfo.name}`, 20, 40);
    doc.text(`Investment Amount: ${formatETFCurrency(investmentAmount)}`, 20, 50);
    doc.text(`Time Period: ${getTimePeriodDisplayName(timePeriod)}`, 20, 60);
    doc.text(`Expected Return: ${returnPercentage.toFixed(2)}%`, 20, 70);
    doc.text(`Volatility: ${etfInfo.volatility.toFixed(1)}%`, 20, 80);
    
    // Add results
    doc.setFontSize(14);
    doc.text('Investment Results:', 20, 110);
    
    doc.setFontSize(12);
    doc.text(`Total Investment: ${formatETFCurrency(result.investment_amount)}`, 20, 130);
    doc.text(`Final Value: ${formatETFCurrency(result.final_value)}`, 20, 140);
    doc.text(`Absolute Return: ${formatETFCurrency(result.absolute_return)}`, 20, 150);
    doc.text(`Return Percentage: ${result.return_percentage.toFixed(2)}%`, 20, 160);
    
    // Add disclaimer
    doc.setFontSize(10);
    doc.text('Disclaimer: This calculation is based on historical data and assumptions.', 20, 190);
    doc.text('Actual returns may vary significantly due to market volatility.', 20, 200);
    doc.text('Past performance does not guarantee future results.', 20, 210);
    doc.text('Please consult with a financial advisor before making investment decisions.', 20, 220);
    
    // Add ETF description
    doc.setFontSize(12);
    doc.text('About this ETF:', 20, 240);
    doc.setFontSize(10);
    const description = etfInfo.description;
    const splitDescription = doc.splitTextToSize(description, 170);
    doc.text(splitDescription, 20, 250);
    
    // Save the PDF
    doc.save('etf-return-calculator-report.pdf');
}

function getTimePeriodDisplayName(timePeriod) {
    const displayNames = {
        '1W': '1 Week',
        '1M': '1 Month',
        '1Y': '1 Year',
        '3Y': '3 Years',
        '5Y': '5 Years'
    };
    return displayNames[timePeriod] || timePeriod;
}

// Utility functions for number formatting
function formatCompactNumber(num) {
    if (num >= 10000000) {
        return (num / 10000000).toFixed(1) + 'Cr';
    } else if (num >= 100000) {
        return (num / 100000).toFixed(1) + 'L';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Input validation helpers
function validateInvestmentAmount(amount) {
    return amount >= 1000 && amount <= 10000000;
}

function getETFRiskLevel(volatility) {
    if (volatility < 10) return 'Low';
    if (volatility < 20) return 'Medium';
    if (volatility < 30) return 'High';
    return 'Very High';
}

// Auto-update investment amount display with formatted value
investmentAmountInput.addEventListener('blur', function() {
    const value = parseFloat(this.value) || 0;
    if (value > 0) {
        // You could add formatted display here if needed
        // For now, keep the raw number for calculation accuracy
    }
});

// ETF Dropdown Functions
function setupETFDropdown() {
    // Toggle dropdown
    etfDropdownToggle.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleETFDropdown();
    });

    // Handle ETF option selection
    const etfOptions = document.querySelectorAll('.etf-option');
    etfOptions.forEach(option => {
        option.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            if (value === 'CUSTOM') {
                etfCustomInput.value = '';
                etfCustomInput.focus();
            } else {
                etfCustomInput.value = value;
                updateETFInfo(
                    this.querySelector('.etf-name').textContent,
                    etfData[value].description,
                    false
                );
                calculateAndUpdateETFResults();
            }
            closeETFDropdown();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!etfInputWrapper.contains(e.target)) {
            closeETFDropdown();
        }
    });
}

function toggleETFDropdown() {
    etfInputWrapper.classList.toggle('open');
}

function closeETFDropdown() {
    etfInputWrapper.classList.remove('open');
}

function openETFDropdown() {
    etfInputWrapper.classList.add('open');
}

function handleETFInputChange() {
    const value = etfCustomInput.value.toUpperCase();
    
    // Filter dropdown options based on input
    const etfOptions = document.querySelectorAll('.etf-option:not(.custom-option)');
    let hasMatch = false;
    
    etfOptions.forEach(option => {
        const symbol = option.getAttribute('data-value');
        const name = option.querySelector('.etf-name').textContent;
        
        if (symbol.includes(value) || name.toLowerCase().includes(value.toLowerCase())) {
            option.style.display = 'block';
            hasMatch = true;
        } else {
            option.style.display = 'none';
        }
    });
    
    // Show custom option if no exact match
    const customOption = document.querySelector('.etf-option.custom-option');
    if (!hasMatch && value.length > 0) {
        customOption.style.display = 'block';
    } else {
        customOption.style.display = hasMatch ? 'none' : 'block';
    }
    
    // Trigger calculation after a short delay
    clearTimeout(window.etfInputTimeout);
    window.etfInputTimeout = setTimeout(() => {
        if (value.length > 0) {
            calculateAndUpdateETFResults();
        }
    }, 500);
}

function handleETFInputFocus() {
    openETFDropdown();
}

function handleETFInputBlur() {
    // Delay closing to allow for option selection
    setTimeout(() => {
        if (!etfInputWrapper.matches(':hover')) {
            closeETFDropdown();
        }
    }, 150);
}

function getSelectedETFSymbol() {
    return etfCustomInput.value.trim().toUpperCase();
}

function setDefaultETF() {
    etfCustomInput.value = 'NIFTY50';
    const nifty50Info = etfData['NIFTY50'];
    updateETFInfo(nifty50Info.name, nifty50Info.description, false);
}

function updateETFInfo(name, description, isCustom) {
    const etfDescription = document.querySelector('.etf-description');
    if (isCustom) {
        etfDescription.innerHTML = `<strong>${name}</strong><br>${description}`;
        etfDescription.style.color = '#d97706';
    } else {
        etfDescription.innerHTML = `<strong>${name}</strong><br>${description}`;
        etfDescription.style.color = '#6b7280';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to recalculate
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        calculateETFReturns();
    }
    
    // Ctrl/Cmd + D to download PDF
    if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        downloadETFPDF();
    }
    
    // Escape to close dropdown
    if (e.key === 'Escape') {
        closeETFDropdown();
    }
});
