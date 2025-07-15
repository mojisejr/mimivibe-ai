'use client'

interface CardFallbackProps {
  className?: string
}

export function CardFallback({ className = "" }: CardFallbackProps) {
  return (
    <div className={`relative bg-gradient-to-br from-primary/20 to-secondary/30 rounded-lg border-2 border-primary/30 aspect-[2/3] flex items-center justify-center ${className}`}>
      {/* Mystical background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="w-full h-full bg-gradient-to-br from-primary to-secondary rounded-lg">
          {/* Decorative stars */}
          <div className="absolute top-2 left-2 text-warning text-xs">✦</div>
          <div className="absolute top-4 right-3 text-warning text-xs">✧</div>
          <div className="absolute bottom-4 left-3 text-warning text-xs">✦</div>
          <div className="absolute bottom-2 right-2 text-warning text-xs">✧</div>
          
          {/* Corner decorations */}
          <div className="absolute top-1 left-1 w-4 h-4 border-l-2 border-t-2 border-accent/40 rounded-tl-lg"></div>
          <div className="absolute top-1 right-1 w-4 h-4 border-r-2 border-t-2 border-accent/40 rounded-tr-lg"></div>
          <div className="absolute bottom-1 left-1 w-4 h-4 border-l-2 border-b-2 border-accent/40 rounded-bl-lg"></div>
          <div className="absolute bottom-1 right-1 w-4 h-4 border-r-2 border-b-2 border-accent/40 rounded-br-lg"></div>
        </div>
      </div>
      
      {/* Logo container */}
      <div className="relative z-10 flex flex-col items-center justify-center p-4">
        {/* Logo image */}
        <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 mb-2 relative">
          <img
            src="/images/logo.png"
            alt="MiMi Vibes Logo"
            className="w-full h-full object-contain drop-shadow-lg"
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
          />
        </div>
        
        {/* Card back text */}
        <div className="text-center">
          <div className="text-xs sm:text-sm font-semibold text-primary mb-1">
            MiMi Vibes
          </div>
          <div className="text-xs text-secondary/80">
            ไพ่ทาโรต์
          </div>
        </div>
      </div>
      
      {/* Mystical glow effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5 animate-pulse"></div>
    </div>
  )
}