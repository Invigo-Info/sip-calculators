// NPS vs SIP Calculator JavaScript

// Global variables
let npsVsSipChart = null;
let tableVisible = false;

// Initialize calculator
document.addEventListener('DOMContentLoaded', function() {
    initializeNpsSipInputs();
    calculateNpsSipComparison();
    createNpsSipChart();
});

// Initialize input event listeners and sliders
function initializeNpsSipInputs() {
    // Input field and slider pairs
    const inputPairs = [
        ['monthlyInvestmentNpsSip', 'monthlyInvestmentNpsSipSlider'],
        ['investmentDurationNpsSip', 'investmentDurationNpsSipSlider'],
        ['sipReturnRateNpsSip', 'sipReturnRateNpsSipSlider'],
        ['npsReturnRateNpsSip', 'npsReturnRateNpsSipSlider'],
        ['taxSlabNpsSip', 'taxSlabNpsSipSlider'],
        ['annuityRateNpsSip', 'annuityRateNpsSipSlider']
    ];

    // Sync inputs with sliders and add event listeners
    inputPairs.forEach(([inputId, sliderId]) => {
        const input = document.getElementById(inputId);
        const slider = document.getElementById(sliderId);

        if (input && slider) {
            // Sync slider with input
            input.addEventListener('input', function() {
                slider.value = this.value;
                updateSliderProgress(slider);
                calculateNpsSipComparison();
            });

            // Sync input with slider
            slider.addEventListener('input', function() {
                input.value = this.value;
                updateSliderProgress(this);
                calculateNpsSipComparison();
            });

            // Initialize slider progress
            updateSliderProgress(slider);
        }
    });

    // Tax benefit toggle
    const taxBenefitToggle = document.getElementById('taxBenefitNpsSip');
    if (taxBenefitToggle) {
        taxBenefitToggle.addEventListener('change', function() {
            const label = this.parentElement.nextElementSibling;
            label.textContent = this.checked ? 'Enabled' : 'Disabled';
            calculateNpsSipComparison();
        });
    }

    // NPS exit percentages are fixed at 60% lump sum, 40% annuity
    // These are read-only as per current NPS rules

    // Auto-update annuity percentage when lump sum changes (for future flexibility)
    const lumpSumInput = document.getElementById('npsLumpSumNpsSip');
    const annuityInput = document.getElementById('npsAnnuityNpsSip');
    
    if (lumpSumInput && annuityInput) {
        lumpSumInput.addEventListener('input', function() {
            annuityInput.value = 100 - parseInt(this.value);
            calculateNpsSipComparison();
        });
    }
}

// Update slider progress visualization
function updateSliderProgress(slider) {
    const min = parseFloat(slider.min);
    const max = parseFloat(slider.max);
    const value = parseFloat(slider.value);
    const percentage = ((value - min) / (max - min)) * 100;
    
    slider.style.setProperty('--slider-progress', `${percentage}%`);
}

// Main calculation function
function calculateNpsSipComparison() {
    try {
        // Get input values
        const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestmentNpsSip').value) || 5000;
        const duration = parseFloat(document.getElementById('investmentDurationNpsSip').value) || 20;
        const sipReturn = parseFloat(document.getElementById('sipReturnRateNpsSip').value) || 12;
        const npsReturn = parseFloat(document.getElementById('npsReturnRateNpsSip').value) || 10;
        const taxSlab = parseFloat(document.getElementById('taxSlabNpsSip').value) || 30;
        const taxBenefit = document.getElementById('taxBenefitNpsSip').checked;
        const lumpSumPercent = parseFloat(document.getElementById('npsLumpSumNpsSip').value) || 60;
        const annuityPercent = parseFloat(document.getElementById('npsAnnuityNpsSip').value) || 40;
        const annuityRate = parseFloat(document.getElementById('annuityRateNpsSip').value) || 6.5;

        // Calculate totals
        const totalInvestment = monthlyInvestment * 12 * duration;
        
        // SIP Calculations
        const sipResults = calculateSIPReturns(monthlyInvestment, sipReturn, duration);
        const sipLTCGTax = calculateLTCGTax(sipResults.totalGains);
        const sipPostTaxValue = sipResults.maturityValue - sipLTCGTax;

        // NPS Calculations
        const npsResults = calculateNPSReturns(monthlyInvestment, npsReturn, duration);
        const npsLumpSum = npsResults.maturityValue * (lumpSumPercent / 100);
        const npsAnnuityCorpus = npsResults.maturityValue * (annuityPercent / 100);
        const monthlyPension = calculateMonthlyPension(npsAnnuityCorpus, annuityRate);

        // Tax Benefits (80CCD1B)
        const maxTaxBenefit = 50000; // Annual limit for 80CCD(1B)
        const eligibleAmount = Math.min(monthlyInvestment * 12, maxTaxBenefit);
        const annualTaxSaved = taxBenefit ? (eligibleAmount * taxSlab / 100) : 0;
        const totalTaxSaved = annualTaxSaved * duration;

        // Update SIP results
        updateElementText('sipTotalInvestedResult', formatCurrency(totalInvestment));
        updateElementText('sipMaturityValueResult', formatCurrency(sipResults.maturityValue));
        updateElementText('sipLtcgTaxResult', formatCurrency(sipLTCGTax));
        updateElementText('sipPostTaxValueResult', formatCurrency(sipPostTaxValue));

        // Update NPS results
        updateElementText('npsTotalInvestedResult', formatCurrency(totalInvestment));
        updateElementText('npsMaturityValueResult', formatCurrency(npsResults.maturityValue));
        updateElementText('npsLumpSumResult', formatCurrency(npsLumpSum));
        updateElementText('npsAnnuityCorpusResult', formatCurrency(npsAnnuityCorpus));
        updateElementText('npsMonthlyPensionResult', formatCurrency(monthlyPension));

        // Update tax benefits
        updateElementText('annualTaxSavedResult', formatCurrency(annualTaxSaved));
        updateElementText('totalTaxSavedResult', formatCurrency(totalTaxSaved));

        // Comparison analysis
        const sipEffectiveValue = sipPostTaxValue;
        const npsEffectiveValue = npsLumpSum; // Not including annuity for fair comparison
        
        let winner, difference, keyDifference;
        if (sipEffectiveValue > npsEffectiveValue) {
            winner = 'SIP';
            difference = sipEffectiveValue - npsEffectiveValue;
            keyDifference = 'SIP offers better liquidity and higher lump sum returns, while NPS provides tax benefits and guaranteed pension income stream.';
        } else {
            winner = 'NPS';
            difference = npsEffectiveValue - sipEffectiveValue;
            keyDifference = 'NPS offers better lump sum returns and tax benefits, plus guaranteed pension income stream.';
        }

        updateElementText('winnerOptionResult', winner);
        updateElementText('returnDifferenceResult', `+${formatCurrency(difference)}`);
        updateElementText('keyDifferenceResult', keyDifference);

        // Update chart
        updateNpsSipChart(sipPostTaxValue, npsLumpSum, npsAnnuityCorpus);

        // Generate table if visible
        if (tableVisible) {
            generateNpsSipTable(monthlyInvestment, sipReturn, npsReturn, duration, taxBenefit, taxSlab);
        }

    } catch (error) {
        console.error('Error in NPS vs SIP calculation:', error);
    }
}

// Calculate SIP returns using compound interest formula
function calculateSIPReturns(monthlyInvestment, annualReturn, years) {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    
    // Future value of SIP formula: PMT * [((1 + r)^n - 1) / r] * (1 + r)
    const futureValue = monthlyInvestment * 
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
    
    const totalInvestment = monthlyInvestment * totalMonths;
    const totalGains = futureValue - totalInvestment;
    
    return {
        maturityValue: futureValue,
        totalInvestment: totalInvestment,
        totalGains: totalGains
    };
}

// Calculate NPS returns
function calculateNPSReturns(monthlyInvestment, annualReturn, years) {
    // NPS follows similar SIP calculation
    return calculateSIPReturns(monthlyInvestment, annualReturn, years);
}

// Calculate LTCG tax for SIP (10% on gains above 1 lakh per year)
function calculateLTCGTax(totalGains) {
    const exemptionLimit = 100000; // ₹1 lakh exemption per year
    const ltcgRate = 0.10; // 10% LTCG tax rate
    
    if (totalGains > exemptionLimit) {
        return (totalGains - exemptionLimit) * ltcgRate;
    }
    return 0;
}

// Calculate monthly pension from annuity corpus
function calculateMonthlyPension(annuityCorpus, annuityRate) {
    const monthlyRate = annuityRate / 100 / 12;
    // Simple annuity calculation for monthly pension
    return annuityCorpus * monthlyRate;
}

// Create comparison chart
function createNpsSipChart() {
    const ctx = document.getElementById('npsVsSipChart');
    if (!ctx) return;

    npsVsSipChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['SIP (Post-tax)', 'NPS Lump Sum', 'NPS Annuity Corpus'],
            datasets: [{
                label: 'Amount (₹)',
                data: [3689267, 1823132, 1215422], // Initial values
                backgroundColor: [
                    '#3B82F6', // Blue for SIP
                    '#10B981', // Green for NPS Lump Sum
                    '#F59E0B'  // Orange for NPS Annuity
                ],
                borderColor: [
                    '#2563EB',
                    '#059669',
                    '#D97706'
                ],
                borderWidth: 2,
                borderRadius: 8
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
                            return formatCurrency(context.parsed.y);
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return formatCurrencyShort(value);
                        }
                    },
                    grid: {
                        color: '#E5E7EB'
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

// Update chart data
function updateNpsSipChart(sipValue, npsLumpSum, npsAnnuity) {
    if (npsVsSipChart) {
        npsVsSipChart.data.datasets[0].data = [sipValue, npsLumpSum, npsAnnuity];
        npsVsSipChart.update('none');
    }
}

// Generate year-wise table
function generateNpsSipTable(monthlyInvestment, sipReturn, npsReturn, duration, taxBenefit, taxSlab) {
    const tableBody = document.getElementById('npsSipYearlyTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const annualInvestment = monthlyInvestment * 12;
    let sipValue = 0;
    let npsValue = 0;
    let cumulativeInvestment = 0;

    // Tax benefit calculation
    const maxTaxBenefit = 50000;
    const eligibleAmount = Math.min(annualInvestment, maxTaxBenefit);
    const annualTaxSaved = taxBenefit ? (eligibleAmount * taxSlab / 100) : 0;

    for (let year = 1; year <= duration; year++) {
        cumulativeInvestment += annualInvestment;
        
        // Calculate values for this year
        const sipYearValue = calculateSIPValue(monthlyInvestment, sipReturn, year);
        const npsYearValue = calculateSIPValue(monthlyInvestment, npsReturn, year);
        
        const difference = sipYearValue - npsYearValue;
        const differenceColor = difference >= 0 ? '#10B981' : '#EF4444';
        const differenceSymbol = difference >= 0 ? '+' : '';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${year}</td>
            <td>${formatCurrency(annualInvestment)}</td>
            <td>${formatCurrency(sipYearValue)}</td>
            <td>${formatCurrency(npsYearValue)}</td>
            <td>${formatCurrency(annualTaxSaved)}</td>
            <td style="color: ${differenceColor}; font-weight: 600;">
                ${differenceSymbol}${formatCurrency(Math.abs(difference))}
            </td>
        `;
        tableBody.appendChild(row);
    }
}

// Calculate SIP value for specific year
function calculateSIPValue(monthlyInvestment, annualReturn, years) {
    const monthlyRate = annualReturn / 100 / 12;
    const totalMonths = years * 12;
    
    return monthlyInvestment * 
        (((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate));
}

// Toggle table visibility
function toggleNpsSipTable() {
    const tableSection = document.getElementById('npsSipTableSection');
    const button = document.querySelector('.table-btn');
    
    if (!tableSection || !button) return;

    tableVisible = !tableVisible;
    
    if (tableVisible) {
        tableSection.classList.remove('hidden');
        button.innerHTML = '<span class="btn-icon">📊</span>Hide Details';
        generateNpsSipTable(
            parseFloat(document.getElementById('monthlyInvestmentNpsSip').value) || 5000,
            parseFloat(document.getElementById('sipReturnRateNpsSip').value) || 12,
            parseFloat(document.getElementById('npsReturnRateNpsSip').value) || 10,
            parseFloat(document.getElementById('investmentDurationNpsSip').value) || 20,
            document.getElementById('taxBenefitNpsSip').checked,
            parseFloat(document.getElementById('taxSlabNpsSip').value) || 30
        );
        
        // Smooth scroll to table
        setTimeout(() => {
            tableSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    } else {
        tableSection.classList.add('hidden');
        button.innerHTML = '<span class="btn-icon">📊</span>View Details';
    }
}

// Download PDF functionality
function downloadNpsSipPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Get current values
        const monthlyInvestment = parseFloat(document.getElementById('monthlyInvestmentNpsSip').value) || 5000;
        const duration = parseFloat(document.getElementById('investmentDurationNpsSip').value) || 20;
        const sipReturn = parseFloat(document.getElementById('sipReturnRateNpsSip').value) || 12;
        const npsReturn = parseFloat(document.getElementById('npsReturnRateNpsSip').value) || 10;

        // PDF content
        doc.setFontSize(20);
        doc.text('NPS vs SIP Calculator Report', 20, 20);
        
        doc.setFontSize(12);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
        
        // Input parameters
        doc.setFontSize(14);
        doc.text('Investment Parameters:', 20, 45);
        doc.setFontSize(10);
        doc.text(`Monthly Investment: ${formatCurrency(monthlyInvestment)}`, 25, 55);
        doc.text(`Duration: ${duration} years`, 25, 65);
        doc.text(`SIP Expected Return: ${sipReturn}%`, 25, 75);
        doc.text(`NPS Expected Return: ${npsReturn}%`, 25, 85);

        // Results
        doc.setFontSize(14);
        doc.text('Results:', 20, 105);
        
        doc.setFontSize(10);
        doc.text('SIP Results:', 25, 115);
        doc.text(`Total Invested: ${document.getElementById('sipTotalInvestedResult').textContent}`, 30, 125);
        doc.text(`Maturity Value: ${document.getElementById('sipMaturityValueResult').textContent}`, 30, 135);
        doc.text(`Post-Tax Value: ${document.getElementById('sipPostTaxValueResult').textContent}`, 30, 145);

        doc.text('NPS Results:', 25, 165);
        doc.text(`Total Invested: ${document.getElementById('npsTotalInvestedResult').textContent}`, 30, 175);
        doc.text(`Maturity Value: ${document.getElementById('npsMaturityValueResult').textContent}`, 30, 185);
        doc.text(`Lump Sum (60%): ${document.getElementById('npsLumpSumResult').textContent}`, 30, 195);
        doc.text(`Monthly Pension: ${document.getElementById('npsMonthlyPensionResult').textContent}`, 30, 205);

        // Tax benefits
        doc.text('Tax Benefits:', 25, 225);
        doc.text(`Annual Tax Saved: ${document.getElementById('annualTaxSavedResult').textContent}`, 30, 235);
        doc.text(`Total Tax Saved: ${document.getElementById('totalTaxSavedResult').textContent}`, 30, 245);

        doc.save('nps-vs-sip-calculator-report.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

// Utility functions
function updateElementText(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

function formatCurrency(amount) {
    if (isNaN(amount)) return '₹0';
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

function formatCurrencyShort(amount) {
    if (amount >= 10000000) { // 1 crore
        return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
    } else if (amount >= 100000) { // 1 lakh
        return '₹' + (amount / 100000).toFixed(1) + 'L';
    } else if (amount >= 1000) { // 1 thousand
        return '₹' + (amount / 1000).toFixed(1) + 'K';
    }
    return '₹' + Math.round(amount).toLocaleString('en-IN');
}

// Mega menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const megaMenuBtn = document.querySelector('.mega-menu-btn');
    const megaMenuContent = document.querySelector('.mega-menu-content');

    if (megaMenuBtn && megaMenuContent) {
        megaMenuBtn.addEventListener('click', function() {
            megaMenuContent.style.display = megaMenuContent.style.display === 'block' ? 'none' : 'block';
        });

        // Close mega menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!megaMenuBtn.contains(event.target) && !megaMenuContent.contains(event.target)) {
                megaMenuContent.style.display = 'none';
            }
        });
    }
});
