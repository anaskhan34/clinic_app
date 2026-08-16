import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import api from "../../api/api";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import Input from "../../components/Input";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

export default function BookAppointmentPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const initialClinicId = searchParams.get("clinicId") || "";
  const initialDoctorId = searchParams.get("doctorId") || "";

  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedClinicId, setSelectedClinicId] = useState(initialClinicId);
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctorId);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load Clinics on mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const response = await api.get("/clinics");
        setClinics(response.data.data || []);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load clinics.");
      } finally {
        setLoading(false);
      }
    };

    fetchClinics();
  }, []);

  // Fetch doctors whenever clinicId changes
  useEffect(() => {
    if (!selectedClinicId) {
      setDoctors([]);
      setSelectedDoctorId("");
      return;
    }

    const fetchDoctorsForClinic = async () => {
      try {
        const response = await api.get(`/doctors?clinicId=${selectedClinicId}`);
        const availableDoctors = response.data.data || [];
        setDoctors(availableDoctors);

        // Reset doctor ID if it is not inside the loaded clinic's doctors list
        if (
          selectedDoctorId &&
          !availableDoctors.some((doctor) => doctor._id === selectedDoctorId)
        ) {
          setSelectedDoctorId("");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load doctors.");
      }
    };

    fetchDoctorsForClinic();
  }, [selectedClinicId]);

  // Handle URL pre-selections
  useEffect(() => {
    if (initialClinicId) setSelectedClinicId(initialClinicId);
    if (initialDoctorId) setSelectedDoctorId(initialDoctorId);
  }, [initialClinicId, initialDoctorId]);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !date) {
      setSlots([]);
      setSelectedSlot("");
      return;
    }

    const fetchSlots = async () => {
      try {
        setSlotsLoading(true);
        setError("");
        const response = await api.get(
          `/appointments/slots?doctorId=${selectedDoctorId}&date=${date}`,
        );

        const slotData = response.data.data || { availableSlots: [] };
        setSlots(slotData.availableSlots || []);
        setSelectedSlot("");
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to fetch available slots.",
        );
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [selectedDoctorId, date]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!selectedClinicId || !selectedDoctorId || !date || !selectedSlot) {
      setError("Please select a clinic, doctor, date, and time slot.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const response = await api.post("/appointments", {
        clinicId: selectedClinicId,
        doctorId: selectedDoctorId,
        appointmentDate: date,
        appointmentTime: selectedSlot,
        reason,
      });

      setSuccess(response.data.message || "Appointment booked successfully.");
      setSelectedSlot("");
      setReason("");
      setTimeout(() => navigate("/appointments"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to book appointment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Please login</h1>
        <p className="mt-3 text-slate-600">Sign in to book an appointment.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Book appointment
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Schedule your consultation
        </h1>
      </div>

      {loading ? (
        <LoadingSpinner text="Preparing appointment form..." />
      ) : (
        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Clinic
              </label>
              <select
                value={selectedClinicId}
                onChange={(e) => {
                  setSelectedClinicId(e.target.value);
                  setSelectedDoctorId("");
                  setSlots([]);
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-100"
              >
                <option value="">Select a clinic</option>
                {clinics.map((clinic) => (
                  <option key={clinic._id} value={clinic._id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Doctor
              </label>
              <select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
                disabled={!selectedClinicId}
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-100 disabled:cursor-not-allowed disabled:bg-slate-100"
              >
                <option value="">Select a doctor</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    {doctor.name} - {doctor.specialization}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="Preferred date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-600">
                {selectedDoctorId && date
                  ? `${doctors.find((doctor) => doctor._id === selectedDoctorId)?.name || "Doctor"} availability for ${date}`
                  : "Select doctor and date to view slots"}
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6">
              <ErrorMessage message={error} />
            </div>
          )}
          {success && (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {success}
            </div>
          )}

          {slotsLoading && (
            <div className="mt-6">
              <LoadingSpinner text="Loading available slots..." />
            </div>
          )}

          {!slotsLoading && selectedDoctorId && date && slots.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-4 text-lg font-semibold text-slate-900">
                Available time slots
              </h2>
              <div className="flex flex-wrap gap-3">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setSelectedSlot(slot)}
                    className={`rounded-xl border px-4 py-2 text-sm font-medium transition ${
                      selectedSlot === slot
                        ? "border-teal-600 bg-teal-600 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-teal-300 hover:text-teal-700"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!slotsLoading && selectedDoctorId && date && slots.length === 0 && (
            <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
              No available slots for this doctor on the selected date.
            </div>
          )}

          <div className="mt-8">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Reason for visit
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Briefly describe your concern"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-slate-800 shadow-sm outline-none focus:border-teal-400 focus:ring-3 focus:ring-teal-100"
            />
          </div>

          <div className="mt-8 flex justify-end">
            <Button type="submit" disabled={submitting || !selectedSlot}>
              {submitting ? "Booking..." : "Confirm appointment"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
