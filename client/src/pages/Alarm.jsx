import React, { useState, useEffect, useRef } from 'react';
import { Bell, Plus, Trash2, Volume2, Play, Square, AlertCircle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

// Web Audio API Synthesis Engine
let audioCtx = null;
let activeOscillators = [];
let soundInterval = null;

const stopSynthesizedSound = () => {
  if (soundInterval) {
    clearInterval(soundInterval);
    soundInterval = null;
  }
  activeOscillators.forEach(osc => {
    try { osc.stop(); } catch(e) {}
  });
  activeOscillators = [];
  if (audioCtx) {
    try { audioCtx.close(); } catch(e) {}
    audioCtx = null;
  }
};

const startSynthesizedSound = (soundType, targetVolume = 0.8, shouldFadeIn = true) => {
  stopSynthesizedSound();
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const masterGain = audioCtx.createGain();
    masterGain.connect(audioCtx.destination);
    
    if (shouldFadeIn) {
      masterGain.gain.setValueAtTime(0.01, audioCtx.currentTime);
      masterGain.gain.linearRampToValueAtTime(targetVolume, audioCtx.currentTime + 6.0); // fade in over 6s
    } else {
      masterGain.gain.setValueAtTime(targetVolume, audioCtx.currentTime);
    }

    if (soundType === 'classic_bell') {
      const playPulse = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(600, now);
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(597, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
        activeOscillators.push(osc1, osc2);
      };
      playPulse();
      soundInterval = setInterval(playPulse, 400);
      
    } else if (soundType === 'digital_beep') {
      const playBeep = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(950, now);
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.setValueAtTime(0.2, now + 0.12);
        gain.gain.setValueAtTime(0.001, now + 0.15);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start();
        osc.stop(now + 0.2);
        activeOscillators.push(osc);
      };
      playBeep();
      soundInterval = setInterval(playBeep, 450);

    } else if (soundType === 'morning_birds') {
      const playChirp = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(2600, now);
        osc.frequency.exponentialRampToValueAtTime(3400, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(1800, now + 0.18);
        
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start();
        osc.stop(now + 0.25);
        activeOscillators.push(osc);
      };
      const birdsInterval = () => {
        playChirp();
        setTimeout(playChirp, 100);
        setTimeout(playChirp, 250);
      };
      birdsInterval();
      soundInterval = setInterval(birdsInterval, 1200);

    } else if (soundType === 'soft_piano') {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major chord
      const playChord = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          
          gain.gain.setValueAtTime(0.12, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);
          
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 1.3);
          activeOscillators.push(osc);
        });
      };
      playChord();
      soundInterval = setInterval(playChord, 2200);

    } else if (soundType === 'sunrise_chime') {
      const notes = [293.66, 369.99, 440.00, 587.33]; // D major
      const playChime = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        notes.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.15);
          
          gain.gain.setValueAtTime(0.1, now + idx * 0.15);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 1.0);
          
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now + idx * 0.15);
          osc.stop(now + idx * 0.15 + 1.1);
          activeOscillators.push(osc);
        });
      };
      playChime();
      soundInterval = setInterval(playChime, 2500);

    } else if (soundType === 'wind_chimes') {
      const chimes = [1046.50, 1174.66, 1318.51, 1567.98, 1760.00];
      const playChimes = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        for (let i = 0; i < 3; i++) {
          const freq = chimes[Math.floor(Math.random() * chimes.length)];
          const delay = Math.random() * 0.8;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + delay);
          
          gain.gain.setValueAtTime(0.08, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 1.5);
          
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now + delay);
          osc.stop(now + delay + 1.6);
          activeOscillators.push(osc);
        }
      };
      playChimes();
      soundInterval = setInterval(playChimes, 1800);

    } else if (soundType === 'temple_bell') {
      const playTemple = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(146.83, now); // D3
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(293.66, now); // D4
        
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 4.5);
        
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(masterGain);
        
        osc1.start();
        osc2.start();
        osc1.stop(now + 5.0);
        osc2.stop(now + 5.0);
        activeOscillators.push(osc1, osc2);
      };
      playTemple();
      soundInterval = setInterval(playTemple, 5500);

    } else if (soundType === 'school_bell') {
      const playSchool = () => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'square';
        osc.frequency.setValueAtTime(420, audioCtx.currentTime);
        
        const mod = audioCtx.createOscillator();
        const modGain = audioCtx.createGain();
        mod.type = 'sawtooth';
        mod.frequency.setValueAtTime(18, audioCtx.currentTime);
        modGain.gain.setValueAtTime(160, audioCtx.currentTime);
        
        mod.connect(modGain);
        modGain.connect(osc.frequency);
        
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        mod.start();
        osc.start();
        mod.stop(audioCtx.currentTime + 1.5);
        osc.stop(audioCtx.currentTime + 1.5);
        activeOscillators.push(osc, mod);
      };
      playSchool();
      soundInterval = setInterval(playSchool, 2000);

    } else if (soundType === 'notification_tone') {
      const playNotif = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.setValueAtTime(880.00, now + 0.12); // A5
        
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        
        osc.connect(gain);
        gain.connect(masterGain);
        
        osc.start();
        osc.stop(now + 0.35);
        activeOscillators.push(osc);
      };
      playNotif();
      soundInterval = setInterval(playNotif, 2000);

    } else if (soundType === 'calm_melody') {
      const scale = [261.63, 293.66, 329.63, 349.23, 392.00];
      const playMelody = () => {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        scale.forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.22);
          
          gain.gain.setValueAtTime(0.1, now + idx * 0.22);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.22 + 0.6);
          
          osc.connect(gain);
          gain.connect(masterGain);
          
          osc.start(now + idx * 0.22);
          osc.stop(now + idx * 0.22 + 0.7);
          activeOscillators.push(osc);
        });
      };
      playMelody();
      soundInterval = setInterval(playMelody, 3200);
    }
  } catch (e) {
    console.error("Synthesizer failed: ", e);
  }
};

const SOUND_LABELS = {
  classic_bell: 'Classic Bell',
  digital_beep: 'Digital Beep',
  morning_birds: 'Morning Birds',
  soft_piano: 'Soft Piano',
  sunrise_chime: 'Sunrise Chime',
  wind_chimes: 'Wind Chimes',
  temple_bell: 'Temple Bell',
  school_bell: 'School Bell',
  notification_tone: 'Notification Tone',
  calm_melody: 'Calm Melody'
};

const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Confetti Particle Canvas
export function Confetti({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];
    const colors = ['#ffe66d', '#ff6b6b', '#4ecdc4', '#1a535c', '#ffffff'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 6 + 4,
        d: Math.random() * canvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 5,
        tiltAngleIncremental: Math.random() * 0.07 + 0.02,
        tiltAngle: 0
      });
    }

    let animationFrameId;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, idx) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - idx / 3) * 15;

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();

        if (p.y > canvas.height) {
          particles[idx] = {
            x: Math.random() * canvas.width,
            y: -20,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
            tiltAngleIncremental: p.tiltAngleIncremental,
            tiltAngle: p.tiltAngle
          };
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 6000);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [active]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 w-full h-full" />;
}

export default function Alarm() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [alarms, setAlarms] = useState(() => {
    const stored = localStorage.getItem('chrono_alarms');
    return stored ? JSON.parse(stored) : [
      { id: '1', time: '07:00', label: 'Morning Wakeup', enabled: true, repeat: [1, 2, 3, 4, 5], sound: 'sunrise_chime', volume: 0.8 },
      { id: '2', time: '10:00', label: 'Weekend Sleep-in', enabled: false, repeat: [0, 6], sound: 'morning_birds', volume: 0.7 }
    ];
  });

  const [newTime, setNewTime] = useState('07:00');
  const [selectedHour, setSelectedHour] = useState('07');
  const [selectedMinute, setSelectedMinute] = useState('00');
  const [hourDropdownOpen, setHourDropdownOpen] = useState(false);
  const [minuteDropdownOpen, setMinuteDropdownOpen] = useState(false);
  const [soundDropdownOpen, setSoundDropdownOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [repeatDays, setRepeatDays] = useState([1, 2, 3, 4, 5]); // Default weekdays
  const [selectedSound, setSelectedSound] = useState('sunrise_chime');
  const [volume, setVolume] = useState(0.8);
  const [previewing, setPreviewing] = useState(false);

  // Ringing state
  const [ringingAlarm, setRingingAlarm] = useState(null);
  const [snoozeActive, setSnoozeActive] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [nextAlarmStr, setNextAlarmStr] = useState('');

  // Persist Alarms
  useEffect(() => {
    localStorage.setItem('chrono_alarms', JSON.stringify(alarms));
    updateNextAlarmIndicator();
  }, [alarms]);

  // Audio Preview helper
  const togglePreview = () => {
    if (previewing) {
      stopSynthesizedSound();
      setPreviewing(false);
    } else {
      setPreviewing(true);
      startSynthesizedSound(selectedSound, volume, false);
      toast.info(`Playing sound preview: ${SOUND_LABELS[selectedSound]}`);
    }
  };

  useEffect(() => {
    return () => {
      stopSynthesizedSound();
    };
  }, []);

  // Sync volume during preview
  const handleVolumeChange = (newVal) => {
    setVolume(newVal);
    if (previewing) {
      startSynthesizedSound(selectedSound, newVal, false);
    }
  };

  // Alarm Check Loop (Interval runs every 1 second)
  useEffect(() => {
    const checkLoop = () => {
      const now = new Date();
      const currentHrs = String(now.getHours()).padStart(2, '0');
      const currentMins = String(now.getMinutes()).padStart(2, '0');
      const currentSecs = now.getSeconds();
      const currentDay = now.getDay();
      
      const timeStr = `${currentHrs}:${currentMins}`;

      // Only check on the 0th second of any minute to avoid triggering multiple times
      if (currentSecs !== 0) return;

      alarms.forEach(alarm => {
        if (!alarm.enabled) return;

        if (alarm.time === timeStr) {
          const isRepeatEnabled = alarm.repeat && alarm.repeat.length > 0;
          if (!isRepeatEnabled || alarm.repeat.includes(currentDay)) {
            triggerAlarm(alarm);
          }
        }
      });
    };

    const interval = setInterval(checkLoop, 1000);
    return () => clearInterval(interval);
  }, [alarms]);

  const triggerAlarm = (alarm) => {
    // Log activity
    logActivity(`Alarm Ringing: ${alarm.label || 'Alarm'} (${alarm.time})`);
    setRingingAlarm(alarm);
    startSynthesizedSound(alarm.sound, alarm.volume, true);
  };

  const logActivity = (action) => {
    try {
      const stored = localStorage.getItem('chrono_activities') || '[]';
      const activities = JSON.parse(stored);
      activities.unshift({
        id: Date.now().toString(),
        time: new Date().toISOString(),
        action: action
      });
      localStorage.setItem('chrono_activities', JSON.stringify(activities.slice(0, 100)));
      window.dispatchEvent(new Event('storage'));
    } catch(e) {}
  };

  // Alarms management CRUD
  const addAlarm = () => {
    if (!newTime) return;
    const item = {
      id: Date.now().toString(),
      time: newTime,
      label: newLabel || 'Alarm',
      enabled: true,
      repeat: [...repeatDays],
      sound: selectedSound,
      volume: volume
    };
    setAlarms(prev => [...prev, item]);
    setNewLabel('');
    logActivity(`Alarm Added: ${item.label} at ${item.time}`);
    toast.success(`Alarm set for ${newTime}`);
  };

  const deleteAlarm = (id) => {
    const toDel = alarms.find(a => a.id === id);
    setAlarms(prev => prev.filter(a => a.id !== id));
    if (toDel) {
      logActivity(`Alarm Deleted: ${toDel.label} (${toDel.time})`);
    }
  };

  const toggleAlarm = (id) => {
    setAlarms(prev => prev.map(a => {
      if (a.id === id) {
        logActivity(`Alarm ${!a.enabled ? 'Enabled' : 'Disabled'}: ${a.label} (${a.time})`);
        return { ...a, enabled: !a.enabled };
      }
      return a;
    }));
  };

  // Snooze function
  const handleSnooze = (mins) => {
    if (!ringingAlarm) return;
    stopSynthesizedSound();
    
    // Create temporary snooze alarm
    const now = new Date();
    const snoozeDate = new Date(now.getTime() + mins * 60000);
    const snoozeHrs = String(snoozeDate.getHours()).padStart(2, '0');
    const snoozeMins = String(snoozeDate.getMinutes()).padStart(2, '0');
    const snoozeTimeStr = `${snoozeHrs}:${snoozeMins}`;

    const tempAlarm = {
      id: `snooze-${Date.now()}`,
      time: snoozeTimeStr,
      label: `Snooze: ${ringingAlarm.label}`,
      enabled: true,
      repeat: [],
      sound: ringingAlarm.sound,
      volume: ringingAlarm.volume
    };

    setAlarms(prev => [...prev, tempAlarm]);
    logActivity(`Snoozed alarm "${ringingAlarm.label}" for ${mins} minutes`);
    setRingingAlarm(null);
    toast.success(`Snoozed for ${mins} minutes (Next Ring: ${snoozeTimeStr})`);
  };

  // Dismiss Alarm
  const handleDismiss = () => {
    if (!ringingAlarm) return;
    stopSynthesizedSound();
    logActivity(`Alarm Dismissed: ${ringingAlarm.label}`);
    
    // If it was a temporary snooze alarm, remove it
    if (ringingAlarm.id.startsWith('snooze-')) {
      setAlarms(prev => prev.filter(a => a.id !== ringingAlarm.id));
    }
    
    setRingingAlarm(null);
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 5500);
    toast.success("Alarm dismissed! Let's conquer the day.");
  };

  // Calculate upcoming alarm time string
  const updateNextAlarmIndicator = () => {
    if (alarms.length === 0) {
      setNextAlarmStr('No alarms active');
      return;
    }

    const enabledAlarms = alarms.filter(a => a.enabled);
    if (enabledAlarms.length === 0) {
      setNextAlarmStr('No alarms enabled');
      return;
    }

    const now = new Date();
    const currentDay = now.getDay();
    const currentHrs = now.getHours();
    const currentMins = now.getMinutes();

    let shortestMinutesDiff = Infinity;
    let nextAlarm = null;

    enabledAlarms.forEach(alarm => {
      const [alarmHrs, alarmMins] = alarm.time.split(':').map(Number);
      
      // If alarm is single-shot (no repeats)
      if (!alarm.repeat || alarm.repeat.length === 0) {
        let alarmDayDiff = 0;
        if (alarmHrs < currentHrs || (alarmHrs === currentHrs && alarmMins <= currentMins)) {
          alarmDayDiff = 1; // tomorrow
        }
        const diffMins = (alarmDayDiff * 24 * 60) + (alarmHrs - currentHrs) * 60 + (alarmMins - currentMins);
        if (diffMins < shortestMinutesDiff) {
          shortestMinutesDiff = diffMins;
          nextAlarm = alarm;
        }
      } else {
        // Repeat alarm: check all repeats to find closest one
        alarm.repeat.forEach(day => {
          let dayDiff = day - currentDay;
          if (dayDiff < 0) {
            dayDiff += 7;
          } else if (dayDiff === 0) {
            if (alarmHrs < currentHrs || (alarmHrs === currentHrs && alarmMins <= currentMins)) {
              dayDiff = 7; // next week
            }
          }
          const diffMins = (dayDiff * 24 * 60) + (alarmHrs - currentHrs) * 60 + (alarmMins - currentMins);
          if (diffMins < shortestMinutesDiff) {
            shortestMinutesDiff = diffMins;
            nextAlarm = alarm;
          }
        });
      }
    });

    if (nextAlarm) {
      const diffHrs = Math.floor(shortestMinutesDiff / 60);
      const diffMins = shortestMinutesDiff % 60;
      
      let nextStr = `${nextAlarm.time} (${nextAlarm.label})`;
      if (diffHrs > 0) {
        nextStr += ` in ${diffHrs}h ${diffMins}m`;
      } else {
        nextStr += ` in ${diffMins}m`;
      }
      setNextAlarmStr(nextStr);
    } else {
      setNextAlarmStr('No upcoming alarms scheduled');
    }
  };

  const handleDayToggle = (dayIdx) => {
    if (repeatDays.includes(dayIdx)) {
      setRepeatDays(prev => prev.filter(d => d !== dayIdx));
    } else {
      setRepeatDays(prev => [...prev, dayIdx].sort());
    }
  };

  const setPresetRepeat = (type) => {
    if (type === 'daily') setRepeatDays([0, 1, 2, 3, 4, 5, 6]);
    else if (type === 'weekdays') setRepeatDays([1, 2, 3, 4, 5]);
    else if (type === 'weekends') setRepeatDays([0, 6]);
    else setRepeatDays([]);
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {confettiActive && <Confetti active={confettiActive} />}
      
      {/* Ringing Overlay */}
      {ringingAlarm && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-2xl z-50 flex flex-col items-center justify-center p-6 text-center select-none animate-[fadeIn_0.3s_ease-out]">
          <div className="space-y-8 max-w-lg w-full">
            {/* Vibrating bell container */}
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center bg-destructive/10 border border-destructive/20 rounded-full animate-bounce">
              <Bell className="w-24 h-24 text-destructive animate-[spin_0.5s_linear_infinite]" />
              <div className="absolute inset-0 rounded-full border border-destructive/40 animate-ping"></div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-destructive animate-pulse">Alarm Ringing</p>
              <h2 className="text-5xl font-black mt-2 tracking-tight">{ringingAlarm.time}</h2>
              <p className="text-xl text-slate-400 mt-3 font-semibold">{ringingAlarm.label}</p>
              <p className="text-xs text-slate-500 mt-2 flex items-center justify-center gap-1">
                <Volume2 className="w-3.5 h-3.5" /> Tone: {SOUND_LABELS[ringingAlarm.sound]}
              </p>
            </div>

            {/* Actions Grid */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => handleSnooze(10)} 
                className="py-4 rounded-xl border border-border bg-card/65 font-bold hover:bg-card hover:text-accent transition-all text-sm"
              >
                Snooze 10 Min
              </button>
              <button 
                onClick={handleDismiss} 
                className="py-4 rounded-xl bg-destructive hover:bg-destructive/80 text-destructive-foreground font-black shadow-[0_0_20px_rgba(255,107,107,0.3)] transition-all text-sm"
              >
                DISMISS
              </button>
            </div>

            {/* Custom Snooze Row */}
            <div className="flex justify-center gap-2 text-xs border-t border-border pt-6">
              <span className="text-slate-500 self-center">Other Snooze:</span>
              {[5, 15, 30].map(m => (
                <button 
                  key={m} 
                  onClick={() => handleSnooze(m)}
                  className="px-3 py-1 rounded bg-card/40 border hover:border-slate-400 text-slate-300 font-semibold"
                >
                  {m} Min
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <Bell className="w-9 h-9 text-primary" />
            Alarm Center
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm`}>Configure and manage alarms with rich synthesized ringtones</p>
        </div>

        {/* Next upcoming alarm banner */}
        <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${
          isDark ? 'bg-card/40 border-[var(--primary)]/15 text-slate-300' : 'bg-white/60 border-slate-200 text-slate-700 shadow-sm'
        }`}>
          <Calendar className="w-4 h-4 text-primary" />
          <div className="text-xs">
            <span className="font-bold opacity-60">Next Alarm: </span>
            <span className="font-semibold text-primary">{nextAlarmStr}</span>
          </div>
        </div>
      </div>

      {/* Add New Alarm panel */}
      <div className={`rounded-xl p-6 border space-y-5 transition-all duration-300 ${
        isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-[0_8px_32px_rgba(0,0,0,0.05)] backdrop-blur-md'
      }`}>
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Create New Alarm
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inputs section */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Alarm Time</label>
              <div className="flex gap-2">
                {/* Hour Dropdown */}
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => { setHourDropdownOpen(!hourDropdownOpen); setMinuteDropdownOpen(false); setSoundDropdownOpen(false); }}
                    className={`w-full text-left text-sm p-3 rounded-xl border outline-none flex items-center justify-between transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-700/50 text-white hover:border-[var(--primary)]/50' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-primary/50'
                    }`}
                  >
                    <span className="font-mono text-base font-bold">{selectedHour}</span>
                    <span className="text-[9px] opacity-50">Hr</span>
                  </button>
                  {hourDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setHourDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 border border-border rounded-xl overflow-hidden z-40 shadow-2xl max-h-48 overflow-y-auto bg-popover text-popover-foreground">
                        {Array.from({ length: 24 }).map((_, h) => {
                          const hStr = String(h).padStart(2, '0');
                          return (
                            <button
                              key={h}
                              type="button"
                              onClick={() => {
                                setSelectedHour(hStr);
                                setHourDropdownOpen(false);
                                const timeVal = `${hStr}:${selectedMinute}`;
                                setNewTime(timeVal);
                                setTimeout(updateNextAlarmIndicator, 100);
                              }}
                              className={`w-full text-center px-4 py-2 transition-colors text-sm font-mono font-bold cursor-pointer ${
                                hStr === selectedHour
                                  ? 'bg-primary/20 text-primary font-black'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              {hStr}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                <span className="self-center font-bold text-lg opacity-60">:</span>

                {/* Minute Dropdown */}
                <div className="flex-1 relative">
                  <button
                    type="button"
                    onClick={() => { setMinuteDropdownOpen(!minuteDropdownOpen); setHourDropdownOpen(false); setSoundDropdownOpen(false); }}
                    className={`w-full text-left text-sm p-3 rounded-xl border outline-none flex items-center justify-between transition-all cursor-pointer ${
                      isDark 
                        ? 'bg-slate-900/60 border-slate-700/50 text-white hover:border-[var(--primary)]/50' 
                        : 'bg-white border-slate-300 text-slate-800 hover:border-primary/50'
                    }`}
                  >
                    <span className="font-mono text-base font-bold">{selectedMinute}</span>
                    <span className="text-[9px] opacity-50">Min</span>
                  </button>
                  {minuteDropdownOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setMinuteDropdownOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1 border border-border rounded-xl overflow-hidden z-40 shadow-2xl max-h-48 overflow-y-auto bg-popover text-popover-foreground">
                        {Array.from({ length: 60 }).map((_, m) => {
                          const mStr = String(m).padStart(2, '0');
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                setSelectedMinute(mStr);
                                setMinuteDropdownOpen(false);
                                const timeVal = `${selectedHour}:${mStr}`;
                                setNewTime(timeVal);
                                setTimeout(updateNextAlarmIndicator, 100);
                              }}
                              className={`w-full text-center px-4 py-2 transition-colors text-sm font-mono font-bold cursor-pointer ${
                                mStr === selectedMinute
                                  ? 'bg-primary/20 text-primary font-black'
                                  : 'text-foreground hover:bg-muted'
                              }`}
                            >
                              {mStr}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Label / Name</label>
              <Input 
                type="text" 
                placeholder="e.g. Wake up, Gym time" 
                value={newLabel} 
                onChange={(e) => setNewLabel(e.target.value)} 
                className={`${isDark ? 'bg-slate-900/60 border-slate-700/50 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
              />
            </div>
          </div>

          {/* Repeat Days section */}
          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Repeat Days</label>
            <div className="flex gap-1.5 flex-wrap">
              {DAYS_SHORT.map((day, idx) => {
                const isActive = repeatDays.includes(idx);
                return (
                  <button
                    key={day}
                    onClick={() => handleDayToggle(idx)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                      isActive 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : 'bg-muted/40 border-border text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {day[0]}
                  </button>
                );
              })}
            </div>

            {/* Presets */}
            <div className="flex gap-2 text-[10px] pt-1">
              <button onClick={() => setPresetRepeat('daily')} className="px-2.5 py-1.5 rounded bg-card/65 hover:bg-card border border-border text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer">Daily</button>
              <button onClick={() => setPresetRepeat('weekdays')} className="px-2.5 py-1.5 rounded bg-card/65 hover:bg-card border border-border text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer">Weekdays</button>
              <button onClick={() => setPresetRepeat('weekends')} className="px-2.5 py-1.5 rounded bg-card/65 hover:bg-card border border-border text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer">Weekends</button>
              <button onClick={() => setPresetRepeat('clear')} className="px-2.5 py-1.5 rounded bg-card/65 hover:bg-card border border-border text-muted-foreground font-semibold uppercase tracking-wider cursor-pointer">Once</button>
            </div>
          </div>

          {/* Tone Selector & Volume */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider font-bold text-slate-500">Alarm Tone</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => { setSoundDropdownOpen(!soundDropdownOpen); setHourDropdownOpen(false); setMinuteDropdownOpen(false); }}
                  className={`w-full text-left text-sm p-3 rounded-xl border outline-none flex items-center justify-between transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-900/60 border-slate-700/50 text-white hover:border-[var(--primary)]/50' 
                      : 'bg-white border-slate-300 text-slate-800 hover:border-primary/50'
                  }`}
                >
                  <span>{SOUND_LABELS[selectedSound]}</span>
                  <span className="text-[9px] opacity-50">▼</span>
                </button>
                {soundDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSoundDropdownOpen(false)} />
                    <div className="absolute left-0 right-0 mt-1 border border-border rounded-xl overflow-hidden z-40 shadow-2xl max-h-60 overflow-y-auto bg-popover text-popover-foreground">
                      {Object.entries(SOUND_LABELS).map(([k, label]) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => {
                            setSelectedSound(k);
                            setSoundDropdownOpen(false);
                            if (previewing) {
                              startSynthesizedSound(k, volume, false);
                            }
                          }}
                          className={`w-full text-left px-4 py-2.5 transition-colors text-sm font-semibold cursor-pointer ${
                            k === selectedSound
                              ? 'bg-primary/20 text-primary font-black'
                              : 'text-foreground hover:bg-muted'
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Volume control slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-500">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <div className="flex items-center gap-3">
                <input 
                  type="range" 
                  min="0.1" 
                  max="1.0" 
                  step="0.05" 
                  value={volume}
                  onChange={(e) => handleVolumeChange(Number(e.target.value))}
                  className="flex-1 accent-primary h-1.5 rounded bg-muted cursor-pointer"
                />
                
                {/* Audio preview button */}
                <Button 
                  onClick={togglePreview} 
                  variant="outline" 
                  size="icon" 
                  className={`w-9 h-9 border flex-shrink-0 ${
                    previewing 
                      ? 'bg-destructive/10 border-destructive/30 text-destructive' 
                      : isDark ? 'border-slate-700/50 text-slate-300' : 'border-slate-300 text-slate-700'
                  }`}
                  title={previewing ? "Stop Sound Preview" : "Play Sound Preview"}
                >
                  {previewing ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Add alarm button */}
        <div className="pt-2 border-t border-border/10 flex justify-end">
          <Button onClick={addAlarm} className="gap-2 px-6 h-11 btn-premium-gold" style={{ border: 'none' }}>
            <Plus className="w-4 h-4" /> Save Alarm Setting
          </Button>
        </div>
      </div>

      {/* Alarm list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">Active Alarm Checklist</h3>
        {alarms.length === 0 ? (
          <div className={`rounded-xl p-10 text-center border ${
            isDark ? 'bg-card/25 border-slate-800 text-slate-500' : 'bg-white/40 border-slate-200 text-slate-400'
          }`}>
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500 opacity-60 mb-2" />
            <p className="font-semibold text-sm">No alarms configured yet</p>
            <p className="text-xs opacity-80 mt-1">Configure your alarm using the creator card above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alarms.map(alarm => {
              const isTemp = alarm.id.startsWith('snooze-');
              return (
                <div 
                  key={alarm.id} 
                  className={`rounded-xl p-5 border flex items-center justify-between transition-all duration-300 ${
                    alarm.enabled 
                      ? isDark ? 'bg-card border-[var(--primary)]/15 shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : 'bg-white border-slate-200 shadow-sm'
                      : isDark ? 'bg-card/30 border-slate-850/60 opacity-60' : 'bg-slate-100/50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <input 
                      type="checkbox" 
                      checked={alarm.enabled} 
                      onChange={() => toggleAlarm(alarm.id)} 
                      className="w-5 h-5 rounded border-border accent-primary cursor-pointer flex-shrink-0"
                    />
                    
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black font-mono tracking-tight ${alarm.enabled ? 'text-primary' : 'text-slate-500'}`}>
                          {alarm.time}
                        </span>
                        {isTemp && (
                          <span className="text-[9px] uppercase tracking-widest bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1 rounded font-bold">
                            Snooze
                          </span>
                        )}
                      </div>
                      
                      <p className={`text-xs font-semibold truncate ${alarm.enabled ? 'text-slate-300' : 'text-slate-500'}`}>{alarm.label}</p>
                      
                      {/* Repeat summary */}
                      <div className="flex gap-1 mt-1.5">
                        {alarm.repeat && alarm.repeat.length > 0 ? (
                          DAYS_SHORT.map((d, i) => {
                            const active = alarm.repeat.includes(i);
                            return (
                              <span 
                                key={d} 
                                className={`text-[9px] font-bold px-1 rounded-sm ${
                                  active 
                                    ? alarm.enabled ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-muted text-muted-foreground border border-border'
                                    : 'text-muted-foreground/30'
                                }`}
                              >
                                {d[0]}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500">Run Once</span>
                        )}
                      </div>
                      
                      {/* Ringtone label */}
                      <p className="text-[10px] text-slate-500 mt-2 truncate flex items-center gap-1 select-none">
                        <Volume2 className="w-3 h-3 text-slate-600" /> Tone: {SOUND_LABELS[alarm.sound] || 'Standard'}
                      </p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => deleteAlarm(alarm.id)} 
                    variant="ghost" 
                    size="icon" 
                    className="text-slate-500 hover:text-destructive hover:bg-destructive/10 flex-shrink-0 ml-4 rounded-lg"
                    title="Delete Alarm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
