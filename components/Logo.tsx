
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg" className={className}>
    <defs>
      <pattern id="halftone" width="8" height="8" patternUnits="userSpaceOnUse">
        <circle cx="4" cy="4" r="1.5" fill="#000" opacity="0.15"/>
      </pattern>
      <filter id="comic-shadow">
        <feDropShadow dx="8" dy="8" stdDeviation="0" floodColor="#000" floodOpacity="1"/>
      </filter>
    </defs>
    
    {/* Action Burst Background */}
    <g filter="url(#comic-shadow)">
        <path d="M256 20 L296 120 L400 100 L340 190 L440 256 L340 322 L400 412 L296 392 L256 492 L216 392 L112 412 L172 322 L72 256 L172 190 L112 100 L216 120 L256 20Z" 
              fill="#FACC15" 
              stroke="#000" 
              strokeWidth="8" 
              strokeLinejoin="round"
        />
    </g>

    {/* Stylized Speech Bubble */}
    <g transform="translate(0, -10)">
        <path d="M126 146 H386 C397.046 146 406 154.954 406 166 V326 C406 337.046 397.046 346 386 346 H286 L236 406 L226 346 H126 C114.954 346 106 337.046 106 326 V166 C106 154.954 114.954 146 126 146 Z" 
              fill="#FFF" 
              stroke="#000" 
              strokeWidth="8"
              filter="url(#comic-shadow)"
        />
        {/* Halftone Texture Overlay */}
        <path d="M126 146 H386 C397.046 146 406 154.954 406 166 V326 C406 337.046 397.046 346 386 346 H286 L236 406 L226 346 H126 C114.954 346 106 337.046 106 326 V166 C106 154.954 114.954 146 126 146 Z" 
              fill="url(#halftone)"
        />
    </g>

    {/* Text Layer */}
    <g transform="translate(0, -5)">
        <text x="256" y="295" 
              fontFamily="Impact, sans-serif" 
              fontWeight="900" 
              fontSize="140" 
              fill="#EF4444" 
              stroke="#000" 
              strokeWidth="4" 
              textAnchor="middle"
              style={{ letterSpacing: '4px' }}
        >
            ACS
        </text>
        {/* Text Highlight for Glossy effect */}
        <path d="M160 200 L200 200 L190 220 L150 220 Z" fill="white" opacity="0.4" />
    </g>
  </svg>
);
