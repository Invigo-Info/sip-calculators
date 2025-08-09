// RD vs FD vs SIP Calculator Script

let rdfdsipcalcComparisonChart = null;

// Input elements
const rdfdsipcalcTenureInput = document.getElementById('rdfdsipcalcTenure');
const rdfdsipcalcTenureSlider = document.getElementById('rdfdsipcalcTenureSlider');
const rdfdsipcalcCurrencySelect = document.getElementById('rdfdsipcalcCurrency');

// RD inputs
const rdfdsipcalcRdMonthlyInput = document.getElementById('rdfdsipcalcRdMonthly');
const rdfdsipcalcRdMonthlySlider = document.getElementById('rdfdsipcalcRdMonthlySlider');
const rdfdsipcalcRdRateInput = document.getElementById('rdfdsipcalcRdRate');
const rdfdsipcalcRdRateSlider = document.getElementById('rdfdsipcalcRdRateSlider');

// FD inputs
const rdfdsipcalcFdTypeSelect = document.getElementById('rdfdsipcalcFdType');
const rdfdsipcalcFdLumpsumInput = document.getElementById('rdfdsipcalcFdLumpsum');
const rdfdsipcalcFdLumpsumSlider = document.getElementById('rdfdsipcalcFdLumpsumSlider');
const rdfdsipcalcFdRateInput = document.getElementById('rdfdsipcalcFdRate');
const rdfdsipcalcFdRateSlider = document.getElementById('rdfdsipcalcFdRateSlider');
const rdfdsipcalcFdCompoundingSelect = document.getElementById('rdfdsipcalcFdCompounding');

// SIP inputs
const rdfdsipcalcSipMonthlyInput = document.getElementById('rdfdsipcalcSipMonthly');
const rdfdsipcalcSipMonthlySlider = document.getElementById('rdfdsipcalcSipMonthlySlider');
const rdfdsipcalcSipReturnInput = document.getElementById('rdfdsipcalcSipReturn');
const rdfdsipcalcSipReturnSlider = document.getElementById('rdfdsipcalcSipReturnSlider');

// Advanced options
const rdfdsipcalcShowCagrCheckbox = document.getElementById('rdfdsipcalcShowCagr');
const rdfdsipcalcAddTaxCheckbox = document.getElementById('rdfdsipcalcAddTax');

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    rdfdsipcalcSetupSliders();
    rdfdsipcalcAddEventListeners();
    rdfdsipcalcInitialSyncValues();
    rdfdsipcalcCalculateAndUpdate();
    rdfdsipcalcSetupMegaMenu();
    rdfdsipcalcSetupTableToggle();
});

function rdfdsipcalcSetupSliders() {
    rdfdsipcalcSyncInputs(rdfdsipcalcTenureInput, rdfdsipcalcTenureSlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcRdMonthlyInput, rdfdsipcalcRdMonthlySlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcRdRateInput, rdfdsipcalcRdRateSlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcFdLumpsumInput, rdfdsipcalcFdLumpsumSlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcFdRateInput, rdfdsipcalcFdRateSlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcSipMonthlyInput, rdfdsipcalcSipMonthlySlider);
    rdfdsipcalcSyncInputs(rdfdsipcalcSipReturnInput, rdfdsipcalcSipReturnSlider);
}

function rdfdsipcalcInitialSyncValues() {
    // Ensure initial values are properly synchronized
    rdfdsipcalcTenureSlider.value = rdfdsipcalcTenureInput.value;
    rdfdsipcalcRdMonthlySlider.value = rdfdsipcalcRdMonthlyInput.value;
    rdfdsipcalcRdRateSlider.value = rdfdsipcalcRdRateInput.value;
    rdfdsipcalcFdLumpsumSlider.value = rdfdsipcalcFdLumpsumInput.value;
    rdfdsipcalcFdRateSlider.value = rdfdsipcalcFdRateInput.value;
    rdfdsipcalcSipMonthlySlider.value = rdfdsipcalcSipMonthlyInput.value;
    rdfdsipcalcSipReturnSlider.value = rdfdsipcalcSipReturnInput.value;
}

function rdfdsipcalcSyncInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        rdfdsipcalcCalculateAndUpdate();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        rdfdsipcalcCalculateAndUpdate();
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
        rdfdsipcalcCalculateAndUpdate();
    });
}

function rdfdsipcalcAddEventListeners() {
    // Add change listeners for all inputs
    [rdfdsipcalcTenureInput, rdfdsipcalcRdMonthlyInput, rdfdsipcalcRdRateInput, 
     rdfdsipcalcFdLumpsumInput, rdfdsipcalcFdRateInput, rdfdsipcalcSipMonthlyInput, rdfdsipcalcSipReturnInput].forEach(input => {
        input.addEventListener('change', rdfdsipcalcCalculateAndUpdate);
        input.addEventListener('keyup', rdfdsipcalcCalculateAndUpdate);
    });

    // Add input listeners for sliders
    [rdfdsipcalcTenureSlider, rdfdsipcalcRdMonthlySlider, rdfdsipcalcRdRateSlider,
     rdfdsipcalcFdLumpsumSlider, rdfdsipcalcFdRateSlider, rdfdsipcalcSipMonthlySlider, rdfdsipcalcSipReturnSlider].forEach(slider => {
        slider.addEventListener('input', rdfdsipcalcCalculateAndUpdate);
    });

    // Add listeners for select elements
    [rdfdsipcalcCurrencySelect, rdfdsipcalcFdTypeSelect, rdfdsipcalcFdCompoundingSelect].forEach(select => {
        select.addEventListener('change', function() {
            rdfdsipcalcUpdateFdInputVisibility();
            rdfdsipcalcCalculateAndUpdate();
        });
    });

    // Add listeners for checkboxes
    [rdfdsipcalcShowCagrCheckbox, rdfdsipcalcAddTaxCheckbox].forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            rdfdsipcalcToggleCagrDisplay();
            rdfdsipcalcCalculateAndUpdate();
        });
    });
}

function rdfdsipcalcUpdateFdInputVisibility() {
    const fdType = rdfdsipcalcFdTypeSelect.value;
    const fdLumpsumGroup = document.getElementById('rdfdsipcalcFdLumpsumGroup');
    
    if (fdType === 'match') {
        fdLumpsumGroup.style.display = 'none';
    } else {
        fdLumpsumGroup.style.display = 'block';
    }
}

function rdfdsipcalcToggleCagrDisplay() {
    const showCagr = rdfdsipcalcShowCagrCheckbox.checked;
    const cagrItems = document.querySelectorAll('.rdfdsipcalc-cagr-item');
    
    cagrItems.forEach(item => {
        item.style.display = showCagr ? 'flex' : 'none';
    });
}

function rdfdsipcalcCalculateAndUpdate() {
    const tenure = parseInt(rdfdsipcalcTenureInput.value) || 5;
    
    // RD inputs
    const rdMonthly = parseFloat(rdfdsipcalcRdMonthlyInput.value) || 5000;
    const rdRate = parseFloat(rdfdsipcalcRdRateInput.value) || 6.8;
    
    // FD inputs
    const fdType = rdfdsipcalcFdTypeSelect.value;
    let fdLumpsum = parseFloat(rdfdsipcalcFdLumpsumInput.value) || 300000;
    const fdRate = parseFloat(rdfdsipcalcFdRateInput.value) || 7.0;
    const fdCompounding = rdfdsipcalcFdCompoundingSelect.value;
    
    // SIP inputs
    const sipMonthly = parseFloat(rdfdsipcalcSipMonthlyInput.value) || 5000;
    const sipReturn = parseFloat(rdfdsipcalcSipReturnInput.value) || 12.0;
    
    // Advanced options
    const showCagr = rdfdsipcalcShowCagrCheckbox.checked;
    const addTax = rdfdsipcalcAddTaxCheckbox.checked;

    // Calculate RD
    const rdResults = rdfdsipcalcCalculateRD(rdMonthly, rdRate, tenure);
    
    // Calculate FD
    if (fdType === 'match') {
        // Match with RD/SIP total investment
        fdLumpsum = Math.max(rdResults.totalInvested, sipMonthly * 12 * tenure);
    }
    const fdResults = rdfdsipcalcCalculateFD(fdLumpsum, fdRate, tenure, fdCompounding);
    
    // Calculate SIP
    const sipResults = rdfdsipcalcCalculateSIP(sipMonthly, sipReturn, tenure);

    // Update display
    rdfdsipcalcUpdateResultsDisplay(rdResults, fdResults, sipResults, showCagr);
    rdfdsipcalcUpdateChart([rdResults, fdResults, sipResults]);
    rdfdsipcalcUpdateRanking([rdResults, fdResults, sipResults]);
    rdfdsipcalcUpdateTable([rdResults, fdResults, sipResults]);
}

function rdfdsipcalcCalculateRD(monthlyDeposit, annualRate, years) {
    // RD formula with quarterly compounding
    const quarterlyRate = annualRate / 400; // Convert to quarterly rate
    const totalMonths = years * 12;
    const totalQuarters = years * 4;
    
    let maturityValue = 0;
    
    // Calculate using the standard RD formula
    // M = R * ((1+i)^n - 1) / (1 - (1+i)^(-1/3))
    // Where i = quarterly rate, n = number of quarters, R = monthly deposit
    
    const i = quarterlyRate;
    const n = totalQuarters;
    const R = monthlyDeposit;
    
    if (i === 0) {
        maturityValue = R * 12 * years;
    } else {
        const numerator = Math.pow(1 + i, n) - 1;
        const denominator = 1 - Math.pow(1 + i, -1/3);
        maturityValue = R * (numerator / denominator);
    }
    
    const totalInvested = monthlyDeposit * 12 * years;
    const interestEarned = maturityValue - totalInvested;
    const effectiveCagr = totalInvested > 0 ? (Math.pow(maturityValue / totalInvested, 1 / years) - 1) * 100 : 0;
    
    return {
        type: 'RD',
        totalInvested: Math.round(totalInvested),
        maturityValue: Math.round(maturityValue),
        returnsEarned: Math.round(interestEarned),
        effectiveCagr: Math.round(effectiveCagr * 100) / 100,
        riskLevel: 'Low'
    };
}

function rdfdsipcalcCalculateFD(principal, annualRate, years, compounding) {
    // FD calculation with different compounding frequencies
    let compoundingFrequency;
    
    switch (compounding) {
        case 'annual':
            compoundingFrequency = 1;
            break;
        case 'halfyearly':
            compoundingFrequency = 2;
            break;
        case 'quarterly':
            compoundingFrequency = 4;
            break;
        case 'monthly':
            compoundingFrequency = 12;
            break;
        default:
            compoundingFrequency = 4;
    }
    
    const rate = annualRate / 100;
    const maturityValue = principal * Math.pow(1 + rate / compoundingFrequency, compoundingFrequency * years);
    const interestEarned = maturityValue - principal;
    const effectiveCagr = principal > 0 ? (Math.pow(maturityValue / principal, 1 / years) - 1) * 100 : 0;
    
    return {
        type: 'FD',
        totalInvested: Math.round(principal),
        maturityValue: Math.round(maturityValue),
        returnsEarned: Math.round(interestEarned),
        effectiveCagr: Math.round(effectiveCagr * 100) / 100,
        riskLevel: 'Low'
    };
}

function rdfdsipcalcCalculateSIP(monthlyInvestment, expectedReturn, years) {
    // SIP calculation using annuity-due formula
    const monthlyRate = expectedReturn / 12 / 100;
    const totalMonths = years * 12;
    
    let maturityValue;
    
    if (monthlyRate === 0) {
        maturityValue = monthlyInvestment * totalMonths;
    } else {
        // Annuity-due formula: PMT * (((1 + r)^n - 1) / r) * (1 + r)
        const numerator = Math.pow(1 + monthlyRate, totalMonths) - 1;
        maturityValue = monthlyInvestment * (numerator / monthlyRate) * (1 + monthlyRate);
    }
    
    const totalInvested = monthlyInvestment * totalMonths;
    const gainsEarned = maturityValue - totalInvested;
    const effectiveCagr = totalInvested > 0 ? (Math.pow(maturityValue / totalInvested, 1 / years) - 1) * 100 : 0;
    
    return {
        type: 'SIP',
        totalInvested: Math.round(totalInvested),
        maturityValue: Math.round(maturityValue),
        returnsEarned: Math.round(gainsEarned),
        effectiveCagr: Math.round(effectiveCagr * 100) / 100,
        riskLevel: 'High'
    };
}

function rdfdsipcalcUpdateResultsDisplay(rdResults, fdResults, sipResults, showCagr) {
    // Update RD results
    document.getElementById('rdfdsipcalcRdInvested').textContent = rdfdsipcalcFormatCurrency(rdResults.totalInvested);
    document.getElementById('rdfdsipcalcRdMaturity').textContent = rdfdsipcalcFormatCurrency(rdResults.maturityValue);
    document.getElementById('rdfdsipcalcRdInterest').textContent = rdfdsipcalcFormatCurrency(rdResults.returnsEarned);
    document.getElementById('rdfdsipcalcRdCagr').textContent = rdResults.effectiveCagr.toFixed(2) + '%';
    
    // Update FD results
    document.getElementById('rdfdsipcalcFdInvested').textContent = rdfdsipcalcFormatCurrency(fdResults.totalInvested);
    document.getElementById('rdfdsipcalcFdMaturity').textContent = rdfdsipcalcFormatCurrency(fdResults.maturityValue);
    document.getElementById('rdfdsipcalcFdInterest').textContent = rdfdsipcalcFormatCurrency(fdResults.returnsEarned);
    document.getElementById('rdfdsipcalcFdCagr').textContent = fdResults.effectiveCagr.toFixed(2) + '%';
    
    // Update SIP results
    document.getElementById('rdfdsipcalcSipInvested').textContent = rdfdsipcalcFormatCurrency(sipResults.totalInvested);
    document.getElementById('rdfdsipcalcSipMaturity').textContent = rdfdsipcalcFormatCurrency(sipResults.maturityValue);
    document.getElementById('rdfdsipcalcSipGain').textContent = rdfdsipcalcFormatCurrency(sipResults.returnsEarned);
    document.getElementById('rdfdsipcalcSipCagr').textContent = sipResults.effectiveCagr.toFixed(2) + '%';
    
    // Toggle CAGR display
    rdfdsipcalcToggleCagrDisplay();
}

function rdfdsipcalcUpdateChart(results) {
    const ctx = document.getElementById('rdfdsipcalcComparisonChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (rdfdsipcalcComparisonChart) {
        rdfdsipcalcComparisonChart.destroy();
    }
    
    const data = {
        labels: ['RD', 'FD', 'SIP'],
        datasets: [{
            label: 'Maturity Value',
            data: [
                results[0].maturityValue,
                results[1].maturityValue,
                results[2].maturityValue
            ],
            backgroundColor: [
                '#10b981',
                '#f59e0b',
                '#8b5cf6'
            ],
            borderColor: [
                '#059669',
                '#d97706',
                '#7c3aed'
            ],
            borderWidth: 2
        }]
    };
    
    rdfdsipcalcComparisonChart = new Chart(ctx, {
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
                            return rdfdsipcalcFormatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return rdfdsipcalcFormatCurrency(value);
                        }
                    }
                }
            }
        }
    });
}

function rdfdsipcalcUpdateRanking(results) {
    // Sort results by maturity value in descending order
    const sortedResults = [...results].sort((a, b) => b.maturityValue - a.maturityValue);
    
    const rankingContainer = document.getElementById('rdfdsipcalcRanking');
    rankingContainer.innerHTML = '';
    
    const ranks = ['1st', '2nd', '3rd'];
    const rankClasses = ['rdfdsipcalc-first', 'rdfdsipcalc-second', 'rdfdsipcalc-third'];
    
    sortedResults.forEach((result, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = `rdfdsipcalc-rank-item ${rankClasses[index]}`;
        
        let investmentName = result.type;
        if (result.type === 'RD') investmentName = 'Recurring Deposit (RD)';
        if (result.type === 'FD') investmentName = 'Fixed Deposit (FD)';
        if (result.type === 'SIP') investmentName = 'SIP';
        
        rankItem.innerHTML = `
            <span class="rdfdsipcalc-rank">${ranks[index]}</span>
            <span class="rdfdsipcalc-investment">${investmentName}</span>
            <span class="rdfdsipcalc-amount">${rdfdsipcalcFormatCurrency(result.maturityValue)}</span>
        `;
        
        rankingContainer.appendChild(rankItem);
    });
}

function rdfdsipcalcUpdateTable(results) {
    const tableBody = document.getElementById('rdfdsipcalcComparisonTableBody');
    tableBody.innerHTML = '';
    
    results.forEach(result => {
        const row = tableBody.insertRow();
        
        let investmentName = result.type;
        if (result.type === 'RD') investmentName = 'Recurring Deposit';
        if (result.type === 'FD') investmentName = 'Fixed Deposit';
        if (result.type === 'SIP') investmentName = 'Systematic Investment Plan';
        
        row.innerHTML = `
            <td>${investmentName}</td>
            <td>${rdfdsipcalcFormatCurrency(result.totalInvested)}</td>
            <td>${rdfdsipcalcFormatCurrency(result.maturityValue)}</td>
            <td>${rdfdsipcalcFormatCurrency(result.returnsEarned)}</td>
            <td>${result.effectiveCagr.toFixed(2)}%</td>
            <td>${result.riskLevel}</td>
        `;
    });
}

function rdfdsipcalcFormatCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function rdfdsipcalcSetupMegaMenu() {
    const megaMenuBtn = document.querySelector('.rdfdsipcalc-mega-menu-btn');
    const megaMenu = document.querySelector('.rdfdsipcalc-mega-menu');
    
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
        const megaLinks = document.querySelectorAll('.rdfdsipcalc-mega-link');
        megaLinks.forEach(link => {
            link.addEventListener('click', function() {
                megaMenu.classList.remove('open');
            });
        });
    }
}

function rdfdsipcalcSetupTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('rdfdsipcalcTableSection');
    if (tableSection) {
        tableSection.classList.add('rdfdsipcalc-hidden');
    }
}

function rdfdsipcalcToggleTable() {
    const tableSection = document.getElementById('rdfdsipcalcTableSection');
    if (tableSection) {
        tableSection.classList.toggle('rdfdsipcalc-hidden');
    }
}

function rdfdsipcalcDownloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('RD vs FD vs SIP Comparison Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const tenure = parseInt(rdfdsipcalcTenureInput.value) || 5;
    const rdMonthly = parseFloat(rdfdsipcalcRdMonthlyInput.value) || 5000;
    const rdRate = parseFloat(rdfdsipcalcRdRateInput.value) || 6.8;
    const fdLumpsum = parseFloat(rdfdsipcalcFdLumpsumInput.value) || 300000;
    const fdRate = parseFloat(rdfdsipcalcFdRateInput.value) || 7.0;
    const sipMonthly = parseFloat(rdfdsipcalcSipMonthlyInput.value) || 5000;
    const sipReturn = parseFloat(rdfdsipcalcSipReturnInput.value) || 12.0;
    
    // Add input parameters
    doc.text('Investment Parameters:', 20, 40);
    doc.text(`Investment Tenure: ${tenure} years`, 20, 50);
    doc.text(`RD Monthly Deposit: ${rdfdsipcalcFormatCurrency(rdMonthly)}`, 20, 60);
    doc.text(`RD Interest Rate: ${rdRate}%`, 20, 70);
    doc.text(`FD Lump Sum: ${rdfdsipcalcFormatCurrency(fdLumpsum)}`, 20, 80);
    doc.text(`FD Interest Rate: ${fdRate}%`, 20, 90);
    doc.text(`SIP Monthly Investment: ${rdfdsipcalcFormatCurrency(sipMonthly)}`, 20, 100);
    doc.text(`SIP Expected Return: ${sipReturn}%`, 20, 110);
    
    // Calculate and add results
    const rdResults = rdfdsipcalcCalculateRD(rdMonthly, rdRate, tenure);
    const fdResults = rdfdsipcalcCalculateFD(fdLumpsum, fdRate, tenure, rdfdsipcalcFdCompoundingSelect.value);
    const sipResults = rdfdsipcalcCalculateSIP(sipMonthly, sipReturn, tenure);
    
    doc.setFontSize(14);
    doc.text('Results Comparison:', 20, 140);
    
    doc.setFontSize(12);
    let yPos = 160;
    
    // RD Results
    doc.text('Recurring Deposit (RD):', 20, yPos);
    doc.text(`Total Invested: ${rdfdsipcalcFormatCurrency(rdResults.totalInvested)}`, 25, yPos + 10);
    doc.text(`Maturity Value: ${rdfdsipcalcFormatCurrency(rdResults.maturityValue)}`, 25, yPos + 20);
    doc.text(`Interest Earned: ${rdfdsipcalcFormatCurrency(rdResults.returnsEarned)}`, 25, yPos + 30);
    doc.text(`Effective CAGR: ${rdResults.effectiveCagr.toFixed(2)}%`, 25, yPos + 40);
    
    yPos += 60;
    
    // FD Results
    doc.text('Fixed Deposit (FD):', 20, yPos);
    doc.text(`Total Invested: ${rdfdsipcalcFormatCurrency(fdResults.totalInvested)}`, 25, yPos + 10);
    doc.text(`Maturity Value: ${rdfdsipcalcFormatCurrency(fdResults.maturityValue)}`, 25, yPos + 20);
    doc.text(`Interest Earned: ${rdfdsipcalcFormatCurrency(fdResults.returnsEarned)}`, 25, yPos + 30);
    doc.text(`Effective CAGR: ${fdResults.effectiveCagr.toFixed(2)}%`, 25, yPos + 40);
    
    yPos += 60;
    
    // SIP Results
    doc.text('Systematic Investment Plan (SIP):', 20, yPos);
    doc.text(`Total Invested: ${rdfdsipcalcFormatCurrency(sipResults.totalInvested)}`, 25, yPos + 10);
    doc.text(`Maturity Value: ${rdfdsipcalcFormatCurrency(sipResults.maturityValue)}`, 25, yPos + 20);
    doc.text(`Gains Earned: ${rdfdsipcalcFormatCurrency(sipResults.returnsEarned)}`, 25, yPos + 30);
    doc.text(`Effective CAGR: ${sipResults.effectiveCagr.toFixed(2)}%`, 25, yPos + 40);
    
    // Save the PDF
    doc.save('rd-vs-fd-vs-sip-comparison-report.pdf');
}

// Initialize FD input visibility on load
document.addEventListener('DOMContentLoaded', function() {
    rdfdsipcalcUpdateFdInputVisibility();
});
