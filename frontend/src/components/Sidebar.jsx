import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user || user.role === "PATIENT") return null;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getLinks = () => {
    switch (user.role) {
      case "DOCTOR":
        return [
          { to: "/dashboard", label: "Overview", icon: "📊" },
          { to: "/doctor/queue", label: "Patient Queue", icon: "👥" },
          { to: "/doctor/profile", label: "My Profile", icon: "👨‍⚕️" },
          { to: "/doctor/schedule", label: "My Schedule", icon: "📅" },
        ];
      case "CLINIC_ADMIN":
        return [
          { to: "/dashboard", label: "Overview", icon: "📊" },
          { to: "/clinic/profile", label: "Clinic Profile", icon: "🏥" },
          { to: "/clinic/doctors", label: "Manage Doctors", icon: "👨‍⚕️" },
          { to: "/clinic/appointments", label: "Appointments", icon: "📅" },
        ];
      case "SUPER_ADMIN":
        return [
          { to: "/dashboard", label: "Overview", icon: "📊" },
          { to: "/admin/clinics", label: "Clinics", icon: "🏥" },
          { to: "/admin/doctors", label: "Doctors", icon: "👨‍⚕️" },
          { to: "/admin/appointments", label: "Appointments", icon: "📅" },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-64px)] flex flex-col justify-between shrink-0">
      <div className="p-6">
        <div className="mb-6 rounded-2xl bg-teal-50/50 p-4 border border-teal-100/55">
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700">
            Logged in as
          </p>
          <h3 className="mt-1 font-bold text-slate-800 truncate">{user.name}</h3>
          <span className="mt-0.5 inline-block rounded-full bg-teal-100/70 px-2 py-0.5 text-2xs font-semibold tracking-wide text-teal-800 uppercase">
            {user.role.replace("_", " ")}
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700 border border-teal-100/50"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`
              }
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-6 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
