import { useEffect, useState } from "react";
import api from "../../api/api";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function SuperAdminDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/doctors");
      setDoctors(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch doctors.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Ecosystem
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Doctor Directory
        </h1>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading doctors list..." />
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50 p-12 text-center text-slate-500">
          No doctors are registered in the ecosystem yet.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Doctor Name</th>
                  <th className="pb-3">Specialization</th>
                  <th className="pb-3">Clinic</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Availability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {doctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-2 font-bold text-slate-900 flex items-center gap-3">
                      {doctor.image && (
                        <img
                          src={doctor.image}
                          alt={doctor.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      )}
                      <span>{doctor.name}</span>
                    </td>
                    <td className="py-4 text-sm text-teal-700 font-semibold">
                      {doctor.specialization}
                    </td>
                    <td className="py-4 text-sm text-slate-800 font-medium">
                      {doctor.clinicId?.name || "Unassigned"}
                    </td>
                    <td className="py-4 text-xs text-slate-500">
                      <p>📧 {doctor.email}</p>
                      {doctor.phone && <p>📞 {doctor.phone}</p>}
                    </td>
                    <td className="py-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                        doctor.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-105 bg-slate-100 text-slate-500"
                      }`}>
                        {doctor.available ? "Available" : "Offline"}
                      </span>
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
