import React, { useState, useEffect } from 'react';
import { BarChart3, Award, TrendingUp, Calendar, Clock, AlertCircle, CheckCircle2, ListTodo, RefreshCw, Plus, Trash2, CheckSquare, Square, Search, Tag, AlertTriangle } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Analytics() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tasks, setTasks] = useState([]);
  const [alarms, setAlarms] = useState([]);
  const [activities, setActivities] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('inbox');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Load datasets on mount and when localstorage updates
  const loadData = () => {
    try {
      const storedTasks = localStorage.getItem('chrono_tasks');
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);

      const storedAlarms = localStorage.getItem('chrono_alarms');
      setAlarms(storedAlarms ? JSON.parse(storedAlarms) : []);

      const storedActivities = localStorage.getItem('chrono_activities');
      setActivities(storedActivities ? JSON.parse(storedActivities) : []);
    } catch (e) {
      console.error("Failed to load analytics datasets: ", e);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
    };
  }, [refreshKey]);

  // Calculations & Statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const overdueTasks = tasks.filter(t => !t.completed && t.dueDate && t.dueDate < todayStr).length;

  // Filter tasks by date ranges
  const getTasksDueInDays = (days) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);
    const targetStr = targetDate.toISOString().split('T')[0];
    return tasks.filter(t => t.dueDate && t.dueDate <= targetStr && t.dueDate >= todayStr).length;
  };

  const todayTasks = tasks.filter(t => t.dueDate === todayStr).length;
  const thisWeekTasks = getTasksDueInDays(7);
  const thisMonthTasks = getTasksDueInDays(30);

  const totalAlarms = alarms.length;
  const activeAlarms = alarms.filter(a => a.enabled).length;

  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Streak calculations
  const calculateStreak = () => {
    const completionDates = tasks
      .filter(t => t.completed && t.completedDate)
      .map(t => t.completedDate.split('T')[0]);
    
    if (completionDates.length === 0) return { current: 0, longest: 0 };
    
    // Sort unique dates descending
    const uniqueDates = [...new Set(completionDates)].sort((a, b) => new Date(b) - new Date(a));
    
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    
    const today = new Date();
    today.setHours(0,0,0,0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const latestDate = new Date(uniqueDates[0]);
    latestDate.setHours(0,0,0,0);

    // If streak is active (completed today or yesterday)
    const isActive = (latestDate.getTime() === today.getTime() || latestDate.getTime() === yesterday.getTime());

    let prevDate = null;
    uniqueDates.forEach((dateStr) => {
      const currentDate = new Date(dateStr);
      currentDate.setHours(0,0,0,0);

      if (prevDate === null) {
        tempStreak = 1;
      } else {
        const diffTime = Math.abs(prevDate.getTime() - currentDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          tempStreak += 1;
        } else if (diffDays > 1) {
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
          tempStreak = 1;
        }
      }
      prevDate = currentDate;
    });

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }

    if (isActive) {
      // Find current streak by scanning forward from tail of sorted dates
      let checkDate = latestDate.getTime() === today.getTime() ? today : yesterday;
      currentStreak = 0;
      
      for (let i = 0; i < uniqueDates.length; i++) {
        const d = new Date(uniqueDates[i]);
        d.setHours(0,0,0,0);
        
        if (d.getTime() === checkDate.getTime()) {
          currentStreak += 1;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    return { current: currentStreak, longest: Math.max(longestStreak, currentStreak) };
  };

  const streaks = calculateStreak();

  // Category chart data
  const categories = ['inbox', 'work', 'personal', 'shopping', 'health'];
  const categoryData = categories.map(cat => ({
    name: cat.toUpperCase(),
    value: tasks.filter(t => t.category === cat).length
  })).filter(item => item.value > 0);

  const CATEGORY_COLORS = {
    INBOX: '#94a3b8',
    WORK: '#4ecdc4',
    PERSONAL: '#1a535c',
    SHOPPING: '#ffe66d',
    HEALTH: '#ff6b6b'
  };

  // Priority chart data
  const priorities = ['high', 'medium', 'low'];
  const priorityData = priorities.map(pr => ({
    name: pr.toUpperCase(),
    value: tasks.filter(t => t.priority === pr).length
  })).filter(item => item.value > 0);

  const PRIORITY_COLORS = {
    HIGH: '#ff6b6b',
    MEDIUM: '#ffe66d',
    LOW: '#4ecdc4'
  };

  // Hourly completion data
  const getHourlyData = () => {
    const hours = Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, completed: 0 }));
    tasks.forEach(t => {
      if (t.completed && t.completedDate) {
        const date = new Date(t.completedDate);
        const hr = date.getHours();
        hours[hr].completed += 1;
      }
    });
    return hours;
  };
  const hourlyData = getHourlyData();

  // Last 7 days completion data (Weekly Completion)
  const getWeeklyData = () => {
    const daysData = [];
    const daysName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const name = daysName[d.getDay()];
      const completedCount = tasks.filter(t => t.completed && t.completedDate && t.completedDate.startsWith(dateStr)).length;
      daysData.push({ name, completed: completedCount });
    }
    return daysData;
  };
  const weeklyData = getWeeklyData();

  // Last 30 Days Heatmap Grid
  const getHeatmapData = () => {
    const cells = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const completedCount = tasks.filter(t => t.completed && t.completedDate && t.completedDate.startsWith(dateStr)).length;
      cells.push({ date: dateStr, count: completedCount });
    }
    return cells;
  };
  const heatmapData = getHeatmapData();

  // Goals computations (Progress rings)
  // Target: Daily = 3 tasks, Weekly = 15 tasks, Monthly = 40 tasks
  const dailyGoal = 3;
  const weeklyGoal = 15;
  const monthlyGoal = 40;

  const todayCompletions = tasks.filter(t => t.completed && t.completedDate && t.completedDate.startsWith(todayStr)).length;
  
  const getCompletionsInDays = (days) => {
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return tasks.filter(t => t.completed && t.completedDate && new Date(t.completedDate) >= past).length;
  };

  const weeklyCompletions = getCompletionsInDays(7);
  const monthlyCompletions = getCompletionsInDays(30);

  const dailyPct = Math.min(Math.round((todayCompletions / dailyGoal) * 100), 100);
  const weeklyPct = Math.min(Math.round((weeklyCompletions / weeklyGoal) * 100), 100);
  const monthlyPct = Math.min(Math.round((monthlyCompletions / monthlyGoal) * 100), 100);

  // Focus rings SVG offset helper (r = 40 => circumference = 251.3)
  const getStrokeDashoffset = (pct) => 251.3 - (251.3 * pct) / 100;

  // Badges logic
  const getBadges = () => {
    const badgeList = [
      { id: 'b1', title: 'First Steps', desc: 'Completed your first task', icon: '🌱', unlocked: completedTasks >= 1 },
      { id: 'b2', title: 'Productivity Ninja', desc: 'Completed 10 tasks', icon: '🥷', unlocked: completedTasks >= 10 },
      { id: 'b3', title: 'Consistent Starter', desc: 'Reached a 3-day streak', icon: '🔥', unlocked: streaks.longest >= 3 },
      { id: 'b4', title: 'Habit Mastery', desc: 'Reached a 7-day streak', icon: '👑', unlocked: streaks.longest >= 7 },
      { id: 'b5', title: 'Early Bird', desc: 'Task completed before 8 AM', icon: '🌅', unlocked: tasks.some(t => {
        if (!t.completed || !t.completedDate) return false;
        const hr = new Date(t.completedDate).getHours();
        return hr < 8;
      }) },
      { id: 'b6', title: 'Goal Crusher', desc: 'Completed monthly target (40)', icon: '🏆', unlocked: monthlyCompletions >= monthlyGoal }
    ];
    return badgeList;
  };
  const badges = getBadges();

  // Dynamic Insights generator
  const getInsights = () => {
    const list = [];
    
    // Most productive day
    if (completedTasks > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const counts = [0, 0, 0, 0, 0, 0, 0];
      tasks.forEach(t => {
        if (t.completed && t.completedDate) {
          const day = new Date(t.completedDate).getDay();
          counts[day] += 1;
        }
      });
      const maxIdx = counts.indexOf(Math.max(...counts));
      if (counts[maxIdx] > 0) {
        list.push({
          icon: <TrendingUp className="w-4 h-4 text-primary" />,
          title: 'Most Productive Day',
          desc: `${dayNames[maxIdx]}s are your peak performance days with a total of ${counts[maxIdx]} completions.`
        });
      }
    }

    // Suggested Focus Hour
    if (completedTasks > 0) {
      const hourCounts = Array(24).fill(0);
      tasks.forEach(t => {
        if (t.completed && t.completedDate) {
          const hr = new Date(t.completedDate).getHours();
          hourCounts[hr] += 1;
        }
      });
      const maxHr = hourCounts.indexOf(Math.max(...hourCounts));
      if (hourCounts[maxHr] > 0) {
        const period = maxHr >= 12 ? 'PM' : 'AM';
        const displayHr = maxHr % 12 || 12;
        list.push({
          icon: <Clock className="w-4 h-4 text-[#ffe66d]" />,
          title: 'Peak Focus Hours',
          desc: `You execute most tasks around ${displayHr} ${period}. Protect this time block for deep work.`
        });
      }
    }

    // Pending vs Overdue
    if (overdueTasks > 0) {
      list.push({
        icon: <AlertCircle className="w-4 h-4 text-[#ff6b6b]" />,
        title: 'Action Required',
        desc: `You have ${overdueTasks} overdue tasks. Consider rescheduling them to declutter your focus.`
      });
    } else if (completedTasks > 0 && pendingTasks === 0) {
      list.push({
        icon: <Award className="w-4 h-4 text-emerald-400" />,
        title: 'Inbox Zero!',
        desc: 'Incredible job! All your pending tasks are completed. Take some time to recharge.'
      });
    }

    // Default encouragement
    if (list.length < 3) {
      list.push({
        icon: <Award className="w-4 h-4 text-cyan-400" />,
        title: 'Consistency is Key',
        desc: 'Log and complete tasks daily to unlock deeper analytics insights and productivity habits.'
      });
    }

    return list.slice(0, 3);
  };
  const insights = getInsights();

  const logActivity = (action) => {
    try {
      const stored = localStorage.getItem('chrono_activities') || '[]';
      const activitiesList = JSON.parse(stored);
      activitiesList.unshift({
        id: Date.now().toString(),
        time: new Date().toISOString(),
        action: action
      });
      localStorage.setItem('chrono_activities', JSON.stringify(activitiesList.slice(0, 100)));
      window.dispatchEvent(new Event('storage'));
    } catch(e) {}
  };

  const isOverdue = (task) => {
    if (task.completed || !task.dueDate) return false;
    return task.dueDate < todayStr;
  };

  const categoryColorClass = (cat) => {
    switch (cat) {
      case 'work': return 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20';
      case 'personal': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'shopping': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'health': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const priorityColorClass = (pr) => {
    switch (pr) {
      case 'high': return 'bg-[#ff6b6b]/10 text-[#ff6b6b] border-[#ff6b6b]/20';
      case 'medium': return 'bg-[#ffe66d]/10 text-yellow-600 dark:text-[#ffe66d] border-[#ffe66d]/30';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const handleToggleComplete = (id) => {
    const updated = tasks.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        logActivity(`Task ${nextCompleted ? 'Completed' : 'Reopened'}: "${t.title}"`);
        return {
          ...t,
          completed: nextCompleted,
          completedDate: nextCompleted ? new Date().toISOString() : null
        };
      }
      return t;
    });
    setTasks(updated);
    localStorage.setItem('chrono_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTask = (id) => {
    const toDel = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    setTasks(updated);
    localStorage.setItem('chrono_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    if (toDel) {
      logActivity(`Task Deleted: "${toDel.title}"`);
      toast.info('Task deleted');
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const taskItem = {
      id: Date.now().toString(),
      title: newTaskTitle.trim(),
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDate || null,
      createdAt: new Date().toISOString()
    };

    const updated = [taskItem, ...tasks];
    setTasks(updated);
    localStorage.setItem('chrono_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    setNewTaskTitle('');
    setNewTaskDate('');
    
    logActivity(`Task Created: "${taskItem.title}" (${taskItem.category})`);
    toast.success('Task added successfully');
  };

  const handleClearCompleted = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;
    const updated = tasks.filter(t => !t.completed);
    setTasks(updated);
    localStorage.setItem('chrono_tasks', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    logActivity(`Cleared ${completedCount} completed tasks`);
    toast.success(`Cleared ${completedCount} completed tasks`);
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'pending') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    if (filterMode === 'overdue') return isOverdue(t);
    return true;
  });



  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.success("Analytics refreshed!");
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out] print:p-0 print:bg-white print:text-black">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            <BarChart3 className="w-9 h-9 text-primary" />
            Productivity Analytics
          </h1>
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm`}>Review performance insights, completed streaks, and task breakdowns</p>
        </div>

        <div className="flex gap-2">
          <Button onClick={triggerRefresh} variant="outline" className={isDark ? 'border-slate-700/50 text-slate-300' : 'border-slate-350 text-slate-700'}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
        {/* Productivity Score */}
        <div className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Productivity Score</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-primary font-mono">{productivityScore}%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Completed / Total ratio</p>
        </div>

        {/* Streaks */}
        <div className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Streak</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-primary font-mono">{streaks.current}</span>
            <span className="text-xs text-slate-400">days</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Longest streak: {streaks.longest} days</p>
        </div>

        {/* Completed Tasks */}
        <div className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Tasks Completed</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-primary font-mono">{completedTasks}</span>
            <span className="text-xs text-slate-400">/ {totalTasks} total</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">{pendingTasks} pending, {overdueTasks} overdue</p>
        </div>

        {/* Due Widget */}
        <div className={`p-5 border rounded-2xl flex flex-col justify-between transition-all ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Alarms Active</p>
          <div className="flex items-baseline gap-2 mt-3">
            <span className="text-4xl font-black text-primary font-mono">{activeAlarms}</span>
            <span className="text-xs text-slate-400">/ {totalAlarms} set</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Configured in Alarm Center</p>
        </div>
      </div>

      {/* Due timeline detailed grid */}
      <div className="grid grid-cols-3 gap-4 text-center print:hidden">
        <div className={`p-3 border rounded-xl ${isDark ? 'bg-card/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Due Today</p>
          <p className="text-lg font-black text-primary mt-1 font-mono">{todayTasks}</p>
        </div>
        <div className={`p-3 border rounded-xl ${isDark ? 'bg-card/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Due This Week</p>
          <p className="text-lg font-black text-primary mt-1 font-mono">{thisWeekTasks}</p>
        </div>
        <div className={`p-3 border rounded-xl ${isDark ? 'bg-card/40 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider">Due This Month</p>
          <p className="text-lg font-black text-primary mt-1 font-mono">{thisMonthTasks}</p>
        </div>
      </div>

      {/* Charts Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Weekly Completion Bar Chart */}
        <div className={`lg:col-span-2 p-6 border rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" /> Weekly Performance (Last 7 Days)
          </h3>
          <div className="h-64 w-full mt-6 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="name" stroke={isDark ? "#94a3b8" : "#4b6d72"} />
                <YAxis stroke={isDark ? "#94a3b8" : "#4b6d72"} allowDecimals={false} />
                <Tooltip 
                  contentStyle={isDark ? { backgroundColor: '#142d32', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' } : {}} 
                />
                <Bar dataKey="completed" fill="var(--secondary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Goals Progress rings (Circular SVG indicators) */}
        <div className={`p-6 border rounded-2xl flex flex-col ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            < Award className="w-5 h-5 text-primary" /> Goal Progress Rings
          </h3>
          
          <div className="flex flex-col justify-around flex-1 mt-6 space-y-6">
            {/* Daily Goal Ring */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Daily Target</h4>
                <p className="text-xs text-slate-500">{todayCompletions} / {dailyGoal} completed today</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" 
                    stroke="var(--secondary)" strokeWidth="8" 
                    strokeDasharray="251.3" strokeDashoffset={getStrokeDashoffset(dailyPct)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold">{dailyPct}%</span>
              </div>
            </div>

            {/* Weekly Goal Ring */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Weekly Target</h4>
                <p className="text-xs text-slate-500">{weeklyCompletions} / {weeklyGoal} completed this week</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" 
                    stroke="var(--primary)" strokeWidth="8" 
                    strokeDasharray="251.3" strokeDashoffset={getStrokeDashoffset(weeklyPct)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold">{weeklyPct}%</span>
              </div>
            </div>

            {/* Monthly Goal Ring */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm font-bold">Monthly Target</h4>
                <p className="text-xs text-slate-500">{monthlyCompletions} / {monthlyGoal} completed this month</p>
              </div>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} strokeWidth="8" />
                  <circle 
                    cx="50" cy="50" r="40" fill="none" 
                    stroke="var(--accent)" strokeWidth="8" 
                    strokeDasharray="251.3" strokeDashoffset={getStrokeDashoffset(monthlyPct)}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-xs font-mono font-bold">{monthlyPct}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Hourly Trend and Categorization Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Hourly Productivity Line Graph */}
        <div className={`lg:col-span-2 p-6 border rounded-2xl flex flex-col justify-between ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" /> Hourly Productivity (24h Trend)
          </h3>
          <div className="h-64 w-full mt-6 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} />
                <XAxis dataKey="hour" stroke={isDark ? "#94a3b8" : "#4b6d72"} />
                <YAxis stroke={isDark ? "#94a3b8" : "#4b6d72"} allowDecimals={false} />
                <Tooltip 
                  contentStyle={isDark ? { backgroundColor: '#142d32', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' } : {}} 
                />
                <Line type="monotone" dataKey="completed" stroke="var(--primary)" strokeWidth={3} dot={{ fill: 'var(--accent)', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown (Pie Chart) */}
        <div className={`p-6 border rounded-2xl flex flex-col ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-base font-bold flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-primary" /> Category Distribution
          </h3>
          <div className="h-56 w-full mt-4 relative flex items-center justify-center">
            {categoryData.length === 0 ? (
              <div className="text-slate-500 text-xs">No tasks added to categorise.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#1a535c'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          {categoryData.length > 0 && (
            <div className="grid grid-cols-3 gap-2 text-[10px] uppercase font-bold text-slate-500 mt-2">
              {categoryData.map(entry => (
                <div key={entry.name} className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}></span>
                  <span className="truncate">{entry.name}: {entry.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Heatmap & Timeline / Insights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Heatmap Grid & Timeline */}
        <div className={`lg:col-span-2 p-6 border rounded-2xl flex flex-col ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <h3 className="text-base font-bold flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-primary" /> Productivity Heatmap (Last 30 Days)
          </h3>
          {/* Heatmap grid */}
          <div className="grid grid-cols-10 gap-1.5 pb-6 border-b border-border/10">
            {heatmapData.map(cell => {
              let bg = 'bg-slate-200/40 dark:bg-slate-800/40';
              if (cell.count > 0 && cell.count <= 2) bg = 'bg-primary/25 text-primary-foreground';
              else if (cell.count > 2 && cell.count <= 4) bg = 'bg-primary/55 text-primary-foreground';
              else if (cell.count > 4) bg = 'bg-primary border border-accent text-primary-foreground';

              return (
                <div 
                  key={cell.date} 
                  className={`h-11 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold font-mono transition-all ${bg}`}
                  title={`${cell.date}: ${cell.count} tasks completed`}
                >
                  <span>{cell.date.split('-')[2]}</span>
                  <span className="text-[8px] opacity-75">{cell.count}</span>
                </div>
              );
            })}
          </div>

          {/* Activity Log Timeline */}
          <h3 className="text-base font-bold flex items-center gap-2 mt-6 mb-4">
            <TrendingUp className="w-5 h-5 text-primary" /> Recent Activity Timeline
          </h3>
          <div className="space-y-4 max-h-48 overflow-y-auto pr-2 divide-y divide-slate-700/10 text-xs">
            {activities.length === 0 ? (
              <div className="text-slate-500 py-4 text-center">No logged activities yet. Add tasks or trigger alarms!</div>
            ) : (
              activities.map(act => (
                <div key={act.id} className="pt-3 flex justify-between gap-4">
                  <span className={`font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{act.action}</span>
                  <span className="text-slate-500 flex-shrink-0 font-mono">{new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Achievements / Badges & Insights */}
        <div className="space-y-6">
          {/* Insights */}
          <div className={`p-6 border rounded-2xl space-y-4 ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-base font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> AI Productivity Insights
            </h3>
            <div className="space-y-3 pt-2 text-xs">
              {insights.map((ins, i) => (
                <div key={i} className="flex gap-3 leading-snug">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-slate-900/60 border border-slate-700/35' : 'bg-slate-100 border border-slate-200'}`}>
                    {ins.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-300 dark:text-slate-200">{ins.title}</h4>
                    <p className="text-slate-500 mt-0.5">{ins.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Badges unlocked */}
          <div className={`p-6 border rounded-2xl space-y-4 ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
            <h3 className="text-base font-bold flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Achievement Badges
            </h3>
            <div className="grid grid-cols-3 gap-3 pt-2">
              {badges.map(b => (
                <div 
                  key={b.id} 
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                    b.unlocked 
                      ? isDark ? 'bg-card border-accent/25' : 'bg-white border-primary/20 shadow-sm'
                      : 'opacity-35 bg-transparent border-slate-800'
                  }`}
                  title={`${b.title}: ${b.desc}`}
                >
                  <span className="text-2xl select-none">{b.icon}</span>
                  <span className="text-[9px] font-bold mt-1 tracking-tight truncate w-full">{b.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Task Checklist Inline Dashboard */}
      <div className={`p-6 border rounded-2xl space-y-4 ${
        isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div className="flex items-center justify-between border-b border-border/10 pb-3 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold">Tasks Checklist</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tasks.filter(t => !t.completed).length} pending
            </span>
          </div>

          {/* Quick Creator Form */}
          <form onSubmit={handleAddTask} className="flex gap-2 flex-grow sm:flex-grow-0 max-w-md w-full sm:w-auto">
            <Input
              type="text"
              placeholder="Add new task inline..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`text-xs ${isDark ? 'bg-slate-900/60 border-slate-700/50 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
              required
            />
            <Button type="submit" className="btn-premium-gold gap-1 text-xs px-3 py-1 flex-shrink-0" style={{ border: 'none' }}>
              <Plus className="w-3.5 h-3.5" /> Add
            </Button>
          </form>
        </div>

        {/* Filters and search row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
          <div className="relative max-w-xs w-full">
            <Input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs pl-8 pr-3 h-8.5 ${isDark ? 'bg-slate-900/40 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex gap-1.5">
              {['all', 'pending', 'completed', 'overdue'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2.5 py-1 rounded-lg capitalize font-semibold transition-colors border text-xs cursor-pointer ${
                    filterMode === mode
                      ? 'bg-primary/20 text-primary border-primary/30 font-bold'
                      : isDark ? 'bg-slate-900/20 border-slate-800/80 text-slate-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:bg-black/5'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <button 
              onClick={handleClearCompleted}
              className="text-[10px] uppercase font-bold text-destructive hover:underline cursor-pointer"
            >
              Clear Completed
            </button>
          </div>
        </div>

        {/* Task List Grid/Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 text-sm">
              <CheckSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
              No tasks found. Create one above!
            </div>
          ) : (
            filteredTasks.map(task => {
              const overdue = isOverdue(task);
              return (
                <div 
                  key={task.id} 
                  className={`p-3.5 border rounded-xl flex gap-3 transition-all ${
                    task.completed 
                      ? 'opacity-55' 
                      : overdue ? 'border-[#ff6b6b]/30 bg-[#ff6b6b]/5' : ''
                  } ${
                    isDark ? 'bg-slate-900/35 border-white/10' : 'bg-white border-slate-200/80 shadow-sm'
                  }`}
                >
                  <button 
                    type="button"
                    onClick={() => handleToggleComplete(task.id)}
                    className="flex-shrink-0 self-start mt-0.5 text-slate-500 hover:text-primary transition-colors cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug break-words ${
                      task.completed ? 'line-through text-slate-500' : isDark ? 'text-slate-200' : 'text-slate-750'
                    }`}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2 select-none">
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 capitalize ${categoryColorClass(task.category)}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {task.category}
                      </span>

                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border capitalize ${priorityColorClass(task.priority)}`}>
                        {task.priority}
                      </span>

                      {task.dueDate && (
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${
                          overdue 
                            ? 'bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/30' 
                            : isDark ? 'bg-slate-800 border-slate-700/50 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                        }`}>
                          <Calendar className="w-2.5 h-2.5" />
                          {task.dueDate}
                          {overdue && <AlertTriangle className="w-2.5 h-2.5 text-[#ff6b6b] ml-0.5" />}
                        </span>
                      )}
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    variant="ghost"
                    size="icon"
                    className="self-center w-8 h-8 rounded-lg text-slate-500 hover:text-[#ff6b6b] hover:bg-[#ff6b6b]/10 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
