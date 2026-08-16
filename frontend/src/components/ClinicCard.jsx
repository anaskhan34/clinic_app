import { Link } from "react-router-dom";

export default function ClinicCard({ clinic }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {clinic.name}
          </h3>
          <p className="mt-1 text-sm text-slate-500">{clinic.city}</p>
        </div>
        {clinic.image ? (
          <img
            src={clinic.image}
            alt={clinic.name}
            className="h-16 w-16 rounded-xl object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-teal-50 text-sm font-semibold text-teal-600">
            {clinic.name?.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      <p className="mb-4 text-sm leading-6 text-slate-600">
        {clinic.description || "General healthcare services and consultations."}
      </p>

      <div className="mb-4 space-y-2 text-sm text-slate-600">
        <p>{clinic.address}</p>
        {clinic.phone && <p>{clinic.phone}</p>}
        {clinic.email && <p>{clinic.email}</p>}
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-teal-700">
          {clinic.openingTime && clinic.closingTime
            ? `${clinic.openingTime} - ${clinic.closingTime}`
            : "Open daily"}
        </span>
        <Link
          to={`/book-appointment?clinicId=${clinic._id}`}
          className="rounded-lg bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700"
        >
          Book now
        </Link>
      </div>
    </div>
  );
}
