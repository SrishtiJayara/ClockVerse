import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock as ClockIcon, Globe, Sun, Moon, Cpu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';

const ALL_TIMEZONES = typeof Intl !== 'undefined' && Intl.supportedValuesOf 
  ? Intl.supportedValuesOf('timeZone')
  : [
      'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 
      'Asia/Kolkata', 'Asia/Tokyo', 'Australia/Sydney', 'Europe/Paris', 
      'Asia/Singapore', 'Asia/Dubai', 'America/Chicago', 'America/Denver'
    ];

const MOTIVATIONAL_QUOTES = [
  "Focus on being productive instead of busy. — Tim Ferriss",
  "Your mind is for having ideas, not holding them. — David Allen",
  "The secret of getting ahead is getting started. — Mark Twain",
  "It is not that we have a short time to live, but that we waste a lot of it. — Seneca",
  "Simplicity is the ultimate sophistication. — Leonardo da Vinci",
  "You do not rise to the level of your goals. You fall to the level of your systems. — James Clear",
  "Every second is a fresh start to create something wonderful. ✨",
  "Done is better than perfect. — Sheryl Sandberg",
  "Amateurs sit and wait for inspiration, the rest of us just get up and go to work. — Stephen King",
  "The best way to predict the future is to create it. — Peter Drucker",
  "Concentrate all your thoughts upon the work at hand. — Alexander Graham Bell",
  "Productivity is being able to do things that you were never able to do before. — Franz Kafka"
];

export default function Clock() {
  const { theme } = useTheme();

  const getGreeting = (hrs) => {
    if (hrs < 12) return 'Good morning, time to shine! 🌅';
    if (hrs < 17) return 'Good afternoon, keep shining! ☀️';
    if (hrs < 22) return 'Embrace the evening calm... 🌇';
    return 'Rest well, dream big! 🌙';
  };
  
  const [selectedTimezone, setSelectedTimezone] = useState(() => {
    return localStorage.getItem('chrono_selected_timezone') || Intl.DateTimeFormat().resolvedOptions().timeZone;
  });
  const [tzSearch, setTzSearch] = useState('');
  const [showTzDropdown, setShowTzDropdown] = useState(false);

  const [time, setTime] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    dateStr: '',
    dayStr: '',
    timezoneStr: '',
    unixTimestamp: 0,
  });

  const [format24, setFormat24] = useState(false);
  const [clockStyle, setClockStyle] = useState('neon'); // 'neon' is now default, options: 'digital', 'analog', 'flip', 'neon', 'arc'
  const requestRef = useRef(0);

  const handleTimezoneChange = (tz) => {
    setSelectedTimezone(tz);
    localStorage.setItem('chrono_selected_timezone', tz);
    setShowTzDropdown(false);
    setTzSearch('');
  };

  const filteredTz = ALL_TIMEZONES.filter(tz => 
    tz.toLowerCase().includes(tzSearch.toLowerCase())
  );

  // High performance update loop for smooth sweeping hands (60FPS)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      let localNow = now;
      if (selectedTimezone) {
        try {
          const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: selectedTimezone,
            year: 'numeric', month: 'numeric', day: 'numeric',
            hour: 'numeric', minute: 'numeric', second: 'numeric',
            hour12: false
          }).formatToParts(now);
          const map = {};
          parts.forEach(p => map[p.type] = p.value);
          localNow = new Date(map.year, map.month - 1, map.day, map.hour, map.minute, map.second, now.getMilliseconds());
        } catch (e) {
          // fallback to system time if timezone fails
        }
      }

      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: selectedTimezone || undefined
      });

      setTime({
        hours: localNow.getHours(),
        minutes: localNow.getMinutes(),
        seconds: localNow.getSeconds(),
        milliseconds: localNow.getMilliseconds(),
        dateStr: dateFormatter.format(now),
        dayStr: localNow.toLocaleDateString('en-US', { weekday: 'long' }),
        timezoneStr: selectedTimezone,
        unixTimestamp: Math.floor(now.getTime() / 1000),
      });

      requestRef.current = requestAnimationFrame(updateTime);
    };

    requestRef.current = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(requestRef.current);
  }, [selectedTimezone]);

  // Format helper for numbers
  const pad = (num) => String(num).padStart(2, '0');

  // Hour display conversion
  const getDisplayHours = (hrs) => {
    if (format24) return pad(hrs);
    const displayHrs = hrs % 12 || 12;
    return pad(displayHrs);
  };

  const getPeriod = (hrs) => {
    return hrs >= 12 ? 'PM' : 'AM';
  };

  // Render Digital Clock HUD Style (with beautiful sweeping outer gauge)
  const DigitalClock = () => {
    const displayHrs = getDisplayHours(time.hours);
    const displayMins = pad(time.minutes);
    const displaySecs = pad(time.seconds);
    const period = getPeriod(time.hours);

    // Smooth sweeping circular second progress
    const smoothSeconds = time.seconds + time.milliseconds / 1000;
    const strokeDashoffset = 628.3 - (628.3 * smoothSeconds) / 60;
    const isDark = theme === 'dark';

    return (
      <div className="flex flex-col items-center justify-center py-6 space-y-6 relative select-none">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          {/* Concentric Glow Sweeper SVG */}
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 220 220">
            <circle cx="110" cy="110" r="100" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(0, 0, 0, 0.02)"} strokeWidth="6" />
            <circle
              cx="110"
              cy="110"
              r="100"
              fill="none"
              stroke="url(#goldGradient)"
              strokeWidth="6"
              strokeDasharray="628.3"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              filter="url(#glowFilter)"
              style={{ transition: 'stroke-dashoffset 0.016s linear' }}
            />
            <defs>
              <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--primary)" />
                <stop offset="100%" stopColor="#e0910f" />
              </linearGradient>
              <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Time digits container */}
          <div className="z-10 flex flex-col items-center justify-center text-center">
            <div className="flex items-baseline justify-center">
              <span className={`text-4xl sm:text-6xl font-extrabold font-mono tracking-normal ${isDark ? 'text-[var(--primary)] text-glow-gold' : 'text-primary'}`}>
                {displayHrs}
              </span>
              <span className={`text-3xl sm:text-5xl font-bold mx-1 animate-pulse opacity-80 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>:</span>
              <span className={`text-4xl sm:text-6xl font-extrabold font-mono tracking-normal ${isDark ? 'text-[var(--primary)] text-glow-gold' : 'text-primary'}`}>
                {displayMins}
              </span>
            </div>
            
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xl font-mono font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {displaySecs}
              </span>
              {!format24 && (
                <span className={`text-xs px-2 py-0.5 rounded font-bold border ${isDark ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                  {period}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render luxury watch Analog Clock face
  const AnalogClock = () => {
    const hrAngle = (time.hours % 12) * 30 + time.minutes * 0.5;
    const minAngle = time.minutes * 6 + time.seconds * 0.1;
    const secAngle = time.seconds * 6 + (time.milliseconds * 6) / 1000;
    const isDark = theme === 'dark';

    return (
      <div className="flex flex-col items-center justify-center py-6 select-none">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="w-full h-full relative" viewBox="0 0 240 240">
            <circle
              cx="120"
              cy="120"
              r="115"
              fill={isDark ? "rgba(26, 42, 71, 0.45)" : "rgba(255, 255, 255, 0.75)"}
              stroke={isDark ? "rgba(252, 163, 17, 0.3)" : "rgba(217, 119, 6, 0.4)"}
              strokeWidth="4"
              className="backdrop-blur-md"
            />
            <circle cx="120" cy="120" r="102" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.03)"} strokeWidth="1" />
            
            {Array.from({ length: 12 }).map((_, i) => {
              const angle = i * 30;
              const isMajor = i % 3 === 0;
              const length = isMajor ? 12 : 6;
              const stroke = isMajor 
                ? (isDark ? 'rgba(252, 163, 17, 0.65)' : 'rgba(217, 119, 6, 0.8)') 
                : (isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)');
              const width = isMajor ? 2.5 : 1;
              return (
                <line
                  key={i}
                  x1="120"
                  y1={120 - 102}
                  x2="120"
                  y2={120 - 102 + length}
                  stroke={stroke}
                  strokeWidth={width}
                  strokeLinecap="round"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '120px 120px',
                  }}
                />
              );
            })}

            <circle cx="120" cy="120" r="28" fill="none" stroke={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)"} strokeWidth="1" />
            
            {/* Hours */}
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="68"
              stroke={isDark ? "#e5e5e5" : "#1e293b"}
              strokeWidth="5"
              strokeLinecap="round"
              style={{
                transform: `rotate(${hrAngle}deg)`,
                transformOrigin: '120px 120px',
              }}
            />

            {/* Minutes */}
            <line
              x1="120"
              y1="120"
              x2="120"
              y2="48"
              stroke={isDark ? "#b0b0b0" : "#475569"}
              strokeWidth="3.5"
              strokeLinecap="round"
              style={{
                transform: `rotate(${minAngle}deg)`,
                transformOrigin: '120px 120px',
              }}
            />

            {/* Seconds */}
            <line
              x1="120"
              y1="135"
              x2="120"
              y2="38"
              stroke={isDark ? "var(--primary)" : "#d97706"}
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{
                transform: `rotate(${secAngle}deg)`,
                transformOrigin: '120px 120px',
              }}
            />

            <circle cx="120" cy="120" r="5" fill={isDark ? "var(--primary)" : "#d97706"} />
            <circle cx="120" cy="120" r="2" fill={isDark ? "var(--background)" : "#ffffff"} />
          </svg>
        </div>
      </div>
    );
  };

  // Render retro split flip digits style
  const FlipClock = () => {
    const hrStr = getDisplayHours(time.hours);
    const minStr = pad(time.minutes);
    const secStr = pad(time.seconds);
    const period = getPeriod(time.hours);
    const isDark = theme === 'dark';

    const FlipCard = ({ val }) => (
      <div className="flex gap-1 relative">
        {val.split('').map((char, index) => (
          <div key={index} className={`relative w-9 h-14 sm:w-14 sm:h-20 border rounded-lg sm:rounded-xl flex items-center justify-center overflow-hidden shadow-2xl ${isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'}`}>
            <div className={`absolute top-0 left-0 right-0 h-1/2 border-b ${isDark ? 'from-slate-800 to-slate-900 border-black/40' : 'from-slate-50 to-slate-100 border-slate-200'}`}></div>
            <div className={`absolute bottom-0 left-0 right-0 h-1/2 ${isDark ? 'from-slate-900 to-slate-950' : 'from-slate-50 to-slate-100'}`}></div>
            <span className={`relative z-10 font-mono text-xl sm:text-4xl font-extrabold tracking-tighter ${isDark ? 'text-[var(--primary)] text-glow-gold' : 'text-primary'}`}>
              {char}
            </span>
            <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-black/60 z-20"></div>
          </div>
        ))}
      </div>
    );

    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6 select-none">
        <div className="flex items-center justify-center gap-1.5 sm:gap-4 flex-nowrap">
          <FlipCard val={hrStr} />
          <span className={`text-xl sm:text-3xl font-bold animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
          <FlipCard val={minStr} />
          <span className={`text-xl sm:text-3xl font-bold animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
          <FlipCard val={secStr} />
          {!format24 && (
            <div className={`w-9 h-14 sm:w-14 sm:h-20 border rounded-lg sm:rounded-xl flex items-center justify-center shadow-xl ${isDark ? 'bg-slate-900 border-slate-700/50' : 'bg-white border-slate-200'}`}>
              <span className={`font-mono text-[10px] sm:text-lg font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{period}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render futuristic Cyber Neon style (DEFAULT VIEW)
  const NeonClock = () => {
    const hrStr = getDisplayHours(time.hours);
    const minStr = pad(time.minutes);
    const secStr = pad(time.seconds);
    const period = getPeriod(time.hours);
    const isDark = theme === 'dark';

    return (
      <div className="flex flex-col items-center justify-center py-10 space-y-6 relative select-none">
        <div className={`digital-grid-texture relative px-4 py-4 sm:px-10 sm:py-8 rounded-2xl border transition-all ${
          isDark 
            ? 'border-[var(--primary)]/25 bg-black/50 shadow-[0_0_30px_rgba(var(--danger-rgb),0.08),inset_0_0_20px_rgba(var(--danger-rgb),0.06)]' 
            : 'border-primary/20 bg-primary/5 shadow-[0_8px_30px_rgba(var(--warning-rgb),0.06)]'
        }`}>
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--primary)]/0 via-[var(--primary)]/2 to-[var(--primary)]/0 pointer-events-none opacity-40 animate-[pulse_3s_infinite]"></div>
          
          <div className={`flex items-baseline justify-center gap-1 font-mono text-3xl sm:text-5xl md:text-6xl font-black tracking-wider ${
            isDark ? 'text-[var(--primary)] text-glow-gold' : 'text-primary'
          }`}>
            <span>{hrStr}</span>
            <span className={`opacity-60 animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
            <span>{minStr}</span>
            <span className={`opacity-60 animate-pulse ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>:</span>
            <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{secStr}</span>
            {!format24 && (
              <span className={`text-[10px] sm:text-base ml-2 sm:ml-4 border px-2 py-0.5 rounded font-bold uppercase tracking-widest ${
                isDark ? 'border-slate-700 bg-slate-800/40 text-slate-400' : 'border-slate-300 bg-slate-200/50 text-slate-700'
              }`}>
                {period}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render Concentric Geometric Arc Clock
  const ArcClock = () => {
    const hrVal = (time.hours % 12) + time.minutes / 60;
    const minVal = time.minutes + time.seconds / 60;
    const secVal = time.seconds + time.milliseconds / 1000;

    const hrOffset = 502.65 - (502.65 * hrVal) / 12;
    const minOffset = 389.56 - (389.56 * minVal) / 60;
    const secOffset = 276.46 - (276.46 * secVal) / 60;

    const displayHrs = getDisplayHours(time.hours);
    const displayMins = pad(time.minutes);
    const period = getPeriod(time.hours);
    const isDark = theme === 'dark';

    return (
      <div className="flex flex-col items-center justify-center py-6 select-none relative">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Hour Arc (Gold) */}
            <circle cx="100" cy="100" r="80" fill="none" stroke={isDark ? "rgba(252, 163, 17, 0.02)" : "rgba(217, 119, 6, 0.02)"} strokeWidth="6" />
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="var(--primary)"
              strokeWidth="6"
              strokeDasharray="502.65"
              strokeDashoffset={hrOffset}
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />

            {/* Minute Arc (Pink) */}
            <circle cx="100" cy="100" r="62" fill="none" stroke={isDark ? "rgba(244, 114, 182, 0.02)" : "rgba(244, 114, 182, 0.02)"} strokeWidth="6" />
            <circle
              cx="100"
              cy="100"
              r="62"
              fill="none"
              stroke="#f472b6"
              strokeWidth="6"
              strokeDasharray="389.56"
              strokeDashoffset={minOffset}
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />

            {/* Second Arc (Cyan) */}
            <circle cx="100" cy="100" r="44" fill="none" stroke={isDark ? "rgba(56, 189, 248, 0.02)" : "rgba(56, 189, 248, 0.02)"} strokeWidth="5" />
            <circle
              cx="100"
              cy="100"
              r="44"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="5"
              strokeDasharray="276.46"
              strokeDashoffset={secOffset}
              strokeLinecap="round"
              filter="url(#arcGlow)"
            />

            <defs>
              <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Time text centered */}
          <div className="z-10 text-center flex flex-col items-center">
            <span className={`text-2xl sm:text-3xl font-mono font-black ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {displayHrs}:{displayMins}
            </span>
            {!format24 && (
              <span className={`text-[10px] font-extrabold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {period}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const isDark = theme === 'dark';

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header Widget */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <ClockIcon className="w-9 h-9 text-primary animate-pulse" />
            {getGreeting(time.hours)}
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm flex items-center gap-2`}>
            <Calendar className="w-4 h-4 text-slate-500" />
            {time.dateStr || 'Loading local date...'}
          </p>
        </div>
        <div className={`px-5 py-3 rounded-2xl border w-full max-w-2xl backdrop-blur-md transition-all duration-300 ${
          isDark ? 'glass-card-premium border-[var(--primary)]/15 bg-gradient-to-r from-[var(--primary)]/5 to-transparent' : 'bg-gradient-to-r from-primary/5 to-transparent border-slate-200/80 shadow-sm'
        }`}>
          <p className={`${isDark ? 'text-slate-350' : 'text-slate-650'} text-xs font-medium italic leading-relaxed`}>
            "{MOTIVATIONAL_QUOTES[time.hours % MOTIVATIONAL_QUOTES.length || 0]}"
          </p>
        </div>
      </div>

      {/* Main Clock Face Card with glass-card-premium */}
      <div className={`rounded-2xl p-10 flex flex-col items-center justify-center relative overflow-hidden transition-all duration-300 ${
        isDark 
          ? 'glass-card-premium border-[var(--primary)]/15' 
          : 'bg-white/70 border border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md'
      }`}>
        {/* Glow Blurs in the card corners */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full glow-orb-gold opacity-60 pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full glow-orb-purple opacity-40 pointer-events-none"></div>

        {clockStyle === 'digital' && <DigitalClock />}
        {clockStyle === 'analog' && <AnalogClock />}
        {clockStyle === 'flip' && <FlipClock />}
        {clockStyle === 'neon' && <NeonClock />}
        {clockStyle === 'arc' && <ArcClock />}
      </div>

      {/* Control Grid Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Style selection */}
        <div className={`rounded-xl p-6 space-y-4 border transition-all duration-300 ${
          isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Clock Display Style</h3>
          <div className="flex flex-wrap gap-2">
            {['neon', 'digital', 'analog', 'flip', 'arc'].map((style) => (
              <Button
                key={style}
                onClick={() => setClockStyle(style)}
                variant={clockStyle === style ? 'default' : 'outline'}
                className={`capitalize h-10 flex-grow min-w-[70px] transition-all text-xs font-semibold cursor-pointer ${
                  clockStyle === style
                    ? 'btn-premium-gold'
                    : isDark 
                      ? 'border-slate-700/50 text-slate-300 hover:bg-white/5' 
                      : 'border-slate-300 text-slate-700 hover:bg-black/5'
                }`}
              >
                {style}
              </Button>
            ))}
          </div>
        </div>

        {/* Format Selection */}
        <div className={`rounded-xl p-6 space-y-4 border transition-all duration-300 ${
          isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md'
        }`}>
          <h3 className={`text-base font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Time Format</h3>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setFormat24(false)}
              variant={!format24 ? 'default' : 'outline'}
              className={`flex-grow min-w-[100px] h-10 transition-all text-xs font-semibold cursor-pointer ${
                !format24
                  ? 'btn-premium-gold'
                  : isDark 
                    ? 'border-slate-700/50 text-slate-300 hover:bg-white/5' 
                    : 'border-slate-300 text-slate-700 hover:bg-black/5'
              }`}
            >
              12-Hour
            </Button>
            <Button
              onClick={() => setFormat24(true)}
              variant={format24 ? 'default' : 'outline'}
              className={`flex-grow min-w-[100px] h-10 transition-all text-xs font-semibold cursor-pointer ${
                format24
                  ? 'btn-premium-gold'
                  : isDark 
                    ? 'border-slate-700/50 text-slate-300 hover:bg-white/5' 
                    : 'border-slate-300 text-slate-700 hover:bg-black/5'
              }`}
            >
              24-Hour
            </Button>
          </div>
        </div>
      </div>

      {/* Secondary Detailed Widget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timezone Entry & Searchable Selector */}
        <div className={`rounded-xl p-5 space-y-3 border transition-all duration-300 relative ${
          isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md'
        }`}>
          <div className="flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${
              isDark ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' : 'bg-primary/10 text-primary border-primary/20'
            }`}>
              <Globe className="w-5 h-5 animate-[spin_60s_linear_infinite]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs uppercase font-bold tracking-wider`}>Selected Timezone</p>
              <button 
                onClick={() => setShowTzDropdown(!showTzDropdown)}
                className={`text-sm font-semibold mt-0.5 w-full text-left truncate flex items-center justify-between hover:text-[var(--primary)] transition-colors ${isDark ? 'text-slate-200' : 'text-slate-800'}`}
                title={selectedTimezone}
              >
                <span>{selectedTimezone || 'Determining timezone...'}</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 hover:text-slate-200 ml-2 border border-slate-700/50 px-1.5 py-0.5 rounded">Change</span>
              </button>
            </div>
          </div>

          {/* Timezone dropdown search */}
          {showTzDropdown && (
            <div className="mt-2 space-y-2 border-t border-border pt-3 z-30 relative">
              <input
                type="text"
                placeholder="Search timezone (e.g. London, Kolkata)..."
                value={tzSearch}
                onChange={(e) => setTzSearch(e.target.value)}
                className="w-full text-xs p-2 rounded-lg border border-border outline-none bg-input/30 text-foreground placeholder-muted-foreground focus:border-primary"
                autoFocus
              />
              <div className="max-h-40 overflow-y-auto divide-y divide-border text-xs">
                {filteredTz.slice(0, 80).map((tz) => (
                  <button
                    key={tz}
                    onClick={() => handleTimezoneChange(tz)}
                    className={`w-full text-left px-3 py-2 transition-colors ${
                      tz === selectedTimezone
                        ? 'bg-primary/20 text-primary font-bold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {tz}
                  </button>
                ))}
                {filteredTz.length === 0 && (
                  <div className="p-3 text-center text-slate-500">No timezones found</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Real-time Unix Epoch Timestamp Counter */}
        <div className={`rounded-xl p-5 space-y-2 flex items-center gap-4 border transition-all duration-300 ${
          isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md'
        }`}>
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            isDark ? 'bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20' : 'bg-secondary/15 text-primary border-secondary/30'
          }`}>
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-xs uppercase font-bold tracking-wider`}>Unix Epoch Time</p>
            <p className={`text-sm font-mono font-bold mt-0.5 tracking-wider ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
              {time.unixTimestamp || '0000000000'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
