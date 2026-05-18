const Skeleton = ({ rows = 3 }) => {
  return (
    <div className="space-y-3 p-5">
      {Array.from({ length: rows }).map((_, index) => (
        <div className="h-16 animate-pulse rounded-md bg-slate-100" key={index} />
      ))}
    </div>
  );
};

export default Skeleton;

