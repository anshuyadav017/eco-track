// script.js
class CarbonCalculator {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 4;
        this.data = {
            transport: {
                carMiles: 100,
                flights: 2,
                publicTransport: 5
            },
            food: {
                diet: 'moderate',
                localFood: 30
            },
            energy: {
                electricity: 400,
                gas: 50,
                renewable: {
                    solar: false,
                    wind: false
                }
            }
        };
        this.animations = new AnimationController();
        this.charts = new ChartController();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupIntersectionObserver();
        this.animations.initBackgroundParticles();
        this.updateCalculations();
        this.startTypingAnimation();
    }

    setupEventListeners() {
        // Range input listeners
        document.querySelectorAll('input[type="range"]').forEach(input => {
            input.addEventListener('input', (e) => {
                this.updateValue(e.target);
                this.updateCalculations();
                this.animations.triggerValueUpdateAnimation(e.target);
            });
        });

        // Food card selection
        document.querySelectorAll('.food-card').forEach(card => {
            card.addEventListener('click', (e) => {
                this.selectFoodOption(e.currentTarget);
            });
        });

        // Renewable energy checkboxes
        document.querySelectorAll('.renewable-card input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.updateRenewableEnergy(e.target);
                this.animations.triggerCheckboxAnimation(e.target.closest('.renewable-card'));
            });
        });

        // Action buttons
        document.querySelectorAll('.adopt-action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.adoptAction(e.currentTarget);
            });
        });

        // Navigation buttons
        const nextBtn = document.querySelector('.next-btn');
        const prevBtn = document.querySelector('.prev-btn');
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousStep());
        }

        // Offset buttons
        document.querySelectorAll('.offset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleOffsetPurchase(e.currentTarget);
            });
        });

        // Smooth scrolling for navigation
        // Corrected smooth scrolling for navigation
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        const href = e.currentTarget.getAttribute('href');

        // Check if the link is an internal anchor link
        if (href && href.startsWith('#')) {
            // If it is, prevent default and scroll smoothly
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        // For any other link (like "login.html"), do nothing and let the default browser action proceed.
    });
});
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                    if (entry.target.classList.contains('stat-value')) {
                        this.animations.animateCounter(entry.target);
                    }
                }
            });
        }, { threshold: 0.3 });

        document.querySelectorAll('.action-card, .offset-card, .achievement-badge, .stat-value').forEach(el => {
            observer.observe(el);
        });
    }

    updateValue(input) {
        const valueDisplay = input.nextElementSibling;
        let unit = '';
        
        switch(input.id) {
            case 'car-miles':
                unit = ' miles';
                this.data.transport.carMiles = parseInt(input.value);
                break;
            case 'flights':
                unit = ' flights';
                this.data.transport.flights = parseInt(input.value);
                break;
            case 'public-transport':
                unit = ' hours';
                this.data.transport.publicTransport = parseInt(input.value);
                break;
            case 'local-food':
                unit = '%';
                this.data.food.localFood = parseInt(input.value);
                break;
            case 'electricity':
                unit = ' kWh';
                this.data.energy.electricity = parseInt(input.value);
                break;
            case 'gas':
                unit = ' therms';
                this.data.energy.gas = parseInt(input.value);
                break;
        }
        
        if (valueDisplay) {
            valueDisplay.textContent = input.value + unit;
        }
    }

    selectFoodOption(card) {
        // Remove previous selection
        document.querySelectorAll('.food-card').forEach(c => c.classList.remove('selected'));
        
        // Add selection to clicked card
        card.classList.add('selected');
        
        // Update data
        this.data.food.diet = card.dataset.diet;
        
        // Animate selection
        this.animations.triggerSelectionAnimation(card);
        
        // Update calculations
        this.updateCalculations();
    }

    updateRenewableEnergy(checkbox) {
        const renewableCard = checkbox.closest('.renewable-card');
        if (renewableCard) {
            const source = renewableCard.dataset.source;
            this.data.energy.renewable[source] = checkbox.checked;
            this.updateCalculations();
        }
    }

    updateCalculations() {
        const emissions = this.calculateEmissions();
        
        // Update transport emissions display
        const transportEmissionsEl = document.getElementById('transport-emissions');
        if (transportEmissionsEl) {
            transportEmissionsEl.textContent = emissions.transport.toFixed(1);
        }
        
        // Update total footprint
        const totalFootprintEl = document.getElementById('total-footprint');
        if (totalFootprintEl) {
            totalFootprintEl.textContent = emissions.total.toFixed(1);
            this.animations.updateCircularProgress(emissions.total);
        }
        
        // Update comparison bars
        this.updateComparisonChart(emissions.total);
        
        // Update breakdown chart if visible
        if (this.currentStep === 4) {
            this.charts.updatePieChart(emissions);
        }
    }

    calculateEmissions() {
        // Transport calculations
        const transportEmissions = 
            (this.data.transport.carMiles * 0.4 * 52) / 1000 + // Weekly miles to annual tons
            (this.data.transport.flights * 1.2) + // Flights to tons
            Math.max(0, (this.data.transport.publicTransport * -0.05 * 52)); // Public transport reduction

        // Food calculations
        const foodMultipliers = {
            'meat-heavy': 3.3,
            'moderate': 2.5,
            'low-meat': 1.9,
            'vegetarian': 1.4
        };
        const foodEmissions = foodMultipliers[this.data.food.diet] * 
            (1 - (this.data.food.localFood / 100) * 0.1); // Local food reduction

        // Energy calculations
        let energyEmissions = 
            (this.data.energy.electricity * 0.0007 * 12) + // Monthly kWh to annual tons
            (this.data.energy.gas * 0.0053 * 12); // Monthly therms to annual tons
        
        // Apply renewable energy reductions
        if (this.data.energy.renewable.solar) energyEmissions *= 0.7;
        if (this.data.energy.renewable.wind) energyEmissions *= 0.8;

        const total = transportEmissions + foodEmissions + energyEmissions;

        return {
            transport: Math.max(0, transportEmissions),
            food: foodEmissions,
            energy: Math.max(0, energyEmissions),
            total: total
        };
    }

    updateComparisonChart(userEmissions) {
        const bars = document.querySelectorAll('.comparison-item .bar');
        const values = [userEmissions, 16, 2.3]; // User, US Average, Global Target
        
        bars.forEach((bar, index) => {
            const percentage = Math.min((values[index] / 20) * 100, 100); // Scale to 20 tons max
            bar.style.setProperty('--bar-width', `${percentage}%`);
        });
    }

    nextStep() {
        if (this.currentStep < this.maxSteps) {
            this.goToStep(this.currentStep + 1);
        }
    }

    previousStep() {
        if (this.currentStep > 1) {
            this.goToStep(this.currentStep - 1);
        }
    }

    goToStep(step) {
        // Hide current step
        const currentStepEl = document.querySelector(`#step-${this.currentStep}`);
        const currentIndicator = document.querySelector(`[data-step="${this.currentStep}"]`);
        
        if (currentStepEl) currentStepEl.classList.remove('active');
        if (currentIndicator) currentIndicator.classList.remove('active');
        
        // Show new step
        const newStepEl = document.querySelector(`#step-${step}`);
        const newIndicator = document.querySelector(`[data-step="${step}"]`);
        
        if (newStepEl) newStepEl.classList.add('active');
        if (newIndicator) newIndicator.classList.add('active');
        
        // Update current step
        this.currentStep = step;
        
        // Update navigation buttons
        this.updateNavigationButtons();
        
        // Trigger step-specific animations
        this.animations.triggerStepAnimation(step);
        
        // Load step-specific content
        if (step === 4) {
            this.loadResults();
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentStep === 1;
        }
        
        if (nextBtn) {
            if (this.currentStep === this.maxSteps) {
                nextBtn.innerHTML = 'View Actions <i class="fas fa-arrow-right"></i>';
                nextBtn.onclick = () => this.scrollToSection('actions');
            } else {
                nextBtn.innerHTML = 'Next <i class="fas fa-arrow-right"></i>';
                nextBtn.onclick = () => this.nextStep();
            }
        }
    }

    loadResults() {
        const emissions = this.calculateEmissions();
        
        // Update circular progress
        setTimeout(() => {
            this.animations.updateCircularProgress(emissions.total);
            this.charts.createPieChart(emissions);
            this.generatePersonalizedActions(emissions);
        }, 300);
    }

    generatePersonalizedActions(emissions) {
        const actions = this.getRecommendedActions(emissions);
        // Update action cards with personalized recommendations
        // This would be implemented based on the user's specific emission profile
        console.log('Generated actions:', actions);
    }

    getRecommendedActions(emissions) {
        const actions = [];
        
        if (this.data.transport.carMiles > 150) {
            actions.push({
                type: 'transport',
                title: 'Switch to Cycling/Walking',
                impact: 'high',
                reduction: emissions.transport * 0.3,
                difficulty: 'easy'
            });
        }
        
        if (this.data.food.diet === 'meat-heavy') {
            actions.push({
                type: 'food',
                title: 'Reduce Meat Consumption',
                impact: 'high',
                reduction: emissions.food * 0.4,
                difficulty: 'medium'
            });
        }
        
        if (this.data.energy.electricity > 500) {
            actions.push({
                type: 'energy',
                title: 'Energy Efficiency Upgrades',
                impact: 'medium',
                reduction: emissions.energy * 0.25,
                difficulty: 'easy'
            });
        }
        
        return actions;
    }

    adoptAction(button) {
        const actionCard = button.closest('.action-card');
        
        // Add adopted class
        actionCard.classList.add('adopted');
        
        // Change button text
        button.innerHTML = '<i class="fas fa-check"></i> Action Adopted!';
        button.style.background = '#2d8f47';
        
        // Trigger celebration animation
        this.animations.triggerCelebrationAnimation(actionCard);
        
        // Update progress tracking
        this.updateProgress();
        
        // Show success message
        this.showSuccessMessage('Great! You\'ve taken a step towards reducing your carbon footprint.');
    }

    updateProgress() {
        // Simulate progress update
        const progressData = this.generateProgressData();
        this.charts.updateProgressChart(progressData);
        
        // Check for new achievements
        this.checkAchievements();
    }

    checkAchievements() {
        // Simple achievement checking logic
        const adoptedActions = document.querySelectorAll('.action-card.adopted').length;
        
        if (adoptedActions >= 1) {
            this.unlockAchievement('first-action');
        }
        
        if (adoptedActions >= 3) {
            this.unlockAchievement('eco-warrior');
        }
    }

    unlockAchievement(achievementId) {
        const badge = document.querySelector(`[data-achievement="${achievementId}"]`);
        if (badge && !badge.classList.contains('earned')) {
            badge.classList.add('earned');
            this.animations.triggerAchievementAnimation(badge);
            this.showSuccessMessage('Achievement Unlocked! 🎉');
        }
    }

    handleOffsetPurchase(button) {
        const card = button.closest('.offset-card');
        const offsetTitle = card.querySelector('h3');
        const offsetType = offsetTitle ? offsetTitle.textContent : 'Carbon Offset';
        
        // Simulate purchase process
        this.showLoadingState(button);
        
        setTimeout(() => {
            this.completeOffsetPurchase(button, offsetType);
        }, 2000);
    }

    showLoadingState(button) {
        const originalText = button.textContent;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        button.disabled = true;
        
        // Store original text for later
        button.dataset.originalText = originalText;
    }

    completeOffsetPurchase(button, offsetType) {
        button.innerHTML = '<i class="fas fa-check"></i> Offset Purchased!';
        button.style.background = '#2d8f47';
        
        // Show success message
        this.showSuccessMessage(`Thank you for supporting ${offsetType}! Your impact will be verified within 30 days.`);
        
        // Update impact statistics
        this.updateImpactStats();
    }

    updateImpactStats() {
        // Animate counter updates
        const counters = document.querySelectorAll('.animated-counter');
        counters.forEach(counter => {
            this.animations.animateCounter(counter);
        });
    }

    showSuccessMessage(message) {
        // Create and show toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification success';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    startTypingAnimation() {
        const typingElement = document.querySelector('.typing-animation');
        if (typingElement) {
            const texts = [
                'Calculate Your Impact',
                'Track Your Progress', 
                'Make a Difference',
                'Save Our Planet'
            ];
            
            this.animations.typeWriter(typingElement, texts, 0);
        }
    }

    generateProgressData() {
        // Generate sample progress data
        return {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            data: [10.5, 9.8, 9.2, 8.7, 8.1, 7.6]
        };
    }
}

class AnimationController {
    constructor() {
        this.particlesContainer = document.querySelector('.particles');
    }

    initBackgroundParticles() {
        if (!this.particlesContainer) return;
        
        // Create floating particles
        for (let i = 0; i < 20; i++) {
            this.createParticle();
        }
    }

    createParticle() {
        if (!this.particlesContainer) return;
        
        const particle = document.createElement('div');
        particle.className = 'background-particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: rgba(76, 175, 80, ${Math.random() * 0.3 + 0.1});
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: particleFloat ${Math.random() * 10 + 10}s linear infinite;
        `;
        
        this.particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 20000);
    }

    triggerValueUpdateAnimation(input) {
        const parent = input.closest('.animated-input');
        if (parent) {
            parent.classList.add('updating');
            
            setTimeout(() => {
                parent.classList.remove('updating');
            }, 300);
        }
    }

    triggerSelectionAnimation(card) {
        // Add selection ripple effect
        const ripple = document.createElement('div');
        ripple.className = 'selection-ripple';
        card.appendChild(ripple);
        
        setTimeout(() => {
            if (card.contains(ripple)) {
                card.removeChild(ripple);
            }
        }, 600);
    }

    triggerCheckboxAnimation(card) {
        if (card) {
            card.style.transform = 'scale(1.05)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        }
    }

    triggerStepAnimation(step) {
        const stepElement = document.querySelector(`#step-${step}`);
        if (stepElement) {
            stepElement.style.opacity = '0';
            stepElement.style.transform = 'translateX(30px)';
            
            setTimeout(() => {
                stepElement.style.transition = 'all 0.5s ease-out';
                stepElement.style.opacity = '1';
                stepElement.style.transform = 'translateX(0)';
            }, 50);
        }
    }

    updateCircularProgress(value) {
        const maxValue = 20; // Maximum expected emissions
        const percentage = Math.min((value / maxValue) * 100, 100);
        
        const progressRing = document.querySelector('.progress-ring-fill');
        if (progressRing) {
            progressRing.style.setProperty('--progress', percentage);
        }
    }

    triggerCelebrationAnimation(element) {
        // Create confetti effect
        this.createConfetti(element);
        
        // Pulse animation
        element.style.animation = 'celebrationPulse 0.6s ease-out';
        
        setTimeout(() => {
            element.style.animation = '';
        }, 600);
    }

    createConfetti(element) {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'];
        
        for (let i = 0; i < 15; i++) {
            const confetti = document.createElement('div');
            const randomX = Math.random() * 200 - 100;
            confetti.style.cssText = `
                position: absolute;
                width: 6px;
                height: 6px;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                animation: confettiFall${i} ${Math.random() * 2 + 1}s ease-out forwards;
                z-index: 1000;
            `;
            
            // Create unique keyframe animation for each confetti piece
            const style = document.createElement('style');
            style.textContent = `
                @keyframes confettiFall${i} {
                    0% {
                        transform: translate(-50%, -50%) rotate(0deg);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(${randomX}px, 200px) rotate(720deg);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
            
            element.style.position = 'relative';
            element.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
                if (style.parentNode) {
                    document.head.removeChild(style);
                }
            }, 3000);
        }
    }

    triggerAchievementAnimation(badge) {
        badge.style.animation = 'achievementUnlock 1s ease-out';
        
        // Add glow effect
        badge.style.boxShadow = '0 0 20px rgba(76, 175, 80, 0.6)';
        
        setTimeout(() => {
            badge.style.animation = '';
            badge.style.boxShadow = '';
        }, 1000);
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.target || element.textContent);
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    }

    typeWriter(element, texts, index) {
        if (index < texts.length) {
            const text = texts[index];
            let charIndex = 0;
            
            const typing = setInterval(() => {
                element.textContent = text.slice(0, charIndex + 1);
                charIndex++;
                
                if (charIndex >= text.length) {
                    clearInterval(typing);
                    setTimeout(() => {
                        this.typeWriter(element, texts, (index + 1) % texts.length);
                    }, 2000);
                }
            }, 100);
        }
    }
}

class ChartController {
    constructor() {
        this.ctx = null;
        this.progressCtx = null;
    }

    createPieChart(emissions) {
        const canvas = document.getElementById('breakdown-chart');
        if (!canvas) return;
        
        this.ctx = canvas.getContext('2d');
        const data = [
            { label: 'Transport', value: emissions.transport, color: '#FF6B6B' },
            { label: 'Food', value: emissions.food, color: '#4ECDC4' },
            { label: 'Energy', value: emissions.energy, color: '#45B7D1' }
        ];
        
        this.drawPieChart(data);
    }

    updatePieChart(emissions) {
        this.createPieChart(emissions);
    }

    drawPieChart(data) {
        const canvas = document.getElementById('breakdown-chart');
        if (!canvas || !this.ctx) return;
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 100;
        
        const total = data.reduce((sum, item) => sum + item.value, 0);
        if (total === 0) return;
        
        let currentAngle = -Math.PI / 2; // Start from top
        
        // Clear canvas
        this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        data.forEach((item) => {
            const sliceAngle = (item.value / total) * 2 * Math.PI;
            
            // Draw slice
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = item.color;
            this.ctx.fill();
            
            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius + 30);
            const labelY = centerY + Math.sin(labelAngle) * (radius + 30);
            
            this.ctx.fillStyle = '#333';
            this.ctx.font = '12px Poppins';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(item.label, labelX, labelY);
            this.ctx.fillText(`${item.value.toFixed(1)}t`, labelX, labelY + 15);
            
            currentAngle += sliceAngle;
        });
        
        // Animate the chart
        this.animatePieChart();
    }

    animatePieChart() {
        const canvas = document.getElementById('breakdown-chart');
        if (canvas) {
            canvas.style.animation = 'chartFadeIn 1s ease-out';
        }
    }

    updateProgressChart(progressData) {
        const canvas = document.getElementById('progress-chart');
        if (!canvas) return;
        
        this.progressCtx = canvas.getContext('2d');
        this.drawLineChart(progressData);
    }

    drawLineChart(data) {
        const canvas = document.getElementById('progress-chart');
        if (!canvas || !this.progressCtx) return;
        
        const padding = 50;
        const chartWidth = canvas.width - (padding * 2);
        const chartHeight = canvas.height - (padding * 2);
        
        // Clear canvas
        this.progressCtx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        this.progressCtx.strokeStyle = '#eee';
        this.progressCtx.lineWidth = 1;
        
        // Horizontal lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (i * chartHeight / 5);
            this.progressCtx.beginPath();
            this.progressCtx.moveTo(padding, y);
            this.progressCtx.lineTo(padding + chartWidth, y);
            this.progressCtx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i <= data.labels.length - 1; i++) {
            const x = padding + (i * chartWidth / (data.labels.length - 1));
            this.progressCtx.beginPath();
            this.progressCtx.moveTo(x, padding);
            this.progressCtx.lineTo(x, padding + chartHeight);
            this.progressCtx.stroke();
        }
        
        // Draw data line
        this.progressCtx.strokeStyle = '#4CAF50';
        this.progressCtx.lineWidth = 3;
        this.progressCtx.beginPath();
        
        const maxValue = Math.max(...data.data);
        const minValue = Math.min(...data.data);
        const valueRange = maxValue - minValue || 1; // Prevent division by zero
        
        data.data.forEach((value, index) => {
            const x = padding + (index * chartWidth / (data.data.length - 1));
            const y = padding + chartHeight - ((value - minValue) / valueRange * chartHeight);
            
            if (index === 0) {
                this.progressCtx.moveTo(x, y);
            } else {
                this.progressCtx.lineTo(x, y);
            }
            
            // Draw data points
            this.progressCtx.fillStyle = '#4CAF50';
            this.progressCtx.beginPath();
            this.progressCtx.arc(x, y, 4, 0, 2 * Math.PI);
            this.progressCtx.fill();
        });
        
        this.progressCtx.stroke();
        
        // Draw labels
        this.progressCtx.fillStyle = '#666';
        this.progressCtx.font = '12px Poppins';
        this.progressCtx.textAlign = 'center';
        
        data.labels.forEach((label, index) => {
            const x = padding + (index * chartWidth / (data.labels.length - 1));
            this.progressCtx.fillText(label, x, canvas.height - 20);
        });
        
        // Animate the chart
        this.animateLineChart();
    }

    animateLineChart() {
        const canvas = document.getElementById('progress-chart');
        if (canvas) {
            canvas.style.animation = 'chartSlideIn 1s ease-out';
        }
    }
}

// Global functions for HTML onclick events
function startCalculator() {
    const calculatorSection = document.getElementById('calculator');
    if (calculatorSection) {
        calculatorSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function updateValue(input) {
    if (window.carbonCalculator) {
        window.carbonCalculator.updateValue(input);
    }
}

function nextStep() {
    if (window.carbonCalculator) {
        window.carbonCalculator.nextStep();
    }
}

function previousStep() {
    if (window.carbonCalculator) {
        window.carbonCalculator.previousStep();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.carbonCalculator = new CarbonCalculator();
});

// Add additional CSS for new animations
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes particleFloat {
        0% { transform: translateY(100vh) rotate(0deg); }
        100% { transform: translateY(-100px) rotate(360deg); }
    }

    .updating {
        animation: inputUpdate 0.3s ease-out;
    }

    @keyframes inputUpdate {
        0% { transform: scale(1); }
        50% { transform: scale(1.02); }
        100% { transform: scale(1); }
    }

    .selection-ripple {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        border-radius: 50%;
        background: rgba(76, 175, 80, 0.3);
        transform: translate(-50%, -50%);
        animation: selectionRipple 0.6s ease-out forwards;
    }

    @keyframes selectionRipple {
        to {
            width: 200px;
            height: 200px;
            opacity: 0;
        }
    }

    @keyframes celebrationPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }

    @keyframes achievementUnlock {
        0% {
            transform: scale(0.5) rotate(-180deg);
            opacity: 0;
        }
        50% {
            transform: scale(1.1) rotate(-90deg);
            opacity: 1;
        }
        100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
        }
    }

    @keyframes chartFadeIn {
        from {
            opacity: 0;
            transform: scale(0.8);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }

    @keyframes chartSlideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .toast-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(400px);
        transition: transform 0.3s ease-out;
        z-index: 10000;
    }

    .toast-notification.success {
        border-left: 4px solid #4CAF50;
    }

    .toast-notification.show {
        transform: translateX(0);
    }

    .toast-notification i {
        color: #4CAF50;
        font-size: 1.2rem;
    }
`;

document.head.appendChild(additionalStyles);
