import { useEffect, useState } from "react";
import api from "../../api/api";
import ClinicCard from "../../components/ClinicCard";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import Input from "../../components/Input";

export default function ClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clinics");
        setClinics(response.data.data || []);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load clinics.");
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  const filteredClinics = clinics.filter((clinic) => {
    const term = search.toLowerCase();
    return (
      clinic.name?.toLowerCase().includes(term) ||
      clinic.city?.toLowerCase().includes(term) ||
      clinic.address?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Clinics
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Choose a clinic
          </h1>
        </div>
        <div className="w-full md:max-w-xs">
          <Input
            placeholder="Search by name, city, or address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading clinics..." />
      ) : filteredClinics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          No clinics match your search query.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredClinics.map((clinic) => (
            <ClinicCard key={clinic._id} clinic={clinic} />
          ))}
        </div>
      )}
    </div>
  );
}
