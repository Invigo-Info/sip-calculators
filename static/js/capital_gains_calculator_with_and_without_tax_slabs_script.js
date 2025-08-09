// Capital Gains Calculator Script

// Global variables for chart
let cgChart = null;

// Cost Inflation Index data (CII)
const costInflationIndex = {
    2001: 100, 2002: 105, 2003: 109, 2004: 113, 2005: 117, 2006: 122, 2007: 129,
    2008: 137, 2009: 148, 2010: 167, 2011: 184, 2012: 200, 2013: 220, 2014: 240,
    2015: 254, 2016: 264, 2017: 272, 2018: 280, 2019: 289, 2020: 301, 2021: 317,
    2022: 331, 2023: 348, 2024: 363, 2025: 380 // Estimated for 2025
};

// Initialize calculator when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCapitalGainsCalculator();
    calculateCapitalGains();
});

function initializeCapitalGainsCalculator() {
    // Bind event listeners
    bindCapitalGainsEventListeners();
    
    // Initialize mega menu
    initializeMegaMenu();
    
    // Set default dates
    setDefaultDates();
    
    // Initial asset type check
    handleAssetTypeChange();
    
    // Initial tax mode check
    handleTaxModeChange();
}

function bindCapitalGainsEventListeners() {
    // Input change listeners
    const inputs = [
        'cgTaxMode', 'cgAssetType', 'cgPurchaseDate', 'cgSaleDate',
        'cgPurchaseValue', 'cgSaleValue', 'cgTransferCosts', 'cgImprovementCost',
        'cgExemptionAmount', 'cgAnnualIncome', 'cgApplyCess', 'cgApplySurcharge'
    ];
    
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('change', calculateCapitalGains);
            element.addEventListener('input', debounce(calculateCapitalGains, 300));
        }
    });
    
    // Slider synchronization
    setupSliderSync('cgPurchaseValue', 'cgPurchaseValueSlider');
    setupSliderSync('cgSaleValue', 'cgSaleValueSlider');
    setupSliderSync('cgTransferCosts', 'cgTransferCostsSlider');
    setupSliderSync('cgImprovementCost', 'cgImprovementCostSlider');
    setupSliderSync('cgExemptionAmount', 'cgExemptionAmountSlider');
    setupSliderSync('cgAnnualIncome', 'cgAnnualIncomeSlider');
    
    // Special handlers
    document.getElementById('cgAssetType').addEventListener('change', handleAssetTypeChange);
    document.getElementById('cgTaxMode').addEventListener('change', handleTaxModeChange);
}

function setupSliderSync(inputId, sliderId) {
    const input = document.getElementById(inputId);
    const slider = document.getElementById(sliderId);
    
    if (input && slider) {
        input.addEventListener('input', () => {
            slider.value = input.value;
            calculateCapitalGains();
        });
        
        slider.addEventListener('input', () => {
            input.value = slider.value;
            calculateCapitalGains();
        });
    }
}

function handleAssetTypeChange() {
    const assetType = document.getElementById('cgAssetType').value;
    const improvementGroup = document.getElementById('cgImprovementCostGroup');
    const exemptionsGroup = document.getElementById('cgExemptionsGroup');
    
    // Show improvement cost for property and unlisted shares
    if (assetType === 'property' || assetType === 'unlisted_share') {
        improvementGroup.style.display = 'flex';
    } else {
        improvementGroup.style.display = 'none';
        document.getElementById('cgImprovementCost').value = 0;
        document.getElementById('cgImprovementCostSlider').value = 0;
    }
    
    // Show exemptions for property
    if (assetType === 'property') {
        exemptionsGroup.style.display = 'flex';
    } else {
        exemptionsGroup.style.display = 'none';
        document.getElementById('cgExemptionAmount').value = 0;
        document.getElementById('cgExemptionAmountSlider').value = 0;
    }
    
    calculateCapitalGains();
}

function handleTaxModeChange() {
    const taxMode = document.getElementById('cgTaxMode').value;
    const annualIncomeGroup = document.getElementById('cgAnnualIncomeGroup');
    
    if (taxMode === 'with_slab') {
        annualIncomeGroup.style.display = 'flex';
    } else {
        annualIncomeGroup.style.display = 'none';
        document.getElementById('cgAnnualIncome').value = 0;
        document.getElementById('cgAnnualIncomeSlider').value = 0;
    }
    
    calculateCapitalGains();
}

function setDefaultDates() {
    const today = new Date();
    const fourYearsAgo = new Date(today.getFullYear() - 4, today.getMonth(), today.getDate());
    
    document.getElementById('cgPurchaseDate').value = fourYearsAgo.toISOString().split('T')[0];
    document.getElementById('cgSaleDate').value = today.toISOString().split('T')[0];
}

function calculateCapitalGains() {
    try {
        const inputs = getCapitalGainsInputs();
        const results = computeCapitalGains(inputs);
        updateCapitalGainsResults(results);
        updateCapitalGainsChart(results);
        updateCapitalGainsTable(results);
    } catch (error) {
        console.error('Error calculating capital gains:', error);
    }
}

function getCapitalGainsInputs() {
    return {
        taxMode: document.getElementById('cgTaxMode').value,
        assetType: document.getElementById('cgAssetType').value,
        purchaseDate: new Date(document.getElementById('cgPurchaseDate').value),
        saleDate: new Date(document.getElementById('cgSaleDate').value),
        purchaseValue: parseFloat(document.getElementById('cgPurchaseValue').value) || 0,
        saleValue: parseFloat(document.getElementById('cgSaleValue').value) || 0,
        transferCosts: parseFloat(document.getElementById('cgTransferCosts').value) || 0,
        improvementCost: parseFloat(document.getElementById('cgImprovementCost').value) || 0,
        exemptionAmount: parseFloat(document.getElementById('cgExemptionAmount').value) || 0,
        annualIncome: parseFloat(document.getElementById('cgAnnualIncome').value) || 0,
        applyCess: document.getElementById('cgApplyCess').checked,
        applySurcharge: document.getElementById('cgApplySurcharge').checked
    };
}

function computeCapitalGains(inputs) {
    // Calculate holding period
    const holdingDays = Math.ceil((inputs.saleDate - inputs.purchaseDate) / (1000 * 60 * 60 * 24));
    
    // Determine STCG/LTCG based on asset type and holding period
    const isLongTerm = determineIfLongTerm(inputs.assetType, holdingDays);
    
    // Calculate base cost (with indexation if applicable)
    const baseCost = calculateBaseCost(inputs, isLongTerm);
    
    // Calculate net consideration
    const netConsideration = inputs.saleValue - inputs.transferCosts;
    
    // Calculate gain
    const gain = Math.max(0, netConsideration - baseCost - inputs.improvementCost);
    
    // Apply asset-specific exemptions and calculate taxable gain
    const exemptionDetails = calculateExemptions(inputs, gain, isLongTerm);
    const taxableGain = Math.max(0, gain - exemptionDetails.totalExemption);
    
    // Calculate tax
    const taxDetails = calculateTax(inputs, taxableGain, isLongTerm);
    
    // Calculate effective rate
    const effectiveRate = gain > 0 ? (taxDetails.totalTax / gain) * 100 : 0;
    
    return {
        holdingDays,
        isLongTerm,
        gain,
        exemptionDetails,
        taxableGain,
        baseCost,
        netConsideration,
        taxDetails,
        effectiveRate,
        afterTaxGain: gain - taxDetails.totalTax
    };
}

function determineIfLongTerm(assetType, holdingDays) {
    switch (assetType) {
        case 'equity_share':
        case 'equity_mf':
            return holdingDays >= 365;
        case 'property':
            return holdingDays >= 730; // 24 months
        case 'debt_mf':
        case 'gold':
        case 'unlisted_share':
            return holdingDays >= 1095; // 36 months
        case 'crypto':
            return false; // No LTCG for crypto
        default:
            return holdingDays >= 1095;
    }
}

function calculateBaseCost(inputs, isLongTerm) {
    // Check if indexation applies
    const indexationApplies = shouldApplyIndexation(inputs.assetType, isLongTerm);
    
    if (!indexationApplies) {
        return inputs.purchaseValue;
    }
    
    // Apply indexation
    const purchaseYear = inputs.purchaseDate.getFullYear();
    const saleYear = inputs.saleDate.getFullYear();
    
    const purchaseCII = costInflationIndex[purchaseYear] || costInflationIndex[2001];
    const saleCII = costInflationIndex[saleYear] || costInflationIndex[2024];
    
    return inputs.purchaseValue * (saleCII / purchaseCII);
}

function shouldApplyIndexation(assetType, isLongTerm) {
    if (!isLongTerm) return false;
    
    switch (assetType) {
        case 'property':
        case 'gold':
        case 'unlisted_share':
            return true;
        case 'debt_mf':
            // Post April 1, 2023, debt MF gains are taxed as per slab without indexation
            return false;
        default:
            return false;
    }
}

function calculateExemptions(inputs, gain, isLongTerm) {
    let exemption = 0;
    let exemptionType = '';
    
    if (inputs.assetType === 'equity_share' || inputs.assetType === 'equity_mf') {
        if (isLongTerm) {
            // Check if sale date is after July 23, 2024
            const newTaxRegimeDate = new Date('2024-07-23');
            if (inputs.saleDate >= newTaxRegimeDate) {
                exemption = Math.min(gain, 125000); // ₹1.25L exemption
                exemptionType = 'LTCG Exemption (Post Jul-23, 2024): ₹1.25L';
            } else {
                exemption = Math.min(gain, 100000); // ₹1L exemption
                exemptionType = 'LTCG Exemption (Pre Jul-23, 2024): ₹1L';
            }
        }
    }
    
    // Add Section 54/54F/54EC exemptions for property
    let sectionExemption = 0;
    if (inputs.assetType === 'property' && inputs.exemptionAmount > 0) {
        sectionExemption = Math.min(inputs.exemptionAmount, gain - exemption);
        exemptionType += (exemptionType ? ' + ' : '') + `Section 54/54F/54EC: ₹${formatIndianNumber(sectionExemption)}`;
    }
    
    return {
        ltcgExemption: exemption,
        sectionExemption: sectionExemption,
        totalExemption: exemption + sectionExemption,
        exemptionType: exemptionType || 'No exemptions applicable'
    };
}

function calculateTax(inputs, taxableGain, isLongTerm) {
    if (taxableGain <= 0) {
        return {
            baseTax: 0,
            cess: 0,
            surcharge: 0,
            totalTax: 0,
            taxRate: '0%',
            explanation: 'No tax as taxable gain is zero or negative'
        };
    }
    
    let taxRate = 0;
    let taxRateText = '';
    let baseTax = 0;
    let explanation = '';
    
    // Calculate tax based on asset type and holding period
    if (inputs.assetType === 'crypto') {
        taxRate = 30;
        taxRateText = '30%';
        baseTax = taxableGain * 0.30;
        explanation = 'Crypto (VDA) gains taxed at flat 30%';
    } else if (isLongTerm) {
        switch (inputs.assetType) {
            case 'equity_share':
            case 'equity_mf':
                const newTaxRegimeDate = new Date('2024-07-23');
                if (inputs.saleDate >= newTaxRegimeDate) {
                    taxRate = 12.5;
                    taxRateText = '12.5%';
                    baseTax = taxableGain * 0.125;
                    explanation = 'Equity LTCG taxed at 12.5% (post Jul-23, 2024)';
                } else {
                    taxRate = 10;
                    taxRateText = '10%';
                    baseTax = taxableGain * 0.10;
                    explanation = 'Equity LTCG taxed at 10% (pre Jul-23, 2024)';
                }
                break;
            case 'property':
            case 'gold':
            case 'unlisted_share':
                taxRate = 20;
                taxRateText = '20%';
                baseTax = taxableGain * 0.20;
                explanation = `${getAssetName(inputs.assetType)} LTCG taxed at 20% with indexation`;
                break;
            case 'debt_mf':
                if (inputs.taxMode === 'with_slab') {
                    const slabTax = calculateSlabTax(inputs.annualIncome + taxableGain) - calculateSlabTax(inputs.annualIncome);
                    baseTax = slabTax;
                    taxRateText = 'Slab rates';
                    explanation = 'Debt MF LTCG taxed as per income tax slabs (post Apr-2023)';
                } else {
                    // Assume average 20% rate for simplification
                    taxRate = 20;
                    taxRateText = '~20% (Slab)';
                    baseTax = taxableGain * 0.20;
                    explanation = 'Debt MF LTCG taxed as per income tax slabs';
                }
                break;
        }
    } else {
        // STCG
        switch (inputs.assetType) {
            case 'equity_share':
            case 'equity_mf':
                const newTaxRegimeDate = new Date('2024-07-23');
                if (inputs.saleDate >= newTaxRegimeDate) {
                    taxRate = 20;
                    taxRateText = '20%';
                    baseTax = taxableGain * 0.20;
                    explanation = 'Equity STCG taxed at 20% (post Jul-23, 2024)';
                } else {
                    taxRate = 15;
                    taxRateText = '15%';
                    baseTax = taxableGain * 0.15;
                    explanation = 'Equity STCG taxed at 15% (pre Jul-23, 2024)';
                }
                break;
            default:
                if (inputs.taxMode === 'with_slab') {
                    const slabTax = calculateSlabTax(inputs.annualIncome + taxableGain) - calculateSlabTax(inputs.annualIncome);
                    baseTax = slabTax;
                    taxRateText = 'Slab rates';
                    explanation = 'STCG taxed as per income tax slabs';
                } else {
                    // Assume average 20% rate for simplification
                    taxRate = 20;
                    taxRateText = '~20% (Slab)';
                    baseTax = taxableGain * 0.20;
                    explanation = 'STCG taxed as per income tax slabs';
                }
                break;
        }
    }
    
    // Calculate cess and surcharge
    let cess = 0;
    let surcharge = 0;
    
    if (inputs.applyCess) {
        cess = baseTax * 0.04; // 4% cess
    }
    
    if (inputs.applySurcharge) {
        // Simplified surcharge calculation (10% if total income > 50L)
        const totalIncome = inputs.annualIncome + taxableGain;
        if (totalIncome > 5000000) {
            surcharge = baseTax * 0.10;
        }
    }
    
    const totalTax = baseTax + cess + surcharge;
    
    return {
        baseTax,
        cess,
        surcharge,
        totalTax,
        taxRate: taxRateText,
        explanation
    };
}

function calculateSlabTax(income) {
    // New tax regime slabs (2024-25)
    if (income <= 300000) return 0;
    if (income <= 700000) return (income - 300000) * 0.05;
    if (income <= 1000000) return 20000 + (income - 700000) * 0.10;
    if (income <= 1200000) return 50000 + (income - 1000000) * 0.15;
    if (income <= 1500000) return 80000 + (income - 1200000) * 0.20;
    return 140000 + (income - 1500000) * 0.30;
}

function getAssetName(assetType) {
    const names = {
        'equity_share': 'Equity Share',
        'equity_mf': 'Equity MF',
        'debt_mf': 'Debt MF',
        'gold': 'Gold',
        'property': 'Property',
        'unlisted_share': 'Unlisted Share',
        'crypto': 'Crypto (VDA)'
    };
    return names[assetType] || assetType;
}

function updateCapitalGainsResults(results) {
    // Update holding period
    document.getElementById('cgHoldingPeriodResult').textContent = `${results.holdingDays.toLocaleString()} days`;
    document.getElementById('cgHoldingTypeResult').textContent = results.isLongTerm ? 'LTCG' : 'STCG';
    
    // Update gains
    document.getElementById('cgNetGainResult').textContent = formatCurrency(results.gain);
    document.getElementById('cgTaxableGainResult').textContent = formatCurrency(results.taxableGain);
    
    // Update tax details
    document.getElementById('cgTaxRateResult').textContent = results.taxDetails.taxRate;
    document.getElementById('cgTaxResult').textContent = formatCurrency(results.taxDetails.totalTax);
    document.getElementById('cgEffectiveRateResult').textContent = `${results.effectiveRate.toFixed(2)}%`;
    
    // Update explanation
    document.getElementById('cgExplanationContent').textContent = results.taxDetails.explanation;
    
    // Update chart summary
    document.getElementById('cgNetGainDisplay').textContent = formatCurrency(results.gain);
    document.getElementById('cgTaxDisplay').textContent = formatCurrency(results.taxDetails.totalTax);
    document.getElementById('cgAfterTaxGainDisplay').textContent = formatCurrency(results.afterTaxGain);
}

function updateCapitalGainsChart(results) {
    const ctx = document.getElementById('cgChart').getContext('2d');
    
    if (cgChart) {
        cgChart.destroy();
    }
    
    const data = {
        labels: ['After-tax Gain', 'Capital Gains Tax'],
        datasets: [{
            data: [results.afterTaxGain, results.taxDetails.totalTax],
            backgroundColor: ['#43e97b', '#fa709a'],
            borderWidth: 0
        }]
    };
    
    const options = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const value = formatCurrency(context.raw);
                        const percentage = ((context.raw / results.gain) * 100).toFixed(1);
                        return `${context.label}: ${value} (${percentage}%)`;
                    }
                }
            }
        }
    };
    
    cgChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        options: options
    });
}

function updateCapitalGainsTable(results) {
    const tbody = document.getElementById('cgDetailsTableBody');
    if (!tbody) return;
    
    const inputs = getCapitalGainsInputs();
    
    const tableData = [
        { parameter: 'Purchase Value', value: formatCurrency(inputs.purchaseValue), description: 'Original purchase price' },
        { parameter: 'Sale Value', value: formatCurrency(inputs.saleValue), description: 'Sale price received' },
        { parameter: 'Transfer Costs', value: formatCurrency(inputs.transferCosts), description: 'Brokerage and other selling costs' },
        { parameter: 'Improvement Cost', value: formatCurrency(inputs.improvementCost), description: 'Cost of improvements made' },
        { parameter: 'Base Cost', value: formatCurrency(results.baseCost), description: results.baseCost > inputs.purchaseValue ? 'Purchase value with indexation' : 'Purchase value (no indexation)' },
        { parameter: 'Net Consideration', value: formatCurrency(results.netConsideration), description: 'Sale value minus transfer costs' },
        { parameter: 'Gross Gain', value: formatCurrency(results.gain), description: 'Net consideration minus base cost and improvement cost' },
        { parameter: 'Exemptions Applied', value: formatCurrency(results.exemptionDetails.totalExemption), description: results.exemptionDetails.exemptionType },
        { parameter: 'Taxable Gain', value: formatCurrency(results.taxableGain), description: 'Gain after applying exemptions' },
        { parameter: 'Base Tax', value: formatCurrency(results.taxDetails.baseTax), description: `Tax at ${results.taxDetails.taxRate}` },
        { parameter: 'Cess (4%)', value: formatCurrency(results.taxDetails.cess), description: 'Health and Education Cess' },
        { parameter: 'Surcharge', value: formatCurrency(results.taxDetails.surcharge), description: 'Surcharge if applicable' },
        { parameter: 'Total Tax', value: formatCurrency(results.taxDetails.totalTax), description: 'Base tax + cess + surcharge' },
        { parameter: 'After-tax Gain', value: formatCurrency(results.afterTaxGain), description: 'Gain after paying tax' }
    ];
    
    tbody.innerHTML = '';
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.parameter}</strong></td>
            <td>${row.value}</td>
            <td>${row.description}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Utility functions
function formatCurrency(amount) {
    return '₹' + formatIndianNumber(Math.round(amount));
}

function formatIndianNumber(num) {
    return num.toLocaleString('en-IN');
}

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

// Mega menu functionality
function initializeMegaMenu() {
    const megaMenuBtn = document.querySelector('.mega-menu-btn');
    const megaMenu = document.querySelector('.mega-menu');
    
    if (megaMenuBtn && megaMenu) {
        megaMenuBtn.addEventListener('click', () => {
            megaMenu.classList.toggle('open');
        });
        
        // Close mega menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!megaMenu.contains(e.target)) {
                megaMenu.classList.remove('open');
            }
        });
    }
}

// Action button functions
function downloadCapitalGainsPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const inputs = getCapitalGainsInputs();
        const results = computeCapitalGains(inputs);
        
        // Add title
        doc.setFontSize(20);
        doc.text('Capital Gains Tax Report', 20, 30);
        
        // Add calculation details
        doc.setFontSize(12);
        let yPos = 50;
        
        const details = [
            `Asset Type: ${getAssetName(inputs.assetType)}`,
            `Purchase Date: ${inputs.purchaseDate.toDateString()}`,
            `Sale Date: ${inputs.saleDate.toDateString()}`,
            `Holding Period: ${results.holdingDays} days (${results.isLongTerm ? 'LTCG' : 'STCG'})`,
            `Purchase Value: ${formatCurrency(inputs.purchaseValue)}`,
            `Sale Value: ${formatCurrency(inputs.saleValue)}`,
            `Net Gain: ${formatCurrency(results.gain)}`,
            `Taxable Gain: ${formatCurrency(results.taxableGain)}`,
            `Tax Rate: ${results.taxDetails.taxRate}`,
            `Capital Gains Tax: ${formatCurrency(results.taxDetails.totalTax)}`,
            `Effective Tax Rate: ${results.effectiveRate.toFixed(2)}%`,
            `After-tax Gain: ${formatCurrency(results.afterTaxGain)}`
        ];
        
        details.forEach(detail => {
            doc.text(detail, 20, yPos);
            yPos += 10;
        });
        
        // Add explanation
        yPos += 10;
        doc.text('Explanation:', 20, yPos);
        yPos += 10;
        doc.text(results.taxDetails.explanation, 20, yPos, { maxWidth: 170 });
        
        doc.save('capital-gains-report.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again.');
    }
}

function toggleCapitalGainsTable() {
    const tableSection = document.getElementById('cgTableSection');
    const button = document.querySelector('.table-btn');
    
    if (tableSection.classList.contains('hidden')) {
        tableSection.classList.remove('hidden');
        button.innerHTML = '<span class="btn-icon">📊</span>Hide Details';
    } else {
        tableSection.classList.add('hidden');
        button.innerHTML = '<span class="btn-icon">📊</span>View Details';
    }
}
