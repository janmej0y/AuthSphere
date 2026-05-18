import { Link } from 'react-router-dom';

const AuthLayout = ({ title, subtitle, footerText, footerLink, footerLinkText, children }) => {
  return (
    <section className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">AuthSphere</p>
          <h1 className="text-3xl font-bold text-ink">{title}</h1>
          <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
        </div>
        {children}
        <p className="mt-6 text-center text-sm text-slate-600">
          {footerText}{' '}
          <Link className="font-semibold text-brand hover:text-blue-700" to={footerLink}>
            {footerLinkText}
          </Link>
        </p>
      </div>
    </section>
  );
};

export default AuthLayout;

