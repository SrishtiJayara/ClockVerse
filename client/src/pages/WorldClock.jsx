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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { Globe, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

var TIMEZONES = [
    { city: 'New York', timezone: 'America/New_York', offset: -5 },
    { city: 'London', timezone: 'Europe/London', offset: 0 },
    { city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9 },
    { city: 'Sydney', timezone: 'Australia/Sydney', offset: 10 },
    { city: 'Dubai', timezone: 'Asia/Dubai', offset: 4 },
    { city: 'Singapore', timezone: 'Asia/Singapore', offset: 8 },
    { city: 'Paris', timezone: 'Europe/Paris', offset: 1 },
    { city: 'Hong Kong', timezone: 'Asia/Hong_Kong', offset: 8 },
];

export default function WorldClock() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    var _a = useState([
        { id: '1', city: 'New York', timezone: 'America/New_York', offset: -5, time: '' },
        { id: '2', city: 'London', timezone: 'Europe/London', offset: 0, time: '' },
        { id: '3', city: 'Tokyo', timezone: 'Asia/Tokyo', offset: 9, time: '' },
    ]), clocks = _a[0], setClocks = _a[1];
    var _b = useState(''), searchQuery = _b[0], setSearchQuery = _b[1];
    var _c = useState(false), showSuggestions = _c[0], setShowSuggestions = _c[1];

    // Update times
    useEffect(function () {
        var updateTimes = function () {
            setClocks(function (prev) {
                return prev.map(function (clock) {
                    var now = new Date();
                    var utc = now.getTime() + now.getTimezoneOffset() * 60000;
                    var localTime = new Date(utc + 3600000 * clock.offset);
                    var hours = String(localTime.getHours()).padStart(2, '0');
                    var minutes = String(localTime.getMinutes()).padStart(2, '0');
                    var seconds = String(localTime.getSeconds()).padStart(2, '0');
                    return __assign(__assign({}, clock), { time: "".concat(hours, ":").concat(minutes, ":").concat(seconds) });
                });
            });
        };
        updateTimes();
        var interval = setInterval(updateTimes, 1000);
        return function () { return clearInterval(interval); };
    }, []);

    var addClock = function (tz) {
        if (!clocks.find(function (c) { return c.timezone === tz.timezone; })) {
            setClocks(__spreadArray(__spreadArray([], clocks, true), [
                {
                    id: Date.now().toString(),
                    city: tz.city,
                    timezone: tz.timezone,
                    offset: tz.offset,
                    time: '',
                },
            ], false));
        }
        setSearchQuery('');
        setShowSuggestions(false);
    };

    var removeClock = function (id) {
        setClocks(clocks.filter(function (c) { return c.id !== id; }));
    };

    var filteredTimezones = TIMEZONES.filter(function (tz) {
        return tz.city.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
            {/* Header */}
            <div>
                <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    <Globe className="w-9 h-9 text-primary animate-[spin_60s_linear_infinite]" />
                    World Clock
                </h1>
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm`}>
                    Track real-time data across different global timezones
                </p>
            </div>

            {/* Add Clock Section */}
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${
                isDark 
                    ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
                    : 'bg-white border-slate-200 shadow-sm'
            }`}>
                <h3 className="text-base font-bold mb-4">Add Timezone</h3>
                <div className="relative">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Search city or timezone..."
                                value={searchQuery}
                                onChange={function (e) {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={function () { return setShowSuggestions(true); }}
                                className="w-full text-sm pl-10 pr-4 py-2.5 rounded-lg border border-border outline-none transition-all bg-input/30 text-foreground placeholder-muted-foreground focus:border-primary"
                            />
                            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 border border-border rounded-xl overflow-hidden z-50 shadow-2xl transition-all duration-300 bg-popover text-popover-foreground">
                            {filteredTimezones.length === 0 ? (
                                <div className="p-4 text-slate-400 text-sm">No timezones found</div>
                            ) : (
                                filteredTimezones.map(function (tz) {
                                    return (
                                        <button
                                            key={tz.timezone}
                                            onClick={function () { return addClock(tz); }}
                                            className="w-full text-left px-4 py-2.5 transition-colors text-sm font-semibold cursor-pointer text-foreground hover:bg-muted"
                                        >
                                            {tz.city} ({tz.timezone})
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Clocks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clocks.map(function (clock) {
                    return (
                        <div
                            key={clock.id}
                            className={`border rounded-2xl p-6 space-y-4 transition-all duration-300 relative overflow-hidden group hover:scale-[1.02] ${
                                isDark 
                                    ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
                                    : 'bg-white border-slate-200 shadow-sm'
                            }`}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-lg font-bold text-primary">{clock.city}</h3>
                                    <p className="text-xs text-slate-400 mt-1 font-mono">{clock.timezone}</p>
                                </div>
                                <Button
                                    onClick={function () { return removeClock(clock.id); }}
                                    variant="ghost"
                                    size="icon"
                                    className={`hover:bg-red-500/10 text-red-400 border-none`}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="text-4xl font-mono font-black text-primary tracking-wider">
                                {clock.time}
                            </div>

                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                UTC {clock.offset > 0 ? '+' : ''}{clock.offset} Hours
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Timezone Reference */}
            <div className={`rounded-2xl p-6 border transition-all duration-300 ${
                isDark 
                    ? 'glass-card-premium border-[var(--primary)]/15 bg-card/30' 
                    : 'bg-white border-slate-200 shadow-sm'
            }`}>
                <h3 className="text-base font-bold mb-4">Available Timezones</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {TIMEZONES.map(function (tz) {
                        return (
                            <button
                                key={tz.timezone}
                                onClick={function () { return addClock(tz); }}
                                className={`text-xs font-bold px-3 py-2.5 border rounded-lg transition-all duration-300 cursor-pointer ${
                                    isDark
                                        ? 'border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-350 hover:text-white'
                                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-primary'
                                }`}
                            >
                                {tz.city}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
