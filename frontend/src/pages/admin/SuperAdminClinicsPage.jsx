import { useEffect, useState } from "react";
import api from "../../api/api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";

export default function SuperAdminClinicsPage() {
  const [clinics, setClinics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchClinics = async () => {
    try {
      setLoading(true);
      const response = await api.get("/clinics");
      setClinics(response.data.data || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch clinics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinics();
  }, []);

  const handleOpenModal = () => {
    setForm({ name: "", email: "", password: "" });
    setError("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/auth/create-clinic-admin", form);
      setSuccess("Clinic Admin created successfully! They can now log in and set up their clinic.");
      setIsModalOpen(false);
      fetchClinics();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to create clinic admin.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Ecosystem
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Registered Clinics
          </h1>
        </div>
        <button
          onClick={handleOpenModal}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
        >
          Create Clinic Admin
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading clinics list..." />
      ) : clinics.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50 p-12 text-center text-slate-500">
          No clinics are currently registered in the ecosystem. Click "Create Clinic Admin" to register a new admin account.
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Clinic Name</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">Address</th>
                  <th className="pb-3">Contact</th>
                  <th className="pb-3">Operating Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clinics.map((clinic) => (
                  <tr key={clinic._id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 pl-2 font-bold text-slate-900">
                      {clinic.name}
                    </td>
                    <td className="py-4 text-sm text-slate-700 font-medium">
                      {clinic.city}
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {clinic.address}
                    </td>
                    <td className="py-4 text-xs text-slate-500 space-y-0.5">
                      <p>📞 {clinic.phone || "No phone"}</p>
                      <p>📧 {clinic.email || "No email"}</p>
                    </td>
                    <td className="py-4 text-xs text-slate-650 font-semibold">
                      {clinic.openingTime && clinic.closingTime
                        ? `${clinic.openingTime} - ${clinic.closingTime}`
                        : "Not configured"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Clinic Admin Modal */}
      <Modal isOpen={isModalOpen} title="Create Clinic Admin Account" onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Clinic Admin Name"
            required
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="admin@clinic.com"
            required
          />
          <Input
            label="Password"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />

          {error && <ErrorMessage message={error} />}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Account"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
