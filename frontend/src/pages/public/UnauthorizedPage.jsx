import { Link } from "react-router-dom";
import Button from "../../components/Button";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-3xl">
          🚫
        </span>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Access Denied</h1>
        <p className="mt-3 text-sm text-slate-500">
          You do not have the required permissions to view this page.
        </p>
        <div className="mt-8">
          <Link to="/dashboard">
            <Button className="w-full">Return to Dashboard</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
