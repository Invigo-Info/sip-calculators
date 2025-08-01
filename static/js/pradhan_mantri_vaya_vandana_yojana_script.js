// PMVVY Calculator Script

let chart = null;

// Input elements
const subscriberAgeInput = document.getElementById('subscriberAge');
const subscriberAgeSlider = document.getElementById('subscriberAgeSlider');
const investmentAmountInput = document.getElementById('investmentAmount');
const investmentAmountSlider = document.getElementById('investmentAmountSlider');
const pensionFrequencySelect = document.getElementById('pensionFrequency');

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupSliders();
    addEventListeners();
    initialSyncValues();
    calculateAndUpdateResults();
    setupMegaMenu();
    setupTableToggle();
});

function setupSliders() {
    syncInputs(subscriberAgeInput, subscriberAgeSlider);
    syncInputs(investmentAmountInput, investmentAmountSlider);
}

function initialSyncValues() {
    // Ensure initial values are properly synchronized
    subscriberAgeSlider.value = subscriberAgeInput.value;
    investmentAmountSlider.value = investmentAmountInput.value;
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
    // Add event listeners for other interactive elements
    pensionFrequencySelect.addEventListener('change', calculateAndUpdateResults);
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('toggleTable').addEventListener('click', toggleTable);
}

function calculateAndUpdateResults() {
    const subscriberAge = parseFloat(subscriberAgeInput.value) || 65;
    const investmentAmount = parseFloat(investmentAmountInput.value) || 200000;
    const pensionFrequency = pensionFrequencySelect.value;

    // Calculate PMVVY returns
    const result = calculatePmvvyReturns(subscriberAge, investmentAmount, pensionFrequency);
    
    if (result.error) {
        console.error('Calculation error:', result.error);
        return;
    }

    updateResultsDisplay(result);
    updateChart(result);
    updateTable(result);
}

function calculatePmvvyReturns(subscriberAge, investmentAmount, pensionFrequency) {
    // Validate age range
    if (subscriberAge < 60 || subscriberAge > 90) {
        return { error: 'Subscriber age must be between 60 and 90 years' };
    }

    // Validate investment amount
    if (investmentAmount < 10000 || investmentAmount > 1500000) {
        return { error: 'Investment amount must be between ₹10,000 and ₹15,00,000' };
    }

    // PMVVY parameters
    const annualInterestRate = 7.40; // Fixed rate of 7.40% per annum
    const policyPeriod = 10; // 10 years
    
    // Calculate pension amount based on frequency and investment
    let pensionAmount;
    let pensionsPerYear;
    let frequencyText;
    
    switch (pensionFrequency) {
        case 'monthly':
            pensionAmount = (investmentAmount * annualInterestRate) / (12 * 100);
            pensionsPerYear = 12;
            frequencyText = 'per month';
            break;
        case 'quarterly':
            pensionAmount = (investmentAmount * annualInterestRate) / (4 * 100);
            pensionsPerYear = 4;
            frequencyText = 'per quarter';
            break;
        case 'half-yearly':
            pensionAmount = (investmentAmount * annualInterestRate) / (2 * 100);
            pensionsPerYear = 2;
            frequencyText = 'per half-year';
            break;
        case 'yearly':
            pensionAmount = (investmentAmount * annualInterestRate) / 100;
            pensionsPerYear = 1;
            frequencyText = 'per year';
            break;
        default:
            pensionAmount = (investmentAmount * annualInterestRate) / (12 * 100);
            pensionsPerYear = 12;
            frequencyText = 'per month';
    }

    // Calculate total pension over 10 years
    const totalPensionPayouts = pensionAmount * pensionsPerYear * policyPeriod;
    
    // Calculate maturity amount (pension + principal returned)
    const maturityAmount = totalPensionPayouts + investmentAmount;
    
    // Calculate effective return rate
    const totalReturns = totalPensionPayouts;
    const effectiveRate = ((totalReturns / investmentAmount) / policyPeriod) * 100;

    // Generate yearly breakdown
    const yearlyBreakdown = [];
    let cumulativePension = 0;

    for (let year = 1; year <= policyPeriod; year++) {
        const yearlyPension = pensionAmount * pensionsPerYear;
        cumulativePension += yearlyPension;
        const remainingBalance = investmentAmount - (year === policyPeriod ? 0 : investmentAmount);
        
        yearlyBreakdown.push({
            year: year,
            age: subscriberAge + year,
            pensionAmount: Math.round(yearlyPension * 100) / 100,
            cumulativePension: Math.round(cumulativePension * 100) / 100,
            remainingBalance: year === policyPeriod ? 0 : investmentAmount
        });
    }

    return {
        subscriberAge: subscriberAge,
        investmentAmount: investmentAmount,
        pensionFrequency: pensionFrequency,
        frequencyText: frequencyText,
        pensionAmount: Math.round(pensionAmount * 100) / 100,
        annualInterestRate: annualInterestRate,
        policyPeriod: policyPeriod,
        totalPensionPayouts: Math.round(totalPensionPayouts * 100) / 100,
        maturityAmount: Math.round(maturityAmount * 100) / 100,
        effectiveRate: Math.round(effectiveRate * 100) / 100,
        yearlyBreakdown: yearlyBreakdown
    };
}

function updateResultsDisplay(result) {
    document.getElementById('pensionAmountResult').textContent = formatCurrency(result.pensionAmount);
    document.getElementById('pensionFrequencyDisplay').textContent = result.frequencyText;
    document.getElementById('totalPayoutResult').textContent = formatCurrency(result.totalPensionPayouts);
    document.getElementById('maturityAmountResult').textContent = formatCurrency(result.maturityAmount);
    document.getElementById('effectiveRateResult').textContent = result.effectiveRate + '%';
}

function updateChart(result) {
    const ctx = document.getElementById('pmvvyChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const investmentAmount = result.investmentAmount;
    const pensionEarned = result.totalPensionPayouts;

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Investment Amount', 'Pension Earned'],
            datasets: [{
                data: [investmentAmount, pensionEarned],
                backgroundColor: [
                    '#3182ce',
                    '#38a169'
                ],
                borderColor: [
                    '#2c5282',
                    '#2f855a'
                ],
                borderWidth: 2
            }]
        },
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
                            const label = context.label || '';
                            const value = context.parsed;
                            return label + ': ' + formatCurrency(value);
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });

    // Update chart summary
    document.getElementById('investmentDisplay').textContent = formatCurrency(investmentAmount);
    document.getElementById('pensionEarnedDisplay').textContent = formatCurrency(pensionEarned);
}

function updateTable(result) {
    const tableBody = document.getElementById('pmvvyTableBody');
    tableBody.innerHTML = '';

    result.yearlyBreakdown.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.year}</td>
            <td>${row.age}</td>
            <td>${formatCurrency(row.pensionAmount)}</td>
            <td>${formatCurrency(row.cumulativePension)}</td>
            <td>${formatCurrency(row.remainingBalance)}</td>
        `;
        tableBody.appendChild(tr);
    });
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });
}

function setupMegaMenu() {
    const megaMenu = document.querySelector('.mega-menu');
    const megaMenuBtn = document.querySelector('.mega-menu-btn');

    if (megaMenuBtn) {
        megaMenuBtn.addEventListener('click', function() {
            megaMenu.classList.toggle('open');
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!megaMenu.contains(event.target)) {
                megaMenu.classList.remove('open');
            }
        });
    }
}

function setupTableToggle() {
    const toggleBtn = document.getElementById('toggleTable');
    const tableSection = document.getElementById('tableSection');

    if (toggleBtn && tableSection) {
        toggleBtn.addEventListener('click', function() {
            tableSection.classList.toggle('hidden');
            
            if (tableSection.classList.contains('hidden')) {
                toggleBtn.innerHTML = '<span class="btn-icon">📊</span>View Table';
            } else {
                toggleBtn.innerHTML = '<span class="btn-icon">📊</span>Hide Table';
            }
        });
    }
}

function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(20);
    doc.text('PMVVY Calculator Report', 105, 20, { align: 'center' });

    // Add calculation details
    doc.setFontSize(12);
    doc.text('Calculation Details:', 20, 40);
    
    const subscriberAge = subscriberAgeInput.value;
    const investmentAmount = investmentAmountInput.value;
    const pensionFrequency = pensionFrequencySelect.value;

    doc.setFontSize(10);
    doc.text(`Subscriber Age: ${subscriberAge} years`, 20, 55);
    doc.text(`Investment Amount: ₹${parseFloat(investmentAmount).toLocaleString('en-IN')}`, 20, 65);
    doc.text(`Pension Frequency: ${pensionFrequency}`, 20, 75);
    doc.text(`Interest Rate: 7.40% per annum`, 20, 85);

    // Add results
    doc.setFontSize(12);
    doc.text('Results:', 20, 105);
    
    const pensionAmount = document.getElementById('pensionAmountResult').textContent;
    const totalPayout = document.getElementById('totalPayoutResult').textContent;
    const maturityAmount = document.getElementById('maturityAmountResult').textContent;
    const effectiveRate = document.getElementById('effectiveRateResult').textContent;

    doc.setFontSize(10);
    doc.text(`Pension Amount: ${pensionAmount} ${document.getElementById('pensionFrequencyDisplay').textContent}`, 20, 120);
    doc.text(`Total Pension (10 Years): ${totalPayout}`, 20, 130);
    doc.text(`Maturity Amount: ${maturityAmount}`, 20, 140);
    doc.text(`Effective Return Rate: ${effectiveRate}`, 20, 150);

    // Add scheme benefits
    doc.setFontSize(12);
    doc.text('PMVVY Scheme Benefits:', 20, 170);
    
    doc.setFontSize(10);
    doc.text('• Guaranteed pension for 10 years', 20, 185);
    doc.text('• Purchase price returned after 10 years', 20, 195);
    doc.text('• Available for senior citizens (60+ years)', 20, 205);
    doc.text('• No medical examination required', 20, 215);
    doc.text('• Loan facility available after 3 years', 20, 225);

    // Save the PDF
    doc.save('pmvvy-calculator-report.pdf');
}