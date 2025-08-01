// PMSYM Calculator Script

let chart = null;

// Input elements
const joiningAgeInput = document.getElementById('joiningAge');
const joiningAgeSlider = document.getElementById('joiningAgeSlider');
const pensionAmountInput = document.getElementById('pensionAmount');

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
    syncInputs(joiningAgeInput, joiningAgeSlider);
    // Pension amount is fixed, no slider needed
}

function initialSyncValues() {
    // Ensure initial values are properly synchronized
    joiningAgeSlider.value = joiningAgeInput.value;
    // Pension amount is fixed at 3000
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
    document.getElementById('downloadPDF').addEventListener('click', downloadPDF);
    document.getElementById('toggleTable').addEventListener('click', toggleTable);
}

function calculateAndUpdateResults() {
    const joiningAge = parseFloat(joiningAgeInput.value) || 25;
    const pensionAmount = 3000; // Fixed pension amount
    const interestRate = 8.0; // Fixed interest rate

    // Calculate PMSYM returns based on age and fixed pension
    const result = calculatePmsymReturns(joiningAge, pensionAmount, interestRate);
    
    if (result.error) {
        console.error('Calculation error:', result.error);
        return;
    }

    updateResultsDisplay(result);
    updateChart(result);
    updateTable(result);
}

function calculatePmsymReturns(joiningAge, pensionAmount, interestRate) {
    // Validate age range
    if (joiningAge < 18 || joiningAge > 40) {
        return { error: 'Joining age must be between 18 and 40 years' };
    }

    // Fixed PMSYM parameters
    pensionAmount = 3000; // Fixed pension amount
    interestRate = 8.0;   // Fixed interest rate

    // Calculate years of contribution
    const yearsOfContribution = Math.floor(60 - joiningAge);

    // PMSYM contribution structure based on age
    let monthlyContribution;
    if (joiningAge <= 29) {
        monthlyContribution = 55;
    } else if (joiningAge <= 30) {
        monthlyContribution = 60;
    } else if (joiningAge <= 31) {
        monthlyContribution = 65;
    } else if (joiningAge <= 32) {
        monthlyContribution = 70;
    } else if (joiningAge <= 33) {
        monthlyContribution = 75;
    } else if (joiningAge <= 34) {
        monthlyContribution = 80;
    } else if (joiningAge <= 35) {
        monthlyContribution = 85;
    } else if (joiningAge <= 36) {
        monthlyContribution = 90;
    } else if (joiningAge <= 37) {
        monthlyContribution = 95;
    } else if (joiningAge <= 38) {
        monthlyContribution = 100;
    } else if (joiningAge <= 39) {
        monthlyContribution = 105;
    } else {
        monthlyContribution = 110;
    }

    // Government contribution is 50% of subscriber contribution
    const governmentContribution = monthlyContribution * 0.5;

    // Calculate total contributions
    const totalSubscriberContribution = monthlyContribution * 12 * yearsOfContribution;
    const totalGovernmentContribution = governmentContribution * 12 * yearsOfContribution;
    const totalContribution = totalSubscriberContribution + totalGovernmentContribution;

    // Generate yearly breakdown
    const yearlyBreakdown = [];
    let currentCorpus = 0;
    const annualRate = interestRate / 100;
    const monthlyRate = annualRate / 12;

    for (let year = 1; year <= yearsOfContribution; year++) {
        // Calculate monthly progression for this year
        for (let month = 0; month < 12; month++) {
            const monthlyTotal = monthlyContribution + governmentContribution;
            currentCorpus += monthlyTotal;
            currentCorpus = currentCorpus * (1 + monthlyRate);
        }

        yearlyBreakdown.push({
            year: year,
            age: joiningAge + year,
            yearlySubscriberContribution: monthlyContribution * 12,
            yearlyGovernmentContribution: governmentContribution * 12,
            totalYearlyContribution: (monthlyContribution + governmentContribution) * 12,
            corpusAtYearEnd: currentCorpus,
            cumulativeSubscriberContribution: monthlyContribution * 12 * year,
            cumulativeGovernmentContribution: governmentContribution * 12 * year
        });
    }

    return {
        joiningAge: joiningAge,
        monthlyContribution: monthlyContribution,
        governmentContribution: governmentContribution,
        pensionAmount: pensionAmount,
        interestRate: interestRate,
        yearsOfContribution: yearsOfContribution,
        totalSubscriberContribution: Math.round(totalSubscriberContribution * 100) / 100,
        totalGovernmentContribution: Math.round(totalGovernmentContribution * 100) / 100,
        totalContribution: Math.round(totalContribution * 100) / 100,
        corpusAt60: Math.round(currentCorpus * 100) / 100,
        yearlyBreakdown: yearlyBreakdown
    };
}

function updateResultsDisplay(result) {
    document.getElementById('monthlyContributionResult').textContent = formatCurrency(result.monthlyContribution);
    document.getElementById('governmentContributionResult').textContent = formatCurrency(result.governmentContribution);
    document.getElementById('totalContributionResult').textContent = formatCurrency(result.totalContribution);
}

function updateChart(result) {
    const ctx = document.getElementById('pmsymChart').getContext('2d');
    
    if (chart) {
        chart.destroy();
    }

    const userContribution = result.totalSubscriberContribution;
    const governmentContribution = result.totalGovernmentContribution;

    chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Your Contribution', 'Government Contribution'],
            datasets: [{
                data: [userContribution, governmentContribution],
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
    document.getElementById('userContributionDisplay').textContent = formatCurrency(userContribution);
    document.getElementById('governmentContributionDisplay').textContent = formatCurrency(governmentContribution);
}

function updateTable(result) {
    const tableBody = document.getElementById('pmsymTableBody');
    tableBody.innerHTML = '';

    result.yearlyBreakdown.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${row.year}</td>
            <td>${row.age}</td>
            <td>${formatCurrency(row.yearlySubscriberContribution)}</td>
            <td>${formatCurrency(row.yearlyGovernmentContribution)}</td>
            <td>${formatCurrency(row.totalYearlyContribution)}</td>
            <td>${formatCurrency(row.corpusAtYearEnd)}</td>
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
    doc.text('PMSYM Calculator Report', 105, 20, { align: 'center' });

    // Add calculation details
    doc.setFontSize(12);
    doc.text('Calculation Details:', 20, 40);
    
    const joiningAge = joiningAgeInput.value;
    const pensionAmount = 3000; // Fixed pension amount
    const interestRate = 8.0; // Fixed interest rate

    doc.setFontSize(10);
    doc.text(`Age at Joining: ${joiningAge} years`, 20, 55);
    doc.text(`Monthly Pension Target: ₹${pensionAmount}`, 20, 65);
    doc.text(`Interest Rate: ${interestRate}%`, 20, 75);

    // Add results
    doc.setFontSize(12);
    doc.text('Results:', 20, 95);
    
    const monthlyContribution = document.getElementById('monthlyContributionResult').textContent;
    const governmentContribution = document.getElementById('governmentContributionResult').textContent;
    const totalContribution = document.getElementById('totalContributionResult').textContent;

    doc.setFontSize(10);
    doc.text(`Monthly Contribution Required: ${monthlyContribution}`, 20, 110);
    doc.text(`Government Contribution: ${governmentContribution}`, 20, 120);
    doc.text(`Total Contribution till Age 60: ${totalContribution}`, 20, 130);

    // Save the PDF
    doc.save('pmsym-calculator-report.pdf');
} 