import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [clinics, setClinics] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const [clinicsRes, appointmentsRes] = await Promise.all([
          api.get("/clinics"),
          api.get("/appointments"),
        ]);

        setClinics(clinicsRes.data.data || []);
        setAppointments(appointmentsRes.data.data || []);
        setError("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load dashboard data.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          Access your dashboard
        </h1>
        <p className="mt-4 text-slate-600">
          Please log in to view your appointments and book a consultation.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <Link to="/login">
            <Button>Login</Button>
          </Link>
          <Link to="/register">
            <Button variant="outline">Register</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 to-sky-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Patient dashboard
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Welcome back, {user.name}
        </h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading your dashboard..." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Clinics</h2>
              <Link to="/clinics" className="text-sm font-medium text-teal-700">
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {clinics.length === 0 ? (
                <p className="text-sm text-slate-500">No clinics registered.</p>
              ) : (
                clinics.slice(0, 3).map((clinic) => (
                  <div
                    key={clinic._id}
                    className="rounded-xl border border-slate-200 p-3 hover:border-teal-200 transition"
                  >
                    <p className="font-medium text-slate-800">{clinic.name}</p>
                    <p className="text-sm text-slate-500">{clinic.city} • {clinic.address}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">
                Appointments
              </h2>
              <Link
                to="/appointments"
                className="text-sm font-medium text-teal-700"
              >
                View all
              </Link>
            </div>
            <div className="space-y-3">
              {appointments.length === 0 ? (
                <p className="text-sm text-slate-500">No appointments yet.</p>
              ) : (
                appointments.slice(0, 3).map((appointment) => (
                  <div
                    key={appointment._id}
                    className="rounded-xl border border-slate-200 p-3 hover:border-teal-200 transition"
                  >
                    <div className="flex justify-between">
                      <p className="font-medium text-slate-800">
                        {appointment.doctorId?.name || "Doctor"}
                      </p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 font-semibold uppercase">
                        {appointment.status}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500">
                      {appointment.appointmentDate} •{" "}
                      {appointment.appointmentTime}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
