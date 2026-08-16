import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchDoctorData = async () => {
    try {
      setLoading(true);
      // Backend returns all appointments for this doctor automatically
      const [docRes, apptsRes] = await Promise.all([
        api.get(`/doctors/${user.doctorId}`),
        api.get("/appointments"),
      ]);

      setDoctorInfo(docRes.data.data);
      setAppointments(apptsRes.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.doctorId) {
      fetchDoctorData();
    }
  }, [user]);

  const handleToggleAvailability = async () => {
    if (!doctorInfo) return;
    try {
      setToggleLoading(true);
      const updatedAvailability = !doctorInfo.available;
      const response = await api.put(`/doctors/${doctorInfo._id}`, {
        available: updatedAvailability,
      });
      setDoctorInfo(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update availability.");
    } finally {
      setToggleLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading dashboard data..." />;
  }

  // Get Pakistani Today's date
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const todayAppointments = appointments.filter((appt) => appt.appointmentDate === todayStr);
  const pendingAppointments = appointments.filter((appt) => appt.status === "PENDING" || appt.status === "CONFIRMED");

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 to-sky-50 p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Doctor Dashboard
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Dr. {doctorInfo?.name || user.name}
          </h1>
          <p className="text-slate-500 mt-1">{doctorInfo?.specialization} • {doctorInfo?.clinicId?.name}</p>
        </div>

        {/* Quick Availability Toggle */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">My Status</p>
            <p className={`text-sm font-bold ${doctorInfo?.available ? "text-emerald-600" : "text-slate-500"}`}>
              {doctorInfo?.available ? "Available" : "Away / Offline"}
            </p>
          </div>
          <button
            onClick={handleToggleAvailability}
            disabled={toggleLoading}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none ${
              doctorInfo?.available ? "bg-emerald-500" : "bg-slate-350 bg-slate-300"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                doctorInfo?.available ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Stats Widgets */}
      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Today's Appointments</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{todayAppointments.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Pending / Confirmed Queue</p>
          <p className="mt-2 text-3xl font-bold text-teal-700">{pendingAppointments.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Consultation Fee</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">PKR {doctorInfo?.consultationFee || 0}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's appointments list */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Today's Appointments ({todayStr})</h2>
            <Link to="/doctor/queue" className="text-sm font-bold text-teal-600 hover:text-teal-700">
              View Active Queue →
            </Link>
          </div>
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <p className="text-sm text-slate-500 py-4 text-center">No appointments scheduled for today.</p>
            ) : (
              todayAppointments.map((appt) => (
                <div key={appt._id} className="flex justify-between items-center rounded-xl border border-slate-100 p-4 hover:bg-slate-50/50 transition">
                  <div>
                    <p className="font-semibold text-slate-800">{appt.patientId?.name || "Unknown Patient"}</p>
                    <p className="text-xs text-slate-400 mt-0.5">Time slot: {appt.appointmentTime} • Queue #{appt.queueNumber}</p>
                    {appt.reason && <p className="text-xs text-slate-500 mt-1">Reason: {appt.reason}</p>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                    appt.status === "COMPLETED" ? "bg-sky-50 text-sky-700" :
                    appt.status === "CANCELLED" ? "bg-rose-50 text-rose-700" :
                    appt.status === "IN_PROGRESS" ? "bg-violet-50 text-violet-700" :
                    "bg-amber-50 text-amber-700"
                  }`}>
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick links & profile stats */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="grid gap-3">
              <Link to="/doctor/queue" className="flex items-center gap-3 p-3.5 rounded-xl border border-teal-200 bg-teal-50/40 hover:bg-teal-50 transition text-sm font-bold text-teal-800">
                👥 Start Patient Queue
              </Link>
              <Link to="/doctor/schedule" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700">
                📅 Edit Schedule Hours
              </Link>
              <Link to="/doctor/profile" className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 transition text-sm font-semibold text-slate-700">
                👨‍⚕️ Update Profile details
              </Link>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Qualifications</h3>
            <p className="text-sm font-medium text-slate-700">{doctorInfo?.qualification || "Not configured"}</p>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-4 mb-2">Experience</h3>
            <p className="text-sm font-medium text-slate-700">{doctorInfo?.experience ? `${doctorInfo.experience} years` : "Not configured"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
