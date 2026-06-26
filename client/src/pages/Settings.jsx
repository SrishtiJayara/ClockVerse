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
import { Settings as SettingsIcon, Volume2, Zap, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
export default function Settings() {
    var _a = useState({
        soundEnabled: true,
        animationsEnabled: true,
        timeFormat: '24h',
        theme: 'dark',
    }), settings = _a[0], setSettings = _a[1];
    // Load from localStorage
    useEffect(function () {
        var saved = localStorage.getItem('appSettings');
        if (saved) {
            setSettings(JSON.parse(saved));
        }
    }, []);
    // Save to localStorage
    var updateSetting = function (key, value) {
        var _a;
        var newSettings = __assign(__assign({}, settings), (_a = {}, _a[key] = value, _a));
        setSettings(newSettings);
        localStorage.setItem('appSettings', JSON.stringify(newSettings));
    };
    return (<div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <SettingsIcon className="w-10 h-10 text-slate-400"/>
          Settings
        </h1>
        <p className="text-slate-400 mt-2">Customize your experience</p>
      </div>

      {/* Sound Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Volume2 className="w-5 h-5 text-cyan-400"/>
            <div>
              <h3 className="font-semibold">Sound Effects</h3>
              <p className="text-sm text-slate-400">Enable notification sounds</p>
            </div>
          </div>
          <button onClick={function () { return updateSetting('soundEnabled', !settings.soundEnabled); }} className={"relative inline-flex h-8 w-14 items-center rounded-full transition-colors ".concat(settings.soundEnabled ? 'bg-cyan-500' : 'bg-slate-600')}>
            <span className={"inline-block h-6 w-6 transform rounded-full bg-white transition-transform ".concat(settings.soundEnabled ? 'translate-x-7' : 'translate-x-1')}/>
          </button>
        </div>
      </div>

      {/* Animation Settings */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-amber-400"/>
            <div>
              <h3 className="font-semibold">Animations</h3>
              <p className="text-sm text-slate-400">Enable smooth animations</p>
            </div>
          </div>
          <button onClick={function () { return updateSetting('animationsEnabled', !settings.animationsEnabled); }} className={"relative inline-flex h-8 w-14 items-center rounded-full transition-colors ".concat(settings.animationsEnabled ? 'bg-cyan-500' : 'bg-slate-600')}>
            <span className={"inline-block h-6 w-6 transform rounded-full bg-white transition-transform ".concat(settings.animationsEnabled ? 'translate-x-7' : 'translate-x-1')}/>
          </button>
        </div>
      </div>

      {/* Time Format */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-5 h-5 text-emerald-400"/>
          <div>
            <h3 className="font-semibold">Time Format</h3>
            <p className="text-sm text-slate-400">Choose your preferred time display</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={function () { return updateSetting('timeFormat', '12h'); }} variant={settings.timeFormat === '12h' ? 'default' : 'outline'} className="w-full">
            12 Hour
          </Button>
          <Button onClick={function () { return updateSetting('timeFormat', '24h'); }} variant={settings.timeFormat === '24h' ? 'default' : 'outline'} className="w-full">
            24 Hour
          </Button>
        </div>
      </div>

      {/* About */}
      <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold">About ClockVerse</h3>
        <div className="space-y-2 text-sm text-slate-400">
          <p>Version: 1.0.0</p>
          <p>A premium productivity timer and clock application</p>
          <p className="mt-4">Built with React, TypeScript, and GSAP</p>
        </div>
      </div>

      {/* Reset */}
      <Button onClick={function () {
            localStorage.removeItem('appSettings');
            setSettings({
                soundEnabled: true,
                animationsEnabled: true,
                timeFormat: '24h',
                theme: 'dark',
            });
        }} variant="outline" className="w-full border-rose-500/30 text-rose-400 hover:bg-rose-500/10">
        Reset to Defaults
      </Button>
    </div>);
}
