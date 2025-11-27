
import React, { useEffect, useState } from 'react';

const Loader3D: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps = [
    "Triangulating GPS coordinates...",
    "Parsing squad interests...",
    "Scanning local database...",
    "Calculating vibe matches...",
    "Optimizing for budget...",
    "Finalizing itinerary..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] w-full relative overflow-hidden">
      <style>{`
        .scene {
          width: 100px;
          height: 100px;
          perspective: 600px;
          margin-bottom: 3rem;
        }
        .cube {
          width: 100%;
          height: 100%;
          position: relative;
          transform-style: preserve-3d;
          animation: rotateCube 4s infinite linear;
        }
        .cube__face {
          position: absolute;
          width: 100px;
          height: 100px;
          border: 2px solid #00F0FF;
          background: rgba(0, 240, 255, 0.1);
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          color: white;
          backface-visibility: visible;
        }
        .cube__face--front  { transform: rotateY(  0deg) translateZ(50px); }
        .cube__face--right  { transform: rotateY( 90deg) translateZ(50px); }
        .cube__face--back   { transform: rotateY(180deg) translateZ(50px); }
        .cube__face--left   { transform: rotateY(-90deg) translateZ(50px); }
        .cube__face--top    { transform: rotateX( 90deg) translateZ(50px); border-color: #BD00FF; background: rgba(189, 0, 255, 0.1); box-shadow: 0 0 15px rgba(189, 0, 255, 0.2); }
        .cube__face--bottom { transform: rotateX(-90deg) translateZ(50px); border-color: #BD00FF; background: rgba(189, 0, 255, 0.1); box-shadow: 0 0 15px rgba(189, 0, 255, 0.2); }

        @keyframes rotateCube {
          0% { transform: rotateX(-15deg) rotateY(0deg); }
          100% { transform: rotateX(-15deg) rotateY(360deg); }
        }
        
        .glow-core {
            position: absolute;
            width: 40px;
            height: 40px;
            background: radial-gradient(circle, #fff, #00F0FF);
            border-radius: 50%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            animation: pulseCore 1.5s infinite ease-in-out;
            box-shadow: 0 0 30px #00F0FF;
        }

        @keyframes pulseCore {
            0%, 100% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; box-shadow: 0 0 50px #BD00FF; }
        }
      `}</style>

      {/* 3D Cube Structure */}
      <div className="scene">
        <div className="cube">
            <div className="cube__face cube__face--front"></div>
            <div className="cube__face cube__face--back"></div>
            <div className="cube__face cube__face--right"></div>
            <div className="cube__face cube__face--left"></div>
            <div className="cube__face cube__face--top"></div>
            <div className="cube__face cube__face--bottom"></div>
            {/* Inner Core */}
            <div className="glow-core"></div>
        </div>
      </div>

      {/* Text Logs */}
      <div className="space-y-2 text-center z-10">
        <h3 className="text-2xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-urban-neon to-urban-purple animate-pulse">
            GENERATING PLAN
        </h3>
        <div className="h-6 overflow-hidden relative">
             {steps.map((step, idx) => (
                 <p 
                    key={idx} 
                    className={`
                        text-sm font-mono transition-all duration-500 absolute w-full left-0
                        ${idx === currentStep ? 'top-0 opacity-100 text-urban-neon' : idx < currentStep ? '-top-6 opacity-0' : 'top-6 opacity-0'}
                    `}
                >
                    &gt; {step}
                 </p>
             ))}
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
    </div>
  );
};

export default Loader3D;
