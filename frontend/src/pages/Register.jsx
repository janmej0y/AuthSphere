import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout.jsx';
import Alert from '../components/Alert.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const demoAdminEmail = import.meta.env.VITE_DEMO_ADMIN_EMAIL || 'admin@example.com';
const demoAdminPassword = import.meta.env.VITE_DEMO_ADMIN_PASSWORD || 'Admin@12345';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [accountType, setAccountType] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (accountType === 'admin') {
      setError('Admin signup is disabled for security. Use the provided seeded admin login instead.');
      return;
    }

    if (form.name.trim().length < 2 || !form.email.includes('@') || form.password.length < 6) {
      setError('Enter a valid name, email, and password with at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await register(form);
      navigate('/dashboard');
    } catch (apiError) {
      setError(apiError.response?.data?.message || 'Unable to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register a user account, or use the seeded admin login for review."
      footerText="Already registered?"
      footerLink="/login"
      footerLinkText="Login"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Alert type="error" message={error} />
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Account type</span>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            value={accountType}
            onChange={(event) => {
              setAccountType(event.target.value);
              setError('');
            }}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        {accountType === 'admin' && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">Admin signup is protected.</p>
            <p className="mt-1">
              Public admin registration is disabled so random users cannot create admin accounts. For testing, use the
              seeded admin login below.
            </p>
            <div className="mt-3 rounded-md bg-white p-3">
              <p>
                <span className="font-semibold">Email:</span> {demoAdminEmail}
              </p>
              <p>
                <span className="font-semibold">Password:</span> {demoAdminPassword}
              </p>
            </div>
            <button
              className="mt-3 rounded-md bg-amber-700 px-4 py-2 font-semibold text-white hover:bg-amber-800"
              type="button"
              onClick={() =>
                navigate('/login', {
                  state: {
                    email: demoAdminEmail,
                    password: demoAdminPassword
                  }
                })
              }
            >
              Use admin login
            </button>
          </div>
        )}
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Name</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Email</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Password</span>
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-brand focus:ring-2 focus:ring-blue-100"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            minLength={6}
            required
          />
        </label>
        <button
          className="w-full rounded-md bg-brand px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          type="submit"
          disabled={loading || accountType === 'admin'}
        >
          {loading ? 'Creating...' : 'Register'}
        </button>
      </form>
    </AuthLayout>
  );
};

export default Register;
