import { useState, useEffect } from 'react';
import { Menu, X, Clock, Timer, Bell, Zap, Globe, BarChart3, Settings, Moon, Sun, CheckSquare } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import TaskDrawer from './TaskDrawer';

const navigationItems = [
  { id: 'clock', label: 'Clock', icon: Clock },
  { id: 'pomodoro', label: 'Focus Flow', icon: Zap },
  { id: 'alarm', label: 'Alarm Center', icon: Bell },
  { id: 'world', label: 'World Clock', icon: Globe },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'tasks', label: 'Task Checklist', icon: CheckSquare },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children, activeTab, onTabChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [taskDrawerOpen, setTaskDrawerOpen] = useState(false);
  const { theme, toggleTheme, bgStyle } = useTheme();
  const isDark = theme === 'dark';

  // Automatically adjust sidebar default on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar overlay on mobile when changing tabs
  const handleTabSelect = (tabId) => {
    onTabChange(tabId);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-screen text-foreground overflow-hidden bg-background">
      
      {/* Mobile Top Navbar (Visible only on mobile/tablet < 768px) */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 border-b border-sidebar-border bg-sidebar/85 backdrop-blur-md z-30 flex items-center justify-between px-6 select-none">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Clock className="w-4 h-4 text-white animate-[spin_40s_linear_infinite]" />
          </div>
          <span className="text-sm font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
            ClockVerse
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`hover:bg-white/5 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-foreground hover:bg-black/5'}`}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </header>

      {/* Backdrop overlay for mobile when sidebar is open */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-35 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - responsive overlay on mobile, fixed on desktop */}
      <aside
        className={`fixed md:relative top-0 bottom-0 h-full z-45 flex flex-col border-r border-sidebar-border bg-sidebar/85 text-sidebar-foreground backdrop-blur-md transition-all duration-300 ${
          sidebarOpen 
            ? 'w-64 left-0' 
            : 'w-0 md:w-20 left-[-256px] md:left-0 overflow-hidden'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border flex items-center justify-between select-none">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_0_15px_rgba(var(--danger-rgb),0.25)]">
              <Clock className="w-5 h-5 text-white animate-[spin_40s_linear_infinite]" />
            </div>
            {(sidebarOpen || window.innerWidth < 768) && (
              <h1 className="text-base font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight">
                ClockVerse
              </h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`ml-auto hover:bg-white/5 ${isDark ? 'text-slate-400 hover:text-slate-200' : 'text-foreground hover:bg-black/5'}`}
          >
            {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 flex flex-col">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const showLabel = sidebarOpen || window.innerWidth < 768;
            return (
              <button
                key={item.id}
                onClick={() => handleTabSelect(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 relative group overflow-hidden ${
                  isActive
                    ? 'text-primary border border-primary/20 shadow-[0_0_20px_rgba(var(--danger-rgb),0.05)]'
                    : isDark
                      ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      : 'text-foreground/80 hover:bg-black/5 hover:text-foreground'
                }`}
                style={isActive ? { backgroundColor: 'rgba(var(--danger-rgb), 0.08)' } : {}}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-primary rounded-r shadow-[0_0_8px_var(--primary)]"></div>
                )}
                
                <Icon className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                {showLabel && <span className="text-xs font-semibold uppercase tracking-wider">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Theme Toggle at the bottom */}
        <div className="p-4 border-t border-sidebar-border mt-auto flex-shrink-0">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group cursor-pointer ${
              isDark 
                ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200' 
                : 'text-foreground/80 hover:bg-black/5 hover:text-foreground'
            }`}
            title="Toggle Light / Dark Mode"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-[#ffe66d] animate-[spin_10s_linear_infinite] group-hover:scale-110 transition-transform" />
                {(sidebarOpen || window.innerWidth < 768) && <span className="text-xs font-semibold uppercase tracking-wider">Light Mode</span>}
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-primary animate-pulse group-hover:scale-110 transition-transform" />
                {(sidebarOpen || window.innerWidth < 768) && <span className="text-xs font-semibold uppercase tracking-wider">Dark Mode</span>}
              </>
            )}
          </button>
        </div>

      </aside>

      {/* Main Content */}
      <main
        className="flex-1 overflow-auto transition-all duration-300 w-full pt-16 md:pt-0"
        style={{
          backgroundColor: 'var(--background)',
          backgroundImage: bgStyle,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Floating Action Button (FAB) for Tasks */}
      <button 
        onClick={() => setTaskDrawerOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group z-35 border border-primary/20 cursor-pointer"
        title="Open Tasks Checklist"
      >
        <CheckSquare className="w-6 h-6 animate-pulse group-hover:scale-110 transition-transform" />
      </button>

      {/* Task Checklist Drawer */}
      <TaskDrawer isOpen={taskDrawerOpen} onClose={() => setTaskDrawerOpen(false)} />
    </div>
  );
}
