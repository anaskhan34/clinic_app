import { useEffect, useState } from "react";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function DoctorQueuePage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [date, setDate] = useState(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date())
  );
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/queue?doctorId=${user.doctorId}&date=${date}`);
      setAppointments(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch queue data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.doctorId && date) {
      fetchQueue();
    }
  }, [user, date]);

  const handleUpdateStatus = async (appointmentId, newStatus) => {
    try {
      setActionLoadingId(appointmentId);
      setError("");
      setSuccess("");
      await api.patch(`/queue/${appointmentId}/status`, { status: newStatus });
      setSuccess(`Queue status updated to ${newStatus}`);
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update status.");
    } finally {
      setActionLoadingId("");
    }
  };

  // Identify active patient (IN_PROGRESS)
  const activeAppointment = appointments.find((appt) => appt.status === "IN_PROGRESS");
  const pendingAppointments = appointments.filter((appt) => appt.status !== "IN_PROGRESS");

  return (
    <div className="flex-1 p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Patients
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Active Queue Management
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase">Queue Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 outline-none focus:border-teal-400"
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Fetching active patient queue..." />
      ) : (
        <div className="space-y-8">
          {/* Active Call In Section */}
          <div className="rounded-3xl border-2 border-dashed border-teal-200 bg-teal-50/20 p-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-700 mb-4">
              Current Patient in consultation
            </h3>
            {activeAppointment ? (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-teal-100 rounded-2xl p-5 shadow-sm gap-4">
                <div>
                  <span className="inline-block rounded-full bg-violet-100 text-violet-850 text-xs px-2.5 py-0.5 font-bold uppercase">
                    In Progress
                  </span>
                  <h4 className="text-xl font-bold text-slate-800 mt-2">
                    {activeAppointment.patientId?.name}
                  </h4>
                  <p className="text-sm text-slate-500">{activeAppointment.patientId?.email}</p>
                  <p className="text-xs text-slate-400 mt-2">Queue Number: #{activeAppointment.queueNumber}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(activeAppointment._id, "COMPLETED")}
                    disabled={actionLoadingId === activeAppointment._id}
                    className="flex-1 sm:flex-none rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
                  >
                    Complete Session
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(activeAppointment._id, "CANCELLED")}
                    disabled={actionLoadingId === activeAppointment._id}
                    className="flex-1 sm:flex-none rounded-xl border border-rose-250 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    No Show / Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 bg-white border border-slate-100 rounded-2xl">
                No active consultation. Select a patient from the queue below to "Call In".
              </div>
            )}
          </div>

          {/* Queue List Table */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Waiting Queue ({pendingAppointments.length})</h2>
            {pendingAppointments.length === 0 ? (
              <p className="text-sm text-slate-450 py-8 text-center text-slate-400">
                No patients waiting in the queue for this day.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-3 pl-2">Queue #</th>
                      <th className="pb-3">Patient</th>
                      <th className="pb-3">Slot Time</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingAppointments.map((appt) => (
                      <tr key={appt._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 pl-2 font-bold text-slate-900">
                          #{appt.queueNumber}
                        </td>
                        <td className="py-4">
                          <p className="font-bold text-slate-800">{appt.patientId?.name}</p>
                          <p className="text-xs text-slate-400">{appt.patientId?.email}</p>
                        </td>
                        <td className="py-4 text-sm text-slate-650 font-semibold">
                          {appt.appointmentTime}
                        </td>
                        <td className="py-4">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase ${
                            appt.status === "CONFIRMED" ? "bg-emerald-50 text-emerald-700" :
                            appt.status === "CANCELLED" ? "bg-rose-50 text-rose-700" :
                            "bg-amber-50 text-amber-700"
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            {appt.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt._id, "CONFIRMED")}
                                  disabled={actionLoadingId === appt._id}
                                  className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                                >
                                  Confirm
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt._id, "CANCELLED")}
                                  disabled={actionLoadingId === appt._id}
                                  className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                            {appt.status === "CONFIRMED" && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(appt._id, "IN_PROGRESS")}
                                  disabled={actionLoadingId === appt._id || !!activeAppointment}
                                  title={activeAppointment ? "Complete active patient first" : "Call patient in"}
                                  className="rounded-lg bg-teal-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Call In
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(appt._id, "CANCELLED")}
                                  disabled={actionLoadingId === appt._id}
                                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
