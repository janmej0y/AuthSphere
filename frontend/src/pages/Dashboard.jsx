import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios.js';
import Alert from '../components/Alert.jsx';
import AppShell from '../components/AppShell.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import Skeleton from '../components/Skeleton.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const emptyForm = { title: '', description: '', status: 'pending', attachmentName: '', attachmentUrl: '' };

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [searchResults, setSearchResults] = useState({ users: [], tasks: [] });
  const [globalQuery, setGlobalQuery] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [filters, setFilters] = useState({ search: '', status: '', sort: 'newest' });
  const [editingId, setEditingId] = useState(null);
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  const pageCompleted = useMemo(() => tasks.filter((task) => task.status === 'completed').length, [tasks]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    window.setTimeout(() => setAlert({ type: '', message: '' }), 3500);
  };

  const fetchTasks = async (nextPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: nextPage, limit: 10, sort: filters.sort });
      if (filters.search) params.set('search', filters.search);
      if (filters.status) params.set('status', filters.status);

      const { data } = await api.get(`/tasks?${params.toString()}`);
      setTasks(data.tasks);
      setPagination({ page: data.page, limit: data.limit, total: data.total, totalPages: data.totalPages });
      setPage(data.page);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminData = async () => {
    if (user?.role !== 'admin') return;

    try {
      const [usersRes, analyticsRes, activityRes] = await Promise.all([
        api.get('/users'),
        api.get('/admin/analytics'),
        api.get('/admin/activity')
      ]);
      setUsers(usersRes.data.users);
      setAnalytics(analyticsRes.data.stats);
      setActivity(activityRes.data.logs);
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to load admin data');
    }
  };

  useEffect(() => {
    fetchTasks(1);
  }, [filters.status, filters.sort]);

  useEffect(() => {
    fetchAdminData();
  }, [user?.role]);

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    fetchTasks(1);
  };

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const taskPayload = () => ({
    title: form.title.trim(),
    description: form.description.trim(),
    status: form.status,
    attachments:
      form.attachmentUrl.trim() && form.attachmentName.trim()
        ? [{ name: form.attachmentName.trim(), url: form.attachmentUrl.trim() }]
        : []
  });

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (form.title.trim().length < 2) {
      showAlert('error', 'Task title must be at least 2 characters');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/tasks/${editingId}`, taskPayload());
        showAlert('success', 'Task updated successfully');
      } else {
        await api.post('/tasks', taskPayload());
        showAlert('success', 'Task created successfully');
      }

      setForm(emptyForm);
      setEditingId(null);
      await fetchTasks(editingId ? page : 1);
      await fetchAdminData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to save task');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (task) => {
    const attachment = task.attachments?.[0] || {};
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      attachmentName: attachment.name || '',
      attachmentUrl: attachment.url || ''
    });
  };

  const handleDelete = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      showAlert('success', 'Task moved to soft delete');
      await fetchTasks(tasks.length === 1 && page > 1 ? page - 1 : page);
      await fetchAdminData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to delete task');
    } finally {
      setConfirm(null);
    }
  };

  const handleRoleChange = async (userId, role) => {
    setUpdatingUserId(userId);
    try {
      const { data } = await api.patch(`/users/${userId}/role`, { role });
      setUsers((current) => current.map((item) => (item._id === userId ? data.user : item)));
      showAlert('success', 'User role updated');
      await fetchAdminData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleUserDelete = async (userId) => {
    try {
      await api.delete(`/users/${userId}`);
      setUsers((current) => current.filter((item) => item._id !== userId));
      showAlert('success', 'User soft deleted successfully');
      await fetchAdminData();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to delete user');
    } finally {
      setConfirm(null);
    }
  };

  const handleGlobalSearch = async (event) => {
    event.preventDefault();
    if (!globalQuery.trim()) {
      setSearchResults({ users: [], tasks: [] });
      return;
    }

    try {
      const { data } = await api.get(`/admin/search?q=${encodeURIComponent(globalQuery)}`);
      setSearchResults({ users: data.users, tasks: data.tasks });
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to search');
    }
  };

  return (
    <AppShell>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-600">Tasks, users, activity, and admin signals in one workspace.</p>
      </header>

      <Alert type={alert.type} message={alert.message} />

      <div className="mt-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total tasks</p>
          <p className="mt-2 text-3xl font-bold">{analytics?.totalTasks ?? pagination.total}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-accent">{analytics?.completedTasks ?? pageCompleted}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{analytics?.pendingTasks ?? tasks.length - pageCompleted}</p>
        </div>
        {user?.role === 'admin' && (
          <>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Users</p>
              <p className="mt-2 text-3xl font-bold">{analytics?.totalUsers ?? users.length}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm text-slate-500">Admins</p>
              <p className="mt-2 text-3xl font-bold">{analytics?.totalAdmins ?? 0}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[380px_1fr]">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold">{editingId ? 'Edit task' : 'Add task'}</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
            <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
            <select className="w-full rounded-md border border-slate-300 px-3 py-2" name="status" value={form.status} onChange={handleChange}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="attachmentName" placeholder="Attachment name" value={form.attachmentName} onChange={handleChange} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" name="attachmentUrl" placeholder="Attachment URL" value={form.attachmentUrl} onChange={handleChange} />
            <div className="flex gap-3">
              <button className="rounded-md bg-brand px-4 py-2 font-semibold text-white disabled:bg-slate-400" disabled={saving} type="submit">
                {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              {editingId && (
                <button className="rounded-md border border-slate-300 px-4 py-2 font-semibold" onClick={() => { setEditingId(null); setForm(emptyForm); }} type="button">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <h2 className="text-lg font-bold">Tasks</h2>
              <form className="flex flex-col gap-2 sm:flex-row" onSubmit={handleFilterSubmit}>
                <input className="rounded-md border border-slate-300 px-3 py-2 text-sm" placeholder="Search tasks" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
                <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
                  <option value="">All status</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
                <select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={filters.sort} onChange={(event) => setFilters((current) => ({ ...current, sort: event.target.value }))}>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="title">Title</option>
                </select>
                <button className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white" type="submit">Apply</button>
              </form>
            </div>
          </div>

          {loading ? (
            <Skeleton rows={4} />
          ) : tasks.length === 0 ? (
            <div className="p-8 text-center">
              <h3 className="text-lg font-semibold">No tasks found</h3>
              <p className="mt-2 text-sm text-slate-600">Try a different filter or create a new task.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200">
              {tasks.map((task) => (
                <article className="p-5" key={task._id}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link className="font-semibold text-ink hover:text-brand" to={`/tasks/${task._id}`}>{task.title}</Link>
                      <p className="mt-2 text-sm text-slate-600">{task.description || 'No description'}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="rounded-full bg-slate-100 px-2 py-1">{task.status}</span>
                        {user?.role === 'admin' && task.user && <span>Owner: {task.user.name}</span>}
                        {task.attachments?.length > 0 && <span>{task.attachments.length} attachment</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold" onClick={() => handleEdit(task)} type="button">Edit</button>
                      <button className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-red-700" onClick={() => setConfirm({ type: 'task', id: task._id })} type="button">Delete</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 p-5 text-sm">
            <button className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={pagination.page <= 1 || loading} onClick={() => fetchTasks(page - 1)} type="button">Previous</button>
            <span>Page {pagination.page} of {pagination.totalPages}</span>
            <button className="rounded-md border border-slate-300 px-3 py-1.5 font-semibold disabled:opacity-50" disabled={pagination.page >= pagination.totalPages || loading} onClick={() => fetchTasks(page + 1)} type="button">Next</button>
          </div>
        </section>
      </div>

      {user?.role === 'admin' && (
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Global search</h2>
            <form className="mt-4 flex gap-2" onSubmit={handleGlobalSearch}>
              <input className="flex-1 rounded-md border border-slate-300 px-3 py-2" placeholder="Search users and tasks" value={globalQuery} onChange={(event) => setGlobalQuery(event.target.value)} />
              <button className="rounded-md bg-brand px-4 py-2 font-semibold text-white" type="submit">Search</button>
            </form>
            <div className="mt-4 space-y-3 text-sm">
              {[...searchResults.users.map((item) => ({ label: item.name, meta: item.email })), ...searchResults.tasks.map((item) => ({ label: item.title, meta: item.status }))].map((item, index) => (
                <div className="rounded-md border border-slate-200 p-3" key={`${item.label}-${index}`}>
                  <p className="font-semibold">{item.label}</p>
                  <p className="text-slate-500">{item.meta}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">Activity timeline</h2>
            <div className="mt-4 space-y-3 text-sm">
              {activity.map((log) => (
                <div className="rounded-md border border-slate-200 p-3" key={log._id}>
                  <p className="font-semibold">{log.action}</p>
                  <p className="text-slate-500">{log.actor?.email || 'system'} - {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {user?.role === 'admin' && (
        <section className="mt-8 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-bold">Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-5 py-3">Name</th>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((item) => (
                  <tr key={item._id}>
                    <td className="px-5 py-3">{item.name}</td>
                    <td className="px-5 py-3">{item.email}</td>
                    <td className="px-5 py-3">
                      <select className="rounded-md border border-slate-300 px-2 py-1" disabled={updatingUserId === item._id} value={item.role} onChange={(event) => handleRoleChange(item._id, event.target.value)}>
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <button className="rounded-md border border-red-200 px-3 py-1.5 font-semibold text-red-700 disabled:opacity-50" disabled={updatingUserId === item._id || item._id === user.id} onClick={() => setConfirm({ type: 'user', id: item._id })} type="button">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {confirm && (
        <ConfirmModal
          title={confirm.type === 'task' ? 'Delete task?' : 'Delete user?'}
          message="This uses soft delete, so the record is hidden from normal views."
          confirmText="Delete"
          onCancel={() => setConfirm(null)}
          onConfirm={() => (confirm.type === 'task' ? handleDelete(confirm.id) : handleUserDelete(confirm.id))}
        />
      )}
    </AppShell>
  );
};

export default Dashboard;

