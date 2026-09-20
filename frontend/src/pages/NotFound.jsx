import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-6xl font-bold text-teal-600">404</p>
      <p className="mt-2 text-sm text-slate-500">This page doesn't exist.</p>
      <Link to="/dashboard" className="mt-6 rounded-lg bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700">
        Go to Dashboard
      </Link>
    </div>
  );
}
