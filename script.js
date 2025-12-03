
class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.isActive = true;
        this.time = 0;
        
        this.resizeCanvas();
        this.setupEventListeners();
        this.createParticles();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());
        
        document.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    createParticles() {
        this.particles = [];
        const particleCount = Math.min(100, Math.floor((this.canvas.width * this.canvas.height) / 15000));
        
        for (let i = 0; i < particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.2,
                hue: Math.random() * 360,
                phase: Math.random() * Math.PI * 2,
                speed: Math.random() * 2 + 1
            });
        }
    }

    updateParticles() {
        if (!this.isActive || !this.particles) return;

        this.time += 0.01;

        this.particles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;

            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                particle.vx += (dx / distance) * force * 0.2;
                particle.vy += (dy / distance) * force * 0.2;
                particle.opacity = Math.min(1, particle.opacity + 0.02);
            } else {
                particle.opacity = Math.max(0.2, particle.opacity - 0.01);
            }

            const maxVel = 3;
            if (Math.abs(particle.vx) > maxVel) particle.vx = Math.sign(particle.vx) * maxVel;
            if (Math.abs(particle.vy) > maxVel) particle.vy = Math.sign(particle.vy) * maxVel;

            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;

            particle.hue += 0.5;
            if (particle.hue > 360) particle.hue = 0;

            particle.size = 2 + Math.sin(this.time * particle.speed + particle.phase) * 1;
        });
    }

    drawParticles() {
        if (!this.isActive || !this.particles) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 120) {
                    const opacity = (120 - distance) / 120 * 0.3;
                    this.ctx.strokeStyle = `hsla(${(particle.hue + other.hue) / 2}, 70%, 60%, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(other.x, other.y);
                    this.ctx.stroke();
                }
            }
        });

        this.particles.forEach(particle => {
            const gradient = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, particle.size
            );
            gradient.addColorStop(0, `hsla(${particle.hue}, 70%, 70%, ${particle.opacity})`);
            gradient.addColorStop(1, `hsla(${particle.hue}, 70%, 50%, 0)`);
            
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        this.updateParticles();
        this.drawParticles();
        requestAnimationFrame(() => this.animate());
    }

    toggle(active) {
        this.isActive = active;
        if (!active) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        } else {
            this.createParticles();
        }
    }
}

class EnhancedParticleSystem extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.mouseTrail = [];
        this.explosions = [];
        this.sparkles = [];
        this.waves = [];
    }

    updateParticles() {
        super.updateParticles();
        
        if (!this.mouseTrail) this.mouseTrail = [];
        this.mouseTrail.push({ x: this.mouse.x, y: this.mouse.y, life: 20, hue: this.time * 50 });
        this.mouseTrail = this.mouseTrail.filter(point => point.life-- > 0);
        
        if (!this.explosions) this.explosions = [];
        this.explosions = this.explosions.filter(explosion => {
            explosion.life--;
            explosion.radius += explosion.speed;
            explosion.opacity = explosion.life / explosion.maxLife;
            return explosion.life > 0;
        });
        
        if (!this.sparkles) this.sparkles = [];
        this.sparkles = this.sparkles.filter(sparkle => {
            sparkle.life--;
            sparkle.y -= sparkle.speed;
            sparkle.x += Math.sin(sparkle.life * 0.1) * 0.5;
            sparkle.opacity = sparkle.life / sparkle.maxLife;
            return sparkle.life > 0;
        });
        
        if (!this.waves) this.waves = [];
        this.waves = this.waves.filter(wave => {
            wave.life--;
            wave.radius += wave.speed;
            wave.opacity = wave.life / wave.maxLife;
            return wave.life > 0;
        });
        
        if (Math.random() < 0.01) {
            this.explosions.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                radius: 0,
                life: 40,
                maxLife: 40,
                speed: Math.random() * 3 + 2,
                color: `hsl(${Math.random() * 360}, 70%, 60%)`,
                opacity: 1
            });
        }
        
        if (Math.random() < 0.02) {
            for (let i = 0; i < 5; i++) {
                this.sparkles.push({
                    x: Math.random() * this.canvas.width,
                    y: this.canvas.height + 10,
                    life: 60 + Math.random() * 40,
                    maxLife: 60 + Math.random() * 40,
                    speed: Math.random() * 2 + 1,
                    size: Math.random() * 3 + 1,
                    hue: Math.random() * 360,
                    opacity: 1
                });
            }
        }
    }

    drawParticles() {
        super.drawParticles();
        this.drawMouseTrail();
        this.drawExplosions();
        this.drawSparkles();
        this.drawWaves();
    }

    drawMouseTrail() {
        if (!this.mouseTrail || this.mouseTrail.length < 2) return;
        
        this.ctx.strokeStyle = `hsla(${this.time * 100}, 80%, 60%, 0.6)`;
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = `hsl(${this.time * 100}, 80%, 60%)`;
        this.ctx.shadowBlur = 10;
        
        this.ctx.beginPath();
        for (let i = 0; i < this.mouseTrail.length; i++) {
            const point = this.mouseTrail[i];
            const opacity = point.life / 20;
            
            if (i === 0) {
                this.ctx.moveTo(point.x, point.y);
            } else {
                this.ctx.lineTo(point.x, point.y);
            }
        }
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;
    }

    drawExplosions() {
        if (!this.explosions) return;
        
        this.explosions.forEach(explosion => {
            this.ctx.strokeStyle = explosion.color.replace('hsl', 'hsla').replace(')', `, ${explosion.opacity})`);
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = explosion.color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(explosion.x, explosion.y, explosion.radius * 0.5, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.shadowBlur = 0;
        });
    }

    drawSparkles() {
        if (!this.sparkles) return;
        
        this.sparkles.forEach(sparkle => {
            this.ctx.fillStyle = `hsla(${sparkle.hue}, 80%, 70%, ${sparkle.opacity})`;
            this.ctx.shadowColor = `hsl(${sparkle.hue}, 80%, 70%)`;
            this.ctx.shadowBlur = 8;
            
            this.ctx.save();
            this.ctx.translate(sparkle.x, sparkle.y);
            this.ctx.rotate(sparkle.life * 0.1);
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -sparkle.size);
            this.ctx.lineTo(sparkle.size * 0.3, 0);
            this.ctx.lineTo(sparkle.size, 0);
            this.ctx.lineTo(sparkle.size * 0.3, 0);
            this.ctx.lineTo(0, sparkle.size);
            this.ctx.lineTo(-sparkle.size * 0.3, 0);
            this.ctx.lineTo(-sparkle.size, 0);
            this.ctx.lineTo(-sparkle.size * 0.3, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
            this.ctx.shadowBlur = 0;
        });
    }

    drawWaves() {
        if (!this.waves) return;
        
        this.waves.forEach(wave => {
            this.ctx.strokeStyle = `hsla(${wave.hue}, 70%, 60%, ${wave.opacity * 0.3})`;
            this.ctx.lineWidth = 2;
            
            for (let i = 0; i < 3; i++) {
                this.ctx.beginPath();
                this.ctx.arc(wave.x, wave.y, wave.radius + i * 10, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        });
    }

    addExplosion(x, y) {
        if (!this.explosions) this.explosions = [];
        this.explosions.push({
            x: x || Math.random() * this.canvas.width,
            y: y || Math.random() * this.canvas.height,
            radius: 0,
            life: 50,
            maxLife: 50,
            speed: Math.random() * 4 + 3,
            color: `hsl(${Math.random() * 360}, 80%, 70%)`,
            opacity: 1
        });
    }

    addWave(x, y) {
        if (!this.waves) this.waves = [];
        this.waves.push({
            x: x || this.canvas.width / 2,
            y: y || this.canvas.height / 2,
            radius: 0,
            life: 60,
            maxLife: 60,
            speed: 2,
            hue: Math.random() * 360,
            opacity: 1
        });
    }
}

class UltimateTextEffectGenerator {
    constructor() {
        this.textInput = document.getElementById('textInput');
        this.fontSelect = document.getElementById('fontSelect');
        this.sizeSelect = document.getElementById('sizeSelect');
        this.particleToggle = document.getElementById('particleToggle');
        this.generateBtn = document.getElementById('generateBtn');
        this.effectsGrid = document.getElementById('effectsGrid');
        this.finalCanvas = document.getElementById('finalCanvas');
        this.downloadButtons = document.getElementById('downloadButtons');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        this.toast = document.getElementById('toast');
        
        this.currentSize = '800x400';
        this.selectedEffect = null;
        
        try {
            this.initializeEffects();
            this.setupEventListeners();
            setTimeout(() => this.generateAllEffects(), 500);
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Error initializing generator', 'error');
        }
    }

    setupEventListeners() {
        const debouncedGenerate = this.debounce(() => this.generateAllEffects(), 1000);
        
        if (this.textInput) {
            this.textInput.addEventListener('input', debouncedGenerate);
        }
        
        if (this.fontSelect) {
            this.fontSelect.addEventListener('change', debouncedGenerate);
        }
        
        if (this.sizeSelect) {
            this.sizeSelect.addEventListener('change', (e) => {
                this.currentSize = e.target.value;
                if (this.selectedEffect) {
                    this.showFullEffect(this.selectedEffect.key, this.selectedEffect.effect, this.selectedEffect.text);
                }
            });
        }
        
        if (this.generateBtn) {
            this.generateBtn.addEventListener('click', () => this.generateAllEffects());
        }
        
        if (this.particleToggle) {
            this.particleToggle.addEventListener('change', (e) => {
                if (window.particleSystem) {
                    window.particleSystem.toggle(e.target.checked);
                }
            });
        }
    }

    initializeEffects() {
        this.effects = {
            neonGlow: {
                name: 'Neon Glow',
                desc: 'Electric neon sign effect',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#0a0a0a';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 30; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 4 + 2;
                            
                            ctx.fillStyle = `hsla(${Math.random() * 60 + 180}, 100%, 50%, 0.8)`;
                            ctx.shadowColor = '#00ffff';
                            ctx.shadowBlur = 15;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#ff00ff';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#00ffff';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        ctx.shadowColor = '#00ffff';
                        ctx.shadowBlur = 35;
                        ctx.fillStyle = '#ffffff';
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Neon Glow effect error:', error);
                        this.renderErrorEffect(ctx, 'Neon Glow', width, height);
                    }
                }
            },

            dragonBreath: {
                name: 'Dragon Breath',
                desc: 'Blazing fire with smoke',
                generate: (ctx, text, width, height) => {
                    try {
                        const gradient = ctx.createRadialGradient(width/2, height, 0, width/2, height/2, height);
                        gradient.addColorStop(0, '#8B0000');
                        gradient.addColorStop(0.3, '#FF4500');
                        gradient.addColorStop(0.6, '#FFD700');
                        gradient.addColorStop(1, '#000000');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 60; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 8 + 3;
                            const opacity = Math.random() * 0.8 + 0.2;
                            
                            ctx.fillStyle = `rgba(255, ${Math.random() * 100 + 69}, 0, ${opacity})`;
                            ctx.beginPath();
                            ctx.ellipse(x, y, size, size * 2, Math.random() * Math.PI, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#FF4500';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#8B0000';
                        ctx.lineWidth = 5;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#FFD700');
                        textGradient.addColorStop(0.5, '#FF6347');
                        textGradient.addColorStop(1, '#FF0000');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Dragon Breath effect error:', error);
                        this.renderErrorEffect(ctx, 'Dragon Breath', width, height);
                    }
                }
            },

            arcticStorm: {
                name: 'Arctic Storm',
                desc: 'Frozen blizzard with ice shards',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, 0, width, height);
                        bgGradient.addColorStop(0, '#E0F6FF');
                        bgGradient.addColorStop(0.5, '#87CEEB');
                        bgGradient.addColorStop(1, '#4682B4');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 150; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 3 + 1;
                            const opacity = Math.random() * 0.9 + 0.1;
                            
                            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                            ctx.lineWidth = 1;
                            const arms = 6;
                            
                            for (let j = 0; j < arms; j++) {
                                const angle = (j * Math.PI * 2) / arms;
                                ctx.beginPath();
                                ctx.moveTo(x, y);
                                ctx.lineTo(
                                    x + Math.cos(angle) * size * 4,
                                    y + Math.sin(angle) * size * 4
                                );
                                ctx.stroke();
                            }
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#FFFFFF';
                        ctx.shadowBlur = 20;
                        ctx.strokeStyle = '#1E90FF';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#FFFFFF');
                        textGradient.addColorStop(0.5, '#E0F6FF');
                        textGradient.addColorStop(1, '#4682B4');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Arctic Storm effect error:', error);
                        this.renderErrorEffect(ctx, 'Arctic Storm', width, height);
                    }
                }
            },

            cosmicVoid: {
                name: 'Cosmic Void',
                desc: 'Deep space with black holes',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000005';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 200; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 2;
                            const twinkle = Math.sin(Date.now() * 0.001 + i) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        for (let i = 0; i < 3; i++) {
                            const centerX = Math.random() * width;
                            const centerY = Math.random() * height;
                            const maxRadius = Math.random() * 80 + 40;
                            
                            for (let r = maxRadius; r > 0; r -= 5) {
                                const hue = (270 + r) % 360;
                                const opacity = (maxRadius - r) / maxRadius * 0.3;
                                ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
                                ctx.lineWidth = 2;
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                            
                            ctx.fillStyle = '#000000';
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#9370DB';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#4B0082';
                        ctx.lineWidth = 2;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, fontSize);
                        textGradient.addColorStop(0, '#FFFFFF');
                        textGradient.addColorStop(0.3, '#DA70D6');
                        textGradient.addColorStop(0.7, '#9370DB');
                        textGradient.addColorStop(1, '#4B0082');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Cosmic Void effect error:', error);
                        this.renderErrorEffect(ctx, 'Cosmic Void', width, height);
                    }
                }
            },

            toxicWaste: {
                name: 'Toxic Waste',
                desc: 'Radioactive bubbling slime',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
                        bgGradient.addColorStop(0, '#1a1a0a');
                        bgGradient.addColorStop(0.5, '#2d4a0f');
                        bgGradient.addColorStop(1, '#0f2a00');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 80; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const baseSize = Math.random() * 15 + 5;
                            const pulse = Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.7;
                            const size = baseSize * pulse;
                            
                            const bubbleGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                            bubbleGradient.addColorStop(0, 'rgba(50, 255, 0, 0.8)');
                            bubbleGradient.addColorStop(0.6, 'rgba(255, 255, 0, 0.4)');
                            bubbleGradient.addColorStop(1, 'rgba(0, 255, 0, 0.1)');
                            
                            ctx.fillStyle = bubbleGradient;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#32FF00';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#228B22';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#FFFF00');
                        textGradient.addColorStop(0.3, '#32FF00');
                        textGradient.addColorStop(0.7, '#00FF00');
                        textGradient.addColorStop(1, '#008000');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Toxic Waste effect error:', error);
                        this.renderErrorEffect(ctx, 'Toxic Waste', width, height);
                    }
                }
            },

            thunderStorm: {
                name: 'Thunder Storm',
                desc: 'Lightning bolts and storm clouds',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
                        bgGradient.addColorStop(0, '#1a1a2e');
                        bgGradient.addColorStop(0.5, '#16213e');
                        bgGradient.addColorStop(1, '#0f0f23');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 8; i++) {
                            const startX = Math.random() * width;
                            const startY = Math.random() * height * 0.3;
                            const segments = 6 + Math.floor(Math.random() * 4);
                            
                            ctx.strokeStyle = '#FFFFFF';
                            ctx.lineWidth = 3;
                            ctx.shadowColor = '#87CEEB';
                            ctx.shadowBlur = 15;
                            
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            
                            let currentX = startX;
                            let currentY = startY;
                            
                            for (let j = 0; j < segments; j++) {
                                const nextX = currentX + (Math.random() - 0.5) * 60;
                                const nextY = currentY + height / segments + (Math.random() - 0.5) * 30;
                                ctx.lineTo(nextX, nextY);
                                currentX = nextX;
                                currentY = nextY;
                            }
                            ctx.stroke();
                            ctx.shadowBlur = 0;
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#87CEEB';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#191970';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#FFFFFF');
                        textGradient.addColorStop(0.3, '#E6E6FA');
                        textGradient.addColorStop(0.7, '#87CEEB');
                        textGradient.addColorStop(1, '#4682B4');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Thunder Storm effect error:', error);
                        this.renderErrorEffect(ctx, 'Thunder Storm', width, height);
                    }
                }
            },

            moltenLava: {
                name: 'Molten Lava',
                desc: 'Flowing magma with heat waves',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, height, 0, 0);
                        bgGradient.addColorStop(0, '#8B0000');
                        bgGradient.addColorStop(0.3, '#DC143C');
                        bgGradient.addColorStop(0.6, '#FF6347');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let y = height - 100; y < height; y += 10) {
                            for (let x = 0; x < width; x += 15) {
                                const offset = Math.sin((x + Date.now() * 0.002) * 0.02) * 20;
                                const bubbleX = x + offset;
                                const bubbleY = y + Math.sin((x + Date.now() * 0.003) * 0.01) * 5;
                                const size = Math.random() * 8 + 3;
                                
                                const lavaGradient = ctx.createRadialGradient(bubbleX, bubbleY, 0, bubbleX, bubbleY, size);
                                lavaGradient.addColorStop(0, '#FFFF00');
                                lavaGradient.addColorStop(0.4, '#FF6347');
                                lavaGradient.addColorStop(1, '#8B0000');
                                
                                ctx.fillStyle = lavaGradient;
                                ctx.beginPath();
                                ctx.arc(bubbleX, bubbleY, size, 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#FF4500';
                        ctx.shadowBlur = 35;
                        ctx.strokeStyle = '#8B0000';
                        ctx.lineWidth = 6;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, height, 0, 0);
                        textGradient.addColorStop(0, '#FF0000');
                        textGradient.addColorStop(0.3, '#FF6347');
                        textGradient.addColorStop(0.6, '#FFD700');
                        textGradient.addColorStop(1, '#FFFFFF');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Molten Lava effect error:', error);
                        this.renderErrorEffect(ctx, 'Molten Lava', width, height);
                    }
                }
            },

            crystalCave: {
                name: 'Crystal Cave',
                desc: 'Sparkling gem formations',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
                        bgGradient.addColorStop(0, '#2F4F4F');
                        bgGradient.addColorStop(0.6, '#1C2B2B');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 40; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 30 + 10;
                            const sides = 6 + Math.floor(Math.random() * 4);
                            const hue = Math.random() * 360;
                            
                            ctx.save();
                            ctx.translate(x, y);
                            ctx.rotate(Math.random() * Math.PI * 2);
                            
                            const crystalGradient = ctx.createLinearGradient(-size, -size, size, size);
                            crystalGradient.addColorStop(0, `hsla(${hue}, 80%, 90%, 0.8)`);
                            crystalGradient.addColorStop(0.5, `hsla(${hue}, 60%, 70%, 0.8)`);
                            crystalGradient.addColorStop(1, `hsla(${hue}, 40%, 50%, 0.6)`);
                            
                            ctx.fillStyle = crystalGradient;
                            ctx.beginPath();
                            for (let j = 0; j < sides; j++) {
                                const angle = (j * Math.PI * 2) / sides;
                                const radius = size * (0.5 + Math.random() * 0.5);
                                const px = Math.cos(angle) * radius;
                                const py = Math.sin(angle) * radius;
                                if (j === 0) ctx.moveTo(px, py);
                                else ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                            ctx.fill();
                            
                            ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.8)`;
                            ctx.lineWidth = 2;
                            ctx.stroke();
                            ctx.restore();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#E0FFFF';
                        ctx.shadowBlur = 20;
                        ctx.strokeStyle = '#008B8B';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, width, 0);
                        textGradient.addColorStop(0, '#E0FFFF');
                        textGradient.addColorStop(0.2, '#AFEEEE');
                        textGradient.addColorStop(0.4, '#40E0D0');
                        textGradient.addColorStop(0.6, '#00CED1');
                        textGradient.addColorStop(0.8, '#008B8B');
                        textGradient.addColorStop(1, '#E0FFFF');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Crystal Cave effect error:', error);
                        this.renderErrorEffect(ctx, 'Crystal Cave', width, height);
                    }
                }
            },

            digitalMatrix: {
                name: 'Digital Matrix',
                desc: 'Falling code rain effect',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000000';
                        ctx.fillRect(0, 0, width, height);

                        const chars = '01アカサタナハマヤラワ';
                        const fontSize = 14;
                        ctx.font = `${fontSize}px monospace`;
                        
                        for (let x = 0; x < width; x += fontSize) {
                            for (let y = fontSize; y < height; y += fontSize) {
                                const char = chars[Math.floor(Math.random() * chars.length)];
                                const alpha = Math.random();
                                const green = Math.floor(100 + alpha * 155);
                                
                                if (Math.random() > 0.95) {
                                    ctx.fillStyle = `rgb(255, 255, 255)`;
                                } else if (Math.random() > 0.8) {
                                    ctx.fillStyle = `rgb(0, 255, 0)`;
                                } else {
                                    ctx.fillStyle = `rgb(0, ${green}, 0)`;
                                }
                                
                                if (Math.random() > 0.3) {
                                    ctx.fillText(char, x, y);
                                }
                            }
                        }

                        const textFontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${textFontSize}px ${this.fontSelect ? this.fontSelect.value : 'monospace'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#00FF00';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#003300';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        ctx.fillStyle = '#00FF00';
                        ctx.fillText(text, width / 2, height / 2);

                        ctx.shadowColor = '#FFFFFF';
                        ctx.shadowBlur = 10;
                        ctx.strokeStyle = '#00FF00';
                        ctx.lineWidth = 2;
                        ctx.strokeText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Digital Matrix effect error:', error);
                        this.renderErrorEffect(ctx, 'Digital Matrix', width, height);
                    }
                }
            },

            underwaterBubbles: {
                name: 'Underwater Bubbles',
                desc: 'Deep ocean with floating bubbles',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
                        bgGradient.addColorStop(0, '#000080');
                        bgGradient.addColorStop(0.3, '#0000CD');
                        bgGradient.addColorStop(0.7, '#191970');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 60; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 20 + 5;
                            const opacity = Math.random() * 0.6 + 0.2;
                            
                            const bubbleGradient = ctx.createRadialGradient(
                                x - size * 0.3, y - size * 0.3, 0,
                                x, y, size
                            );
                            bubbleGradient.addColorStop(0, `rgba(173, 216, 230, ${opacity})`);
                            bubbleGradient.addColorStop(0.7, `rgba(100, 149, 237, ${opacity * 0.5})`);
                            bubbleGradient.addColorStop(1, `rgba(0, 191, 255, ${opacity * 0.2})`);
                            
                            ctx.fillStyle = bubbleGradient;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                            
                            ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.stroke();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#87CEEB';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#000080';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#E0FFFF');
                        textGradient.addColorStop(0.3, '#AFEEEE');
                        textGradient.addColorStop(0.7, '#40E0D0');
                        textGradient.addColorStop(1, '#008B8B');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Underwater Bubbles effect error:', error);
                        this.renderErrorEffect(ctx, 'Underwater Bubbles', width, height);
                    }
                }
            },

            holographicShimmer: {
                name: 'Holographic Shimmer',
                desc: 'Rainbow hologram with light refraction',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#0a0a0a';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 100; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 3 + 1;
                            const hue = (Date.now() * 0.1 + i * 10) % 360;
                            const opacity = Math.sin(Date.now() * 0.005 + i) * 0.3 + 0.5;
                            
                            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${opacity})`;
                            ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
                            ctx.shadowBlur = 10;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }

                        for (let y = 0; y < height; y += 4) {
                            const hue = (y + Date.now() * 0.1) % 360;
                            const opacity = 0.1;
                            ctx.strokeStyle = `hsla(${hue}, 100%, 50%, ${opacity})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        for (let i = 0; i < 5; i++) {
                            const offsetX = (Math.random() - 0.5) * 4;
                            const offsetY = (Math.random() - 0.5) * 4;
                            const hue = (Date.now() * 0.2 + i * 60) % 360;
                            
                            ctx.fillStyle = `hsla(${hue}, 100%, 60%, 0.3)`;
                            ctx.fillText(text, width / 2 + offsetX, height / 2 + offsetY);
                        }

                        const mainHue = (Date.now() * 0.5) % 360;
                        const textGradient = ctx.createLinearGradient(0, 0, width, 0);
                        textGradient.addColorStop(0, `hsl(${mainHue}, 100%, 80%)`);
                        textGradient.addColorStop(0.25, `hsl(${(mainHue + 90) % 360}, 100%, 80%)`);
                                                textGradient.addColorStop(0.5, `hsl(${(mainHue + 180) % 360}, 100%, 80%)`);
                        textGradient.addColorStop(0.75, `hsl(${(mainHue + 270) % 360}, 100%, 80%)`);
                        textGradient.addColorStop(1, `hsl(${mainHue}, 100%, 80%)`);
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);

                        ctx.strokeStyle = '#FFFFFF';
                        ctx.lineWidth = 1;
                        ctx.strokeText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Holographic Shimmer effect error:', error);
                        this.renderErrorEffect(ctx, 'Holographic Shimmer', width, height);
                    }
                }
            },

            shadowRealm: {
                name: 'Shadow Realm',
                desc: 'Dark void with ghostly shadows',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
                        bgGradient.addColorStop(0, '#1a1a1a');
                        bgGradient.addColorStop(0.5, '#0d0d0d');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 20; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 100 + 50;
                            const opacity = Math.random() * 0.3 + 0.1;
                            
                            const shadowGradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                            shadowGradient.addColorStop(0, `rgba(128, 0, 128, ${opacity})`);
                            shadowGradient.addColorStop(0.5, `rgba(75, 0, 130, ${opacity * 0.7})`);
                            shadowGradient.addColorStop(1, `rgba(25, 25, 112, 0)`);
                            
                            ctx.fillStyle = shadowGradient;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        for (let i = 0; i < 30; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 3 + 1;
                            const twinkle = Math.sin(Date.now() * 0.002 + i) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `rgba(148, 0, 211, ${twinkle * 0.8})`;
                            ctx.shadowColor = '#9400D3';
                            ctx.shadowBlur = 8;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                            ctx.shadowBlur = 0;
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        for (let i = 0; i < 3; i++) {
                            const offsetX = (i - 1) * 8;
                            const offsetY = (i - 1) * 8;
                            const opacity = (3 - i) * 0.2;
                            
                            ctx.fillStyle = `rgba(75, 0, 130, ${opacity})`;
                            ctx.fillText(text, width / 2 + offsetX, height / 2 + offsetY);
                        }

                        ctx.shadowColor = '#9400D3';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#4B0082';
                        ctx.lineWidth = 2;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#E6E6FA');
                        textGradient.addColorStop(0.3, '#DDA0DD');
                        textGradient.addColorStop(0.7, '#9370DB');
                        textGradient.addColorStop(1, '#4B0082');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Shadow Realm effect error:', error);
                        this.renderErrorEffect(ctx, 'Shadow Realm', width, height);
                    }
                }
            },

            galaxyNebula: {
                name: 'Galaxy Nebula',
                desc: 'Colorful cosmic gas clouds',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000011';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 300; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 2 + 0.5;
                            const brightness = Math.random();
                            
                            ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        for (let i = 0; i < 5; i++) {
                            const centerX = Math.random() * width;
                            const centerY = Math.random() * height;
                            const size = Math.random() * 200 + 100;
                            const hue = Math.random() * 360;
                            
                            const nebulaGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, size);
                            nebulaGradient.addColorStop(0, `hsla(${hue}, 80%, 60%, 0.4)`);
                            nebulaGradient.addColorStop(0.3, `hsla(${hue + 30}, 70%, 50%, 0.3)`);
                            nebulaGradient.addColorStop(0.6, `hsla(${hue + 60}, 60%, 40%, 0.2)`);
                            nebulaGradient.addColorStop(1, `hsla(${hue + 90}, 50%, 30%, 0)`);
                            
                            ctx.fillStyle = nebulaGradient;
                            ctx.beginPath();
                            ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#FF69B4';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#8A2BE2';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, width, height);
                        textGradient.addColorStop(0, '#FF1493');
                        textGradient.addColorStop(0.2, '#FF69B4');
                        textGradient.addColorStop(0.4, '#DA70D6');
                        textGradient.addColorStop(0.6, '#9370DB');
                        textGradient.addColorStop(0.8, '#8A2BE2');
                        textGradient.addColorStop(1, '#4B0082');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Galaxy Nebula effect error:', error);
                        this.renderErrorEffect(ctx, 'Galaxy Nebula', width, height);
                    }
                }
            },

            electricPlasma: {
                name: 'Electric Plasma',
                desc: 'High-energy plasma discharge',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000022';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 15; i++) {
                            const startX = Math.random() * width;
                            const startY = Math.random() * height;
                            const endX = Math.random() * width;
                            const endY = Math.random() * height;
                            
                            const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
                            gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
                            gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.6)');
                            gradient.addColorStop(1, 'rgba(255, 255, 0, 0.8)');
                            
                            ctx.strokeStyle = gradient;
                            ctx.lineWidth = Math.random() * 4 + 2;
                            ctx.shadowColor = '#00FFFF';
                            ctx.shadowBlur = 15;
                            
                            ctx.beginPath();
                            ctx.moveTo(startX, startY);
                            
                            const segments = 5 + Math.floor(Math.random() * 5);
                            for (let j = 1; j <= segments; j++) {
                                const t = j / segments;
                                const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 50;
                                const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 50;
                                ctx.lineTo(x, y);
                            }
                            ctx.stroke();
                        }

                        for (let i = 0; i < 80; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 6 + 2;
                            const hue = Math.random() * 120 + 180;
                            const pulse = Math.sin(Date.now() * 0.01 + i) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${pulse})`;
                            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                            ctx.shadowBlur = 12;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.shadowBlur = 0;

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'Arial'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 35;
                        ctx.strokeStyle = '#FF00FF';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, width, 0);
                        textGradient.addColorStop(0, '#00FFFF');
                        textGradient.addColorStop(0.3, '#FFFFFF');
                        textGradient.addColorStop(0.6, '#FF00FF');
                        textGradient.addColorStop(1, '#FFFF00');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Electric Plasma effect error:', error);
                        this.renderErrorEffect(ctx, 'Electric Plasma', width, height);
                    }
                }
            },

            mysticRunes: {
                name: 'Mystic Runes',
                desc: 'Ancient magical symbols',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
                        bgGradient.addColorStop(0, '#2F1B14');
                        bgGradient.addColorStop(0.5, '#1A0F0A');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        const runes = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'];
                        
                        for (let i = 0; i < 30; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const rune = runes[Math.floor(Math.random() * runes.length)];
                            const size = Math.random() * 20 + 10;
                            const opacity = Math.random() * 0.6 + 0.2;
                            const glow = Math.sin(Date.now() * 0.001 + i) * 0.3 + 0.5;
                            
                            ctx.font = `${size}px serif`;
                            ctx.textAlign = 'center';
                            ctx.fillStyle = `rgba(255, 215, 0, ${opacity * glow})`;
                            ctx.shadowColor = '#FFD700';
                            ctx.shadowBlur = 8;
                            ctx.fillText(rune, x, y);
                        }

                        for (let i = 0; i < 5; i++) {
                            const centerX = Math.random() * width;
                            const centerY = Math.random() * height;
                            const radius = Math.random() * 40 + 20;
                            const segments = 6;
                            
                            ctx.strokeStyle = `rgba(255, 215, 0, 0.4)`;
                            ctx.lineWidth = 2;
                            ctx.shadowColor = '#FFD700';
                            ctx.shadowBlur = 10;
                            
                            ctx.beginPath();
                            for (let j = 0; j <= segments; j++) {
                                const angle = (j * Math.PI * 2) / segments;
                                const x = centerX + Math.cos(angle) * radius;
                                const y = centerY + Math.sin(angle) * radius;
                                if (j === 0) ctx.moveTo(x, y);
                                else ctx.lineTo(x, y);
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }
                        ctx.shadowBlur = 0;

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'serif'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#FFD700';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#8B4513';
                        ctx.lineWidth = 4;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#FFFF00');
                        textGradient.addColorStop(0.3, '#FFD700');
                        textGradient.addColorStop(0.7, '#FFA500');
                        textGradient.addColorStop(1, '#FF8C00');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Mystic Runes effect error:', error);
                        this.renderErrorEffect(ctx, 'Mystic Runes', width, height);
                    }
                }
            },

            cyberGrid: {
                name: 'Cyber Grid',
                desc: 'Futuristic digital grid system',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000011';
                        ctx.fillRect(0, 0, width, height);

                        const gridSize = 30;
                        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                        ctx.lineWidth = 1;
                        
                        for (let x = 0; x <= width; x += gridSize) {
                            const opacity = Math.sin(x * 0.01 + Date.now() * 0.002) * 0.2 + 0.3;
                            ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                            ctx.beginPath();
                            ctx.moveTo(x, 0);
                            ctx.lineTo(x, height);
                            ctx.stroke();
                        }
                        
                        for (let y = 0; y <= height; y += gridSize) {
                            const opacity = Math.sin(y * 0.01 + Date.now() * 0.002) * 0.2 + 0.3;
                            ctx.strokeStyle = `rgba(0, 255, 255, ${opacity})`;
                            ctx.beginPath();
                            ctx.moveTo(0, y);
                            ctx.lineTo(width, y);
                            ctx.stroke();
                        }

                        for (let i = 0; i < 20; i++) {
                            const x = Math.floor(Math.random() * (width / gridSize)) * gridSize;
                            const y = Math.floor(Math.random() * (height / gridSize)) * gridSize;
                            const pulse = Math.sin(Date.now() * 0.005 + i) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `rgba(0, 255, 255, ${pulse * 0.8})`;
                            ctx.shadowColor = '#00FFFF';
                            ctx.shadowBlur = 10;
                            ctx.fillRect(x + 2, y + 2, gridSize - 4, gridSize - 4);
                        }

                        for (let i = 0; i < 10; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 4 + 2;
                            
                            ctx.fillStyle = '#FF0080';
                            ctx.shadowColor = '#FF0080';
                            ctx.shadowBlur = 8;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.shadowBlur = 0;

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'monospace'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#00FFFF';
                        ctx.shadowBlur = 25;
                        ctx.strokeStyle = '#0080FF';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, width, 0);
                        textGradient.addColorStop(0, '#00FFFF');
                        textGradient.addColorStop(0.5, '#FFFFFF');
                        textGradient.addColorStop(1, '#FF0080');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Cyber Grid effect error:', error);
                        this.renderErrorEffect(ctx, 'Cyber Grid', width, height);
                    }
                }
            },

            enchantedForest: {
                name: 'Enchanted Forest',
                desc: 'Magical woodland with fireflies',
                generate: (ctx, text, width, height) => {
                    try {
                        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
                        bgGradient.addColorStop(0, '#1B4332');
                        bgGradient.addColorStop(0.4, '#2D5A3D');
                        bgGradient.addColorStop(0.8, '#081C15');
                        bgGradient.addColorStop(1, '#000000');
                        ctx.fillStyle = bgGradient;
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 15; i++) {
                            const x = (i / 15) * width + (Math.random() - 0.5) * 100;
                            const treeHeight = Math.random() * height * 0.8 + height * 0.2;
                            const trunkWidth = Math.random() * 20 + 10;
                            
                            ctx.fillStyle = '#2D5A3D';
                            ctx.fillRect(x - trunkWidth/2, height - treeHeight, trunkWidth, treeHeight);
                            
                            for (let j = 0; j < 3; j++) {
                                const leafY = height - treeHeight + j * (treeHeight / 4);
                                const leafSize = (3 - j) * 20 + 30;
                                const leafGradient = ctx.createRadialGradient(x, leafY, 0, x, leafY, leafSize);
                                leafGradient.addColorStop(0, `rgba(34, 139, 34, 0.8)`);
                                leafGradient.addColorStop(1, `rgba(0, 100, 0, 0.3)`);
                                
                                ctx.fillStyle = leafGradient;
                                ctx.beginPath();
                                ctx.arc(x, leafY, leafSize, 0, Math.PI * 2);
                                ctx.fill();
                            }
                        }

                        for (let i = 0; i < 50; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 3 + 1;
                            const hue = Math.random() * 60 + 60;
                            const twinkle = Math.sin(Date.now() * 0.003 + i * 0.5) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${twinkle})`;
                            ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
                            ctx.shadowBlur = 12;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }
                        ctx.shadowBlur = 0;

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'serif'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#90EE90';
                        ctx.shadowBlur = 20;
                        ctx.strokeStyle = '#228B22';
                        ctx.lineWidth = 3;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createLinearGradient(0, 0, 0, height);
                        textGradient.addColorStop(0, '#ADFF2F');
                        textGradient.addColorStop(0.3, '#90EE90');
                        textGradient.addColorStop(0.7, '#32CD32');
                        textGradient.addColorStop(1, '#228B22');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Enchanted Forest effect error:', error);
                        this.renderErrorEffect(ctx, 'Enchanted Forest', width, height);
                    }
                }
            },

            quantumField: {
                name: 'Quantum Field',
                desc: 'Subatomic particle interactions',
                generate: (ctx, text, width, height) => {
                    try {
                        ctx.fillStyle = '#000005';
                        ctx.fillRect(0, 0, width, height);

                        for (let i = 0; i < 100; i++) {
                            const x = Math.random() * width;
                            const y = Math.random() * height;
                            const size = Math.random() * 2 + 0.5;
                            const phase = Date.now() * 0.001 + i;
                            const opacity = Math.sin(phase) * 0.5 + 0.5;
                            
                            ctx.fillStyle = `rgba(138, 43, 226, ${opacity})`;
                            ctx.beginPath();
                            ctx.arc(x, y, size, 0, Math.PI * 2);
                            ctx.fill();
                        }

                        for (let i = 0; i < 80; i++) {
                            for (let j = i + 1; j < 80; j++) {
                                const distance = Math.sqrt(
                                    Math.pow((i % 10) * (width / 10) - (j % 10) * (width / 10), 2) +
                                    Math.pow(Math.floor(i / 10) * (height / 8) - Math.floor(j / 8) * (height / 8), 2)
                                );
                                
                                if (distance < 100 && Math.random() > 0.7) {
                                    const opacity = (100 - distance) / 100 * 0.3;
                                    const wave = Math.sin(Date.now() * 0.005 + distance * 0.1) * 0.5 + 0.5;
                                    
                                    ctx.strokeStyle = `rgba(75, 0, 130, ${opacity * wave})`;
                                    ctx.lineWidth = 1;
                                    ctx.beginPath();
                                    ctx.moveTo((i % 10) * (width / 10), Math.floor(i / 10) * (height / 8));
                                    ctx.lineTo((j % 10) * (width / 10), Math.floor(j / 8) * (height / 8));
                                    ctx.stroke();
                                }
                            }
                        }

                        for (let i = 0; i < 20; i++) {
                            const centerX = Math.random() * width;
                            const centerY = Math.random() * height;
                            const maxRadius = Math.random() * 30 + 10;
                            const phase = Date.now() * 0.002 + i;
                            
                            for (let r = 5; r <= maxRadius; r += 5) {
                                const opacity = Math.sin(phase + r * 0.1) * 0.3 + 0.2;
                                ctx.strokeStyle = `rgba(147, 112, 219, ${opacity})`;
                                ctx.lineWidth = 1;
                                ctx.beginPath();
                                ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
                                ctx.stroke();
                            }
                        }

                        const fontSize = this.getFontSize(text, width, height);
                        ctx.font = `bold ${fontSize}px ${this.fontSelect ? this.fontSelect.value : 'monospace'}`;
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';

                        ctx.shadowColor = '#9370DB';
                        ctx.shadowBlur = 30;
                        ctx.strokeStyle = '#4B0082';
                        ctx.lineWidth = 2;
                        ctx.strokeText(text, width / 2, height / 2);

                        const textGradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, fontSize);
                        textGradient.addColorStop(0, '#FFFFFF');
                        textGradient.addColorStop(0.2, '#E6E6FA');
                        textGradient.addColorStop(0.5, '#DDA0DD');
                        textGradient.addColorStop(0.8, '#9370DB');
                        textGradient.addColorStop(1, '#4B0082');
                        ctx.fillStyle = textGradient;
                        ctx.fillText(text, width / 2, height / 2);
                    } catch (error) {
                        console.error('Quantum Field effect error:', error);
                        this.renderErrorEffect(ctx, 'Quantum Field', width, height);
                    }
                }
            }
        };

        console.log(`✅ Initialized ${Object.keys(this.effects).length} text effects`);
    }

    renderErrorEffect(ctx, effectName, width, height) {
        try {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(0, 0, width, height);
            
            ctx.fillStyle = '#e74c3c';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`Error: ${effectName}`, width / 2, height / 2 - 10);
            ctx.fillText('Effect failed to render', width / 2, height / 2 + 10);
        } catch (error) {
            console.error('Error rendering error effect:', error);
        }
    }

    getFontSize(text, width, height) {
        try {
            const baseSize = Math.min(width, height) / 8;
            const textLength = text.length;
            let fontSize = baseSize;
            
            if (textLength > 10) {
                fontSize = baseSize * (10 / textLength);
            }
            
            return Math.max(fontSize, 12);
        } catch (error) {
            console.error('Font size calculation error:', error);
            return 48;
        }
    }

    showLoading(show) {
        try {
            if (this.loadingOverlay) {
                this.loadingOverlay.style.display = show ? 'flex' : 'none';
            }
        } catch (error) {
            console.error('Show loading error:', error);
        }
    }

    async generateAllEffects() {
        try {
            const text = this.textInput ? this.textInput.value.trim() : '';
            
            if (!text) {
                this.showToast('Please enter some text first!', 'error');
                return;
            }

            this.showLoading(true);
            
            if (this.effectsGrid) {
                this.effectsGrid.innerHTML = '';
            }

            const effects = Object.entries(this.effects);
            
            for (let i = 0; i < effects.length; i++) {
                const [key, effect] = effects[i];
                
                try {
                    await this.createEffectCard(key, effect, text);
                    await new Promise(resolve => setTimeout(resolve, 50));
                } catch (error) {
                    console.error(`Error creating ${effect.name}:`, error);
                }
            }

            this.showLoading(false);
            this.showToast(`Generated ${effects.length} effects for "${text}"!`, 'success');
            
        } catch (error) {
            console.error('Generate all effects error:', error);
            this.showLoading(false);
            this.showToast('Error generating effects', 'error');
        }
    }

    async createEffectCard(key, effect, text) {
        return new Promise((resolve) => {
            try {
                const card = document.createElement('div');
                card.className = 'effect-card';
                
                const canvas = document.createElement('canvas');
                canvas.width = 300;
                canvas.height = 150;
                
                const ctx = canvas.getContext('2d');
                
                setTimeout(() => {
                    try {
                        effect.generate(ctx, text, canvas.width, canvas.height);
                        
                        const info = document.createElement('div');
                        info.className = 'effect-info';
                        info.innerHTML = `
                            <h3>${effect.name}</h3>
                            <p>${effect.desc}</p>
                        `;
                        
                        card.appendChild(canvas);
                        card.appendChild(info);
                        
                        card.addEventListener('click', () => {
                            this.showFullEffect(key, effect, text);
                            if (window.particleSystem && window.particleSystem.addExplosion) {
                                window.particleSystem.addExplosion(
                                    Math.random() * window.innerWidth,
                                    Math.random() * window.innerHeight
                                );
                            }
                        });
                        
                        if (this.effectsGrid) {
                            this.effectsGrid.appendChild(card);
                        }
                        
                        resolve();
                    } catch (error) {
                        console.error(`Card generation error for ${effect.name}:`, error);
                        resolve();
                    }
                }, 10);
                
            } catch (error) {
                console.error(`Create card error for ${effect.name}:`, error);
                resolve();
            }
        });
    }

    showFullEffect(key, effect, text) {
        try {
            if (!this.finalCanvas) return;
            
            const [width, height] = this.currentSize.split('x').map(Number);
            
            this.finalCanvas.width = width;
            this.finalCanvas.height = height;
            
            const ctx = this.finalCanvas.getContext('2d');
            
            effect.generate(ctx, text, width, height);
            
            this.selectedEffect = { key, effect, text };
            
            this.finalCanvas.classList.add('show');
            if (this.downloadButtons) {
                this.downloadButtons.style.display = 'flex';
            }
            
            this.showToast(`${effect.name} ready for download!`, 'success');
            
            if (window.particleSystem) {
                window.particleSystem.addWave(width/2, height/2);
            }
            
        } catch (error) {
            console.error('Show full effect error:', error);
            this.showToast('Error displaying full effect', 'error');
        }
    }

    showToast(message, type = 'success') {
        try {
            if (!this.toast) return;
            
            this.toast.textContent = message;
            this.toast.className = `toast ${type}`;
            this.toast.classList.add('show');

            setTimeout(() => {
                this.toast.classList.remove('show');
            }, 3000);
        } catch (error) {
            console.error('Toast error:', error);
        }
    }

    debounce(func, wait) {
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
}

// Aktivasi fitur particles yang sudah diperbaiki
document.addEventListener('DOMContentLoaded', () => {
    try {
        console.log('🎨 Initializing Ultimate Text Effect Generator...');

        // Inisialisasi sistem partikel yang sudah diperbaiki
        const particleCanvas = document.getElementById('particleCanvas');
        if (particleCanvas) {
            window.particleSystem = new EnhancedParticleSystem(particleCanvas);
            console.log('✅ Enhanced particle system initialized');
        } else {
            console.warn('⚠️ Particle canvas not found');
        }

        // Inisialisasi generator efek teks
        window.textEffectGenerator = new UltimateTextEffectGenerator();
        console.log('✅ Text effect generator with 20 effects initialized');

        // Event listener untuk toggle partikel
        const particleToggle = document.getElementById('particleToggle');
        if (particleToggle && window.particleSystem) {
            particleToggle.checked = true; // Aktifkan partikel secara default
            window.particleSystem.toggle(true);
            
            particleToggle.addEventListener('change', (e) => {
                window.particleSystem.toggle(e.target.checked);
                if (e.target.checked) {
                    console.log('🎆 Particles activated');
                    window.particleSystem.addExplosion(
                        window.innerWidth / 2, 
                        window.innerHeight / 2
                    );
                } else {
                    console.log('🎆 Particles deactivated');
                }
            });
        }

        // Event listener untuk mouse movement yang memicu efek partikel
        document.addEventListener('mousemove', (e) => {
            if (window.particleSystem && window.particleSystem.isActive) {
                // Update posisi mouse untuk sistem partikel
                window.particleSystem.mouse.x = e.clientX;
                window.particleSystem.mouse.y = e.clientY;
                
                // Tambahkan efek sparkle sesekali
                if (Math.random() < 0.03) {
                    for (let i = 0; i < 2; i++) {
                        window.particleSystem.sparkles.push({
                            x: e.clientX + (Math.random() - 0.5) * 50,
                            y: e.clientY + (Math.random() - 0.5) * 50,
                            life: 30 + Math.random() * 20,
                            maxLife: 30 + Math.random() * 20,
                            speed: Math.random() * 3 + 1,
                            size: Math.random() * 2 + 1,
                            hue: Math.random() * 360,
                            opacity: 1
                        });
                    }
                }
            }
        });

        // Event listener untuk klik yang memicu ledakan partikel
        document.addEventListener('click', (e) => {
            if (window.particleSystem && window.particleSystem.isActive) {
                window.particleSystem.addExplosion(e.clientX, e.clientY);
                
                // Tambahkan gelombang juga
                setTimeout(() => {
                    window.particleSystem.addWave(e.clientX, e.clientY);
                }, 200);
            }
        });

        // Auto-generate efek setelah halaman dimuat
        setTimeout(() => {
            if (window.textEffectGenerator) {
                const defaultText = window.textEffectGenerator.textInput?.value || 'AMAZING';
                if (defaultText) {
                    window.textEffectGenerator.generateAllEffects();
                }
            }
        }, 1000);

        console.log('%c🎨 Ultimate Text Effect Generator - 20 Effects Ready!', 'color: #ff006e; font-size: 16px; font-weight: bold;');
        console.log('%c🎆 Enhanced Particle System Active!', 'color: #8338ec; font-size: 14px; font-weight: bold;');
        console.log('%c⭐ Features:', 'color: #3a86ff; font-size: 14px; font-weight: bold;');
        console.log('  • 20 Stunning text effects');
        console.log('  • Interactive particle system');
        console.log('  • Mouse trail effects');
        console.log('  • Click explosions');
        console.log('  • Animated sparkles');
        console.log('  • Wave effects');
        console.log('  • Responsive design');
        console.log('%c🚀 Ready to create magic!', 'color: #06ffa5; font-size: 14px; font-weight: bold;');

    } catch (error) {
        console.error('❌ Initialization failed:', error);
    }
});

// Fungsi download yang sudah diperbaiki
function downloadImage(format = 'png') {
    try {
        const canvas = document.getElementById('finalCanvas');
        if (!canvas) {
            showToast('No image to download', 'error');
            return;
        }

        const quality = format === 'jpeg' ? 0.9 : undefined;
        const dataURL = canvas.toDataURL(`image/${format}`, quality);
        
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
        const effectName = window.textEffectGenerator && window.textEffectGenerator.selectedEffect 
            ? window.textEffectGenerator.selectedEffect.effect.name.replace(/\s+/g, '_') 
            : 'TextEffect';
        
        link.download = `${effectName}_${timestamp}.${format}`;
        link.href = dataURL;
        link.click();
        
        showToast(`Downloaded as ${format.toUpperCase()}!`, 'success');
        
        // Tambahkan efek partikel saat download
        if (window.particleSystem) {
            window.particleSystem.addExplosion(
                window.innerWidth / 2,
                window.innerHeight / 3
            );
        }
    } catch (error) {
        console.error('Download error:', error);
        showToast('Download failed. Please try again.', 'error');
    }
}

function showToast(message, type = 'success') {
    try {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.className = `toast ${type}`;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    } catch (error) {
        console.error('Toast error:', error);
    }
}

console.log('🎉 Ultimate Text Effect Generator - 20 EFFECTS + FULL PARTICLES LOADED! 🎉');
