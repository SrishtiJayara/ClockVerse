import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Calendar, CheckSquare, Square, Filter, Search, Tag, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function TaskDrawer({ isOpen, onClose }) {
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
  const [filterMode, setFilterMode] = useState('all'); // all, pending, completed, overdue

  // Persist tasks and trigger storage event for analytics dashboard
  useEffect(() => {
    localStorage.setItem('chrono_tasks', JSON.stringify(tasks));
    window.dispatchEvent(new Event('storage'));
  }, [tasks]);

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

    setTasks(prev => [taskItem, ...prev]);
    setNewTaskTitle('');
    setNewTaskDate('');
    
    logActivity(`Task Created: "${taskItem.title}" (${taskItem.category})`);
    toast.success('Task added successfully');
  };

  const handleToggleComplete = (id) => {
    setTasks(prev => prev.map(t => {
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
    }));
  };

  const handleDeleteTask = (id) => {
    const toDel = tasks.find(t => t.id === id);
    setTasks(prev => prev.filter(t => t.id !== id));
    if (toDel) {
      logActivity(`Task Deleted: "${toDel.title}"`);
      toast.info('Task deleted');
    }
  };

  const handleClearCompleted = () => {
    const completedCount = tasks.filter(t => t.completed).length;
    if (completedCount === 0) return;
    setTasks(prev => prev.filter(t => !t.completed));
    logActivity(`Cleared ${completedCount} completed tasks`);
    toast.success(`Cleared ${completedCount} completed tasks`);
  };

  // Task lists computations
  const isOverdue = (task) => {
    if (task.completed || !task.dueDate) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    return task.dueDate < todayStr;
  };

  const filteredTasks = tasks
    .filter(t => {
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

  return (
    <>
      {/* Sliding Drawer Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Drawer Body */}
      <div className={`fixed right-0 top-0 h-full w-full sm:w-[450px] z-50 transition-transform duration-300 transform shadow-2xl flex flex-col border-l ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      } ${
        isDark ? 'bg-[#0e2327] border-white/15 text-white' : 'bg-[#f7fff7] border-slate-200 text-slate-800'
      }`}>
        {/* Drawer Header */}
        <div className={`p-5 border-b flex items-center justify-between ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold">Tasks Checklist</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
              {tasks.filter(t => !t.completed).length} pending
            </span>
          </div>
          <Button 
            onClick={onClose} 
            variant="ghost" 
            size="icon" 
            className="rounded-lg text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Task Creator Form */}
        <form onSubmit={handleAddTask} className={`p-5 border-b space-y-3.5 bg-black/5 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="What needs to be done?..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className={`text-sm flex-1 ${isDark ? 'bg-slate-900/60 border-slate-700/50 text-white' : 'bg-white border-slate-300 text-slate-800'}`}
              required
            />
            <Button type="submit" className="btn-premium-gold gap-1 text-xs px-3" style={{ border: 'none' }}>
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Category Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</label>
              <select
                value={newTaskCategory}
                onChange={(e) => setNewTaskCategory(e.target.value)}
                className={`w-full p-2 rounded-lg border outline-none ${
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

            {/* Priority Select */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Priority</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className={`w-full p-2 rounded-lg border outline-none ${
                  isDark ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white border-slate-350 text-slate-800'
                }`}
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Due Date</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className={`w-full p-1.5 rounded-lg border outline-none text-center ${
                  isDark ? 'bg-slate-900/80 border-slate-700/50 text-white' : 'bg-white border-slate-350 text-slate-800'
                }`}
              />
            </div>
          </div>
        </form>

        {/* Filter / Search Row */}
        <div className={`p-4 border-b space-y-2 flex flex-col ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
          {/* Search bar */}
          <div className="relative">
            <Input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`text-xs pl-8 pr-3 h-8 ${isDark ? 'bg-slate-900/40 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}
            />
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-500" />
          </div>

          {/* Filter badges */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex gap-1">
              {['all', 'pending', 'completed', 'overdue'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2 py-1 rounded-md capitalize font-semibold transition-colors border ${
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
              className="text-[10px] uppercase font-bold text-destructive hover:underline"
            >
              Clear Completed
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              <CheckSquare className="w-8 h-8 mx-auto opacity-30 mb-2" />
              No tasks found. Create one!
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
                  {/* Complete checkbox */}
                  <button 
                    type="button"
                    onClick={() => handleToggleComplete(task.id)}
                    className="flex-shrink-0 self-start mt-0.5 text-slate-500 hover:text-primary transition-colors"
                  >
                    {task.completed ? (
                      <CheckSquare className="w-5 h-5 text-primary" />
                    ) : (
                      <Square className="w-5 h-5" />
                    )}
                  </button>

                  {/* Task details */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold leading-snug break-words ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-200 dark:text-slate-100'
                    }`}>
                      {task.title}
                    </p>

                    <div className="flex items-center gap-1.5 flex-wrap mt-2 select-none">
                      {/* Category Badge */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5 ${categoryColorClass(task.category)}`}>
                        <Tag className="w-2.5 h-2.5" />
                        {task.category}
                      </span>

                      {/* Priority Badge */}
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${priorityColorClass(task.priority)}`}>
                        {task.priority}
                      </span>

                      {/* Due Date badge */}
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

                  {/* Delete button */}
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
    </>
  );
}
