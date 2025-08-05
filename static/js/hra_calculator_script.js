// HRA Calculator Script

let hraChart = null;

// Input elements
const basicSalaryAnnualInput = document.getElementById('basicSalaryAnnual');
const basicSalaryAnnualSlider = document.getElementById('basicSalaryAnnualSlider');
const daReceivedAnnualInput = document.getElementById('daReceivedAnnual');
const daReceivedAnnualSlider = document.getElementById('daReceivedAnnualSlider');
const hraReceivedAnnualInput = document.getElementById('hraReceivedAnnual');
const hraReceivedAnnualSlider = document.getElementById('hraReceivedAnnualSlider');
const rentPaidAnnualInput = document.getElementById('rentPaidAnnual');
const rentPaidAnnualSlider = document.getElementById('rentPaidAnnualSlider');
const cityTypeSelect = document.getElementById('cityType');

// Custom Chart.js plugin to display HRA Exempt amount in center
const hraCenterTextPlugin = {
    id: 'hraCenterText',
    beforeDraw: function(chart) {
        if (chart.config.options.plugins.hraCenterText && chart.config.options.plugins.hraCenterText.display) {
            const ctx = chart.ctx;
            const centerX = (chart.chartArea.left + chart.chartArea.right) / 2;
            const centerY = (chart.chartArea.top + chart.chartArea.bottom) / 2;
            
            ctx.save();
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Draw HRA Exempt amount
            ctx.font = 'bold 28px Inter, sans-serif';
            ctx.fillStyle = '#1a202c';
            ctx.fillText(chart.config.options.plugins.hraCenterText.text, centerX, centerY - 10);
            
            // Draw "HRA Exempt" label
            ctx.font = '14px Inter, sans-serif';
            ctx.fillStyle = '#6b7280';
            ctx.fillText('HRA Exempt', centerX, centerY + 15);
            
            ctx.restore();
        }
    }
};

// Register the plugin
Chart.register(hraCenterTextPlugin);

// Initialize sliders and event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupHRASliders();
    addHRAEventListeners();
    initialSyncHRAValues();
    calculateAndUpdateHRAResults();
    setupHRAMegaMenu();
    setupTooltips();
});

function setupHRASliders() {
    syncHRAInputs(basicSalaryAnnualInput, basicSalaryAnnualSlider);
    syncHRAInputs(daReceivedAnnualInput, daReceivedAnnualSlider);
    syncHRAInputs(hraReceivedAnnualInput, hraReceivedAnnualSlider);
    syncHRAInputs(rentPaidAnnualInput, rentPaidAnnualSlider);
}

function initialSyncHRAValues() {
    // Ensure initial values are properly synchronized
    basicSalaryAnnualSlider.value = basicSalaryAnnualInput.value;
    daReceivedAnnualSlider.value = daReceivedAnnualInput.value;
    hraReceivedAnnualSlider.value = hraReceivedAnnualInput.value;
    rentPaidAnnualSlider.value = rentPaidAnnualInput.value;
}

function syncHRAInputs(input, slider) {
    // Sync input to slider
    input.addEventListener('input', function() {
        const value = parseFloat(this.value) || 0;
        if (value >= parseFloat(slider.min) && value <= parseFloat(slider.max)) {
            slider.value = value;
        }
        calculateAndUpdateHRAResults();
    });

    // Sync slider to input
    slider.addEventListener('input', function() {
        input.value = this.value;
        calculateAndUpdateHRAResults();
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
            // For values above slider max, keep the input value but set slider to max
            slider.value = slider.max;
        }
        calculateAndUpdateHRAResults();
    });
}

function addHRAEventListeners() {
    // Add change listeners for all inputs
    [basicSalaryAnnualInput, daReceivedAnnualInput, hraReceivedAnnualInput, rentPaidAnnualInput].forEach(input => {
        input.addEventListener('change', calculateAndUpdateHRAResults);
        input.addEventListener('keyup', calculateAndUpdateHRAResults);
    });

    // Add input listeners for sliders
    [basicSalaryAnnualSlider, daReceivedAnnualSlider, hraReceivedAnnualSlider, rentPaidAnnualSlider].forEach(slider => {
        slider.addEventListener('input', calculateAndUpdateHRAResults);
    });

    // Add listener for city type
    cityTypeSelect.addEventListener('change', calculateAndUpdateHRAResults);
}

function calculateAndUpdateHRAResults() {
    const basicSalaryAnnual = parseFloat(basicSalaryAnnualInput.value) || 0;
    const daReceivedAnnual = parseFloat(daReceivedAnnualInput.value) || 0;
    const hraReceivedAnnual = parseFloat(hraReceivedAnnualInput.value) || 0;
    const rentPaidAnnual = parseFloat(rentPaidAnnualInput.value) || 0;
    const cityType = cityTypeSelect.value;

    // Validate inputs
    if (basicSalaryAnnual <= 0) {
        showHRAError('Basic salary must be greater than 0');
        return;
    }

    if (daReceivedAnnual < 0) {
        showHRAError('Dearness Allowance cannot be negative');
        return;
    }

    if (hraReceivedAnnual < 0) {
        showHRAError('HRA received cannot be negative');
        return;
    }

    if (rentPaidAnnual < 0) {
        showHRAError('Rent paid cannot be negative');
        return;
    }

    // Send calculation request to backend
    fetch('/calculate-hra', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            basic_salary_annual: basicSalaryAnnual,
            da_received_annual: daReceivedAnnual,
            hra_received_annual: hraReceivedAnnual,
            rent_paid_annual: rentPaidAnnual,
            city_type: cityType
        })
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            showHRAError(result.error);
            return;
        }
        
        // Update display
        updateHRAResultsDisplay(result);
        updateHRAChart(result);
        updateCalculationDetails(result);
        clearHRAError();
    })
    .catch(error => {
        console.error('Error:', error);
        // Fallback to client-side calculation
        const result = calculateHRAClientSide(basicSalaryAnnual, daReceivedAnnual, hraReceivedAnnual, rentPaidAnnual, cityType);
        updateHRAResultsDisplay(result);
        updateHRAChart(result);
        updateCalculationDetails(result);
    });
}

function calculateHRAClientSide(basicSalaryAnnual, daReceivedAnnual, hraReceivedAnnual, rentPaidAnnual, cityType) {
    // Client-side HRA calculation as fallback following ClearTax logic
    const totalSalaryAnnual = basicSalaryAnnual + daReceivedAnnual;
    const actualHra = hraReceivedAnnual;
    const salaryPercentage = cityType === 'metro' ? basicSalaryAnnual * 0.50 : basicSalaryAnnual * 0.40;
    const tenPercentTotalSalary = totalSalaryAnnual * 0.10;
    const rentMinusTenPercent = Math.max(0, rentPaidAnnual - tenPercentTotalSalary);
    
    const hraExempt = Math.min(actualHra, salaryPercentage, rentMinusTenPercent);
    const taxableHra = Math.max(0, hraReceivedAnnual - hraExempt);
    
    // Estimate tax savings (assuming 30% tax bracket)
    const taxSavings = hraExempt * 0.30;
    
    return {
        basic_salary_annual: basicSalaryAnnual,
        da_received_annual: daReceivedAnnual,
        total_salary_annual: totalSalaryAnnual,
        hra_received_annual: hraReceivedAnnual,
        rent_paid_annual: rentPaidAnnual,
        city_type: cityType,
        actual_hra: actualHra,
        salary_percentage: salaryPercentage,
        rent_minus_ten_percent: rentMinusTenPercent,
        hra_exempt: hraExempt,
        taxable_hra: taxableHra,
        ten_percent_total_salary: tenPercentTotalSalary,
        tax_savings: taxSavings
    };
}

function updateHRAResultsDisplay(result) {
    document.getElementById('hraExemptResult').textContent = formatHRACurrency(result.hra_exempt);
    document.getElementById('taxableHraResult').textContent = formatHRACurrency(result.taxable_hra);
    
    // Calculate and display tax savings (assuming 30% tax bracket)
    const taxSavings = result.hra_exempt * 0.30;
    document.getElementById('taxSavingsResult').textContent = formatHRACurrency(taxSavings);
    
    // Update chart summary
    document.getElementById('hraExemptDisplay').textContent = formatHRACurrency(result.hra_exempt);
    document.getElementById('taxableHraDisplay').textContent = formatHRACurrency(result.taxable_hra);
}

function updateHRAChart(result) {
    const ctx = document.getElementById('hraChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (hraChart) {
        hraChart.destroy();
    }
    
    const data = {
        labels: ['HRA Exempt', 'Taxable HRA'],
        datasets: [{
            data: [
                result.hra_exempt,
                result.taxable_hra
            ],
            backgroundColor: [
                '#48bb78',
                '#ed8936'
            ],
            borderWidth: 2,
            borderColor: '#ffffff'
        }]
    };
    
    hraChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                hraCenterText: {
                    display: true,
                    text: formatHRACurrency(result.hra_exempt)
                }
            },
            cutout: '60%'
        }
    });
}

function updateCalculationDetails(result) {
    // Update basic details
    document.getElementById('basicSalaryDetail').textContent = formatHRACurrency(result.basic_salary_annual);
    document.getElementById('daReceivedDetail').textContent = formatHRACurrency(result.da_received_annual);
    document.getElementById('totalSalaryDetail').textContent = formatHRACurrency(result.total_salary_annual);
    
    // Update HRA calculation details
    document.getElementById('actualHraDetail').textContent = formatHRACurrency(result.actual_hra);
    document.getElementById('salaryPercentageDetail').textContent = formatHRACurrency(result.salary_percentage);
    document.getElementById('rentMinusTenDetail').textContent = formatHRACurrency(result.rent_minus_ten_percent);
    document.getElementById('minimumExemptDetail').textContent = formatHRACurrency(result.hra_exempt);
}

function formatHRACurrency(amount) {
    // Format to Indian rupee format (₹1,59,384)
    const formatted = Math.round(amount).toLocaleString('en-IN');
    return '₹' + formatted;
}

function showHRAError(message) {
    // Create or update error message
    let errorDiv = document.getElementById('hraErrorMessage');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'hraErrorMessage';
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

function clearHRAError() {
    const errorDiv = document.getElementById('hraErrorMessage');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}

function setupHRAMegaMenu() {
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

function setupTooltips() {
    const tooltipIcons = document.querySelectorAll('.tooltip-icon');
    
    tooltipIcons.forEach(icon => {
        const label = icon.parentElement;
        const tooltipText = label.getAttribute('data-tooltip');
        
        if (tooltipText) {
            // Create tooltip element
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = tooltipText;
            tooltip.style.cssText = `
                position: absolute;
                background: #2d3748;
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 12px;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease;
                top: -40px;
                left: 50%;
                transform: translateX(-50%);
                max-width: 250px;
                white-space: normal;
                text-align: center;
                line-height: 1.4;
            `;
            
            // Position tooltip relative to label
            label.style.position = 'relative';
            label.appendChild(tooltip);
            
            // Show/hide tooltip on hover
            icon.addEventListener('mouseenter', function() {
                tooltip.style.opacity = '1';
            });
            
            icon.addEventListener('mouseleave', function() {
                tooltip.style.opacity = '0';
            });
        }
    });
}

function downloadHRAPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('HRA Calculator Report (Annual)', 20, 20);
    
    // Add current values
    doc.setFontSize(12);
    const basicSalaryAnnual = parseFloat(basicSalaryAnnualInput.value) || 0;
    const daReceivedAnnual = parseFloat(daReceivedAnnualInput.value) || 0;
    const hraReceivedAnnual = parseFloat(hraReceivedAnnualInput.value) || 0;
    const rentPaidAnnual = parseFloat(rentPaidAnnualInput.value) || 0;
    const cityType = cityTypeSelect.value;
    
    doc.text(`Basic Salary (Annual): ${formatHRACurrency(basicSalaryAnnual)}`, 20, 40);
    doc.text(`Dearness Allowance (Annual): ${formatHRACurrency(daReceivedAnnual)}`, 20, 50);
    doc.text(`Total Salary (Basic + DA): ${formatHRACurrency(basicSalaryAnnual + daReceivedAnnual)}`, 20, 60);
    doc.text(`HRA Received (Annual): ${formatHRACurrency(hraReceivedAnnual)}`, 20, 70);
    doc.text(`Rent Paid (Annual): ${formatHRACurrency(rentPaidAnnual)}`, 20, 80);
    doc.text(`City Type: ${cityType === 'metro' ? 'Metro (Delhi/Mumbai/Kolkata/Chennai)' : 'Non-Metro'}`, 20, 90);
    
    // Calculate results
    const result = calculateHRAClientSide(basicSalaryAnnual, daReceivedAnnual, hraReceivedAnnual, rentPaidAnnual, cityType);
    
    // Add calculation details
    doc.setFontSize(14);
    doc.text('HRA Exemption Calculation:', 20, 110);
    
    doc.setFontSize(10);
    doc.text(`1. Actual HRA Received: ${formatHRACurrency(result.actual_hra)}`, 30, 120);
    doc.text(`2. ${cityType === 'metro' ? '50%' : '40%'} of Basic Salary: ${formatHRACurrency(result.salary_percentage)}`, 30, 130);
    doc.text(`3. Rent - 10% of Total Salary: ${formatHRACurrency(result.rent_minus_ten_percent)}`, 30, 140);
    
    // Add results
    doc.setFontSize(12);
    doc.text(`HRA Exempt Amount: ${formatHRACurrency(result.hra_exempt)}`, 20, 160);
    doc.text(`Taxable HRA Amount: ${formatHRACurrency(result.taxable_hra)}`, 20, 170);
    doc.text(`Potential Tax Savings (30% bracket): ${formatHRACurrency(result.hra_exempt * 0.30)}`, 20, 180);
    
    // Add explanation
    doc.setFontSize(10);
    doc.text('Note: HRA exemption is the minimum of the three calculated values above.', 20, 200);
    doc.text('10% calculation is based on Total Salary (Basic + DA) as per Income Tax rules.', 20, 210);
    doc.text('Tax savings calculation assumes 30% tax bracket. Actual savings may vary.', 20, 220);
    doc.text('Consult a tax advisor for personalized advice.', 20, 230);
    
    // Save the PDF
    doc.save('hra-calculator-annual-report.pdf');
}

function shareHRAResults() {
    const basicSalaryAnnual = parseFloat(basicSalaryAnnualInput.value) || 0;
    const daReceivedAnnual = parseFloat(daReceivedAnnualInput.value) || 0;
    const hraReceivedAnnual = parseFloat(hraReceivedAnnualInput.value) || 0;
    const rentPaidAnnual = parseFloat(rentPaidAnnualInput.value) || 0;
    const cityType = cityTypeSelect.value;
    
    const result = calculateHRAClientSide(basicSalaryAnnual, daReceivedAnnual, hraReceivedAnnual, rentPaidAnnual, cityType);
    
    const shareText = `HRA Calculator Results (Annual):
💰 Basic Salary: ${formatHRACurrency(basicSalaryAnnual)}
📊 Dearness Allowance: ${formatHRACurrency(daReceivedAnnual)}
💼 Total Salary: ${formatHRACurrency(basicSalaryAnnual + daReceivedAnnual)}
🏠 HRA Received: ${formatHRACurrency(hraReceivedAnnual)}
🏘️ Rent Paid: ${formatHRACurrency(rentPaidAnnual)}
🌆 City Type: ${cityType === 'metro' ? 'Metro (Delhi/Mumbai/Kolkata/Chennai)' : 'Non-Metro'}

📊 Results:
✅ HRA Exempt: ${formatHRACurrency(result.hra_exempt)}
📈 Taxable HRA: ${formatHRACurrency(result.taxable_hra)}
💵 Tax Savings: ${formatHRACurrency(result.hra_exempt * 0.30)}

Calculate your HRA exemption: ${window.location.href}`;

    if (navigator.share) {
        navigator.share({
            title: 'HRA Calculator Results (Annual)',
            text: shareText,
        }).catch(console.error);
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(shareText).then(() => {
            // Show temporary notification
            const notification = document.createElement('div');
            notification.textContent = 'Results copied to clipboard!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #48bb78;
                color: white;
                padding: 12px 20px;
                border-radius: 6px;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            `;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 3000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            alert('Unable to share. Please copy the URL manually.');
        });
    }
}

// Utility function to format city type for display
function formatCityType(cityType) {
    return cityType === 'metro' ? 'Metro City' : 'Non-Metro City';
}

// Utility function to get exemption percentage
function getExemptionPercentage(cityType) {
    return cityType === 'metro' ? '50%' : '40%';
}