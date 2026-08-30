import React from 'react';

interface OfficialLogoProps {
  variant?: 'full' | 'icon-only' | 'horizontal' | 'badge';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  textClassName?: string;
  showSubtitle?: boolean;
}

export const OfficialLogo: React.FC<OfficialLogoProps> = ({
  variant = 'horizontal',
  size = 'md',
  className = '',
  textClassName = '',
  showSubtitle = true
}) => {
  // Size mapping for the icon
  const iconDimensions = {
    xs: 28,
    sm: 36,
    md: 48,
    lg: 64,
    xl: 84,
    '2xl': 120
  }[size];

  const titleSizes = {
    xs: 'text-sm',
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
    '2xl': 'text-4xl'
  }[size];

  // The SVG reproduces the official logo graphic:
  // Smartphone angled in perspective + yellow emoji with black glasses, blue eyes & thinking hand popping out
  const LogoIllustration = (
    <svg
      width={iconDimensions}
      height={iconDimensions}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      {/* Background Soft Glow / Shadow (Optional, keep clean) */}
      <defs>
        {/* Gradients */}
        <radialGradient id="emojiFaceGrad" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#FFE15D" />
          <stop offset="75%" stopColor="#FFC812" />
          <stop offset="100%" stopColor="#F5A600" />
        </radialGradient>
        <filter id="popShadow" x="-10%" y="-10%" width="130%" height="130%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.15" />
        </filter>
      </defs>

      {/* 1. ANGLED SMARTPHONE (Perspective Tilt) */}
      <g transform="translate(10, 15) rotate(-14 70 100)">
        {/* Phone Outer Shadow / Body */}
        <rect
          x="30"
          y="15"
          width="74"
          height="142"
          rx="18"
          fill="#111827"
          stroke="#000000"
          strokeWidth="4"
        />
        {/* Phone Screen Glass */}
        <rect
          x="35"
          y="20"
          width="64"
          height="132"
          rx="14"
          fill="#FFFFFF"
        />
        {/* Speaker Notch */}
        <rect
          x="55"
          y="24"
          width="24"
          height="3.5"
          rx="1.75"
          fill="#111827"
        />
        {/* Volume & Power buttons */}
        <rect x="26.5" y="45" width="3.5" height="12" rx="1.5" fill="#111827" />
        <rect x="26.5" y="62" width="3.5" height="12" rx="1.5" fill="#111827" />
        <rect x="104" y="52" width="3.5" height="18" rx="1.5" fill="#111827" />
      </g>

      {/* 2. DYNAMIC SPEED / MOTION LINES (Popping out from screen) */}
      <g stroke="#111827" strokeWidth="2.5" strokeLinecap="round">
        <path d="M 72 165 C 80 135 92 110 108 85" opacity="0.8" />
        <path d="M 52 145 C 65 125 78 100 88 78" opacity="0.6" strokeWidth="2" />
        <path d="M 98 175 C 105 155 116 135 126 115" opacity="0.7" />
      </g>

      {/* 3. THINKING EMOJI HEAD (Pop-out Circle) */}
      <g filter="url(#popShadow)">
        {/* Yellow Emoji Head */}
        <circle
          cx="120"
          cy="98"
          r="46"
          fill="url(#emojiFaceGrad)"
          stroke="#111827"
          strokeWidth="4.5"
        />

        {/* Eyebrows */}
        <path
          d="M 92 68 Q 106 63 118 69"
          stroke="#111827"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 132 68 Q 146 64 158 71"
          stroke="#111827"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />

        {/* LEFT EYE (Behind Glasses) */}
        <ellipse cx="106" cy="85" rx="11" ry="13" fill="#FFFFFF" />
        {/* Blue Iris */}
        <circle cx="107" cy="82" r="7.5" fill="#2563EB" />
        {/* Pupil */}
        <circle cx="107" cy="81" r="4" fill="#111827" />
        {/* Highlight Reflection */}
        <circle cx="109" cy="79" r="2" fill="#FFFFFF" />

        {/* RIGHT EYE (Behind Glasses) */}
        <ellipse cx="140" cy="86" rx="11" ry="13" fill="#FFFFFF" />
        {/* Blue Iris */}
        <circle cx="140" cy="83" r="7.5" fill="#2563EB" />
        {/* Pupil */}
        <circle cx="140" cy="82" r="4" fill="#111827" />
        {/* Highlight Reflection */}
        <circle cx="142" cy="80" r="2" fill="#FFFFFF" />

        {/* ICONIC BLACK HIPSTER GLASSES */}
        {/* Left Lens Frame */}
        <rect
          x="90"
          y="70"
          width="32"
          height="30"
          rx="12"
          fill="none"
          stroke="#111827"
          strokeWidth="5"
        />
        {/* Right Lens Frame */}
        <rect
          x="126"
          y="71"
          width="32"
          height="30"
          rx="12"
          fill="none"
          stroke="#111827"
          strokeWidth="5"
        />
        {/* Bridge */}
        <path
          d="M 120 80 Q 123 76 127 80"
          stroke="#111827"
          strokeWidth="5"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left Temple Arm */}
        <path
          d="M 90 80 L 76 83"
          stroke="#111827"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        {/* Right Temple Arm */}
        <path
          d="M 158 82 L 165 84"
          stroke="#111827"
          strokeWidth="4.5"
          strokeLinecap="round"
        />

        {/* MOUTH (Puzzled / Inquiring Smile) */}
        <path
          d="M 116 112 Q 128 116 138 110"
          stroke="#111827"
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* 4. HAND UNDER CHIN (The "Thinking / Lou Ame Tay" gesture) */}
        <g id="thinking-hand">
          {/* Index Finger curved against cheek */}
          <path
            d="M 130 118 C 136 122 142 123 145 127 C 147 131 143 136 137 136 L 122 136 C 114 136 108 129 110 121 C 112 115 119 114 125 117 Z"
            fill="#FFC812"
            stroke="#111827"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Thumb under chin */}
          <path
            d="M 108 124 C 104 126 102 132 105 137 C 108 142 115 145 120 144"
            fill="#FFC812"
            stroke="#111827"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Knuckles */}
          <path
            d="M 118 136 C 120 144 128 147 136 145 C 142 144 145 138 144 134"
            fill="#FFC812"
            stroke="#111827"
            strokeWidth="3"
          />
        </g>
      </g>
    </svg>
  );

  // Variant: ICON ONLY
  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        {LogoIllustration}
      </div>
    );
  }

  // Variant: FULL STACKED (Logo text on top or bottom, like official print)
  if (variant === 'full') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        <span className={`font-heading font-black tracking-tight uppercase text-gray-900 ${titleSizes} ${textClassName}`}>
          LOU AME TAY <span className="text-[#00A86B]">?</span>
        </span>
        <div className="my-1">
          {LogoIllustration}
        </div>
        {showSubtitle && (
          <span className="text-xs font-extrabold text-[#00A86B] uppercase tracking-wider">
            Menu Digital Sénégal 🇸🇳
          </span>
        )}
      </div>
    );
  }

  // Variant: BADGE (Pill shaped container with logo)
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2.5 bg-white border border-gray-200/90 shadow-sm rounded-2xl px-3 py-1.5 ${className}`}>
        {LogoIllustration}
        <div className="flex flex-col text-left">
          <span className={`font-heading font-black tracking-tight uppercase text-gray-900 leading-tight ${titleSizes} ${textClassName}`}>
            LOU AME TAY <span className="text-[#00A86B]">?</span>
          </span>
          {showSubtitle && (
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Solution Officielle
            </span>
          )}
        </div>
      </div>
    );
  }

  // Variant: HORIZONTAL (Default for Navbar and Headers)
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {LogoIllustration}
      <div className="flex flex-col text-left">
        <span className={`font-heading font-black tracking-tight uppercase text-gray-900 leading-none ${titleSizes} ${textClassName}`}>
          LOU AME TAY <span className="text-[#00A86B]">?</span>
        </span>
        {showSubtitle && (
          <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest mt-0.5">
            Menu Digital Sénégal 🇸🇳
          </span>
        )}
      </div>
    </div>
  );
};
