import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    clinics: 0,
    doctors: 0,
    appointments: 0,
  });
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [recentClinics, setRecentClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStatsData = async () => {
    try {
      setLoading(true);
      const [clinicsRes, doctorsRes, appointmentsRes] = await Promise.all([
        api.get("/clinics"),
        api.get("/doctors"),
        api.get("/appointments"),
      ]);

      const clinicsList = clinicsRes.data.data || [];
      const doctorsList = doctorsRes.data.data || [];
      const appointmentsList = appointmentsRes.data.data || [];

      setStats({
        clinics: clinicsList.length,
        doctors: doctorsList.length,
        appointments: appointmentsList.length,
      });

      setRecentClinics(clinicsList.slice(0, 3));
      setRecentAppointments(appointmentsList.slice(0, 3));
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch dashboard statistics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatsData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading Super Admin dashboard..." />;
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 to-sky-50 p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Super Administration
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900 font-bold">
          Ecosystem Control Center
        </h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Statistics widgets */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Clinics</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.clinics}</p>
            <Link to="/admin/clinics" className="text-xs font-semibold text-teal-650 text-teal-650 hover:underline">
              Manage Clinics →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Doctors</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.doctors}</p>
            <Link to="/admin/doctors" className="text-xs font-semibold text-teal-650 text-teal-650 hover:underline">
              View Directory →
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Appointments</p>
          <div className="mt-2 flex items-baseline justify-between">
            <p className="text-3xl font-bold text-slate-900">{stats.appointments}</p>
            <Link to="/admin/appointments" className="text-xs font-semibold text-teal-650 text-teal-650 hover:underline">
              View Bookings →
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Clinics list */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Ecosystem Clinics</h2>
            <Link to="/admin/clinics" className="text-sm font-semibold text-teal-600 hover:underline">
              All Clinics
            </Link>
          </div>
          <div className="space-y-3">
            {recentClinics.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No clinics registered in the system yet.</p>
            ) : (
              recentClinics.map((clinic) => (
                <div key={clinic._id} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                  <p className="font-bold text-slate-800">{clinic.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{clinic.city} • {clinic.address}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Appointments booked */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>
            <Link to="/admin/appointments" className="text-sm font-semibold text-teal-600 hover:underline">
              All Appointments
            </Link>
          </div>
          <div className="space-y-3">
            {recentAppointments.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">No appointments recorded yet.</p>
            ) : (
              recentAppointments.map((appt) => (
                <div key={appt._id} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-800">Patient: {appt.patientId?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Doc: {appt.doctorId?.name} • Clinic: {appt.clinicId?.name}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold uppercase bg-slate-100 text-slate-600">
                      {appt.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
