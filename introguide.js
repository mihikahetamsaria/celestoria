// Tour Guide System - Non-overlapping, smart positioning
(function() {
    let currentStep = 0;
    let tourActive = false;
    let tourOverlay = null;
    let tourTooltip = null;

    const tourSteps = [
        {
            target: '.logo',
            title: 'Welcome to Celestoria',
            content: 'An advanced orbital mechanics and asteroid impact simulator. Let me show you around!',
            position: 'bottom'
        },
        {
            target: '#sidebar .sidebar-icon:nth-child(1)',
            title: 'Simulation Controls',
            content: 'Control time speed, camera, and visual settings. You can speed up time to see orbital mechanics in action.',
            position: 'right'
        },
        {
            target: '#sidebar .sidebar-icon:nth-child(2)',
            title: 'Deflection Methods',
            content: 'Learn about real asteroid deflection techniques like kinetic impactors and surface alteration.',
            position: 'right'
        },
        {
            target: '#sidebar .sidebar-icon:nth-child(3)',
            title: 'Asteroid Explorer',
            content: 'Browse and select from over 100 real asteroids. Click on any asteroid to see detailed information.',
            position: 'right'
        },
        {
            target: '#sidebar .sidebar-icon:nth-child(4)',
            title: 'Physics Settings',
            content: 'Toggle N-body gravity simulation and adjust gravitational constants for experimental scenarios.',
            position: 'right'
        },
        {
            target: '#sidebar .sidebar-icon:nth-child(5)',
            title: 'Orbit Sandbox',
            content: 'Modify asteroid orbits in real-time. Adjust semi-major axis, eccentricity, and inclination to see Earth-crossing scenarios.',
            position: 'right'
        },
        {
            target: '#sim-time-display',
            title: 'Simulation Time',
            content: 'Track how much time has passed in the simulation. Speed it up to see years of orbital motion in seconds!',
            position: 'bottom'
        },
        {
            target: 'body',
            title: 'Interactive 3D View',
            content: 'Click and drag to rotate the view. Scroll to zoom. Click on asteroids or planets to select them.',
            position: 'center'
        },
        {
            target: '.main-nav',
            title: 'Other Simulators',
            content: 'Explore seismic impact analysis and tsunami propagation simulators for comprehensive threat assessment.',
            position: 'bottom'
        }
    ];

    function createTourElements() {
        // Create overlay
        tourOverlay = document.createElement('div');
        tourOverlay.id = 'tour-overlay';
        tourOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9998;
            pointer-events: none;
        `;
        document.body.appendChild(tourOverlay);

        // Create tooltip
        tourTooltip = document.createElement('div');
        tourTooltip.id = 'tour-tooltip';
        tourTooltip.style.cssText = `
            position: fixed;
            background: linear-gradient(135deg, rgba(15, 15, 35, 0.98), rgba(30, 30, 60, 0.98));
            backdrop-filter: blur(15px);
            border: 2px solid #4fc3f7;
            border-radius: 12px;
            padding: 20px;
            max-width: 350px;
            z-index: 9999;
            box-shadow: 0 10px 40px rgba(79, 195, 247, 0.3);
            pointer-events: auto;
        `;
        document.body.appendChild(tourTooltip);
    }

    function getOptimalPosition(targetRect, tooltipWidth = 350, tooltipHeight = 200, preferredPosition) {
        const padding = 20;
        const positions = {
            top: {
                x: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
                y: targetRect.top - tooltipHeight - padding
            },
            bottom: {
                x: targetRect.left + (targetRect.width / 2) - (tooltipWidth / 2),
                y: targetRect.bottom + padding
            },
            left: {
                x: targetRect.left - tooltipWidth - padding,
                y: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2)
            },
            right: {
                x: targetRect.right + padding,
                y: targetRect.top + (targetRect.height / 2) - (tooltipHeight / 2)
            },
            center: {
                x: (window.innerWidth / 2) - (tooltipWidth / 2),
                y: (window.innerHeight / 2) - (tooltipHeight / 2)
            }
        };

        // Try preferred position first
        if (preferredPosition && isPositionValid(positions[preferredPosition], tooltipWidth, tooltipHeight)) {
            return positions[preferredPosition];
        }

        // Try other positions in order of preference
        const fallbackOrder = ['right', 'bottom', 'left', 'top', 'center'];
        for (const pos of fallbackOrder) {
            if (isPositionValid(positions[pos], tooltipWidth, tooltipHeight)) {
                return positions[pos];
            }
        }

        // Fallback to center
        return positions.center;
    }

    function isPositionValid(pos, width, height) {
        const padding = 10;
        return pos.x >= padding &&
               pos.y >= padding &&
               pos.x + width <= window.innerWidth - padding &&
               pos.y + height <= window.innerHeight - padding;
    }

    function highlightElement(element) {
        if (!element || element === document.body) return;

        const rect = element.getBoundingClientRect();
        const highlight = document.createElement('div');
        highlight.className = 'tour-highlight';
        highlight.style.cssText = `
            position: fixed;
            top: ${rect.top - 5}px;
            left: ${rect.left - 5}px;
            width: ${rect.width + 10}px;
            height: ${rect.height + 10}px;
            border: 3px solid #4fc3f7;
            border-radius: 8px;
            z-index: 9997;
            pointer-events: none;
            box-shadow: 0 0 20px rgba(79, 195, 247, 0.6);
            animation: pulse 2s infinite;
        `;
        document.body.appendChild(highlight);

        return highlight;
    }

    function showStep(stepIndex) {
        // Remove old highlights
        document.querySelectorAll('.tour-highlight').forEach(el => el.remove());

        if (stepIndex >= tourSteps.length) {
            endTour();
            return;
        }

        const step = tourSteps[stepIndex];
        const targetElement = document.querySelector(step.target);

        if (!targetElement) {
            currentStep++;
            showStep(currentStep);
            return;
        }

        // Highlight target
        const highlight = highlightElement(targetElement);

        // Position tooltip
        const targetRect = targetElement.getBoundingClientRect();
        const position = getOptimalPosition(targetRect, 350, 200, step.position);

        tourTooltip.style.left = `${position.x}px`;
        tourTooltip.style.top = `${position.y}px`;

        // Update content
        tourTooltip.innerHTML = `
            <h3 style="color: #4fc3f7; margin-bottom: 10px; font-size: 18px;">${step.title}</h3>
            <p style="color: #e0e0e0; line-height: 1.6; margin-bottom: 20px;">${step.content}</p>
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #81d4fa; font-size: 14px;">${stepIndex + 1} / ${tourSteps.length}</span>
                <div style="display: flex; gap: 10px;">
                    ${stepIndex > 0 ? '<button id="tour-prev" style="padding: 8px 16px; background: rgba(79, 195, 247, 0.2); border: 1px solid #4fc3f7; color: #4fc3f7; border-radius: 6px; cursor: pointer;">Previous</button>' : ''}
                    ${stepIndex < tourSteps.length - 1 
                        ? '<button id="tour-next" style="padding: 8px 16px; background: #4fc3f7; border: none; color: #000; border-radius: 6px; cursor: pointer; font-weight: 600;">Next</button>'
                        : '<button id="tour-finish" style="padding: 8px 16px; background: #4fc3f7; border: none; color: #000; border-radius: 6px; cursor: pointer; font-weight: 600;">Finish</button>'
                    }
                    <button id="tour-skip" style="padding: 8px 16px; background: rgba(255, 255, 255, 0.1); border: 1px solid rgba(255, 255, 255, 0.2); color: #fff; border-radius: 6px; cursor: pointer;">Skip Tour</button>
                </div>
            </div>
        `;

        // Add event listeners
        const nextBtn = document.getElementById('tour-next');
        const prevBtn = document.getElementById('tour-prev');
        const finishBtn = document.getElementById('tour-finish');
        const skipBtn = document.getElementById('tour-skip');

        if (nextBtn) nextBtn.onclick = () => { currentStep++; showStep(currentStep); };
        if (prevBtn) prevBtn.onclick = () => { currentStep--; showStep(currentStep); };
        if (finishBtn) finishBtn.onclick = endTour;
        if (skipBtn) skipBtn.onclick = endTour;
    }

    function startTour() {
        if (tourActive) return;

        tourActive = true;
        currentStep = 0;
        createTourElements();

        // Add pulse animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.7; transform: scale(1.02); }
            }
        `;
        document.head.appendChild(style);

        showStep(currentStep);
    }

    function endTour() {
        tourActive = false;
        if (tourOverlay) tourOverlay.remove();
        if (tourTooltip) tourTooltip.remove();
        document.querySelectorAll('.tour-highlight').forEach(el => el.remove());
        localStorage.setItem('celestoria_tour_completed', 'true');
    }

    // Auto-start tour on first visit
    window.addEventListener('load', () => {
        setTimeout(() => {
            const tourCompleted = localStorage.getItem('celestoria_tour_completed');
            if (!tourCompleted && document.getElementById('loading').style.display === 'none') {
                startTour();
            }
        }, 1000);
    });

    // Expose to global scope for manual trigger
    window.startCelestoriaTour = startTour;
})();