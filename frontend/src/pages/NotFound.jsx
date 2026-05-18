import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <section className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-brand">404</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Page not found</h1>
        <p className="mt-3 text-sm text-slate-600">The route you opened is not part of AuthSphere.</p>
        <Link className="mt-6 inline-flex rounded-md bg-brand px-4 py-2 font-semibold text-white hover:bg-blue-700" to="/dashboard">
          Back to dashboard
        </Link>
      </div>
    </section>
  );
};

export default NotFound;

