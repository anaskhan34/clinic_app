import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import Button from "../../components/Button";

export default function AppointmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);

  const fetchAppointmentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/appointments/${id}`);
      setAppointment(response.data.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch appointment details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointmentDetails();
  }, [id]);

  const handleCancel = async () => {
    const confirmation = window.confirm("Are you sure you want to cancel this appointment?");
    if (!confirmation) return;

    try {
      setCancelling(true);
      await api.put(`/appointments/${id}`, { status: "CANCELLED" });
      await fetchAppointmentDetails();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to cancel appointment.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading appointment details..." />;
  }

  if (error || !appointment) {
    return (
      <div className="mx-auto max-w-xl px-4 py-10">
        <ErrorMessage message={error || "Appointment not found."} />
        <div className="mt-4 text-center">
          <Link to="/appointments" className="text-teal-600 hover:underline">
            Back to appointments
          </Link>
        </div>
      </div>
    );
  }

  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    COMPLETED: "bg-sky-100 text-sky-700 border-sky-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
    IN_PROGRESS: "bg-violet-100 text-violet-700 border-violet-200",
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition flex items-center gap-1"
        >
          ← Back
        </button>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Appointment Details
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">
              Queue #{appointment.queueNumber || "N/A"}
            </h1>
          </div>
          <span
            className={`inline-flex rounded-full border px-3.5 py-1 text-sm font-semibold uppercase ${
              statusColors[appointment.status] || "bg-slate-100 text-slate-600 border-slate-200"
            }`}
          >
            {appointment.status}
          </span>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Clinic Details
              </h3>
              <p className="font-bold text-slate-800">
                {appointment.clinicId?.name || "Clinic Info"}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {appointment.clinicId?.address}, {appointment.clinicId?.city}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Doctor Details
              </h3>
              <p className="font-bold text-slate-800">
                {appointment.doctorId?.name || "Doctor Info"}
              </p>
              <p className="text-sm text-teal-700 mt-0.5 font-medium">
                {appointment.doctorId?.specialization}
              </p>
              {appointment.doctorId?.consultationFee && (
                <p className="text-xs text-slate-500 mt-1">
                  Consultation Fee: PKR {appointment.doctorId.consultationFee}
                </p>
              )}
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Date & Time
              </h3>
              <p className="font-bold text-slate-800">
                📅 {appointment.appointmentDate}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                ⏰ {appointment.appointmentTime}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Patient Info
              </h3>
              <p className="font-semibold text-slate-700">
                {appointment.patientId?.name || "Patient"}
              </p>
              <p className="text-sm text-slate-500">
                {appointment.patientId?.email}
              </p>
            </div>
          </div>

          {appointment.reason && (
            <>
              <hr className="border-slate-100" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Reason for Consultation
                </h3>
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 leading-relaxed italic">
                  "{appointment.reason}"
                </div>
              </div>
            </>
          )}

          {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
            <div className="pt-4 flex justify-end border-t border-slate-100">
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Cancel Appointment"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
