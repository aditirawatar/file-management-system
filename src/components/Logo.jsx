const Logo = ({ size = "default", className = "" }) => {
  const sizes = {
    small: { container: "h-8", text: "text-xl" },
    default: { container: "h-10", text: "text-2xl" },
    large: { container: "h-16", text: "text-4xl" }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className={`${currentSize.container} aspect-square relative`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="50%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1D4ED8" />
            </linearGradient>
            <filter id="shadow">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
            </filter>
          </defs>

          <rect
            x="20"
            y="15"
            width="60"
            height="70"
            rx="8"
            fill="url(#logoGradient)"
            filter="url(#shadow)"
          />

          <path
            d="M 35 35 L 50 45 L 65 35"
            stroke="white"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />

          <rect
            x="35"
            y="52"
            width="30"
            height="3"
            rx="1.5"
            fill="white"
            opacity="0.8"
          />

          <rect
            x="35"
            y="60"
            width="20"
            height="3"
            rx="1.5"
            fill="white"
            opacity="0.6"
          />

          <circle
            cx="85"
            cy="75"
            r="18"
            fill="#10B981"
            filter="url(#shadow)"
          />

          <path
            d="M 85 68 L 85 82 M 78 75 L 92 75"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <span className={`font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent ${currentSize.text}`}>
        FileFlow
      </span>
    </div>
  );
};

export default Logo;
