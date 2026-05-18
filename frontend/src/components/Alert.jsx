const toneClasses = {
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  error: 'border-red-200 bg-red-50 text-red-800',
  info: 'border-blue-200 bg-blue-50 text-blue-800'
};

const Alert = ({ type = 'info', message }) => {
  if (!message) return null;

  return (
    <div className={`rounded-md border px-4 py-3 text-sm ${toneClasses[type]}`}>
      {message}
    </div>
  );
};

export default Alert;

