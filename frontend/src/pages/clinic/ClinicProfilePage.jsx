import { useEffect, useState } from "react";
import api from "../../api/api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function ClinicProfilePage() {
  const { refreshUser } = useAuth();
  const [clinic, setClinic] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
    address: "",
    city: "",
    phone: "",
    email: "",
    openingTime: "09:00",
    closingTime: "17:00",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClinicProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clinics/my-clinic");
      const data = response.data.data;
      setClinic(data);
      setForm({
        name: data.name || "",
        description: data.description || "",
        address: data.address || "",
        city: data.city || "",
        phone: data.phone || "",
        email: data.email || "",
        openingTime: data.openingTime || "09:00",
        closingTime: data.closingTime || "17:00",
      });
      setError("");
    } catch (err) {
      if (err.response?.status === 404) {
        setClinic(null);
      } else {
        setError(err.response?.data?.message || "Unable to fetch clinic details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicProfile();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      if (!clinic) {
        // Create Clinic (POST /clinics)
        const response = await api.post("/clinics", form);
        setSuccess("Clinic profile created successfully!");
        setClinic(response.data.data.clinic);
        await refreshUser(); // Sync token clinicId
      } else {
        // Update Clinic (PUT /clinics/:id)
        const response = await api.put(`/clinics/${clinic._id}`, form);
        setSuccess("Clinic profile updated successfully!");
        setClinic(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save clinic profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!clinic) return;
    const confirmDelete = window.confirm(
      "WARNING: Deleting your clinic will remove all doctors and appointments associated with it. Are you absolutely sure?"
    );
    if (!confirmDelete) return;

    const doubleCheck = window.confirm("Type 'DELETE' to confirm destruction of this clinic.");
    if (!doubleCheck) return;

    try {
      setDeleting(true);
      setError("");
      await api.delete(`/clinics/${clinic._id}`);
      setSuccess("Clinic deleted successfully!");
      setClinic(null);
      setForm({
        name: "",
        description: "",
        address: "",
        city: "",
        phone: "",
        email: "",
        openingTime: "09:00",
        closingTime: "17:00",
      });
      await refreshUser(); // Sync token clinicId to null
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete clinic.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading clinic profile details..." />;
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Setup
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            {clinic ? "Clinic Profile" : "Create Clinic Profile"}
          </h1>
        </div>
        {clinic && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-xl border border-rose-250 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition disabled:opacity-50"
          >
            {deleting ? "Deleting..." : "Delete Clinic"}
          </button>
        )}
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Clinic Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. HealthCare Clinic"
              required
            />
            <Input
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="e.g. Islamabad"
              required
            />
            <Input
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="e.g. Sector F-8, Street 10"
              required
            />
            <Input
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. +92 51 1234567"
              required
            />
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="e.g. contact@healthcare.com"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Opening Time"
                type="time"
                name="openingTime"
                value={form.openingTime}
                onChange={handleChange}
              />
              <Input
                label="Closing Time"
                type="time"
                name="closingTime"
                value={form.closingTime}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Description / Services Overview
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the clinical facilities, specialties, and equipment available..."
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-100"
            />
          </div>

          {error && <ErrorMessage message={error} />}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving Clinic Details..." : clinic ? "Save Changes" : "Create Profile"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
