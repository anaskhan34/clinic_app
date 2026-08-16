import { useEffect, useState } from "react";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function ClinicAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const response = await api.get("/appointments");
      setAppointments(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoadingId(appointmentId);
      setError("");
      setSuccess("");
      await api.put(`/appointments/${appointmentId}`, { status: newStatus });
      setSuccess(`Appointment status updated to ${newStatus}`);
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status.");
    } finally {
      setActionLoadingId("");
    }
  };

  const handleDelete = async (appointmentId) => {
    const confirmation = window.confirm("Are you sure you want to permanently delete this appointment record?");
    if (!confirmation) return;

    try {
      setActionLoadingId(appointmentId);
      setError("");
      setSuccess("");
      await api.delete(`/appointments/${appointmentId}`);
      setSuccess("Appointment record deleted successfully.");
      fetchAppointments();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete appointment.");
    } finally {
      setActionLoadingId("");
    }
  };

  const statusColors = {
    PENDING: "bg-amber-55 bg-amber-50 text-amber-700",
    CONFIRMED: "bg-emerald-55 bg-emerald-50 text-emerald-700",
    COMPLETED: "bg-sky-55 bg-sky-50 text-sky-700",
    CANCELLED: "bg-rose-55 bg-rose-50 text-rose-700",
    IN_PROGRESS: "bg-violet-55 bg-violet-50 text-violet-750 text-violet-700",
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Bookings
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Clinic Appointments
        </h1>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading appointments list..." />
      ) : appointments.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50 p-12 text-center text-slate-500">
          No appointments have been booked at your clinic yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Queue</th>
                  <th className="pb-3">Patient</th>
                  <th className="pb-3">Doctor</th>
                  <th className="pb-3">Date & Time</th>
                  <th className="pb-3">Reason</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150 divide-slate-100">
                {appointments.map((appt) => (
                  <tr key={appt._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-2 font-bold text-slate-950">
                      #{appt.queueNumber || "N/A"}
                    </td>
                    <td className="py-4">
                      <p className="font-semibold text-slate-800">{appt.patientId?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-400">{appt.patientId?.email}</p>
                    </td>
                    <td className="py-4 text-sm text-slate-700 font-medium">
                      {appt.doctorId?.name}
                    </td>
                    <td className="py-4">
                      <p className="text-sm font-semibold text-slate-800">{appt.appointmentDate}</p>
                      <p className="text-xs text-slate-400">{appt.appointmentTime}</p>
                    </td>
                    <td className="py-4 text-xs text-slate-500 max-w-[150px] truncate italic" title={appt.reason}>
                      {appt.reason || "No reason given"}
                    </td>
                    <td className="py-4">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold uppercase ${statusColors[appt.status] || "bg-slate-100"}`}>
                        {appt.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex gap-2 justify-end items-center">
                        {/* Status changers */}
                        {appt.status === "PENDING" && (
                          <button
                            onClick={() => handleUpdateStatus(appt._id, "CONFIRMED")}
                            disabled={actionLoadingId === appt._id}
                            className="rounded bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                          >
                            Confirm
                          </button>
                        )}
                        {appt.status !== "CANCELLED" && appt.status !== "COMPLETED" && (
                          <button
                            onClick={() => handleUpdateStatus(appt._id, "CANCELLED")}
                            disabled={actionLoadingId === appt._id}
                            className="rounded bg-rose-50 px-2 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(appt._id)}
                          disabled={actionLoadingId === appt._id}
                          className="rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition hover:text-slate-850 hover:text-slate-800"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
