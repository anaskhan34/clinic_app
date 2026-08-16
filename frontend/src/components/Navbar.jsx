import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const getNavItems = () => {
    if (!user || user.role === "PATIENT") {
      return [
        { to: "/", label: "Home" },
        { to: "/clinics", label: "Clinics" },
        { to: "/doctors", label: "Doctors" },
        { to: "/appointments", label: "My Appointments" },
      ];
    } else {
      // Professionals and Admins navigate using the Sidebar, but can access Home/Dashboard from here
      return [
        { to: "/", label: "Home" },
        { to: "/dashboard", label: "Dashboard" },
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-sm shadow-2xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
            C
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">ClinicFlow</p>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? "text-teal-700"
                    : "text-slate-650 text-slate-600 hover:text-slate-900"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm font-medium text-slate-600 sm:block">
                {user.name}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="text-sm font-medium text-slate-700"
              >
                Login
              </NavLink>
              <Button onClick={() => navigate("/register")}>Register</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
