"use client";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
  variant?: "default" | "white" | "minimal";
}

export const Logo = ({
  size = "md",
  className = "",
  showText = true,
  variant = "default",
}: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
    xl: "w-16 h-16",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
    xl: "text-xl",
  };

  const textColorClasses = {
    default: "text-base-content",
    white: "text-white",
    minimal: "text-neutral-content",
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img
        src="/images/logo.webp"
        alt="MiMiVibes"
        className={`${sizeClasses[size]} object-contain`}
        loading="lazy"
        onError={(e) => {
          // Fallback to PNG if WebP fails
          const target = e.currentTarget as HTMLImageElement;
          target.src = "/images/logo.png";
        }}
      />
      {showText && (
        <span className={`font-semibold ${textSizeClasses[size]} ${textColorClasses[variant]}`}>
          MiMiVibes
        </span>
      )}
    </div>
  );
};