import { useEffect, useState } from "react";
import api from "../../api/api";
import Button from "../../components/Button";
import Input from "../../components/Input";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function DoctorProfilePage() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors/${user.doctorId}`);
      const data = response.data.data;
      setDoctor(data);
      setForm({
        name: data.name || "",
        phone: data.phone || "",
        specialization: data.specialization || "",
        qualification: data.qualification || "",
        experience: data.experience || "",
        consultationFee: data.consultationFee || "",
      });
      if (data.image) {
        setImagePreview(data.image);
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to fetch doctor profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.doctorId) {
      fetchProfile();
    }
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // Build FormData because of possible image upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("phone", form.phone);
      formData.append("specialization", form.specialization);
      formData.append("qualification", form.qualification);
      formData.append("experience", form.experience);
      formData.append("consultationFee", form.consultationFee);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await api.put(`/doctors/${user.doctorId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSuccess("Profile updated successfully!");
      setDoctor(response.data.data);
      setImageFile(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading profile details..." />;
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Settings
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          My Doctor Profile
        </h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="h-24 w-24 rounded-full object-cover border-2 border-teal-100 shadow-sm"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-2xl border-2 border-dashed border-slate-200 text-slate-400">
                👨‍⚕️
              </div>
            )}
            <div className="text-center sm:text-left">
              <h3 className="font-bold text-slate-800">Profile Photo</h3>
              <p className="text-xs text-slate-500 mt-1 mb-3">Accepts PNG, JPG or JPEG. Max size 2MB.</p>
              <label className="cursor-pointer rounded-xl bg-teal-50 px-4 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-100 transition border border-teal-100">
                Upload New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6 md:grid-cols-2">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-500">
                Email Address
              </label>
              <input
                type="email"
                value={doctor?.email}
                disabled
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-slate-500 shadow-sm outline-none cursor-not-allowed"
              />
            </div>
            <Input
              label="Phone Number"
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
            />
            <Input
              label="Qualification"
              name="qualification"
              value={form.qualification}
              onChange={handleChange}
              placeholder="e.g. MBBS, FCPS"
            />
            <Input
              label="Years of Experience"
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

          {error && <ErrorMessage message={error} />}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving Changes..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
