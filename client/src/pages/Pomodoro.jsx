var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState, useEffect, useRef } from 'react';
import { Zap, Play, Pause, RotateCcw, Target, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import gsap from 'gsap';
import { useTheme } from '@/contexts/ThemeContext';
export default function Pomodoro() {
    var _a = useState({
        focusMinutes: 25,
        breakMinutes: 5,
        remainingSeconds: 25 * 60,
        isRunning: false,
        isBreak: false,
        sessionsCompleted: 0,
    }), pomodoro = _a[0], setPomodoro = _a[1];
    var _b = useState('25'), focusInput = _b[0], setFocusInput = _b[1];
    var _c = useState('5'), breakInput = _c[0], setBreakInput = _c[1];
    var containerRef = useRef(null);
    var textRef = useRef(null);
    var audioContextRef = useRef(null);
    // Sound play helper for alerts
    var playAlertSound = function (isBreak) {
        try {
            if (!audioContextRef.current) {
                audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            var ctx = audioContextRef.current;
            var osc = ctx.createOscillator();
            var gain = ctx.createGain();
            osc.type = 'sine';
            // High pitch double-beep for work start, single sweet chime for break
            osc.frequency.setValueAtTime(isBreak ? 523.25 : 659.25, ctx.currentTime); // C5 or E5
            osc.frequency.exponentialRampToValueAtTime(isBreak ? 783.99 : 880.00, ctx.currentTime + 0.25); // G5 or A5
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.4);
        }
        catch (e) {
            // Audio fallback
        }
    };
    // Pomodoro loop
    useEffect(function () {
        var interval;
        if (pomodoro.isRunning && pomodoro.remainingSeconds > 0) {
            interval = setInterval(function () {
                setTimerState();
            }, 1000);
        }
        return function () { return clearInterval(interval); };
    }, [pomodoro.isRunning]);
    var setTimerState = function () {
        setPomodoro(function (prev) {
            if (prev.remainingSeconds <= 1) {
                // Transition state
                var newIsBreak = !prev.isBreak;
                var newSeconds = newIsBreak ? prev.breakMinutes * 60 : prev.focusMinutes * 60;
                playAlertSound(newIsBreak);
                // Flash screen
                if (containerRef.current) {
                    gsap.fromTo(containerRef.current, { scale: 0.97, borderColor: newIsBreak ? 'var(--success)' : 'var(--primary)' }, { scale: 1.03, borderColor: newIsBreak ? 'var(--success)' : 'var(--primary)', duration: 0.3, yoyo: true, repeat: 3 });
                }
                return __assign(__assign({}, prev), { remainingSeconds: newSeconds, isBreak: newIsBreak, sessionsCompleted: newIsBreak ? prev.sessionsCompleted : prev.sessionsCompleted + 1 });
            }
            return __assign(__assign({}, prev), { remainingSeconds: prev.remainingSeconds - 1 });
        });
    };
    // Soft breathing scaling animation on text when ticking
    useEffect(function () {
        if (pomodoro.isRunning && textRef.current) {
            gsap.to(textRef.current, {
                scale: 1.03,
                duration: 1,
                repeat: -1,
                yoyo: true,
                ease: 'power1.inOut',
            });
        }
        else if (textRef.current) {
            gsap.killTweensOf(textRef.current);
            gsap.to(textRef.current, { scale: 1, duration: 0.2 });
        }
    }, [pomodoro.isRunning]);
    var formatTime = function (seconds) {
        var mins = Math.floor(seconds / 60);
        var secs = seconds % 60;
        return "".concat(String(mins).padStart(2, '0'), ":").concat(String(secs).padStart(2, '0'));
    };
    var togglePomodoro = function () {
        setPomodoro(function (prev) { return (__assign(__assign({}, prev), { isRunning: !prev.isRunning })); });
        if (containerRef.current) {
            gsap.to(containerRef.current, {
                duration: 0.2,
                scale: 0.99,
                yoyo: true,
                repeat: 1,
            });
        }
    };
    var resetPomodoro = function () {
        setPomodoro(function (prev) { return (__assign(__assign({}, prev), { remainingSeconds: prev.focusMinutes * 60, isRunning: false, isBreak: false })); });
    };
    var updateSettings = function () {
        var focus = parseInt(focusInput) || 25;
        var breakTime = parseInt(breakInput) || 5;
        setPomodoro(function (prev) { return (__assign(__assign({}, prev), { focusMinutes: focus, breakMinutes: breakTime, remainingSeconds: focus * 60, isRunning: false, isBreak: false })); });
        if (containerRef.current) {
            gsap.fromTo(containerRef.current, { opacity: 0.5, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out' });
        }
    };
    var currentTotal = pomodoro.isBreak ? pomodoro.breakMinutes * 60 : pomodoro.focusMinutes * 60;
    var progress = currentTotal > 0 ? ((currentTotal - pomodoro.remainingSeconds) / currentTotal) * 100 : 0;
    // Perimeter of circular gauge (r=90 => 2 * pi * 90 = 565.48)
    var strokeDashoffset = 565.48 - (565.48 * progress) / 100;
    var themeColor = pomodoro.isBreak ? '#4ecdc4' : 'var(--primary)'; // Mint teal for break, deep teal for focus
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (<div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <Zap className="w-9 h-9 text-primary"/>
          Focus Flow
        </h1>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm`}>Boost your productivity with focused work and break cycles</p>
      </div>

      {/* Main Glass Display Card */}
      <div ref={containerRef} className={`rounded-2xl p-10 flex flex-col items-center justify-center relative overflow-hidden border transition-all duration-300 ${
          isDark 
            ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30 shadow-[0_4px_24px_rgba(0,0,0,0.2)]' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
        {/* Glow Spheres */}
        <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full glow-orb-gold opacity-30 pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full glow-orb-purple opacity-30 pointer-events-none"></div>

        {/* Dynamic State Badge */}
        <div className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border mb-6 z-10 flex items-center gap-2" style={{
            color: themeColor,
            borderColor: "".concat(themeColor, "33"),
            backgroundColor: "".concat(themeColor, "0a"),
        }}>
          <Sparkles className="w-3.5 h-3.5"/>
          {pomodoro.isBreak ? 'Break Interval' : 'Focus Session'}
        </div>

        {/* Circular Gauge */}
        <div className="relative w-64 h-64 flex items-center justify-center mb-8">
          <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 200 200">
            {/* Background Dial Ring */}
            <circle cx="100" cy="100" r="90" fill="none" stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.03)"} strokeWidth="5"/>
            {/* Glowing Active Ring */}
            <circle cx="100" cy="100" r="90" fill="none" stroke={themeColor} strokeWidth="6" strokeDasharray="565.48" strokeDashoffset={strokeDashoffset} strokeLinecap="round" filter="url(#pomoGlowFilter)" style={{ transition: 'stroke-dashoffset 1s linear' }}/>
            <defs>
              <filter id="pomoGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3.5" result="blur"/>
                <feMerge>
                  <feMergeNode in="blur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* Time text centered */}
          <div ref={textRef} className="z-10 flex flex-col items-center justify-center text-center select-none">
            <span className="text-5xl font-mono font-black" style={{
            color: themeColor,
            textShadow: pomodoro.isBreak
                ? '0 0 12px rgba(78, 205, 196, 0.4)'
                : '0 0 12px rgba(26, 83, 92, 0.4)',
        }}>
              {formatTime(pomodoro.remainingSeconds)}
            </span>
          </div>
        </div>

        {/* Button Controls */}
        <div className="flex gap-4 w-full max-w-xs z-10">
          <Button onClick={togglePomodoro} className="flex-1 h-11 font-bold text-xs gap-2 cursor-pointer" style={{
            backgroundColor: pomodoro.isRunning ? '#ff6b6b' : themeColor,
            color: 'var(--primary-foreground)',
            boxShadow: pomodoro.isRunning 
              ? '0 4px 12px rgba(255, 107, 107, 0.25)' 
              : '0 4px 12px rgba(26, 83, 92, 0.2)',
            border: 'none',
        }}>
            {pomodoro.isRunning ? <Pause className="w-4 h-4"/> : <Play className="w-4 h-4"/>}
            {pomodoro.isRunning ? 'Pause Work' : 'Start Focus'}
          </Button>
          <Button onClick={resetPomodoro} variant="outline" className={`flex-1 h-11 font-semibold text-xs gap-2 cursor-pointer ${
              isDark 
                ? 'border-slate-700/50 text-slate-355 hover:bg-white/5 hover:text-white' 
                : 'border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-primary'
          }`}>
            <RotateCcw className="w-4 h-4" />
            Reset Cycle
          </Button>
        </div>

        {/* Target Progress Panel */}
        <div className={`mt-8 border-t pt-6 w-full max-w-sm flex items-center justify-between text-xs z-10 ${
            isDark ? 'border-slate-800' : 'border-slate-200'
        }`}>
          <span className={`font-bold uppercase tracking-wider flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <Target className="w-4 h-4 text-primary"/>
            Session completed
          </span>
          <div className="flex items-center gap-2">
            <span className={`font-bold text-sm ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{pomodoro.sessionsCompleted}</span>
            <span className="text-slate-500">/ 4</span>
          </div>
        </div>
      </div>

      {/* Configuration Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`rounded-xl p-5 space-y-3 border transition-all duration-300 ${
            isDark 
                ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
                : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Focus Duration</h3>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Minutes</label>
            <input 
                type="number" 
                min="1" 
                max="180" 
                value={focusInput} 
                onChange={function (e) { return setFocusInput(e.target.value); }} 
                className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none transition-all ${
                    isDark
                        ? 'bg-slate-950/85 border-slate-700/50 text-white placeholder-slate-500 focus:border-[var(--primary)]'
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary'
                }`}
            />
          </div>
        </div>

        <div className={`rounded-xl p-5 space-y-3 border transition-all duration-300 ${
            isDark 
                ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
                : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Break Duration</h3>
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Minutes</label>
            <input 
                type="number" 
                min="1" 
                max="60" 
                value={breakInput} 
                onChange={function (e) { return setBreakInput(e.target.value); }} 
                className={`w-full text-sm px-3 py-2.5 rounded-lg border outline-none transition-all ${
                    isDark
                        ? 'bg-slate-950/85 border-slate-700/50 text-white placeholder-slate-500 focus:border-[var(--primary)]'
                        : 'bg-white border-slate-200 text-slate-800 placeholder-slate-400 focus:border-primary'
                }`}
            />
          </div>
        </div>
      </div>

      <Button onClick={updateSettings} className="w-full btn-premium-gold h-10 font-bold border-none cursor-pointer">
        Save Durations & Reset
      </Button>

      {/* Guide Card */}
      <div className={`rounded-xl p-6 space-y-4 border transition-all duration-300 ${
          isDark 
              ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
              : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <h3 className={`text-sm font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>💡 Focus Flow Method Guide</h3>
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Work with high-concentration for 25-minute sprints.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Take a refreshing 5-minute break immediately after.</span>
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>Repeat 4 times to hit 100 minutes of productive work.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">•</span>
              <span>After completing 4 sessions, treat yourself to a longer 20-minute break.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>);
}
