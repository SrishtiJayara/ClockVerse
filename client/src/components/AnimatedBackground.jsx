import { useEffect, useRef } from 'react';
export default function AnimatedBackground() {
    var canvasRef = useRef(null);
    useEffect(function () {
        var canvas = canvasRef.current;
        if (!canvas)
            return;
        var ctx = canvas.getContext('2d');
        if (!ctx)
            return;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Particle system
        var particles = [];
        // Create particles
        for (var i = 0; i < 50; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2,
            });
        }
        var animate = function () {
            var isDark = document.documentElement.classList.contains('dark');
            // Clear canvas with semi-transparent background
            ctx.fillStyle = isDark ? 'rgba(29, 53, 87, 0.1)' : 'rgba(241, 250, 238, 0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            // Update and draw particles
            particles.forEach(function (particle) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                // Wrap around edges
                if (particle.x < 0)
                    particle.x = canvas.width;
                if (particle.x > canvas.width)
                    particle.x = 0;
                if (particle.y < 0)
                    particle.y = canvas.height;
                if (particle.y > canvas.height)
                    particle.y = 0;
                // Draw particle
                ctx.fillStyle = isDark 
                    ? "rgba(230, 57, 70, ".concat(particle.opacity, ")")
                    : "rgba(69, 123, 157, ".concat(particle.opacity, ")");
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(animate);
        };
        animate();
        // Handle window resize
        var handleResize = function () {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        return function () { return window.removeEventListener('resize', handleResize); };
    }, []);
    return (<canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: -1, opacity: 0.3 }}/>);
}
