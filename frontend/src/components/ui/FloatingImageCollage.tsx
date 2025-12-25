import React, { useState, useEffect } from 'react';
import './FloatingImageCollage.css';

const FloatingImageCollage: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const x = (clientX - centerX) / centerX;
    const y = (clientY - centerY) / centerY;
    setMousePosition({ x, y });
  };

  useEffect(() => {
    window.addEventListener('mousemove', (e) => handleMouseMove(e as unknown as React.MouseEvent));
    return () => {
      window.removeEventListener('mousemove', (e) => handleMouseMove(e as unknown as React.MouseEvent));
    };
  }, []);

  return (
    <div className="floating-collage-container" onMouseMove={handleMouseMove}>
      <div
        className="floating-image-wrapper"
        style={{
          transform: `translate(-50%, -50%) perspective(1000px) rotateY(${mousePosition.x * 10}deg) rotateX(${-mousePosition.y * 10}deg)`,
        }}
      >
        <div
          className="floating-image bg-gradient-to-br from-purple-500 to-indigo-600"
          style={{ transform: `translateZ(50px) translateX(-20%) translateY(-20%)`, width: 250, height: 180 }}
        ></div>
        <div
          className="floating-image bg-gradient-to-br from-pink-500 to-rose-600"
          style={{ transform: `translateZ(150px) translateX(30%) translateY(-40%)`, width: 200, height: 260 }}
        ></div>
        <div
          className="floating-image bg-gradient-to-br from-blue-500 to-cyan-600"
          style={{ transform: `translateZ(100px) translateX(0%) translateY(30%)`, width: 280, height: 200 }}
        ></div>
      </div>
    </div>
  );
};

export default FloatingImageCollage;
