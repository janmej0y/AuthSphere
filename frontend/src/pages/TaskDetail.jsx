import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Alert from '../components/Alert.jsx';
import AppShell from '../components/AppShell.jsx';
import Skeleton from '../components/Skeleton.jsx';

const TaskDetail = () => {
  const { id } = useParams();
  const [task, setTask] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const { data } = await api.get(`/tasks/${id}`);
        setTask(data.task);
      } catch (apiError) {
        setError(apiError.response?.data?.message || 'Unable to load task');
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [id]);

  return (
    <AppShell>
      <Link className="text-sm font-semibold text-brand" to="/dashboard">Back to dashboard</Link>
      <div className="mt-4">
        <Alert type="error" message={error} />
      </div>
      {loading ? (
        <Skeleton rows={3} />
      ) : task ? (
        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-ink">{task.title}</h1>
              <p className="mt-2 text-sm text-slate-600">{task.description || 'No description'}</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">{task.status}</span>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Owner</p>
              <p className="mt-1 font-semibold">{task.user?.name || 'Unknown'}</p>
              <p className="text-sm text-slate-500">{task.user?.email}</p>
            </div>
            <div className="rounded-md border border-slate-200 p-4">
              <p className="text-sm text-slate-500">Created</p>
              <p className="mt-1 font-semibold">{new Date(task.createdAt).toLocaleString()}</p>
            </div>
          </div>
          {task.attachments?.length > 0 && (
            <div className="mt-6">
              <h2 className="font-bold">Attachments</h2>
              <div className="mt-3 space-y-2">
                {task.attachments.map((attachment) => (
                  <a className="block rounded-md border border-slate-200 p-3 text-sm font-semibold text-brand" href={attachment.url} key={attachment.url} rel="noreferrer" target="_blank">
                    {attachment.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}
    </AppShell>
  );
};

export default TaskDetail;

