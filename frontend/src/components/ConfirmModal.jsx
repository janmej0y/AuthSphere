const ConfirmModal = ({ title, message, confirmText = 'Confirm', onCancel, onConfirm }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700" onClick={onConfirm} type="button">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;

