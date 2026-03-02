import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isConfigured } from './lib/supabase';
import AuthScreen from './components/AuthScreen';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import SearchFilter from './components/SearchFilter';
import TaskList from './components/TaskList';
import TaskModal from './components/TaskModal';
import ConfirmModal from './components/ConfirmModal';
import Toast from './components/Toast';
import LoadingSpinner from './components/LoadingSpinner';
import NotConfigured from './components/NotConfigured';

function App() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState({ total_points: 0, level: 1 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [query, setQuery] = useState('');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [toast, setToast] = useState({ message: '', type: 'success' });
  const channelRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  // Browser Notifications for Due Tasks
  useEffect(() => {
    if (tasks.length > 0 && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }

      const checkDueTasks = () => {
        const today = new Date().setHours(0, 0, 0, 0);
        const dueToday = tasks.filter(t => !t.completed && t.due_date && new Date(t.due_date).setHours(0, 0, 0, 0) === today);
        if (dueToday.length > 0 && Notification.permission === "granted") {
          new Notification("📅 Tareas para hoy", {
            body: `Tienes ${dueToday.length} tareas que vencen hoy en TaskFlow.`,
            icon: "/vite.svg"
          });
        }
      };

      checkDueTasks();
    }
  }, [tasks.length]);

  const loadProfile = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) setUserProfile(data);
  }, []);

  const loadTasks = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        showToast('⚠️ Error al cargar tareas', 'error');
        console.error(error);
      } else {
        setTasks(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);

      if (currentUser) {
        loadTasks(currentUser.id);
        loadProfile(currentUser.id);

        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
        }

        channelRef.current = supabase
          .channel(`tasks-${currentUser.id}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${currentUser.id}` },
            () => loadTasks(currentUser.id)
          )
          .subscribe();
      } else {
        if (channelRef.current) {
          supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
        setTasks([]);
        setUserProfile({ total_points: 0, level: 1 });
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [loadTasks, loadProfile]);

  const handleSignIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    return null;
  };

  const handleSignUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return error.message;
    return null;
  };

  const handleOAuth = async (provider) => {
    try {
      const options = { redirectTo: window.location.origin };
      if (provider === 'google') {
        options.queryParams = { prompt: 'select_account', access_type: 'offline' };
      }
      const { error } = await supabase.auth.signInWithOAuth({ provider, options });
      if (error) return error.message;
    } catch (err) {
      return 'Error de conexión con el proveedor OAuth';
    }
    return null;
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('👋 Sesión cerrada correctamente');
  };

  const handleSaveTask = async ({ id, title, description, category, due_date }) => {
    if (id) {
      const { error } = await supabase
        .from('tasks')
        .update({ title, description, category, due_date })
        .eq('id', id);
      if (error) return showToast('⚠️ Error al actualizar', 'error');
      showToast('✅ Tarea actualizada');
    } else {
      const { error } = await supabase
        .from('tasks')
        .insert({ user_id: user.id, title, description, category, due_date });
      if (error) return showToast('⚠️ Error al crear', 'error');
      showToast('🎉 Tarea agregada');
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
    loadTasks(user.id);
  };

  const handleToggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    const isNowCompleted = !task.completed;

    const { error } = await supabase
      .from('tasks')
      .update({ completed: isNowCompleted })
      .eq('id', id);

    if (error) return showToast('⚠️ Error al actualizar', 'error');

    if (isNowCompleted) {
      const pointsToAdd = task.points || 10;
      const newTotal = (userProfile.total_points || 0) + pointsToAdd;
      const newLevel = Math.floor(newTotal / 100) + 1;

      await supabase
        .from('user_profiles')
        .update({ total_points: newTotal, level: newLevel })
        .eq('id', user.id);

      loadProfile(user.id);
      showToast(`🏆 ¡Completada! +${pointsToAdd} pts`);
    } else {
      showToast('🔄 Marcada como pendiente');
    }

    loadTasks(user.id);
  };

  const handleDeleteTask = async () => {
    if (!pendingDeleteId) return;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', pendingDeleteId);
    if (error) return showToast('⚠️ Error al eliminar', 'error');
    showToast('🗑️ Tarea eliminada', 'error');
    setIsConfirmModalOpen(false);
    setPendingDeleteId(null);
    loadTasks(user.id);
  };

  const filteredTasks = tasks.filter(task => {
    const matchStatus = filter === 'all' ||
      (filter === 'pending' && !task.completed) ||
      (filter === 'completed' && task.completed);

    const matchCategory = categoryFilter === 'Todas' || task.category === categoryFilter;

    const q = query.toLowerCase();
    const matchText = !q ||
      task.title.toLowerCase().includes(q) ||
      task.description.toLowerCase().includes(q);

    return matchStatus && matchCategory && matchText;
  });

  if (!isConfigured) return <NotConfigured />;

  if (!user && !loading) {
    return (
      <>
        <AuthScreen
          onSignIn={handleSignIn}
          onSignUp={handleSignUp}
          onOAuth={handleOAuth}
        />
        <Toast
          message={toast.message}
          type={toast.type}
          onClear={() => setToast({ message: '', type: 'success' })}
        />
      </>
    );
  }

  if (loading && !user) return <LoadingSpinner />;

  return (
    <div className="app-container">
      <Header
        user={user}
        onAddTask={() => { setEditingTask(null); setIsTaskModalOpen(true); }}
        onLogout={handleLogout}
      />
      <main className="main">
        <StatsBar tasks={tasks} profile={userProfile} />
        <SearchFilter
          query={query}
          onSearchChange={setQuery}
          filter={filter}
          onFilterChange={setFilter}
          onClearSearch={() => setQuery('')}
          categoryFilter={categoryFilter}
          onCategoryChange={setCategoryFilter}
        />
        <TaskList
          tasks={filteredTasks}
          query={query}
          onToggle={handleToggleTask}
          onEdit={(task) => { setEditingTask(task); setIsTaskModalOpen(true); }}
          onDelete={(id) => { setPendingDeleteId(id); setIsConfirmModalOpen(true); }}
        />
      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        task={editingTask}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setPendingDeleteId(null); }}
        onConfirm={handleDeleteTask}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        onClear={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

export default App;
