export default function Logo({
    className = "w-10 h-10",
    textSize = "text-xl",
    showText = true,
    theme = "dark" // "light" means light text (for dark backgrounds), "dark" means dark text
}: {
    className?: string,
    textSize?: string,
    showText?: boolean,
    theme?: "light" | "dark"
}) {
    return (
        <div className="flex items-center gap-2">
            <svg
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={className}
            >
                {/* House Outline */}
                <path
                    d="M50 15L15 45V90H45V90H55V90H85V45L50 15Z"
                    stroke="url(#paint0_linear)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-slate-900"
                />

                {/* House Body */}
                <path
                    d="M20 45V85H80V45"
                    stroke="url(#paint0_linear)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Roof Left */}
                <path
                    d="M15 50L50 20"
                    stroke="#1e3a8a"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Checkmark integrated into Roof Right */}
                <path
                    d="M45 40L60 55L85 20"
                    stroke="#22c55e"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Keyhole */}
                <path
                    d="M50 60C48 60 46 62 46 64V72C46 74 48 76 50 76C52 76 54 74 54 72V64C54 62 52 60 50 60Z"
                    fill="#1e3a8a"
                />

                <defs>
                    <linearGradient id="paint0_linear" x1="20" y1="85" x2="80" y2="85" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#1e3a8a" />
                        <stop offset="1" stopColor="#22c55e" />
                    </linearGradient>
                </defs>
            </svg>

            {showText && (
                <div className="flex flex-col">
                    <span className={`font-bold leading-none tracking-tight ${textSize} ${theme === 'light' ? 'text-white' : 'text-slate-900'}`}>
                        Rent<span className="text-green-500">Well</span>
                    </span>
                </div>
            )}
        </div>
    );
}
