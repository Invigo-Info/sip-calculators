// ELSS vs SIP Calculator Script

let elssVsSipChart = null;

// Input elements
const monthlyInvestmentElssInput = document.getElementById('monthlyInvestmentElss');
const monthlyInvestmentElssSlider = document.getElementById('monthlyInvestmentElssSlider');
const investmentDurationElssInput = document.getElementById('investmentDurationElss');
const investmentDurationElssSlider = document.getElementById('investmentDurationElssSlider');
const sipReturnRateElssInput = document.getElementById('sipReturnRateElss');
const sipReturnRateElssSlider = document.getElementById('sipReturnRateElssSlider');
const elssReturnRateElssInput = document.getElementById('elssReturnRateElss');
const elssReturnRateElssSlider = document.getElementById('elssReturnRateElssSlider');
const taxSlabElssInput = document.getElementById('taxSlabElss');
const taxSlabElssSlider = document.getElementById('taxSlabElssSlider');

// Custom Chart.js plugin to display comparison data in center
const elssVsSipCenterTextPlugin = {
    id: 'elssVsSipCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.elssVsSipCenterText && chart.config.options.plugins.elssVsSipCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw Net Benefit
            ctx.font = 'bold 24px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.elssVsSipCenterText.text, centerX, centerY - 8);
            
            // Draw "Net Benefit" label
            ctx.font = '12px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('Net Benefit', centerX, centerY + 12);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(elssVsSipCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupElssVsSipSliders();
    addElssVsSipEventListeners();
    initialSyncElssVsSipValues();
    calculateAndUpdateElssVsSipResults();
    setupElssVsSipMegaMenu();
    setupElssVsSipTableToggle();
});

function setupElssVsSipSliders() {
    syncElssVsSipInputs(monthlyInvestmentElssInput, monthlyInvestmentElssSlider);
    syncElssVsSipInputs(investmentDurationElssInput, investmentDurationElssSlider);
    syncElssVsSipInputs(sipReturnRateElssInput, sipReturnRateElssSlider);
    syncElssVsSipInputs(elssReturnRateElssInput, elssReturnRateElssSlider);
    syncElssVsSipInputs(taxSlabElssInput, taxSlabElssSlider);
}

function initialSyncElssVsSipValues() {
    // Ensure initial values are properly synchronized
    monthlyInvestmentElssSlider.value = monthlyInvestmentElssInput.value;
    investmentDurationElssSlider.value = investmentDurationElssInput.value;
    sipReturnRateElssSlider.value = sipReturnRateElssInput.value;
    elssReturnRateElssSlider.value = elssReturnRateElssInput.value;
    taxSlabElssSlider.value = taxSlabElssInput.value;
}

function syncElssVsSipInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateElssVsSipResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateElssVsSipResults();
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
        calculateAndUpdateElssVsSipResults();
    });
}

function addElssVsSipEventListeners() {
    // Add change listeners for all inputs
    [monthlyInvestmentElssInput, investmentDurationElssInput, sipReturnRateElssInput, 
     elssReturnRateElssInput, taxSlabElssInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateElssVsSipResults);
        input.addEventListener('keyup', calculateAndUpdateElssVsSipResults);
    });

    // Add input listeners for sliders
    [monthlyInvestmentElssSlider, investmentDurationElssSlider, sipReturnRateElssSlider,
     elssReturnRateElssSlider, taxSlabElssSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateElssVsSipResults);
    });
}

function calculateAndUpdateElssVsSipResults() {
    const monthlyInvestment = parseFloat(monthlyInvestmentElssInput.value) || 0;
    const investmentDuration = parseInt(investmentDurationElssInput.value) || 10;
    const sipReturnRate = parseFloat(sipReturnRateElssInput.value) || 12.0;
    const elssReturnRate = parseFloat(elssReturnRateElssInput.value) || 14.0;
    const taxSlab = parseFloat(taxSlabElssInput.value) || 30;

    // Validate inputs
    if (monthlyInvestment < 500 || monthlyInvestment > 50000) {
        showElssVsSipError('Monthly investment must be between ₹500 and ₹50,000');
        return;
    }

    if (investmentDuration < 3 || investmentDuration > 30) {
        showElssVsSipError('Investment duration must be between 3 and 30 years');
        return;
    }

    // Calculate annual investment
    const annualInvestment = monthlyInvestment * 12;

    // Limit ELSS tax benefit to ₹1.5 lakh per year
    const elssEligibleForTax = Math.min(annualInvestment, 150000);

    // Send calculation request to backend
    fetch('/calculate-elss-vs-sip', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            monthly_investment: monthlyInvestment,
            investment_duration: investmentDuration,
            sip_return_rate: sipReturnRate,
            elss_return_rate: elssReturnRate,
            tax_slab: taxSlab
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showElssVsSipError(result.error);
            return;
        }
        
        // Update display
        updateElssVsSipResultsDisplay(result);
        updateElssVsSipChart(result);
        updateElssVsSipTable(result);
        clearElssVsSipError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateElssVsSipClientSide(monthlyInvestment, investmentDuration, 
                                                   sipReturnRate, elssReturnRate, taxSlab);
        updateElssVsSipResultsDisplay(result);
        updateElssVsSipChart(result);
        updateElssVsSipTable(result);
    });
}

function calculateElssVsSipClientSide(monthlyInvestment, durationYears, sipReturnRate, elssReturnRate, taxSlab) {
    const annualInvestment = monthlyInvestment * 12;
    const sipMonthlyRate = sipReturnRate / (12 * 100);
    const elssMonthlyRate = elssReturnRate / (12 * 100);
    const totalMonths = durationYears * 12;
    
    // Calculate SIP future value using standard SIP formula
    const sipFinalValue = monthlyInvestment * (((Math.pow(1 + sipMonthlyRate, totalMonths) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
    
    // Calculate ELSS future value using standard SIP formula
    const elssFinalValue = monthlyInvestment * (((Math.pow(1 + elssMonthlyRate, totalMonths) - 1) / elssMonthlyRate) * (1 + elssMonthlyRate));
    
    // Calculate tax benefits
    const elssEligibleForTax = Math.min(annualInvestment, 150000);
    const annualTaxSaved = elssEligibleForTax * (taxSlab / 100);
    const totalTaxSaved = annualTaxSaved * durationYears;
    
    // Net benefit calculation
    const netBenefit = (elssFinalValue + totalTaxSaved) - sipFinalValue;
    
    // Year-wise breakdown
    const yearWiseData = [];
    let sipRunningValue = 0;
    let elssRunningValue = 0;
    let cumulativeTaxSaved = 0;
    
    for (let year = 1; year <= durationYears; year++) {
        // Calculate SIP value at end of year
        const monthsCompleted = year * 12;
        sipRunningValue = monthlyInvestment * (((Math.pow(1 + sipMonthlyRate, monthsCompleted) - 1) / sipMonthlyRate) * (1 + sipMonthlyRate));
        
        // Calculate ELSS value at end of year
        elssRunningValue = monthlyInvestment * (((Math.pow(1 + elssMonthlyRate, monthsCompleted) - 1) / elssMonthlyRate) * (1 + elssMonthlyRate));
        
        // Calculate cumulative tax saved
        cumulativeTaxSaved += annualTaxSaved;
        
        yearWiseData.push({
            year: year,
            annual_investment: annualInvestment,
            sip_value: Math.round(sipRunningValue),
            elss_value: Math.round(elssRunningValue),
            annual_tax_saved: Math.round(annualTaxSaved),
            elss_advantage: Math.round((elssRunningValue + cumulativeTaxSaved) - sipRunningValue)
        });
    }
    
    return {
        monthly_investment: monthlyInvestment,
        investment_duration: durationYears,
        sip_return_rate: sipReturnRate,
        elss_return_rate: elssReturnRate,
        tax_slab: taxSlab,
        sip_final_value: Math.round(sipFinalValue),
        elss_final_value: Math.round(elssFinalValue),
        total_tax_saved: Math.round(totalTaxSaved),
        net_benefit: Math.round(netBenefit),
        annual_investment: annualInvestment,
        year_wise_data: yearWiseData
    };
}

function updateElssVsSipResultsDisplay(result) {
    document.getElementById('sipFinalValueElssResult').textContent = formatElssVsSipCurrency(result.sip_final_value);
    document.getElementById('elssFinalValueElssResult').textContent = formatElssVsSipCurrency(result.elss_final_value);
    document.getElementById('taxSavedElssResult').textContent = formatElssVsSipCurrency(result.total_tax_saved);
    document.getElementById('netBenefitElssResult').textContent = formatElssVsSipCurrency(result.net_benefit);
    
    // Update chart summary
    document.getElementById('sipFinalValueElssDisplay').textContent = formatElssVsSipCurrency(result.sip_final_value);
    document.getElementById('elssFinalValueElssDisplay').textContent = formatElssVsSipCurrency(result.elss_final_value);
    document.getElementById('taxSavedElssDisplay').textContent = formatElssVsSipCurrency(result.total_tax_saved);
}

function updateElssVsSipChart(result) {
    const ctx = document.getElementById('elssVsSipChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (elssVsSipChart) {
        elssVsSipChart.destroy();
    }
    
    const data = {
        labels: ['Regular SIP', 'ELSS Value', 'Tax Saved'],
        datasets: [{
            data: [
                result.sip_final_value,
                result.elss_final_value,
                result.total_tax_saved
            ],
            backgroundColor: [
                '#3498db',
                '#27ae60',
                '#6c757d'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    elssVsSipChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                elssVsSipCenterText: {
                    display: true,
                    text: formatElssVsSipCurrency(result.net_benefit)
                }
            },
            cutout: '60%'
        }
    });
}

function updateElssVsSipTable(result) {
    if (result.year_wise_data) {
        updateElssVsSipYearlyTable(result.year_wise_data);
    }
}

function updateElssVsSipYearlyTable(yearlyData) {
    const tableBody = document.getElementById('elssVsSipYearlyTableBody');
    tableBody.innerHTML = '';
    
    yearlyData.forEach(data => {
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${data.year}</td>
            <td>${formatElssVsSipCurrency(data.annual_investment)}</td>
            <td>${formatElssVsSipCurrency(data.sip_value)}</td>
            <td>${formatElssVsSipCurrency(data.elss_value)}</td>
            <td>${formatElssVsSipCurrency(data.annual_tax_saved)}</td>
            <td>${formatElssVsSipCurrency(data.elss_advantage)}</td>
        `;
    });
}

function formatElssVsSipCurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showElssVsSipError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('elssVsSipErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'elssVsSipErrorMessage';
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

function clearElssVsSipError() {
    const errorDiv = document.getElementById('elssVsSipErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupElssVsSipMegaMenu() {
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

function setupElssVsSipTableToggle() {
    // Initially hide table
    const tableSection = document.getElementById('elssVsSipTableSection');
    if (tableSection) {
        tableSection.classList.add('hidden');
    }
}

function toggleElssVsSipTable() {
    const tableSection = document.getElementById('elssVsSipTableSection');
    if (tableSection) {
        tableSection.classList.toggle('hidden');
    }
}

function downloadElssVsSipPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('ELSS vs SIP Calculator Report', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const monthlyInvestment = parseFloat(monthlyInvestmentElssInput.value) || 0;
    const investmentDuration = parseInt(investmentDurationElssInput.value) || 10;
    const sipReturnRate = parseFloat(sipReturnRateElssInput.value) || 12.0;
    const elssReturnRate = parseFloat(elssReturnRateElssInput.value) || 14.0;
    const taxSlab = parseFloat(taxSlabElssInput.value) || 30;
    
    doc.text(`Monthly Investment: ${formatElssVsSipCurrency(monthlyInvestment)}`, 20, 40);
    doc.text(`Investment Duration: ${investmentDuration} years`, 20, 50);
    doc.text(`SIP Return Rate: ${sipReturnRate}%`, 20, 60);
    doc.text(`ELSS Return Rate: ${elssReturnRate}%`, 20, 70);
    doc.text(`Tax Slab: ${taxSlab}%`, 20, 80);
    
    // Add results
    const result = calculateElssVsSipClientSide(monthlyInvestment, investmentDuration, 
                                              sipReturnRate, elssReturnRate, taxSlab);
    doc.text(`Regular SIP Final Value: ${formatElssVsSipCurrency(result.sip_final_value)}`, 20, 110);
    doc.text(`ELSS Final Value: ${formatElssVsSipCurrency(result.elss_final_value)}`, 20, 120);
    doc.text(`Total Tax Saved: ${formatElssVsSipCurrency(result.total_tax_saved)}`, 20, 130);
    doc.text(`Net Benefit from ELSS: ${formatElssVsSipCurrency(result.net_benefit)}`, 20, 140);
    
    // Add year-wise breakdown header
    doc.setFontSize(14);
    doc.text('Year-wise Comparison:', 20, 170);
    
    // Add table headers
    doc.setFontSize(10);
    let yPos = 180;
    doc.text('Year', 20, yPos);
    doc.text('SIP Value', 45, yPos);
    doc.text('ELSS Value', 80, yPos);
    doc.text('Tax Saved', 115, yPos);
    doc.text('ELSS Advantage', 150, yPos);
    
    yPos += 10;
    
    // Add table data (first 10 years to fit on page)
    result.year_wise_data.slice(0, 10).forEach(data => {
        doc.text(data.year.toString(), 20, yPos);
        doc.text(formatElssVsSipCurrency(data.sip_value), 45, yPos);
        doc.text(formatElssVsSipCurrency(data.elss_value), 80, yPos);
        doc.text(formatElssVsSipCurrency(data.annual_tax_saved), 115, yPos);
        doc.text(formatElssVsSipCurrency(data.elss_advantage), 150, yPos);
        yPos += 8;
    });
    
    // Save the PDF
    doc.save('elss-vs-sip-calculator-report.pdf');
}

// Format percentage for display
function formatElssVsSipPercentage(percentage) {
    return percentage.toFixed(1) + '%';
}

// Format years for display
function formatElssVsSipYears(years) {
    return years + (years === 1 ? ' year' : ' years');
}
