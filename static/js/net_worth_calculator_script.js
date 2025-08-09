// Net Worth Calculator JavaScript

// Global variables
let netWorthChart;
let netWorthSnapshot = [];

// Document ready
document.addEventListener('DOMContentLoaded', function() {
    initializeNetWorthCalculator();
    setupMegaMenu();
});

// Initialize calculator
function initializeNetWorthCalculator() {
    console.log('Initializing Net Worth Calculator...');
    
    // Set initial values to 0
    const inputs = document.querySelectorAll('input[type="number"]');
    inputs.forEach(input => {
        input.value = '0';
    });
    
    // Calculate initial net worth
    calculateNetWorth();
    
    // Create the chart
    console.log('Creating chart...');
    createNetWorthChart();
    console.log('Chart creation completed');
}

// Validate numeric input
function validateNetWorthInput(input) {
    const value = parseFloat(input.value) || 0;
    const container = input.parentElement;
    
    // Remove negative values
    if (value < 0) {
        input.value = '0';
        container.classList.add('error');
        setTimeout(() => container.classList.remove('error'), 1500);
        return;
    }
    
    // Format large numbers
    if (value > 0) {
        input.value = Math.round(value);
    }
    
    container.classList.remove('error');
}

// Calculate net worth
function calculateNetWorth() {
    // Get asset values
    const cashBank = getInputValue('cashBank');
    const investment = getInputValue('investment');
    const realEstate = getInputValue('realEstate');
    const vehicle = getInputValue('vehicle');
    const otherAssets = getInputValue('otherAssets');
    
    // Get liability values
    const homeLoan = getInputValue('homeLoan');
    const personalLoan = getInputValue('personalLoan');
    const creditCard = getInputValue('creditCard');
    const otherLiabilities = getInputValue('otherLiabilities');
    
    // Calculate totals
    const totalAssets = cashBank + investment + realEstate + vehicle + otherAssets;
    const totalLiabilities = homeLoan + personalLoan + creditCard + otherLiabilities;
    const netWorth = totalAssets - totalLiabilities;
    
    // Update results with animation
    updateNetWorthResults(totalAssets, totalLiabilities, netWorth);
    
    // Update chart
    updateNetWorthChart(totalAssets, totalLiabilities);
}

// Get input value safely
function getInputValue(inputType) {
    const input = document.getElementById(`${inputType}Amount`);
    return parseFloat(input.value) || 0;
}

// Update results display
function updateNetWorthResults(totalAssets, totalLiabilities, netWorth) {
    const totalAssetsElement = document.getElementById('totalAssetsResult');
    const totalLiabilitiesElement = document.getElementById('totalLiabilitiesResult');
    const netWorthElement = document.getElementById('netWorthResult');
    const summaryElement = document.getElementById('netWorthSummary');
    
    // Format and display values
    totalAssetsElement.textContent = formatCurrency(totalAssets);
    totalLiabilitiesElement.textContent = formatCurrency(totalLiabilities);
    netWorthElement.textContent = formatCurrency(netWorth);
    
    // Update chart summary
    document.getElementById('totalAssetsDisplay').textContent = formatCurrency(totalAssets);
    document.getElementById('totalLiabilitiesDisplay').textContent = formatCurrency(totalLiabilities);
    
    // Style net worth based on positive/negative
    netWorthElement.className = 'card-value';
    if (netWorth > 0) {
        netWorthElement.classList.add('positive');
    } else if (netWorth < 0) {
        netWorthElement.classList.add('negative');
    }
    
    // Update summary text
    const formattedNetWorth = formatCurrency(Math.abs(netWorth));
    if (netWorth >= 0) {
        summaryElement.textContent = `Your current net worth is ${formattedNetWorth}.`;
    } else {
        summaryElement.textContent = `Your current net worth is -${formattedNetWorth}. You have more liabilities than assets.`;
    }
    
    // Add animation effect
    addUpdateAnimation([totalAssetsElement, totalLiabilitiesElement, netWorthElement]);
}

// Add animation effect to elements
function addUpdateAnimation(elements) {
    elements.forEach(element => {
        const card = element.closest('.result-card');
        card.classList.add('updated');
        setTimeout(() => card.classList.remove('updated'), 400);
    });
}

// Format currency
function formatCurrency(amount) {
    if (amount === 0) return '₹0';
    
    const absAmount = Math.abs(amount);
    
    if (absAmount >= 10000000) { // 1 crore
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
    } else if (absAmount >= 100000) { // 1 lakh
        return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (absAmount >= 1000) { // 1 thousand
        return `₹${(amount / 1000).toFixed(1)}K`;
    } else {
        return `₹${amount.toLocaleString('en-IN')}`;
    }
}

// Create donut chart
function createNetWorthChart() {
    const canvas = document.getElementById('netWorthChart');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get 2D context');
        return;
    }
    
    // Destroy existing chart if it exists
    if (netWorthChart) {
        netWorthChart.destroy();
    }
    
    netWorthChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Total Assets', 'Total Liabilities'],
            datasets: [{
                data: [0, 0],
                backgroundColor: ['#10b981', '#ef4444'],
                borderColor: ['#059669', '#dc2626'],
                borderWidth: 2,
                cutout: '60%'
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
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${formatCurrency(value)} (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true,
                duration: 1000,
                easing: 'easeOutCubic'
            }
        }
    });
}

// Update chart data
function updateNetWorthChart(totalAssets, totalLiabilities) {
    if (!netWorthChart) {
        console.log('Chart not available, creating new one...');
        createNetWorthChart();
        return;
    }
    
    const total = totalAssets + totalLiabilities;
    
    if (total === 0) {
        netWorthChart.data.datasets[0].data = [0, 0];
    } else {
        netWorthChart.data.datasets[0].data = [totalAssets, totalLiabilities];
    }
    
    console.log('Updating chart with data:', [totalAssets, totalLiabilities]);
    netWorthChart.update('active');
}

// Download PDF functionality
function downloadNetWorthPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Get current values
        const totalAssets = parseFloat(document.getElementById('totalAssetsResult').textContent.replace(/[₹,KLCr]/g, ''));
        const totalLiabilities = parseFloat(document.getElementById('totalLiabilitiesResult').textContent.replace(/[₹,KLCr]/g, ''));
        const netWorth = parseFloat(document.getElementById('netWorthResult').textContent.replace(/[₹,KLCr]/g, ''));
        
        // PDF content
        doc.setFontSize(20);
        doc.text('Net Worth Calculator Report', 20, 30);
        
        doc.setFontSize(12);
        const date = new Date().toLocaleDateString('en-IN');
        doc.text(`Generated on: ${date}`, 20, 45);
        
        // Results section
        doc.setFontSize(16);
        doc.text('Financial Summary:', 20, 65);
        
        doc.setFontSize(12);
        doc.text(`Total Assets: ${document.getElementById('totalAssetsResult').textContent}`, 30, 80);
        doc.text(`Total Liabilities: ${document.getElementById('totalLiabilitiesResult').textContent}`, 30, 95);
        doc.text(`Net Worth: ${document.getElementById('netWorthResult').textContent}`, 30, 110);
        
        // Assets breakdown
        doc.setFontSize(14);
        doc.text('Assets Breakdown:', 20, 135);
        
        let yPos = 150;
        const assetTypes = [
            { key: 'cashBank', label: 'Cash & Bank Balances' },
            { key: 'investment', label: 'Investment Value' },
            { key: 'realEstate', label: 'Real Estate Value' },
            { key: 'vehicle', label: 'Vehicle / Personal Property' },
            { key: 'otherAssets', label: 'Other Assets' }
        ];
        
        doc.setFontSize(10);
        assetTypes.forEach(asset => {
            const value = getInputValue(asset.key);
            if (value > 0) {
                doc.text(`${asset.label}: ${formatCurrency(value)}`, 30, yPos);
                yPos += 12;
            }
        });
        
        // Liabilities breakdown
        yPos += 10;
        doc.setFontSize(14);
        doc.text('Liabilities Breakdown:', 20, yPos);
        yPos += 15;
        
        const liabilityTypes = [
            { key: 'homeLoan', label: 'Home Loan Outstanding' },
            { key: 'personalLoan', label: 'Personal / Car Loan' },
            { key: 'creditCard', label: 'Credit Card Balance' },
            { key: 'otherLiabilities', label: 'Other Liabilities' }
        ];
        
        doc.setFontSize(10);
        liabilityTypes.forEach(liability => {
            const value = getInputValue(liability.key);
            if (value > 0) {
                doc.text(`${liability.label}: ${formatCurrency(value)}`, 30, yPos);
                yPos += 12;
            }
        });
        
        // Save PDF
        doc.save('net-worth-report.pdf');
        
        // Show success message
        showNotification('PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    }
}

// Save snapshot functionality
function saveNetWorthSnapshot() {
    const snapshot = {
        date: new Date().toISOString(),
        totalAssets: parseFloat(document.getElementById('totalAssetsResult').textContent.replace(/[₹,KLCr]/g, '')) || 0,
        totalLiabilities: parseFloat(document.getElementById('totalLiabilitiesResult').textContent.replace(/[₹,KLCr]/g, '')) || 0,
        netWorth: parseFloat(document.getElementById('netWorthResult').textContent.replace(/[₹,KLCr]/g, '')) || 0,
        assets: {
            cashBank: getInputValue('cashBank'),
            investment: getInputValue('investment'),
            realEstate: getInputValue('realEstate'),
            vehicle: getInputValue('vehicle'),
            otherAssets: getInputValue('otherAssets')
        },
        liabilities: {
            homeLoan: getInputValue('homeLoan'),
            personalLoan: getInputValue('personalLoan'),
            creditCard: getInputValue('creditCard'),
            otherLiabilities: getInputValue('otherLiabilities')
        }
    };
    
    // Save to localStorage
    let snapshots = JSON.parse(localStorage.getItem('netWorthSnapshots')) || [];
    snapshots.push(snapshot);
    
    // Keep only last 10 snapshots
    if (snapshots.length > 10) {
        snapshots = snapshots.slice(-10);
    }
    
    localStorage.setItem('netWorthSnapshots', JSON.stringify(snapshots));
    
    showNotification('Snapshot saved successfully!', 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        backgroundColor: type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3182ce',
        color: 'white',
        borderRadius: '6px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        fontSize: '14px',
        fontWeight: '500',
        maxWidth: '300px',
        animation: 'slideInRight 0.3s ease'
    });
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Setup mega menu functionality
function setupMegaMenu() {
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
        
        // Close menu when pressing Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                megaMenu.classList.remove('open');
            }
        });
    }
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    // Enter key to calculate
    if (e.key === 'Enter' && e.target.type === 'number') {
        calculateNetWorth();
    }
    
    // Ctrl+S to save snapshot
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveNetWorthSnapshot();
    }
    
    // Ctrl+D to download PDF
    if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        downloadNetWorthPDF();
    }
});

// Input formatting on focus and blur
document.addEventListener('DOMContentLoaded', function() {
    const numberInputs = document.querySelectorAll('input[type="number"]');
    
    numberInputs.forEach(input => {
        input.addEventListener('focus', function() {
            if (this.value === '0') {
                this.value = '';
            }
        });
        
        input.addEventListener('blur', function() {
            if (this.value === '' || isNaN(this.value)) {
                this.value = '0';
                calculateNetWorth();
            }
        });
        
        // Real-time calculation on input
        input.addEventListener('input', function() {
            validateNetWorthInput(this);
        });
    });
});

// Export functions for global access
window.validateNetWorthInput = validateNetWorthInput;
window.calculateNetWorth = calculateNetWorth;
window.downloadNetWorthPDF = downloadNetWorthPDF;
window.saveNetWorthSnapshot = saveNetWorthSnapshot;
