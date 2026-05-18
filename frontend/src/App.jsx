import { Outlet } from 'react-router-dom';

const App = () => {
  return (
    <main className="min-h-screen bg-surface text-ink">
      <Outlet />
    </main>
  );
};

export default App;

