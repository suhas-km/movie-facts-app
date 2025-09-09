interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
}

export default function Logo({ size = 'md', variant = 'dark' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl'
  };

  const colors = variant === 'dark' 
    ? 'bg-stone-800 text-white' 
    : 'bg-white text-stone-800 border border-stone-200';

  return (
    <div className="flex items-center gap-3">
      <div className={`${sizeClasses[size]} ${colors} rounded-xl flex items-center justify-center shadow-lg`}>
        <svg 
          viewBox="0 0 24 24" 
          className="w-1/2 h-1/2" 
          fill="currentColor"
        >
          {/* Film strip design */}
          <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>
          {/* Center play button */}
          <polygon points="10,8 10,16 16,12"/>
        </svg>
      </div>
      <span className={`${textSizes[size]} font-bold ${variant === 'dark' ? 'text-stone-800' : 'text-white'}`}>
        Cinemate
      </span>
    </div>
  );
}
