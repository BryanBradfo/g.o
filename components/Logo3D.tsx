import React from 'react';

const Logo3D: React.FC = () => {
  return (
    <div className="relative w-36 h-20 select-none">
       <svg className="w-full h-full overflow-visible" viewBox="0 0 200 120">
         <defs>
            {/* Matte Gradient: Deep Purple to Rich Blue */}
            <linearGradient id="retroGradient" x1="0%" y1="0%" x2="100%" y2="100%">
               <stop offset="0%" stopColor="#4C1D95" /> {/* Violet 900 */}
               <stop offset="100%" stopColor="#1E3A8A" /> {/* Blue 900 */}
            </linearGradient>
         </defs>
         
         {/* Define the curve path for the text to follow (Sine Wave) */}
         <path id="curve" d="M10,80 Q50,20 100,80 T190,80" fill="transparent" />
         
         <text width="200">
           <textPath 
              href="#curve" 
              startOffset="50%" 
              textAnchor="middle"
              style={{
                  fontFamily: "'Shrikhand', cursive",
                  fontSize: "90px",
                  fill: "url(#retroGradient)",
                  filter: "drop-shadow(3px 3px 0px rgba(0,0,0,0.5))" // Subtle non-neon shadow
              }}
           >
             G.O
           </textPath>
         </text>
       </svg>
    </div>
  );
};

export default Logo3D;