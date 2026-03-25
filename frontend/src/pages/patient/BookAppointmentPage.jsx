import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

const BookAppointmentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get(`/api/patient/case/${id}/report`);
      setCaseData(res.data);

      // fetch doctor created slots
      const slotsRes = await api.get(`/api/patient/case/${id}/slots`);
      setSlots(slotsRes.data);

    } catch (err) {
      console.error("Error loading case:", err);
      setError("Unable to load case information. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {

    if (!selectedSlot) {
      alert("Please select a consultation slot");
      return;
    }

    try {

      await api.post(`/api/patient/book-slot`, {
        slot_id: selectedSlot
      });

      alert("Appointment booked successfully");

      navigate(`/patient/case/${id}`);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "Failed to book appointment");
    }

  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading case information...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-600">
        {error}
      </div>
    );
  }
  const formatTime = (time) => {
    const [hour, minute] = time.split(":");

    let h = parseInt(hour);
    const ampm = h >= 12 ? "PM" : "AM";

    h = h % 12;
    h = h ? h : 12;

    return `${h}:${minute} ${ampm}`;
  };
  const groupedSlots = slots.reduce((acc, slot) => {

    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }

    acc[slot.date].push(slot);

    return acc;

  }, {});

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">

      <div className="bg-white max-w-3xl w-full p-12 rounded-3xl shadow-lg space-y-10 border border-gray-100">

        {/* HEADER */}
        <div>
          <h2 className="text-3xl font-bold text-slate-900">
            Schedule Consultation
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Book a specialist consultation based on your medical report.
          </p>
        </div>

        {/* DOCTOR INFO */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 grid grid-cols-2 gap-6">

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Doctor
            </p>

            <p className="text-lg font-semibold text-gray-800">
              Dr {caseData?.doctor_name || "Specialist"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Specialization
            </p>

            <p className="text-lg font-semibold text-gray-800">
              {caseData?.doctor_specialization || "Neurology"}
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Experience
            </p>

            <p className="text-gray-700">12+ Years</p>
          </div>

          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Consultation Mode
            </p>

            <p className="text-gray-700">In-person / Hospital Visit</p>
          </div>

        </div>

        {/* CONSULTATION PURPOSE */}
        {caseData && (

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">

            <p className="text-xs text-gray-500 uppercase tracking-wide">
              Consultation For
            </p>

            <p className="text-xl font-semibold text-blue-900 mt-1">
              {caseData.final_diagnosis}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              Specialist evaluation based on your AI medical report and doctor review.
            </p>

          </div>

        )}

        {/* AVAILABLE SLOTS */}
        {/* AVAILABLE SLOTS */}
        {/* AVAILABLE SLOTS */}

        <div>

          <label className="text-sm font-medium text-gray-700">
            Available Consultation Slots
          </label>

          {slots.length === 0 ? (

            <p className="text-sm text-gray-500 mt-3">
              No consultation slots available yet. Please check again later.
            </p>

          ) : (

            Object.keys(groupedSlots).map((date) => (

              <div key={date} className="mt-5">

                <h4 className="font-semibold text-gray-700 mb-3">

                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}

                </h4>

                <div className="grid grid-cols-4 gap-3">

                  {groupedSlots[date].map((slot) => (

                    <button
                      key={slot._id}
                      disabled={slot.booked}
                      onClick={() => {
                        setSelectedSlot(slot._id);
                        setDate(slot.date);
                        setTime(slot.time);
                      }}
                      className={`border rounded-lg py-2 text-sm font-medium transition
${selectedSlot === slot._id
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-white hover:bg-gray-50"}
${slot.booked ? "opacity-50 cursor-not-allowed" : ""}
`}
                    >

                      {formatTime(slot.time)}

                    </button>

                  ))}

                </div>

              </div>

            ))

          )}

        </div>

        {/* SUMMARY */}
        {selectedSlot && (

          <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg border">

            Appointment Scheduled For
            <span className="font-semibold"> {date}</span> at
            <span className="font-semibold"> {time}</span>

          </div>

        )}

        {/* NOTE */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          This consultation allows a specialist to review your results and guide
          the next steps in your neurological care.
        </div>

        {/* BOOK BUTTON */}
        <button
          onClick={handleBook}
          disabled={!selectedSlot}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl w-full font-semibold shadow-md transition"
        >
          Confirm Consultation Booking
        </button>

      </div>

    </div>
  );
};

export default BookAppointmentPage;