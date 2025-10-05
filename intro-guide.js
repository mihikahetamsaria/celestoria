
// Intro Guide System for Celestoria
class IntroGuide {
    constructor() {
        this.currentStep = 0;
        this.steps = [
            {
                title: "Welcome to CELESTORIA",
                text: "Your advanced orbital mechanics simulator. Let's take a quick tour of the main features!",
                highlight: null,
                position: "center"
            },
            {
                title: "Sidebar Navigation",
                text: "Click these icons to access different panels: Simulation Controls, Deflection Methods, Asteroid Explorer, Physics Settings, and Orbit Sandbox.",
                highlight: "#sidebar",
                position: "right"
            },
            {
                title: "Asteroid Explorer",
                text: "Browse and select from 100 real asteroids. Click on any asteroid name to select it and view detailed information.",
                highlight: "[data-panel='asteroids']",
                position: "right",
                action: () => {
                    document.querySelector("[data-panel='asteroids']")?.click();
                }
            },
            {
                title: "Simulation Controls",
                text: "Control time warp speed to see orbital motion unfold. Adjust from 1 day/second up to 10 years/second!",
                highlight: "[data-panel='controls']",
                position: "right",
                action: () => {
                    document.querySelector("[data-panel='controls']")?.click();
                }
            },
            {
                title: "Orbit Sandbox",
                text: "Modify asteroid orbits by adjusting Semi-major Axis, Eccentricity, and Inclination. Watch for Earth-crossing warnings!",
                highlight: "[data-panel='orbital']",
                position: "right",
                action: () => {
                    document.querySelector("[data-panel='orbital']")?.click();
                }
            },
            {
                title: "Deflection Methods",
                text: "Test asteroid deflection techniques! Use kinetic impactors or surface alteration to change an asteroid's trajectory.",
                highlight: "[data-panel='mitigation']",
                position: "right",
                action: () => {
                    document.querySelector("[data-panel='mitigation']")?.click();
                }
            },
            {
                title: "Interactive 3D View",
                text: "Click and drag to rotate the view. Scroll to zoom in/out. Click on asteroids to select them directly!",
                highlight: "canvas",
                position: "center"
            },
            {
                title: "Ready to Explore!",
                text: "You're all set! Select an asteroid, adjust its orbit, or try the 'Crash on Earth' feature to test deflection missions. Have fun exploring!",
                highlight: null,
                position: "center"
            }
        ];
        
        this.overlay = null;
        this.tooltip = null;
        this.init();
    }
    
    init() {
        this.createOverlay();
        this.createTooltip();
        this.addStyles();
        
        // Check if user has seen the guide before
        if (!localStorage.getItem('celestoria_guide_completed')) {
            setTimeout(() => this.start(), 1000);
        }
        
        // Add a button to restart the guide
        this.addRestartButton();
    }
    
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.id = 'intro-overlay';
        this.overlay.style.display = 'none';
        document.body.appendChild(this.overlay);
    }
    
    createTooltip() {
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'intro-tooltip';
        this.tooltip.innerHTML = `
            <div class="tooltip-header">
                <h3 id="tooltip-title"></h3>
                <span id="tooltip-step"></span>
            </div>
            <p id="tooltip-text"></p>
            <div class="tooltip-buttons">
                <button id="tooltip-skip">Skip Tour</button>
                <button id="tooltip-next">Next</button>
            </div>
        `;
        this.tooltip.style.display = 'none';
        document.body.appendChild(this.tooltip);
        
        document.getElementById('tooltip-skip').addEventListener('click', () => this.skip());
        document.getElementById('tooltip-next').addEventListener('click', () => this.next());
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #intro-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                z-index: 9998;
                pointer-events: none;
            }
            
            .intro-highlight {
                position: relative;
                z-index: 9999 !important;
                box-shadow: 0 0 0 5px rgba(79, 195, 247, 0.5), 0 0 30px rgba(79, 195, 247, 0.8) !important;
                pointer-events: auto;
            }
            
            #intro-tooltip {
                position: fixed;
                background: linear-gradient(180deg, rgba(15, 15, 35, 0.98) 0%, rgba(10, 10, 25, 0.98) 100%);
                border: 2px solid #4fc3f7;
                border-radius: 12px;
                padding: 25px;
                max-width: 400px;
                z-index: 10000;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
            }
            
            .tooltip-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            #tooltip-title {
                color: #4fc3f7;
                font-size: 20px;
                margin: 0;
                font-weight: 700;
            }
            
            #tooltip-step {
                color: #81d4fa;
                font-size: 14px;
                font-weight: 600;
            }
            
            #tooltip-text {
                color: #e0e0e0;
                line-height: 1.6;
                margin-bottom: 20px;
                font-size: 14px;
            }
            
            .tooltip-buttons {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
            }
            
            .tooltip-buttons button {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                font-weight: 600;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            #tooltip-skip {
                background: rgba(255, 255, 255, 0.1);
                color: #81d4fa;
                border: 1px solid rgba(79, 195, 247, 0.3);
            }
            
            #tooltip-skip:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            #tooltip-next {
                background: linear-gradient(135deg, #4fc3f7, #2196f3);
                color: #000;
                box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
            }
            
            #tooltip-next:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(79, 195, 247, 0.5);
            }
            
            #restart-guide-btn {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #4fc3f7, #2196f3);
                color: #000;
                border: none;
                border-radius: 50%;
                width: 50px;
                height: 50px;
                font-size: 20px;
                cursor: pointer;
                box-shadow: 0 4px 15px rgba(79, 195, 247, 0.3);
                transition: all 0.3s;
                z-index: 100;
            }
            
            #restart-guide-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 20px rgba(79, 195, 247, 0.5);
            }
        `;
        document.head.appendChild(style);
    }
    
    addRestartButton() {
        const btn = document.createElement('button');
        btn.id = 'restart-guide-btn';
        btn.innerHTML = '?';
        btn.title = 'Restart Guide';
        btn.addEventListener('click', () => this.start());
        document.body.appendChild(btn);
    }
    
    start() {
        this.currentStep = 0;
        this.showStep();
    }
    
    showStep() {
        const step = this.steps[this.currentStep];
        
        // Clear previous highlights
        document.querySelectorAll('.intro-highlight').forEach(el => {
            el.classList.remove('intro-highlight');
        });
        
        // Show overlay
        this.overlay.style.display = 'block';
        
        // Execute step action if any
        if (step.action) {
            step.action();
        }
        
        // Update tooltip content
        document.getElementById('tooltip-title').textContent = step.title;
        document.getElementById('tooltip-text').textContent = step.text;
        document.getElementById('tooltip-step').textContent = `${this.currentStep + 1}/${this.steps.length}`;
        
        // Update button text for last step
        const nextBtn = document.getElementById('tooltip-next');
        nextBtn.textContent = this.currentStep === this.steps.length - 1 ? 'Finish' : 'Next';
        
        // Position tooltip and highlight element
        this.positionTooltip(step);
        
        // Show tooltip
        this.tooltip.style.display = 'block';
    }
    
    positionTooltip(step) {
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.classList.add('intro-highlight');
                
                const rect = element.getBoundingClientRect();
                
                if (step.position === 'right') {
                    this.tooltip.style.left = `${rect.right + 20}px`;
                    this.tooltip.style.top = `${rect.top + (rect.height / 2) - 100}px`;
                } else if (step.position === 'bottom') {
                    this.tooltip.style.left = `${rect.left + (rect.width / 2) - 200}px`;
                    this.tooltip.style.top = `${rect.bottom + 20}px`;
                } else {
                    // center
                    this.tooltip.style.left = '50%';
                    this.tooltip.style.top = '50%';
                    this.tooltip.style.transform = 'translate(-50%, -50%)';
                }
            }
        } else {
            // Center position
            this.tooltip.style.left = '50%';
            this.tooltip.style.top = '50%';
            this.tooltip.style.transform = 'translate(-50%, -50%)';
        }
    }
    
    next() {
        if (this.currentStep < this.steps.length - 1) {
            this.currentStep++;
            this.showStep();
        } else {
            this.finish();
        }
    }
    
    skip() {
        this.finish();
    }
    
    finish() {
        // Clear highlights
        document.querySelectorAll('.intro-highlight').forEach(el => {
            el.classList.remove('intro-highlight');
        });
        
        // Hide overlay and tooltip
        this.overlay.style.display = 'none';
        this.tooltip.style.display = 'none';
        
        // Mark guide as completed
        localStorage.setItem('celestoria_guide_completed', 'true');
        
        // Close any open panels
        document.querySelectorAll('.side-panel').forEach(p => p.classList.remove('open'));
        document.querySelectorAll('.sidebar-icon').forEach(i => i.classList.remove('active'));
    }
}

// Initialize the guide when the page loads
window.addEventListener('load', () => {
    // Wait for the main app to be ready
    setTimeout(() => {
        window.introGuide = new IntroGuide();
    }, 2000);
});
