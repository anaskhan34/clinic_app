export default function AppointmentCard({ appointment, onCancel }) {
  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-emerald-100 text-emerald-700",
    COMPLETED: "bg-sky-100 text-sky-700",
    CANCELLED: "bg-rose-100 text-rose-700",
    IN_PROGRESS: "bg-violet-100 text-violet-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {appointment.doctorId?.name || "Doctor"}
          </h3>
          <p className="text-sm text-slate-500">
            {appointment.clinicId?.name || "Clinic"}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusColors[appointment.status] || "bg-slate-100 text-slate-600"}`}
        >
          {appointment.status}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-700">Date:</span>{" "}
          {appointment.appointmentDate}
        </p>
        <p>
          <span className="font-medium text-slate-700">Time:</span>{" "}
          {appointment.appointmentTime}
        </p>
        {appointment.reason && (
          <p>
            <span className="font-medium text-slate-700">Reason:</span>{" "}
            {appointment.reason}
          </p>
        )}
        {appointment.queueNumber && (
          <p>
            <span className="font-medium text-slate-700">Queue Number:</span>{" "}
            {appointment.queueNumber}
          </p>
        )}
      </div>

      {appointment.status !== "CANCELLED" && onCancel && (
        <button
          type="button"
          onClick={() => onCancel(appointment._id)}
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-100"
        >
          Cancel
        </button>
      )}
    </div>
  );
}
