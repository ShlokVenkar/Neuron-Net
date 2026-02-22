import React, { useEffect, useRef } from 'react';
import './CosmicBackground.css';

const CosmicBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];
    let gpuChips = [];
    let circuits = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // GPU Chip class for floating GPU visualizations
    class GPUChip {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 40 + 25;
        this.vx = (Math.random() - 0.5) * 0.12;
        this.vy = (Math.random() - 0.5) * 0.12;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.008;
        this.pulse = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.15 + 0.08;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        this.pulse += 0.02;

        if (this.x < -this.size) this.x = canvas.width + this.size;
        if (this.x > canvas.width + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = canvas.height + this.size;
        if (this.y > canvas.height + this.size) this.y = -this.size;
      }

      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const pulseEffect = Math.sin(this.pulse) * 0.3 + 0.7;
        const glowIntensity = this.opacity * pulseEffect;

        // GPU chip outline with glow
        ctx.shadowBlur = 15;
        ctx.shadowColor = `rgba(139, 92, 246, ${glowIntensity})`;
        ctx.strokeStyle = `rgba(139, 92, 246, ${glowIntensity * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-this.size / 2, -this.size / 2, this.size, this.size);

        // Internal grid pattern
        ctx.shadowBlur = 0;
        ctx.strokeStyle = `rgba(167, 139, 250, ${glowIntensity * 0.4})`;
        ctx.lineWidth = 0.8;
        const gridSize = this.size / 4;
        for (let i = 1; i < 4; i++) {
          ctx.beginPath();
          ctx.moveTo(-this.size / 2 + gridSize * i, -this.size / 2);
          ctx.lineTo(-this.size / 2 + gridSize * i, this.size / 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(-this.size / 2, -this.size / 2 + gridSize * i);
          ctx.lineTo(this.size / 2, -this.size / 2 + gridSize * i);
          ctx.stroke();
        }

        // Corner circuits with glow
        ctx.fillStyle = `rgba(192, 132, 252, ${glowIntensity * 0.7})`;
        const cornerSize = this.size / 10;
        ctx.fillRect(-this.size / 2, -this.size / 2, cornerSize, cornerSize);
        ctx.fillRect(this.size / 2 - cornerSize, -this.size / 2, cornerSize, cornerSize);
        ctx.fillRect(-this.size / 2, this.size / 2 - cornerSize, cornerSize, cornerSize);
        ctx.fillRect(this.size / 2 - cornerSize, this.size / 2 - cornerSize, cornerSize, cornerSize);

        ctx.restore();
      }
    }

    // Circuit line class - streaming data visualization
    class Circuit {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = -50;
        this.length = Math.random() * 80 + 40;
        this.speed = Math.random() * 1.5 + 0.8;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.y += this.speed;
        if (this.y > canvas.height + this.length) {
          this.reset();
        }
      }

      draw() {
        const gradient = ctx.createLinearGradient(this.x, this.y - this.length, this.x, this.y);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0)');
        gradient.addColorStop(0.5, `rgba(167, 139, 250, ${this.opacity})`);
        gradient.addColorStop(1, 'rgba(192, 132, 252, 0)');
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.length);
        ctx.lineTo(this.x, this.y);
        ctx.stroke();

        // Add glowing head
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(192, 132, 252, ${this.opacity * 0.8})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(192, 132, 252, 0.6)';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.radius = Math.random() * 2 + 0.8;
        this.pulsePhase = Math.random() * Math.PI * 2;
        this.opacity = Math.random() * 0.4 + 0.3;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.pulsePhase += 0.03;

        if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
        if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
      }

      draw() {
        const pulse = Math.sin(this.pulsePhase) * 0.3 + 0.7;
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 3);
        gradient.addColorStop(0, `rgba(192, 132, 252, ${this.opacity * pulse})`);
        gradient.addColorStop(0.5, `rgba(139, 92, 246, ${this.opacity * 0.5 * pulse})`);
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }
    }

    // Initialize particles
    for (let i = 0; i < 50; i++) {
      particles.push(new Particle());
    }

    // Initialize GPU chips
    for (let i = 0; i < 6; i++) {
      gpuChips.push(new GPUChip());
    }

    // Initialize circuits
    for (let i = 0; i < 12; i++) {
      circuits.push(new Circuit());
    }

    const drawConnections = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 140) {
            const opacity = (1 - distance / 140) * 0.25;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(167, 139, 250, ${opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      // Darker background for purple-black theme
      ctx.fillStyle = 'rgba(8, 3, 15, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw circuits first (background layer)
      circuits.forEach(circuit => {
        circuit.update();
        circuit.draw();
      });

      // Draw GPU chips
      gpuChips.forEach(chip => {
        chip.update();
        chip.draw();
      });

      // Draw particles
      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      // Draw connections
      drawConnections();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="cosmic-canvas" />
      <div className="cosmic-overlay"></div>
    </>
  );
};

export default CosmicBackground;
