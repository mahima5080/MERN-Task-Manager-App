import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('task_user')) || null);
  const [token, setToken] = useState(localStorage.getItem('task_token') || '');
  const [isRegister, setIsRegister] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Task states
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/tasks`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isRegister ? '/auth/register' : '/auth/login';
      const payload = isRegister ? { name, email, password } : { email, password };
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      if (isRegister) {
        alert('Registration successful! Please login.');
        setIsRegister(false);
      } else {
        setUser(res.data.user);
        setToken(res.data.token);
        localStorage.setItem('task_user', JSON.stringify(res.data.user));
        localStorage.setItem('task_token', res.data.token);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Authentication error');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken('');
    setTasks([]);
    localStorage.removeItem('task_user');
    localStorage.removeItem('task_token');
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      const res = await axios.post(`${API_URL}/tasks`, { title, description }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks([res.data, ...tasks]);
      setTitle('');
      setDescription('');
    } catch (err) {
      alert('Error creating task');
    }
  };

  const toggleTaskStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
      const res = await axios.put(`${API_URL}/tasks/${id}`, { status: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.map(t => t._id === id ? res.data : t));
    } catch (err) {
      alert('Error updating task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API_URL}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(tasks.filter(t => t._id !== id));
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const filteredTasks = tasks.filter(t => filter === 'All' || t.status === filter);

  if (!token) {
    return (
      <div style={{ maxWidth: '400px', margin: '50px auto', fontFamily: 'sans-serif', padding: '25px', borderRadius: '12px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff' }}>
        <h2>{isRegister ? 'Register' : 'Login'} — Task Manager</h2>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '15px' }}>
          {isRegister && (
            <input type="text" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          )}
          <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
          <button type="submit" style={{ padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p style={{ fontSize: '0.85rem', marginTop: '15px', color: '#64748b', cursor: 'pointer' }} onClick={() => setIsRegister(!isRegister)}>
          {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '30px auto', fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Task Manager Dashboard</h2>
        <div>
          <span style={{ marginRight: '15px', fontWeight: 'bold', color: '#334155' }}>Welcome, {user?.name}</span>
          <button onClick={handleLogout} style={{ padding: '6px 14px', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Logout</button>
        </div>
      </header>

      {/* Add Task Form */}
      <form onSubmit={handleAddTask} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #cbd5e1', marginBottom: '25px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <h3>Add New Task</h3>
        <input type="text" placeholder="Task Title" value={title} onChange={e => setTitle(e.target.value)} required style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
        <textarea placeholder="Description (Optional)" value={description} onChange={e => setDescription(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '60px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', width: '150px' }}>+ Add Task</button>
      </form>

      {/* Task Filters */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['All', 'Pending', 'Completed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 'bold',
              backgroundColor: filter === status ? '#4f46e5' : '#e2e8f0',
              color: filter === status ? '#ffffff' : '#334155'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <div key={task._id} style={{ backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', textDecoration: task.status === 'Completed' ? 'line-through' : 'none', color: task.status === 'Completed' ? '#94a3b8' : '#0f172a' }}>{task.title}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{task.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => toggleTaskStatus(task._id, task.status)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: task.status === 'Completed' ? '#fbbf24' : '#10b981', color: '#fff' }}>
                  {task.status === 'Completed' ? 'Mark Pending' : 'Mark Complete'}
                </button>
                <button onClick={() => deleteTask(task._id)} style={{ padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', backgroundColor: '#ef4444', color: '#fff' }}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: '#64748b' }}>No tasks found for filter '{filter}'.</p>
        )}
      </div>
    </div>
  );
}

export default App;