import mascotImage from "@assets/BullBear_1757731653767.png";

interface MascotProps {
  type: 'bull' | 'bear';
  mood?: 'normal' | 'happy' | 'loading' | 'celebrating' | 'thoughtful' | 'encouraging';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animated?: boolean;
  message?: string;
  className?: string;
}

export default function Mascot({ 
  type, 
  mood = 'normal', 
  size = 'md', 
  animated = false, 
  message,
  className = '' 
}: MascotProps) {
  // Size configurations for the image
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  };

  // Animation classes
  const animationClasses = {
    normal: animated ? 'animate-pulse' : '',
    happy: animated ? 'animate-bounce' : '',
    loading: 'animate-spin',
    celebrating: animated ? 'animate-bounce' : '',
    thoughtful: animated ? 'animate-pulse' : '',
    encouraging: animated ? 'animate-bounce' : ''
  };

  // Alt text based on type and mood for accessibility
  const getAltText = () => {
    const typeText = type === 'bull' ? 'Bull' : 'Bear';
    const moodText = mood !== 'normal' ? ` in ${mood} mood` : '';
    return `${typeText} mascot${moodText}`;
  };

  // Message styling based on type
  const messageColor = type === 'bull' ? 'text-green-600 dark:text-green-400' : 'text-blue-600 dark:text-blue-400';

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`} data-testid={`mascot-${type}-${mood}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${animationClasses[mood]} 
          flex items-center justify-center
          transition-transform duration-300 hover:scale-110
        `}
      >
        <img 
          src={mascotImage} 
          alt={getAltText()}
          className="w-full h-full object-contain select-none"
        />
      </div>
      
      {message && (
        <div className={`text-center max-w-xs ${messageColor}`}>
          <p className="text-sm font-medium leading-relaxed">
            {message}
          </p>
        </div>
      )}
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