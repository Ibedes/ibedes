import React, { useState, useEffect, useCallback } from 'react';

interface Particle {
    id: number;
    x: number;
    y: number;
    color: string;
}

const COLORS = ['#FFD700', '#FF6347', '#00CED1', '#ADFF2F', '#FF69B4'];

const ClickEffect: React.FC = () => {
    const [particles, setParticles] = useState<Particle[]>([]);

    const createParticles = useCallback((x: number, y: number) => {
        const newParticles: Particle[] = [];
        const particleCount = 8; // Number of particles per click

        for (let i = 0; i < particleCount; i++) {
            newParticles.push({
                id: Date.now() + i + Math.random(),
                x,
                y,
                color: COLORS[Math.floor(Math.random() * COLORS.length)],
            });
        }

        setParticles((prev) => [...prev, ...newParticles]);
    }, []);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            createParticles(e.clientX, e.clientY);
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
        };
    }, [createParticles]);

    const handleAnimationEnd = (id: number) => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9999,
                overflow: 'hidden',
            }}
        >
            {particles.map((p, index) => (
                <ParticleItem key={p.id} particle={p} index={index} onComplete={() => handleAnimationEnd(p.id)} />
            ))}
        </div>
    );
};

const ParticleItem: React.FC<{ particle: Particle; index: number; onComplete: () => void }> = ({
    particle,
    index,
    onComplete,
}) => {
    // Calculate random angle and distance for explosion effect
    const angle = (index / 8) * 360 * (Math.PI / 180); // Distribute evenly
    const velocity = 50 + Math.random() * 50; // Random distance
    const tx = Math.cos(angle) * velocity;
    const ty = Math.sin(angle) * velocity;

    return (
        <div
            onAnimationEnd={onComplete}
            style={{
                position: 'absolute',
                left: particle.x,
                top: particle.y,
                width: '6px',
                height: '6px',
                backgroundColor: particle.color,
                borderRadius: '50%',
                transform: 'translate(-50%, -50%)',
                animation: `particle-explode 0.6s ease-out forwards`,
                // We use a custom property to pass the translation values to the keyframes if we were using CSS variables,
                // but since we can't easily inject dynamic keyframes per particle in pure CSS modules without overhead,
                // we'll use inline styles for the transform in a way that works with a defined keyframe or use a simple approach.
                // Actually, let's use a simpler approach: standard CSS animation with CSS variables for direction.
                // @ts-ignore
                '--tx': `${tx}px`,
                '--ty': `${ty}px`,
            }}
        />
    );
};

export default ClickEffect;
