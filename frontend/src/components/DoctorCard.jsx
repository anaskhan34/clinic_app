import { Link } from "react-router-dom";

export default function DoctorCard({ doctor }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex items-center gap-4">
        {doctor.image ? (
          <img
            src={doctor.image}
            alt={doctor.name}
            className="h-16 w-16 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-50 text-lg font-semibold text-sky-700">
            {doctor.name?.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            {doctor.name}
          </h3>
          <p className="text-sm text-slate-500">{doctor.specialization}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-slate-600">
        {doctor.clinicId?.name && (
          <p>
            <span className="font-medium text-slate-700">Clinic:</span>{" "}
            {doctor.clinicId.name}
          </p>
        )}
        {doctor.qualification && <p>{doctor.qualification}</p>}
        {doctor.experience && <p>{doctor.experience} years of experience</p>}
        {doctor.consultationFee && <p>Fee: PKR {doctor.consultationFee}</p>}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            doctor.available
              ? "bg-emerald-100 text-emerald-700"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {doctor.available ? "Available" : "Unavailable"}
        </span>
        <Link
          to={`/book-appointment?doctorId=${doctor._id}&clinicId=${doctor.clinicId?._id || ""}`}
          className="rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          onClick={(e) => !doctor.available && e.preventDefault()}
        >
          Select doctor
        </Link>
      </div>
    </div>
  );
}
