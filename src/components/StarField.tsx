import React, { useEffect, useRef } from 'react';

const StarField: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create stars with more variety and subtlety
    const createStars = () => {
      const stars = [];
      const starCount = 200;

      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        const size = Math.random();
        
        if (size < 0.6) {
          star.className = 'star star-tiny';
        } else if (size < 0.8) {
          star.className = 'star star-small';
        } else if (size < 0.95) {
          star.className = 'star star-medium';
        } else {
          star.className = 'star star-large';
        }

        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationDuration = (3 + Math.random() * 4) + 's';

        stars.push(star);
        container.appendChild(star);
      }

      return stars;
    };

    // Create constellation points
    const createConstellations = () => {
      const constellations = [];
      const constellationCount = 12;

      for (let i = 0; i < constellationCount; i++) {
        const constellation = document.createElement('div');
        constellation.className = 'constellation';
        
        constellation.style.left = Math.random() * 100 + '%';
        constellation.style.top = Math.random() * 100 + '%';
        constellation.style.animationDelay = Math.random() * 3 + 's';
        constellation.style.animationDuration = (2 + Math.random() * 2) + 's';

        constellations.push(constellation);
        container.appendChild(constellation);
      }

      return constellations;
    };

    // Create floating cosmic dust
    const createCosmicDust = () => {
      const dust = [];
      const dustCount = 15;

      for (let i = 0; i < dustCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'floating-dust';
        
        const size = 8 + Math.random() * 24;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = (6 + Math.random() * 6) + 's';

        // Soft cosmic colors
        const colors = [
          'rgba(168, 85, 247, 0.1)',
          'rgba(147, 51, 234, 0.08)',
          'rgba(16, 185, 129, 0.06)',
          'rgba(245, 158, 11, 0.05)',
          'rgba(236, 72, 153, 0.07)',
          'rgba(255, 255, 255, 0.04)'
        ];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        dust.push(particle);
        container.appendChild(particle);
      }

      return dust;
    };

    const stars = createStars();
    const constellations = createConstellations();
    const dust = createCosmicDust();

    return () => {
      stars.forEach(star => star.remove());
      constellations.forEach(constellation => constellation.remove());
      dust.forEach(particle => particle.remove());
    };
  }, []);

  return <div ref={containerRef} className="star-field" />;
};

export default StarField;