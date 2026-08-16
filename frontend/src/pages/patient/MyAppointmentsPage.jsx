import { useEffect, useState } from "react";
import api from "../../api/api";
import AppointmentCard from "../../components/AppointmentCard";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { Link } from "react-router-dom";

export default function MyAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/appointments");
      setAppointments(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (appointmentId) => {
    const confirmation = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmation) return;

    try {
      await api.put(`/appointments/${appointmentId}`, { status: "CANCELLED" });
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Appointments
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            My appointments
          </h1>
        </div>
        <Link to="/book-appointment">
          <button className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition">
            Book New Appointment
          </button>
        </Link>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading appointments..." />
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          You have no appointments yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="relative">
              <AppointmentCard
                appointment={appointment}
                onCancel={handleCancel}
              />
              <div className="absolute bottom-5 right-5">
                <Link
                  to={`/appointments/${appointment._id}`}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
