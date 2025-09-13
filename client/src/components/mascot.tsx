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
  // Size configurations
  const sizeClasses = {
    sm: 'text-2xl w-8 h-8',
    md: 'text-3xl w-12 h-12',
    lg: 'text-4xl w-16 h-16',
    xl: 'text-6xl w-24 h-24'
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

  // Mascot characters with mood variations
  const getMascotCharacter = () => {
    if (type === 'bull') {
      switch (mood) {
        case 'happy':
        case 'celebrating':
          return '🐂'; // Bull face - positive/bullish
        case 'encouraging':
          return '📈'; // Chart going up with bull energy
        case 'loading':
        case 'thoughtful':
          return '🐂'; // Standard bull
        default:
          return '🐂'; // Standard bull
      }
    } else {
      switch (mood) {
        case 'thoughtful':
          return '🐻'; // Bear face - thoughtful/cautious
        case 'encouraging':
          return '🤔'; // Thinking face for guidance
        case 'loading':
          return '🐻'; // Standard bear
        case 'happy':
          return '🐻'; // Happy bear for positive guidance
        default:
          return '🐻'; // Standard bear
      }
    }
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
        <span className="select-none">
          {getMascotCharacter()}
        </span>
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