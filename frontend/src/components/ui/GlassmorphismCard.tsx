import React, { useEffect, useRef } from 'react';
import './glassmorphism.css';

const GlassmorphismCard: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const card = cardRef.current;
      if (!card) return;

      const { clientX, clientY } = e;
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = (clientX - left - width / 2) / width;
      const y = (clientY - top - height / 2) / height;

      const images = card.querySelectorAll<HTMLDivElement>('.floating-element');
      images.forEach((image, index) => {
        const speed = (index + 1) * 0.5;
        const dx = -x * speed * 20;
        const dy = -y * speed * 20;
        image.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="glassmorphism-card" ref={cardRef}>
      <div className="bg-box" style={{ top: '10%', left: '15%' }}></div>
      <div className="bg-box" style={{ bottom: '15%', right: '10%' }}></div>
      
      <div 
        className="floating-element bg-gradient-to-tr from-yellow-400 to-orange-500 rounded-full" 
        style={{ width: 100, height: 100, top: '20%', left: '30%', position: 'absolute' }} 
      />
      <div 
        className="floating-element bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-lg rotate-12" 
        style={{ width: 80, height: 80, bottom: '30%', right: '40%', position: 'absolute' }} 
      />
      <div 
        className="floating-element bg-gradient-to-tr from-green-400 to-emerald-500 rounded-xl -rotate-6" 
        style={{ width: 120, height: 80, top: '40%', right: '20%', position: 'absolute' }} 
      />
    </div>
  );
};

export default GlassmorphismCard;
