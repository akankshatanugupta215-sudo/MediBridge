export default function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex h-full min-h-[200px] w-full items-center justify-center py-16">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-teal-600" />
        <span className="text-sm text-slate-500">{label}</span>
      </div>
    </div>
  );
}
