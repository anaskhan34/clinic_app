import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../../api/api";
import DoctorCard from "../../components/DoctorCard";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function DoctorsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const clinicIdFromUrl = searchParams.get("clinicId") || "";
  const specializationFromUrl = searchParams.get("specialization") || "";
  const availableFromUrl = searchParams.get("available") || "";

  const [doctors, setDoctors] = useState([]);
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters state
  const [selectedClinic, setSelectedClinic] = useState(clinicIdFromUrl);
  const [selectedSpecialization, setSelectedSpecialization] = useState(specializationFromUrl);
  const [selectedAvailability, setSelectedAvailability] = useState(availableFromUrl);

  // Unique specializations list for filter dropdown
  const [specializations, setSpecializations] = useState([]);

  useEffect(() => {
    // Sync filter state if URL changes
    setSelectedClinic(searchParams.get("clinicId") || "");
    setSelectedSpecialization(searchParams.get("specialization") || "");
    setSelectedAvailability(searchParams.get("available") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const response = await api.get("/clinics");
        setClinics(response.data.data || []);
      } catch (err) {
        console.error("Error loading clinics:", err);
      }
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (selectedClinic) params.append("clinicId", selectedClinic);
        if (selectedSpecialization) params.append("specialization", selectedSpecialization);
        if (selectedAvailability) params.append("available", selectedAvailability);

        const response = await api.get(`/doctors?${params.toString()}`);
        const doctorsList = response.data.data || [];
        setDoctors(doctorsList);

        // Extract specializations dynamically if we don't have them
        if (doctorsList.length > 0 && specializations.length === 0) {
          const specs = [...new Set(doctorsList.map((doc) => doc.specialization))].filter(Boolean);
          setSpecializations(specs);
        }
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load doctors.");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedClinic, selectedSpecialization, selectedAvailability]);

  const handleFilterChange = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const handleReset = () => {
    setSearchParams({});
    setSelectedClinic("");
    setSelectedSpecialization("");
    setSelectedAvailability("");
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Doctors
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Meet the specialists
        </h1>
      </div>

      {/* Filters Panel */}
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Filter Doctors</h3>
        <div className="grid gap-4 sm:grid-cols-4 items-end">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Clinic</label>
            <select
              value={selectedClinic}
              onChange={(e) => handleFilterChange("clinicId", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            >
              <option value="">All Clinics</option>
              {clinics.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Specialization</label>
            <select
              value={selectedSpecialization}
              onChange={(e) => handleFilterChange("specialization", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            >
              <option value="">All Specializations</option>
              {specializations.map((spec) => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
              {/* Fallbacks if not loaded yet */}
              {!specializations.includes("Cardiologist") && <option value="Cardiologist">Cardiologist</option>}
              {!specializations.includes("Dentist") && <option value="Dentist">Dentist</option>}
              {!specializations.includes("Pediatrician") && <option value="Pediatrician">Pediatrician</option>}
              {!specializations.includes("Dermatologist") && <option value="Dermatologist">Dermatologist</option>}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Availability</label>
            <select
              value={selectedAvailability}
              onChange={(e) => handleFilterChange("available", e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
            >
              <option value="">All Statuses</option>
              <option value="true">Available Now</option>
            </select>
          </div>

          <div>
            <button
              onClick={handleReset}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-800 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {loading ? (
        <LoadingSpinner text="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center text-slate-500">
          No doctors match the selected filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => (
            <DoctorCard key={doctor._id} doctor={doctor} />
          ))}
        </div>
      )}
    </div>
  );
}
