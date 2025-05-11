import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Helper function to get random number within a range
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const AnimatedAvatar = ({ 
  name, 
  size = "md", 
  color = "primary", 
  className,
  onClick 
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isWaving, setIsWaving] = useState(false);
  
  // Get initials from name
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map(part => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Determine background color based on the name (consistent color for same name)
  const getColorClass = (name) => {
    const colors = [
      "bg-blue-500 hover:bg-blue-600",
      "bg-purple-500 hover:bg-purple-600",
      "bg-pink-500 hover:bg-pink-600",
      "bg-green-500 hover:bg-green-600", 
      "bg-amber-500 hover:bg-amber-600",
      "bg-teal-500 hover:bg-teal-600"
    ];
    
    if (!name) return colors[0];
    
    // Use consistent hash for the same name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };
  
  // Size classes
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
    "2xl": "h-20 w-20 text-xl"
  };
  
  // Random blinks
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 300);
      }
    }, 2000);
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Occasional waves
  useEffect(() => {
    const waveInterval = setInterval(() => {
      if (Math.random() > 0.9) {
        setIsWaving(true);
        setTimeout(() => setIsWaving(false), 1000);
      }
    }, 5000);
    
    return () => clearInterval(waveInterval);
  }, []);
  
  // Hover handler
  const handleHover = () => {
    setIsWaving(true);
    setTimeout(() => setIsWaving(false), 1000);
  };
  
  const bgColorClass = color === "primary" ? "bg-primary hover:bg-primary/90" : getColorClass(name);
  
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-full text-white font-medium transition-all duration-200 cursor-pointer",
        sizeClasses[size],
        bgColorClass,
        className
      )}
      onClick={onClick}
      onMouseEnter={handleHover}
    >
      {/* Face container */}
      <div className="relative">
        {/* Character Face Content */}
        {name ? (
          <div className="relative">
            {/* Eyes */}
            <div className="flex justify-center space-x-1 mb-1 mt-[-2px]">
              <div className={`w-1 h-1 rounded-full bg-white ${isBlinking ? 'h-[1px]' : ''}`}></div>
              <div className={`w-1 h-1 rounded-full bg-white ${isBlinking ? 'h-[1px]' : ''}`}></div>
            </div>
            
            {/* Mouth */}
            <div className="flex justify-center">
              <div className="w-2 h-[2px] bg-white rounded-sm"></div>
            </div>
            
            {/* Hand (for waving) */}
            <div 
              className={`absolute ${size === "sm" ? "top-[-3px] right-[-7px]" : "top-[-4px] right-[-8px]"} transition-transform duration-300`}
              style={{ 
                transform: isWaving ? "rotate(-30deg) translateY(-2px)" : "rotate(0) translateY(0)",
                transformOrigin: "bottom left"
              }}
            >
              <div className="w-1 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        ) : (
          // Fallback to initials if no avatar
          <span>{getInitials(name)}</span>
        )}
      </div>
    </div>
  );
};

export default AnimatedAvatar; 