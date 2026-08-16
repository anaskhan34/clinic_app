import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../api/api";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button";
import Input from "../../components/Input";

const fallbackClinics = [
  {
    _id: "clinic-1",
    name: "Al-Shifa Medical Center",
    city: "Islamabad",
    address: "Sector F-8, Islamabad",
    description: "State-of-the-art cardiology and general medicine consulting clinic.",
    openingTime: "09:00",
    closingTime: "17:00",
  },
  {
    _id: "clinic-2",
    name: "City Care Clinic",
    city: "Lahore",
    address: "Gulberg III, Lahore",
    description: "Comprehensive pediatric care, vaccination services, and dermatology consultations.",
    openingTime: "10:00",
    closingTime: "18:00",
  },
  {
    _id: "clinic-3",
    name: "Clifton Healthcare",
    city: "Karachi",
    address: "Block 5, Clifton, Karachi",
    description: "Multi-specialty outpatient services including dentistry and ophthalmology.",
    openingTime: "09:00",
    closingTime: "20:00",
  },
];

const fallbackDoctors = [
  {
    _id: "doc-1",
    name: "Dr. Sarah Khan",
    specialization: "Cardiologist",
    experience: 12,
    consultationFee: 2500,
    clinicId: { name: "Al-Shifa Medical Center", _id: "clinic-1" },
    available: true,
  },
  {
    _id: "doc-2",
    name: "Dr. Faisal Mahmood",
    specialization: "Dermatologist",
    experience: 8,
    consultationFee: 1800,
    clinicId: { name: "City Care Clinic", _id: "clinic-2" },
    available: true,
  },
  {
    _id: "doc-3",
    name: "Dr. Ayesha Yousuf",
    specialization: "Pediatrician",
    experience: 10,
    consultationFee: 2000,
    clinicId: { name: "Clifton Healthcare", _id: "clinic-3" },
    available: true,
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);

  // Search form fields
  const [searchName, setSearchName] = useState("");
  const [searchSpecialization, setSearchSpecialization] = useState("");
  const [searchClinic, setSearchClinic] = useState("");
  const [searchCity, setSearchCity] = useState("");

  // FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  useEffect(() => {
    const fetchPublicData = async () => {
      // Only fetch from API if user is authenticated to avoid 401 console logs
      if (user) {
        try {
          const [clinicsRes, doctorsRes] = await Promise.all([
            api.get("/clinics"),
            api.get("/doctors"),
          ]);
          setClinics(clinicsRes.data.data || []);
          setDoctors(doctorsRes.data.data || []);
        } catch (err) {
          console.log("Could not load real data for public view, falling back to static visual items.", err);
        }
      }
    };

    fetchPublicData();
  }, [user]);

  const displayClinics = clinics.length > 0 ? clinics.slice(0, 3) : fallbackClinics;
  const displayDoctors = doctors.length > 0 ? doctors.slice(0, 3) : fallbackDoctors;

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (searchClinic) query.append("clinicId", searchClinic);
    if (searchSpecialization) query.append("specialization", searchSpecialization);
    // Go to doctors search page with query parameters
    navigate(`/doctors?${query.toString()}`);
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book an appointment?",
      answer: "First, sign in to your patient account. Browse our Clinics or Doctors directories, select your preferred date, pick an available time slot, enter a reason for your visit, and confirm the booking.",
    },
    {
      question: "Can I choose my doctor?",
      answer: "Absolutely. You can filter doctors by clinic, specialization, and availability to find the provider that best fits your medical needs.",
    },
    {
      question: "Can I see available appointment times?",
      answer: "Yes. Our booking engine integrates directly with each doctor's live calendar to show real-time available 30-minute slots. Booked slots are hidden dynamically.",
    },
    {
      question: "Can I cancel an appointment?",
      answer: "Yes, patients can cancel their own scheduled appointments at any time from their 'My Appointments' page on the dashboard.",
    },
    {
      question: "Do I need an account to book?",
      answer: "Yes, an account is required to book appointments. This secures your queue slots, generates your official queue number, and lets doctors review your booking details.",
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-teal-50 via-white to-sky-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl grid items-center gap-12 md:grid-cols-2">
          <div className="space-y-6">
            <span className="inline-flex rounded-full bg-teal-100/70 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-teal-800">
              ⚡ Health Tech Platform
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl lg:text-6xl leading-[1.1]">
              Simple appointments for a <span className="text-teal-600 bg-gradient-to-r from-teal-600 to-sky-600 bg-clip-text text-transparent">healthier life</span>.
            </h1>
            <p className="text-lg text-slate-600 max-w-lg leading-relaxed">
              Discover nearby clinics, consult with certified medical specialists, and secure your appointment slots in under a minute.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link to={user ? "/book-appointment" : "/login"}>
                <Button className="px-6 py-3 text-base shadow-sm">Book an Appointment</Button>
              </Link>
              <Link to="/doctors">
                <Button variant="outline" className="px-6 py-3 text-base shadow-xs">
                  Find a Doctor
                </Button>
              </Link>
            </div>
          </div>

          {/* Clean Healthcare Visual */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white/60 p-6 shadow-xl backdrop-blur-sm relative">
              <div className="absolute -top-4 -left-4 w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-2xl font-bold shadow-md">
                🏥
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <span className="text-3xl">👨‍⚕️</span>
                  <div>
                    <h3 className="font-bold text-slate-800">ClinicFlow Connect</h3>
                    <p className="text-xs text-teal-700 font-semibold">Verified Doctors Directory</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-650 text-slate-600">Active Clinics</span>
                    <span className="text-lg font-bold text-slate-850 text-slate-900">12+</span>
                  </div>
                  <div className="flex justify-between items-center rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-650 text-slate-600">Total Specialists</span>
                    <span className="text-lg font-bold text-slate-850 text-slate-900">25+</span>
                  </div>
                  <div className="flex justify-between items-center rounded-xl bg-slate-50 p-3">
                    <span className="text-sm font-semibold text-slate-650 text-slate-600">Patient Satisfaction</span>
                    <span className="text-lg font-bold text-teal-700">96%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Search Section */}
      <section className="mx-auto max-w-5xl px-4 -mt-10 relative z-10">
        <form
          onSubmit={handleSearch}
          className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg space-y-4"
        >
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Quick Search Directory</p>
          <div className="grid gap-4 sm:grid-cols-4 items-end">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Doctor Name</label>
              <input
                type="text"
                placeholder="Dr. Smith"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">Specialization</label>
              <input
                type="text"
                placeholder="e.g. Cardiologist"
                value={searchSpecialization}
                onChange={(e) => setSearchSpecialization(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-500">City</label>
              <input
                type="text"
                placeholder="e.g. Islamabad"
                value={searchCity}
                onChange={(e) => setSearchCity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400"
              />
            </div>
            <div>
              <button
                type="submit"
                className="w-full rounded-xl bg-teal-650 bg-teal-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-teal-700 transition"
              >
                Search Doctors
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* 3. Why Choose ClinicFlow */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Platform Features</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Why Choose ClinicFlow?</h2>
          <p className="mt-2 text-slate-550 text-slate-500 max-w-xl mx-auto">Providing a seamless, tech-enabled clinical visit booking system.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">📅</span>
            <h4 className="mt-4 font-bold text-slate-800 text-lg">Easy Online Booking</h4>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">Book consultations instantly online. Say goodbye to long wait times and busy phones.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">👨‍⚕️</span>
            <h4 className="mt-4 font-bold text-slate-800 text-lg">Find Qualified Doctors</h4>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">Filter certified physicians by their specialization, clinics, and customer fee ranges.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">⏱️</span>
            <h4 className="mt-4 font-bold text-slate-800 text-lg">Real-Time Slots</h4>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">Select live available time slots directly from each doctor's schedule calendar.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">🔒</span>
            <h4 className="mt-4 font-bold text-slate-800 text-lg">Secure Patient Experience</h4>
            <p className="mt-2 text-sm text-slate-500 leading-relaxed">Your health records, reason details, and history data are safely secured with JWT safeguards.</p>
          </div>
        </div>
      </section>

      {/* 4. How It Works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Patient Workflow</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">How It Works</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-3 relative">
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">1</div>
              <h4 className="font-bold text-slate-800">Find a Doctor</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">Search through clinics, select specialties, and explore doctor qualifications.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">2</div>
              <h4 className="font-bold text-slate-800">Choose Available Time</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">Pick an open 30-minute time slot on a calendar date that fits your daily routine.</p>
            </div>
            <div className="text-center space-y-3">
              <div className="mx-auto w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">3</div>
              <h4 className="font-bold text-slate-800">Book Appointment</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto leading-relaxed">Enter your consultation reason and book. You'll receive a queue number instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured Doctors */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Team Specialists</p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Featured Doctors</h2>
          </div>
          <Link to="/doctors" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition">
            View All Doctors →
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayDoctors.map((doctor) => (
            <div key={doctor._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  {doctor.image ? (
                    <img src={doctor.image} alt={doctor.name} className="h-14 w-14 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 text-sky-700 font-bold">
                      {doctor.name?.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-snug">{doctor.name}</h3>
                    <p className="text-xs font-semibold text-teal-700 uppercase tracking-wider">{doctor.specialization}</p>
                  </div>
                </div>
                <div className="space-y-1 text-sm text-slate-500 mb-6">
                  <p>💼 {doctor.experience} years experience</p>
                  <p>🏥 {doctor.clinicId?.name}</p>
                  <p className="font-bold text-slate-700">PKR {doctor.consultationFee}</p>
                </div>
              </div>
              <Link to={user ? `/book-appointment?doctorId=${doctor._id}&clinicId=${doctor.clinicId?._id}` : "/login"}>
                <button className="w-full rounded-xl bg-teal-50 border border-teal-100 py-2.5 text-xs font-bold text-teal-700 hover:bg-teal-100 transition">
                  View Profile & Book
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Clinics Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-end mb-10">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Locations</p>
              <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Featured Clinics</h2>
            </div>
            <Link to="/clinics" className="text-sm font-bold text-teal-600 hover:text-teal-700 transition">
              View All Clinics →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayClinics.map((clinic) => (
              <div key={clinic._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">{clinic.name}</h3>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-2xs font-semibold text-teal-750 text-teal-700 uppercase tracking-wide">
                      {clinic.city}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{clinic.description || "Comprehensive outpatient clinic services."}</p>
                  <p className="text-xs text-slate-400 mb-6">📍 {clinic.address}</p>
                </div>
                <Link to={user ? `/doctors?clinicId=${clinic._id}` : "/login"}>
                  <button className="w-full rounded-xl bg-slate-50 border border-slate-150 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 transition">
                    View Clinic Doctors
                  </button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. Appointment CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-r from-teal-650 to-teal-600 bg-teal-600 text-white relative">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold md:text-4xl leading-tight">
            Your health deserves the right care.
          </h2>
          <p className="text-teal-100 max-w-lg mx-auto text-base">
            Join thousands of patients who book and manage consultations effortlessly through ClinicFlow.
          </p>
          <div className="pt-4">
            <Link to={user ? "/book-appointment" : "/login"}>
              <button className="rounded-xl bg-white px-6 py-3 font-semibold text-teal-750 text-teal-700 hover:bg-slate-50 transition shadow-md">
                Book an Appointment Now
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* 8. Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">Patient Stories</p>
          <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">What Patients Say</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 italic leading-relaxed">
              "Booking appointments was always a chore. With ClinicFlow, I selected my doctor, chose F-8 Islamabad clinic, checked available slots, and was booked in seconds. Queue details were spot on!"
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl">👩</span>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">Amina Malik</h5>
                <p className="text-2xs text-slate-400 uppercase tracking-wide font-semibold">Patient, Islamabad</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 italic leading-relaxed">
              "I love how I can see the exact available slots of my doctor on a specific date. No more call-backs. Extremely simple interface, fast registration, and direct queue visibility."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl">🧑</span>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">Zain Ahmed</h5>
                <p className="text-2xs text-slate-400 uppercase tracking-wide font-semibold">Patient, Lahore</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500 italic leading-relaxed">
              "Outstanding patient experience. I booked from my mobile, went directly at the slot time, and was called in based on my queue number. Highly recommended medical booking solution."
            </p>
            <div className="mt-4 flex items-center gap-3">
              <span className="text-2xl">👨</span>
              <div>
                <h5 className="font-bold text-slate-800 text-sm">Fahad Raza</h5>
                <p className="text-2xs text-slate-400 uppercase tracking-wide font-semibold">Patient, Karachi</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 border-t border-b border-slate-200">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-700">FAQ</p>
            <h2 className="mt-3 text-3xl font-extrabold text-slate-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left font-bold text-slate-850 text-slate-800 hover:bg-slate-50/50 transition gap-4 outline-none"
                >
                  <span>{faq.question}</span>
                  <span className="text-teal-600 text-lg">{openFaqIndex === index ? "−" : "+"}</span>
                </button>
                {openFaqIndex === index && (
                  <div className="px-6 pb-4 text-sm text-slate-500 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800">
        <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
                C
              </div>
              <span className="text-lg font-bold text-white">ClinicFlow</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-450">
              ClinicFlow streamlines medical appointments connecting patients, doctors, and clinic admins in a single online queue dashboard.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Quick Links</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/clinics" className="hover:text-white transition">Clinics Directory</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition">Doctors Directory</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Authentication</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/login" className="hover:text-white transition">Login Portal</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition">Patient Registration</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-white mb-4">Contact Information</h4>
            <p className="text-xs leading-relaxed text-slate-450 mb-2">
              📍 Karachi, Pakistan
            </p>
            <p className="text-xs leading-relaxed text-slate-450 mb-2">
              📧 support@clinicflow.com
            </p>
            <p className="text-xs leading-relaxed text-slate-450">
              📞 +92 xx xxxxxxx
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-12 pt-8 border-t border-slate-800 text-center text-2xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} ClinicFlow. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="cursor-pointer hover:text-white transition">Privacy Policy</span>
            <span className="cursor-pointer hover:text-white transition">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
