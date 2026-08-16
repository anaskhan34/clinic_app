import { useEffect, useState } from "react";
import api from "../../api/api";
import Button from "../../components/Button";
import ErrorMessage from "../../components/ErrorMessage";
import LoadingSpinner from "../../components/LoadingSpinner";
import { useAuth } from "../../context/AuthContext";

const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const defaultDaySettings = {
  start: "09:00",
  end: "17:00",
  enabled: true,
};

export default function DoctorSchedulePage() {
  const { user } = useAuth();
  const [schedule, setSchedule] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/doctors/${user.doctorId}`);
      const doctorData = response.data.data;
      
      // Initialize schedule with defaults if not present
      const initialSchedule = {};
      daysOfWeek.forEach((day) => {
        initialSchedule[day] = doctorData.schedule?.[day] || { ...defaultDaySettings };
      });
      
      setSchedule(initialSchedule);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.doctorId) {
      fetchSchedule();
    }
  }, [user]);

  const handleTimeChange = (day, field, value) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }));
  };

  const handleToggle = (day) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await api.put(
        `/doctors/${user.doctorId}`,
        { schedule },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setSuccess("Working hours updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save schedule.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your schedule..." />;
  }

  return (
    <div className="flex-1 p-6 md:p-10 max-w-4xl mx-auto">
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-700">
          Availability
        </p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          My Working Schedule
        </h1>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3 pl-2">Day</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Start Time</th>
                  <th className="pb-3">End Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daysOfWeek.map((day) => {
                  const dayData = schedule[day] || { ...defaultDaySettings };
                  return (
                    <tr key={day} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 pl-2 font-bold capitalize text-slate-800">
                        {day}
                      </td>
                      <td className="py-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={dayData.enabled}
                            onChange={() => handleToggle(day)}
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-350 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-teal-600"></div>
                          <span className="ml-2 text-sm text-slate-600">
                            {dayData.enabled ? "Active" : "Off-duty"}
                          </span>
                        </label>
                      </td>
                      <td className="py-4">
                        <input
                          type="time"
                          value={dayData.start}
                          onChange={(e) => handleTimeChange(day, "start", e.target.value)}
                          disabled={!dayData.enabled}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-teal-400 disabled:bg-slate-55 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </td>
                      <td className="py-4">
                        <input
                          type="time"
                          value={dayData.end}
                          onChange={(e) => handleTimeChange(day, "end", e.target.value)}
                          disabled={!dayData.enabled}
                          className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 outline-none focus:border-teal-400 disabled:bg-slate-55 disabled:cursor-not-allowed disabled:bg-slate-100"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {error && <ErrorMessage message={error} />}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 font-semibold">
              {success}
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving working hours..." : "Save Schedule"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
