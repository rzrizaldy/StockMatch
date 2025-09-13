import mascotImage from "@assets/BullBear_1757731653767.png";
import bullReadImage from "@assets/Bull Read_1757776595370.png";

interface MascotProps {
  type: 'bull' | 'bear';
  size?: 'sm' | 'md' | 'lg' | 'quiz';
  className?: string;
}

export default function Mascot({ 
  type, 
  size = 'sm', 
  className = '' 
}: MascotProps) {
  // Size configurations for the image - defaulting to small for subtle placement
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    quiz: 'w-20 h-28' // 87x125 from Figma, scaled to Tailwind units
  };

  // Choose the right image based on context
  const getImageSrc = () => {
    if (type === 'bull' && size === 'quiz') {
      return bullReadImage;
    }
    return mascotImage;
  };

  // Alt text for accessibility
  const getAltText = () => {
    if (type === 'bull' && size === 'quiz') {
      return 'Bull mascot reading a book';
    }
    const typeText = type === 'bull' ? 'Bull' : 'Bear';
    return `StockMatch ${typeText} mascot`;
  };

  return (
    <div className={`flex items-center justify-center ${className}`} data-testid={`mascot-${type}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src={getImageSrc()} 
          alt={getAltText()}
          className="w-full h-full object-contain select-none"
        />
      </div>
    </div>
  );
}

// Convenience components for common use cases
export function BullMascot(props: Omit<MascotProps, 'type'>) {
  return <Mascot {...props} type="bull" />;
}

export function BearMascot(props: Omit<MascotProps, 'type'>) {
  return <Mascot {...props} type="bear" />;
}