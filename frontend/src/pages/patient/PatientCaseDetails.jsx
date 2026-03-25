import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom"; // Add useSearchParams here
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";
import { useAuth } from "../../context/AuthContext";
import CaseProgressTracker from "../../components/case/CaseProgressTracker";
import CaseActions from "../../components/case/CaseActions";
import MMSESlotSelector from "../../components/case/MMSESlotSelector";
import {
  FaCheckCircle,
  FaUserCircle,
  FaInfoCircle,
  FaArrowLeft,
  FaCalendarAlt, // Add this
  FaClock        // Add this
} from "react-icons/fa";
import toast from "react-hot-toast";

const PatientCaseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const [searchParams] = useSearchParams(); // This now works because of the import above

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startCognitive, setStartCognitive] = useState(false);

  // Define this so your logic below doesn't break
  const isFormActive = startCognitive || searchParams.get("startCognitive") === "true";

  useEffect(() => {
    fetchCase();
  }, [id]);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!caseData) return <div className="p-6">Case not found.</div>;
  const getActiveStep = (status) => {
    const statusMap = {
      "submitted": 1,
      "awaiting_patient_test_choice": 2,
      "awaiting_cognitive_form": 3,
      "test_requested": 3,
      "test_submitted": 4,
      "awaiting_mmse_slot_selection": 4,
      "mmse_confirmed": 4,
      "ai_completed": 4,
      "reviewed": 5,
      "closed": 5
    };
    return statusMap[status] || 1;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">

      <div className="bg-white max-w-5xl mx-auto rounded-3xl shadow-xl p-10 space-y-10">

        {/* HEADER */}
        <div className="flex justify-between items-start">

          <div>
            <h2 className="text-3xl font-bold text-gray-800">
              {caseData.subject}
            </h2>

            <p className="text-sm text-gray-500 mt-2">
              Case ID: {caseData._id?.slice(-6)}
            </p>
          </div>

          <StatusBadge status={caseData.status} />

        </div>

        <div className="border-t"></div>

        {/* PROGRESS TRACKER */}
        <CaseProgressTracker currentStep={getActiveStep(caseData.status)} />

        {/* ================= PATIENT INFO ================= */}
        <div>

          <h3 className="text-xl font-bold text-blue-700 mb-5">
            Patient Information
          </h3>

          <div className="grid grid-cols-2 gap-5">

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-sm">
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-lg font-semibold text-gray-800">
                {caseData.name}
              </p>
            </div>

            <div className="bg-green-50 p-5 rounded-xl border border-green-100 shadow-sm">
              <p className="text-sm text-gray-500">Age</p>
              <p className="text-lg font-semibold text-gray-800">
                {caseData.age}
              </p>
            </div>

            <div className="bg-purple-50 p-5 rounded-xl border border-purple-100 shadow-sm">
              <p className="text-sm text-gray-500">Gender</p>
              <p className="text-lg font-semibold text-gray-800">
                {caseData.gender}
              </p>
            </div>

            {caseData.email && (
              <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-lg font-semibold text-gray-800">
                  {caseData.email}
                </p>
              </div>
            )}

            {caseData.contact_number && (
              <div className="bg-pink-50 p-5 rounded-xl border border-pink-100 shadow-sm">
                <p className="text-sm text-gray-500">Contact Number</p>
                <p className="text-lg font-semibold text-gray-800">
                  {caseData.contact_number}
                </p>
              </div>
            )}

          </div>

        </div>

        <div className="border-t"></div>

        {/* ================= CASE DETAILS ================= */}
        <div>

          <h3 className="text-xl font-bold text-blue-700 mb-5">
            Case Details
          </h3>

          <div className="grid grid-cols-2 gap-5">

            <div className="bg-orange-50 p-5 rounded-xl border border-orange-100 shadow-sm">
              <p className="text-sm text-gray-500">Duration</p>
              <p className="text-lg font-semibold text-gray-800">
                {caseData.duration}
              </p>
            </div>

            <div className="bg-yellow-50 p-5 rounded-xl border border-yellow-100 shadow-sm">
              <p className="text-sm text-gray-500">Severity</p>

              <span className="inline-block mt-1 px-3 py-1 rounded-full text-sm font-semibold bg-yellow-200 text-yellow-800">
                {caseData.severity}
              </span>

            </div>

          </div>

          {caseData.description && (

            <div className="bg-gray-50 border border-gray-200 p-5 rounded-xl mt-5">

              <p className="text-sm text-gray-500 mb-1">
                Description
              </p>

              <p className="text-gray-800 leading-relaxed">
                {caseData.description}
              </p>

            </div>

          )}

        </div>

        {/* ================= SYMPTOMS ================= */}
        <div>

          <h3 className="text-xl font-bold text-blue-700 mb-5">
            Reported Symptoms
          </h3>

          <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">

            <div className="flex flex-wrap gap-3">

              {caseData.symptoms?.map((symptom, index) => (

                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm hover:bg-blue-200 transition"
                >
                  {symptom}
                </span>

              ))}

            </div>

          </div>

        </div>


        {/* ================= CHOOSE TEST ================= */}
        {caseData.suspected_disease && !caseData.selected_test && (

          <>
            <div className="border-t"></div>

            <div className="bg-white border p-6 rounded-xl">

              <h3 className="text-lg font-semibold mb-4">
                Next Step
              </h3>

              <p className="text-gray-600 mb-4">
                The doctor has suggested diagnostic tests.
                Please choose a test to continue.
              </p>

              <button
                onClick={() => navigate(`/patient/case/${id}/select-test`)}
                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700"
              >
                Choose Diagnostic Test →
              </button>

            </div>
          </>

        )}

        {/* ================= TEST SELECTED ================= */}
        {/* ================= TEST SELECTED ================= */}
{/* ================= TEST SELECTED & SUBMISSION AREA ================= */}
{caseData.selected_test && caseData.status !== "finalized" && (
  <>
    <div className="border-t"></div>

    {/* 1. TEST SELECTED CARD (PURPLE) */}
    <div className="bg-purple-50 border border-purple-200 p-8 rounded-[2rem] shadow-sm space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-purple-900 mb-1">
            Test Selected
          </h3>
          <p className="text-purple-700 capitalize font-medium">
            {caseData.selected_test.replace('_', ' ')} test has been selected.
          </p>
        </div>
        <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-purple-200">
          Required Action
        </span>
      </div>

      {/* --- INSTRUCTIONS: REVEALED ONLY AFTER BUTTON CLICK FOR UPLOAD TESTS --- */}
      {startCognitive && (caseData.selected_test === "mri" || caseData.suspected_disease?.toLowerCase().includes("multiple")) && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-2xl animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-2 mb-3 text-blue-800">
            <FaInfoCircle />
            <h4 className="font-bold text-sm uppercase tracking-wider">MRI Analysis Protocol</h4>
          </div>
          <ul className="text-xs text-blue-700 space-y-2 list-disc ml-5 font-medium leading-relaxed">
            <li>Please ensure you provide high-resolution DICOM or JPEG/PNG files of the brain scan.</li>
            <li>The analysis focuses on T2-weighted or FLAIR sequences for lesion detection.</li>
            <li>Maximum file size allowed is 50MB.</li>
            <li>Ensure the patient's face is not visible in the scan for privacy compliance.</li>
          </ul>
        </div>
      )}

      {/* --- ACTION BUTTONS --- */}
      <div className="pt-2">
        {caseData.selected_test === "cognitive" ? (
          /* Cognitive Assessment Logic */
          caseData.status === "awaiting_cognitive_form" ? (
            <button
              onClick={() => navigate(`/patient/case/${id}/cognitive-test`)}
              className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition shadow-xl shadow-purple-100 flex items-center gap-2"
            >
              Start Cognitive Assessment →
            </button>
          ) : (
            <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-bold border border-emerald-200 w-fit">
              <FaCheckCircle className="text-xl" />
              <span>Cognitive Assessment Completed</span>
            </div>
          )
        ) : (
          /* MRI / Audio / Features Logic */
          caseData.status === "test_requested" ? (
            !startCognitive ? (
              <button
                onClick={() => setStartCognitive(true)}
                className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-purple-700 transition shadow-xl shadow-purple-100 flex items-center gap-2"
              >
                Upload Test Data →
              </button>
            ) : (
              <p className="text-purple-600 text-sm font-bold animate-pulse">
                Please follow instructions and upload file below...
              </p>
            )
          ) : (
            <div className="flex items-center gap-3 bg-emerald-100 text-emerald-700 px-6 py-4 rounded-2xl font-bold border border-emerald-200 w-fit">
              <FaCheckCircle className="text-xl" />
              <span>Test Data Submitted Successfully</span>
            </div>
          )
        )}
      </div>
    </div>

    {/* 2. TEST SUBMISSION BOX (REVEALED BELOW PURPLE CARD) */}
    {((caseData.selected_test !== "cognitive" && startCognitive && caseData.status === "test_requested") ||
      (caseData.selected_test === "cognitive" && isFormActive)) && (
      <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-gray-800">
            {caseData.selected_test === 'cognitive' ? 'Clinical Assessment' : 'Test Submission'}
          </h3>
        </div>

        <CaseActions
          caseData={caseData}
          role={role}
          onChooseTest={async (test) => {
            await api.post(`/cases/${id}/choose-test`, { selected_test: test });
            fetchCase();
          }}
          onUpload={async (file) => {
            const formData = new FormData();
            formData.append("file", file);
            await api.post(`/cases/${id}/upload-file`, formData, {
              headers: { "Content-Type": "multipart/form-data" },
            });
            fetchCase();
          }}
          onSelectSlot={async (slot) => {
            await api.post(`/cases/${id}/select-mmse-slot`, { selected_slot: slot });
            fetchCase();
          }}
          onSubmitCognitive={async (data) => {
            await api.post(`/cases/${id}/submit-cognitive`, data);
            navigate(`/patient/case/${id}`, { replace: true });
            fetchCase();
          }}
        />
      </div>
    )}
  </>
)}
        {/* ================= APPOINTMENT BOOKING / CONFIRMATION ================= */}
        {/* ================= APPOINTMENT BOOKING SECTION ================= */}
        {caseData.selected_test === "cognitive" &&
          caseData.status === "awaiting_mmse_slot_selection" &&
          !caseData.selected_mmse_slot && ( // Only show if NOT already booked
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
              <MMSESlotSelector
                slots={caseData.mmse_slots}
                onSelect={async (slot) => {
                  try {
                    await api.post(`/cases/${id}/select-mmse-slot`, { selected_slot: slot });
                    toast.success("Appointment Booked!");
                    fetchCase();
                  } catch (err) {
                    toast.error("Failed to book slot");
                  }
                }}
              />
            </div>
          )}

        {/* ================= SHOW CONFIRMED APPOINTMENT ================= */}
        {caseData.selected_mmse_slot && (
          <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl backdrop-blur-md">
                📅
              </div>
              <div>
                <h3 className="text-xl font-bold">Appointment Confirmed</h3>
                <div className="flex flex-wrap gap-4 mt-2 text-blue-100 font-medium">
                  <span className="flex items-center gap-2">
                    <FaCalendarAlt /> {new Date(caseData.selected_mmse_slot).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-2">
                    <FaClock /> {new Date(caseData.selected_mmse_slot).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-center md:text-right">
              <span className="inline-block px-4 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20">
                Status: {caseData.status === 'mmse_confirmed' ? 'Awaiting Doctor' : 'Ready'}
              </span>
              <p className="text-[10px] text-blue-200 mt-2 italic">Please be online 5 minutes before the start.</p>
            </div>
          </div>
        )}
        {/* ================= FINAL REPORT ================= */}
        {(caseData.status === "finalized" || caseData.status === "closed") && (

          <div className="mt-6">

            <button
              onClick={() => navigate(`/patient/case/${id}/report`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl"
            >
              View Final Report
            </button>

          </div>

        )}

        {/* ================= BACK BUTTON ================= */}
        <div className="pt-6">

          <button
            onClick={() => navigate("/patient/dashboard")}
            className="text-blue-600 hover:underline"
          >
            ← Back to Dashboard
          </button>

        </div>


      </div>
    </div>
  );
};

export default PatientCaseDetails;