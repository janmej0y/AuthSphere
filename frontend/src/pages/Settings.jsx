import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import Alert from '../components/Alert.jsx';
import AppShell from '../components/AppShell.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const [profile, setProfile] = useState({ name: user?.name || '', email: user?.email || '' });
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [alert, setAlert] = useState({ type: '', message: '' });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('authsphere_dark') === 'true');

  useEffect(() => {
    document.body.classList.toggle('authsphere-dark', darkMode);
    localStorage.setItem('authsphere_dark', String(darkMode));
  }, [darkMode]);

  const showAlert = (type, message) => {
    setAlert({ type, message });
    window.setTimeout(() => setAlert({ type: '', message: '' }), 3500);
  };

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    try {
      const { data } = await api.patch('/profile', profile);
      updateUser(data.user);
      showAlert('success', 'Profile updated');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to update profile');
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.patch('/profile/password', password);
      setPassword({ currentPassword: '', newPassword: '' });
      showAlert('success', 'Password changed. Please login again when your session expires.');
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to change password');
    }
  };

  const handleDeleteProfile = async () => {
    try {
      await api.delete('/profile');
      await logout();
    } catch (error) {
      showAlert('error', error.response?.data?.message || 'Unable to delete profile');
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <AppShell>
      <header>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your profile, password, and interface preference.</p>
      </header>

      <div className="mt-6">
        <Alert type={alert.type} message={alert.message} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handleProfileSubmit}>
          <h2 className="text-lg font-bold">Profile</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" type="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
            <button className="rounded-md bg-brand px-4 py-2 font-semibold text-white" type="submit">Save profile</button>
          </div>
        </form>

        <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={handlePasswordSubmit}>
          <h2 className="text-lg font-bold">Password</h2>
          <div className="mt-4 space-y-4">
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="Current password" type="password" value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} />
            <input className="w-full rounded-md border border-slate-300 px-3 py-2" placeholder="New password" type="password" value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} />
            <button className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white" type="submit">Change password</button>
          </div>
        </form>
      </div>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">Preferences</h2>
        <label className="mt-4 flex items-center gap-3 text-sm font-semibold">
          <input checked={darkMode} onChange={(event) => setDarkMode(event.target.checked)} type="checkbox" />
          Dark mode
        </label>
      </section>

      <section className="mt-8 rounded-lg border border-red-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-red-700">Danger zone</h2>
        <p className="mt-2 text-sm text-slate-600">This soft deletes your profile and hides it from active views.</p>
        <button className="mt-4 rounded-md bg-red-600 px-4 py-2 font-semibold text-white" onClick={() => setConfirmDelete(true)} type="button">Delete profile</button>
      </section>

      {confirmDelete && (
        <ConfirmModal
          title="Delete profile?"
          message="Your account will be soft deleted and you will be logged out."
          confirmText="Delete"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={handleDeleteProfile}
        />
      )}
    </AppShell>
  );
};

export default Settings;

