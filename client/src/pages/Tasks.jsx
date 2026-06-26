import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, Trash2, Calendar, Square, Search, Tag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function Tasks() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [tasks, setTasks] = useState(() => {
    const stored = localStorage.getItem('chrono_tasks');
    return stored ? JSON.parse(stored) : [
      { id: 't1', title: 'Schedule weekly planning session', completed: false, priority: 'high', category: 'work', dueDate: new Date().toISOString().split('T')[0], createdAt: new Date().toISOString() },
      { id: 't2', title: 'Prepare presentation deck', completed: true, priority: 'medium', category: 'work', dueDate: new Date().toISOString().split('T')[0], completedDate: new Date().toISOString(), createdAt: new Date().toISOString() }
    ];
  });

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('inbox');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDate, setNewTaskDate] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Sync tasks with other components
  const loadData = () => {
    try {
      const storedTasks = localStorage.getItem('chrono_tasks');
      setTasks(storedTasks ? JSON.parse(storedTasks) : []);
    } catch(e) {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  // Save to localStorage and dispatch event
  const saveTasks = (newTasks) => {
    setTasks(newTasks);
    localStorage.setItem('chrono_tasks', JSON.stringify(newTasks));
    window.dispatchEvent(new Event('storage'));
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
    saveTasks(updated);
    setNewTaskTitle('');
    setNewTaskDate('');
    
    logActivity(`Task Created: "${taskItem.title}" (${taskItem.category})`);
    toast.success('Task added successfully');
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
    saveTasks(updated);
  };

  const handleDeleteTask = (id) => {
    const toDel = tasks.find(t => t.id === id);
    const updated = tasks.filter(t => t.id !== id);
    saveTasks(updated);
    if (toDel) {
      logActivity(`Task Deleted: "${toDel.title}"`);
      toast.info('Task deleted');
    }
  };

  const handleClearCompleted = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;
    const updated = tasks.filter(t => !t.completed);
    saveTasks(updated);
    logActivity(`Cleared ${completedCount} completed tasks`);
    toast.success(`Cleared ${completedCount} completed tasks`);
  };

  const isOverdue = (task) => {
    if (task.completed || !task.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  };

  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (filterMode === 'pending') return !t.completed;
    if (filterMode === 'completed') return t.completed;
    if (filterMode === 'overdue') return isOverdue(t);
    return true;
  });

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

  // Stats
  const totalCount = tasks.length;
  const pendingCount = tasks.filter(t => !t.completed).length;
  const completedCount = totalCount - pendingCount;
  const overdueCount = tasks.filter(t => isOverdue(t)).length;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold flex items-center gap-3 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          <CheckSquare className="w-9 h-9 text-primary animate-pulse" />
          Task Checklist
        </h1>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} mt-2 text-sm`}>
          Manage, filter, and track your daily checklists and productivity items
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 border rounded-2xl ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Tasks</p>
          <p className="text-3xl font-black text-primary font-mono mt-2">{totalCount}</p>
        </div>
        <div className={`p-4 border rounded-2xl ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Pending</p>
          <p className="text-3xl font-black text-amber-500 font-mono mt-2">{pendingCount}</p>
        </div>
        <div className={`p-4 border rounded-2xl ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Completed</p>
          <p className="text-3xl font-black text-emerald-500 font-mono mt-2">{completedCount}</p>
        </div>
        <div className={`p-4 border rounded-2xl ${isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white border-slate-200 shadow-sm'}`}>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Overdue</p>
          <p className="text-3xl font-black text-[#ff6b6b] font-mono mt-2">{overdueCount}</p>
        </div>
      </div>

      {/* Creator Panel */}
      <div className={`rounded-xl p-6 border space-y-4 transition-all duration-300 ${
        isDark ? 'glass-card-premium border-[var(--primary)]/15' : 'bg-white/70 border-slate-200/80 shadow-md backdrop-blur-md'
      }`}>
        <h3 className="text-base font-bold flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Create New Task
        </h3>

        <form onSubmit={handleAddTask} className="space-y-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`text-sm flex-1 ${isDark ? 'bg-slate-900/60 border-slate-700/50 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
              required
            />
            <Button type="submit" className="btn-premium-gold gap-1 text-xs px-6 h-11" style={{ border: 'none' }}>
              <Plus className="w-4 h-4" /> Add Task
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none cursor-pointer ${
                  isDark ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white border-slate-350 text-slate-800'
                }`}
              >
                <option value="inbox">Inbox</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="shopping">Shopping</option>
                <option value="health">Health</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className={`w-full p-2.5 rounded-xl border outline-none cursor-pointer ${
                  isDark ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white border-slate-350 text-slate-800'
                }`}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className={`w-full p-2 rounded-xl border outline-none text-center cursor-pointer ${
                  isDark ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white border-slate-350 text-slate-800'
                }`}
              />
            </div>
          </div>
        </form>
      </div>

      {/* Main Checklist Card */}
      <div className={`p-6 border rounded-2xl space-y-4 ${
        isDark ? 'glass-card-premium border-[var(--primary)]/15 bg-card/10' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        {/* Filters and search row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs pb-3 border-b border-border/10">
          <div className="relative max-w-md w-full">
            <Input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs pl-8 pr-3 h-9.5 ${isDark ? 'bg-slate-900/40 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            />
            <Search className="absolute left-2.5 top-3 w-4 h-4 text-slate-500" />
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex gap-1.5">
              {['all', 'pending', 'completed', 'overdue'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-3 py-1.5 rounded-lg capitalize font-semibold transition-colors border text-xs cursor-pointer ${
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

        {/* Task List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {filteredTasks.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-500 text-sm">
              <CheckSquare className="w-10 h-10 mx-auto opacity-30 mb-2" />
              No tasks found. Create a task to get started!
            </div>
          ) : (
            filteredTasks.map(task => {
              const overdue = isOverdue(task);
              return (
                <div 
                  key={task.id} 
                  className={`p-4 border rounded-xl flex gap-3 transition-all ${
                    task.completed 
                      ? 'opacity-55 bg-transparent border-border/5' 
                      : overdue ? 'border-[#ff6b6b]/30 bg-[#ff6b6b]/5' : ''
                  } ${
                    isDark ? 'bg-slate-900/35 border-white/10' : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
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

                    <div className="flex items-center gap-1.5 flex-wrap mt-2.5 select-none">
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
