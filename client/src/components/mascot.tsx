import mascotImage from "@assets/BullBear_1757731653767.png";

interface MascotProps {
  type: 'bull' | 'bear';
  size?: 'sm' | 'md' | 'lg';
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
    lg: 'w-16 h-16'
  };

  // Alt text for accessibility
  const getAltText = () => {
    const typeText = type === 'bull' ? 'Bull' : 'Bear';
    return `StockMatch ${typeText} mascot`;
  };

  return (
    <div className={`flex items-center justify-center ${className}`} data-testid={`mascot-${type}`}>
      <div className={`${sizeClasses[size]} flex items-center justify-center`}>
        <img 
          src={mascotImage} 
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