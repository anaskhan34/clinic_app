import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function ClinicDashboard() {
  const { user } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch my clinic
      let clinicRes;
      try {
        clinicRes = await api.get("/clinics/my-clinic");
        setClinic(clinicRes.data.data);
      } catch (err) {
        if (err.response?.status === 404) {
          // Clinic admin doesn't have a clinic yet
          setClinic(null);
        } else {
          throw err;
        }
      }

      // Fetch clinic doctors and appointments
      const [doctorsRes, appointmentsRes] = await Promise.all([
        api.get("/doctors"), // Automatically filtered by backend for CLINIC_ADMIN
        api.get("/appointments"), // Automatically filtered by backend for CLINIC_ADMIN
      ]);

      setDoctors(doctorsRes.data.data || []);
      setAppointments(appointmentsRes.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner text="Loading clinic data..." />;
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      {/* If Clinic doesn't exist, show warning */}
      {!clinic ? (
        <div className="rounded-3xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center">
          <span className="text-4xl">🏥</span>
          <h2 className="mt-4 text-2xl font-bold text-slate-800">Clinic Profile Missing</h2>
          <p className="mt-2 text-slate-600 max-w-md mx-auto text-sm leading-relaxed">
            You need to create your clinic profile before you can manage doctors, schedules, or appointments.
          </p>
          <div className="mt-6">
            <Link to="/clinic/profile">
              <button className="rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
                Create Clinic Profile Now
              </button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8 rounded-3xl border border-slate-200 bg-gradient-to-r from-teal-50 to-sky-50 p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
              Clinic Administration
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">
              {clinic.name}
            </h1>
            <p className="text-slate-500 mt-1">{clinic.city} • {clinic.address}</p>
          </div>

          {error && <ErrorMessage message={error} />}

          {/* Stats widgets */}
          <div className="grid gap-6 sm:grid-cols-2 mb-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Registered Doctors</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-slate-900">{doctors.length}</p>
                <Link to="/clinic/doctors" className="text-xs font-semibold text-teal-600 hover:underline">
                  Manage Directory →
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-slate-500">Total Booked Appointments</p>
              <div className="mt-2 flex items-baseline justify-between">
                <p className="text-3xl font-bold text-slate-900">{appointments.length}</p>
                <Link to="/clinic/appointments" className="text-xs font-semibold text-teal-600 hover:underline">
                  View Bookings →
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Doctors list summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Our Doctors</h2>
                <Link to="/clinic/doctors" className="text-sm font-semibold text-teal-600 hover:underline">
                  Add Doctor
                </Link>
              </div>
              <div className="space-y-3">
                {doctors.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No doctors registered in your clinic.</p>
                ) : (
                  doctors.slice(0, 3).map((doctor) => (
                    <div key={doctor._id} className="flex justify-between items-center border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                      <div>
                        <p className="font-bold text-slate-800">{doctor.name}</p>
                        <p className="text-xs text-slate-450 text-slate-500">{doctor.specialization}</p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        doctor.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                      }`}>
                        {doctor.available ? "Active" : "Away"}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Appointments summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-slate-900">Recent Appointments</h2>
                <Link to="/clinic/appointments" className="text-sm font-semibold text-teal-600 hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {appointments.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4">No appointments booked yet.</p>
                ) : (
                  appointments.slice(0, 3).map((appt) => (
                    <div key={appt._id} className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-bold text-slate-850 text-slate-800">
                            Patient: {appt.patientId?.name || "Unknown"}
                          </p>
                          <p className="text-xs text-slate-450 text-slate-500 mt-0.5">
                            Doc: {appt.doctorId?.name} • Time: {appt.appointmentTime}
                          </p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold uppercase ${
                          appt.status === "COMPLETED" ? "bg-sky-50 text-sky-700" :
                          appt.status === "CANCELLED" ? "bg-rose-50 text-rose-700" :
                          "bg-amber-50 text-amber-700"
                        }`}>
                          {appt.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
