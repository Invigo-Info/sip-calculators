document.addEventListener('DOMContentLoaded', function() {
            // Wait a moment to ensure all other scripts have loaded
            setTimeout(function() {
                const megaMenuBtn = document.querySelector('.mega-menu-btn');
                const megaMenu = document.querySelector('.mega-menu');
                const megaMenuContent = document.querySelector('.mega-menu-content');
                
                console.log('=== NAVIGATION DEBUG ===');
                console.log('Button found:', !!megaMenuBtn);
                console.log('Menu container found:', !!megaMenu);
                console.log('Menu content found:', !!megaMenuContent);
                
                if (megaMenuBtn && megaMenu) {
                    // Remove any existing event listeners
                    const newBtn = megaMenuBtn.cloneNode(true);
                    megaMenuBtn.parentNode.replaceChild(newBtn, megaMenuBtn);
                    
                    // Add fresh event listener
                    newBtn.addEventListener('click', function(e) {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        console.log('=== BUTTON CLICKED ===');
                        console.log('Before toggle - has open class:', megaMenu.classList.contains('open'));
                        
                        // Force toggle the class
                        if (megaMenu.classList.contains('open')) {
                            megaMenu.classList.remove('open');
                            console.log('Removed open class');
                        } else {
                            megaMenu.classList.add('open');
                            console.log('Added open class');
                        }
                        
                        console.log('After toggle - has open class:', megaMenu.classList.contains('open'));
                        console.log('Menu content display style:', window.getComputedStyle(megaMenuContent).display);
                    });
                    
                    // Close on outside click
                    document.addEventListener('click', function(e) {
                        if (!megaMenu.contains(e.target)) {
                            megaMenu.classList.remove('open');
                            console.log('Closed menu via outside click');
                        }
                    });
                    
                    console.log('Navigation initialized successfully!');
                } else {
                    console.error('Navigation elements not found!');
                }
            }, 100);
        });