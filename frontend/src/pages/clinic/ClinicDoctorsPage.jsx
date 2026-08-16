import { useEffect, useState } from "react";
import api from "../../api/api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import Modal from "../../components/Modal";

export default function ClinicDoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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

  const handleOpenAddModal = () => {
    setEditingDoctor(null);
    setForm({
      name: "",
      email: "",
      password: "",
      phone: "",
      specialization: "",
      qualification: "",
      experience: "",
      consultationFee: "",
    });
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (doctor) => {
    setEditingDoctor(doctor);
    setForm({
      name: doctor.name || "",
      email: doctor.email || "",
      password: "", // Leave blank on edit, password shouldn't be updated here or requires separate logic
      phone: doctor.phone || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      consultationFee: doctor.consultationFee || "",
    });
    setImageFile(null);
    setError("");
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("phone", form.phone);
      formData.append("specialization", form.specialization);
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("consultationFee", form.consultationFee);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (editingDoctor) {
        // Update Doctor
        await api.put(`/doctors/${editingDoctor._id}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Doctor updated successfully!");
      } else {
        // Create Doctor
        formData.append("password", form.password);
        await api.post("/doctors", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setSuccess("Doctor registered successfully!");
      }

      setIsModalOpen(false);
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save doctor profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (doctorId) => {
    const confirmation = window.confirm(
      "Are you sure you want to delete this doctor? Their login credentials and schedules will be deleted."
    );
    if (!confirmation) return;

    try {
      await api.delete(`/doctors/${doctorId}`);
      setSuccess("Doctor deleted successfully!");
      fetchDoctors();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete doctor.");
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
            Staff
          </p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">
            Doctors Directory
          </h1>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 transition"
        >
          Add New Doctor
        </button>
      </div>

      {error && <ErrorMessage message={error} />}
      {success && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
          {success}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Loading doctors..." />
      ) : doctors.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-350 bg-slate-50 p-12 text-center text-slate-500">
          No doctors are currently registered under your clinic. Click "Add New Doctor" to get started.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {doctors.map((doctor) => (
            <div
              key={doctor._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="mb-4 flex items-center gap-4">
                  {doctor.image ? (
                    <img
                      src={doctor.image}
                      alt={doctor.name}
                      className="h-16 w-16 rounded-full object-cover border border-slate-100"
                    />
                  ) : (
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-teal-700 text-lg font-bold">
                      {doctor.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 leading-tight">
                      {doctor.name}
                    </h3>
                    <p className="text-sm font-medium text-teal-700 mt-0.5">
                      {doctor.specialization}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-sm text-slate-600 mb-4">
                  <p>📧 {doctor.email}</p>
                  {doctor.phone && <p>📞 {doctor.phone}</p>}
                  {doctor.qualification && <p>🎓 {doctor.qualification}</p>}
                  <p>💼 {doctor.experience || 0} years experience</p>
                  <p>💵 Fee: PKR {doctor.consultationFee || 0}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-150 border-t border-slate-100">
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                    doctor.available ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {doctor.available ? "Available" : "Away"}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenEditModal(doctor)}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doctor._id)}
                    className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal
        isOpen={isModalOpen}
        title={editingDoctor ? "Edit Doctor Profile" : "Register New Doctor"}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1 py-1">
          <Input
            label="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
            disabled={!!editingDoctor}
          />
          {!editingDoctor && (
            <Input
              label="Login Password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          )}
          <Input
            label="Phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
          <Input
            label="Specialization"
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            required
            placeholder="e.g. Cardiologist, Dentist"
          />
          <Input
            label="Qualification"
            name="qualification"
            value={form.qualification}
            onChange={handleChange}
            placeholder="e.g. MBBS, MD"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Experience (Years)"
              type="number"
              name="experience"
              value={form.experience}
              onChange={handleChange}
            />
            <Input
              label="Consultation Fee (PKR)"
              type="number"
              name="consultationFee"
              value={form.consultationFee}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Profile Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          {error && <ErrorMessage message={error} />}

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-55 hover:bg-slate-50"
            >
              Cancel
            </button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingDoctor ? "Save Changes" : "Register Doctor"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
