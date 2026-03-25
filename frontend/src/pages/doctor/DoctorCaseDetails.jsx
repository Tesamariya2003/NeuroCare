import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { clinicalQuestions } from "../../data/clinicalQuestions";

const DoctorCaseDetails = () => {
  const { id } = useParams();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [disease, setDisease] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCase();
  }, []);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch (error) {
      toast.error("Failed to fetch case");
    } finally {
      setLoading(false);
    }
  };

  // Logic to handle MMSE slot selection redirect
  useEffect(() => {
    if (caseData?.status === "awaiting_mmse_slot_selection") {
      navigate(`/doctor/case/${id}/review`);
    }
  }, [caseData, id, navigate]);

  const handleSuspect = async (selectedDisease) => {
    try {
      await api.post(`/cases/doctor/suspect/${id}`, {
        suspected_disease: selectedDisease,
      });

      toast.success("Suspected disease set");
      fetchCase();
    } catch (error) {
      toast.error("Failed to set disease");
    }
  };

  if (loading) return <Loader />;
  if (!caseData) return <div className="p-6">Case not found</div>;
  console.log(caseData)

const steps = [
  "submitted",
  "awaiting_patient_test_choice",
  "test_submitted",
  "ai_completed",
  "reviewed",
  "closed"
];

  const currentStepIndex = steps.indexOf(caseData.status);

  const handleEdit = () => {
    navigate(`/doctor/case/${id}/result`);
  };

  const questionMap = {};

  Object.values(clinicalQuestions).forEach(group => {
    group.forEach(q => {
      questionMap[q.key] = q.question;
    });
  });
  const answers = caseData?.questionnaire_answers || []

  let redFlags = []
  let correlation = ""

  if (answers.some(a => a.question.includes("voice"))) {
    redFlags.push("Voice Weakness")
  }

  if (answers.some(a => a.question.includes("pronouncing"))) {
    redFlags.push("Speech Difficulty")
  }

  if (answers.some(a => a.question.includes("find the right words"))) {
    redFlags.push("Word Retrieval Difficulty")
  }

  if (redFlags.length > 0) {
    correlation =
      "Speech abnormalities detected in questionnaire responses. Neurological evaluation recommended."
  }
  return (
    <div className="bg-white p-10 rounded-3xl shadow-lg max-w-5xl mx-auto space-y-8">

      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-6">

        <div className="flex items-center gap-4">

          <h2 className="text-2xl font-bold">
            {caseData.subject}
          </h2>

          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold capitalize">
            {caseData.status.replaceAll("_", " ")}
          </span>

        </div>

        {/* ACTION BUTTONS */}

        <div className="flex gap-3">

          {(caseData.status === "ai_completed" || caseData.status === "reviewed") && (
  <button
    onClick={handleEdit}
    className="text-blue-600 text-sm font-medium hover:underline"
  >
    Edit Review
  </button>
)}

          {(caseData.status === "finalized" || caseData.status === "closed") && (
            <button
              onClick={() => navigate(`/doctor/case/${id}/result`)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              View Final Report
            </button>
          )}

        </div>

      </div>

      {/* PATIENT INFO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-y-12 gap-x-8 bg-slate-50/30 p-10 rounded-[2rem] border border-slate-100 shadow-sm">

        {/* Column 1: Patient Name */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Patient Name</p>
          <p className="text-xl font-semibold text-slate-800 tracking-tight capitalize">{caseData.name}</p>
        </div>

        {/* Column 2: Age */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Patient Age</p>
          <p className="text-xl font-semibold text-slate-800 tracking-tight">{caseData.age} Years</p>
        </div>

        {/* Column 3: Gender */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Gender</p>
          <p className="text-xl font-semibold text-slate-800 tracking-tight capitalize">{caseData.gender}</p>
        </div>

        {/* Column 4: Duration */}
        <div className="space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
          <p className="text-xl font-semibold text-slate-800 tracking-tight">{caseData.duration || "N/A"}</p>
        </div>

        {/* Severity with a more subtle pill */}
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Severity</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border 
      ${caseData.severity?.toLowerCase() === 'severe'
              ? 'bg-rose-50 text-rose-600 border-rose-100'
              : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse"></span>
            {caseData.severity || "Standard"}
          </span>
        </div>
      </div>

      {/* 2. PATIENT DESCRIPTION (LONG FORM) */}
      {caseData.description && (
        <div className="p-8 bg-white border border-slate-100 rounded-[2rem] shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
            Detailed Patient Complaint
          </p>
          <p className="text-slate-600 leading-relaxed italic font-medium text-base">
            "{caseData.description}"
          </p>
        </div>
      )}

      {/* SYMPTOMS SECTION */}
      <div>
        <p className="text-sm text-gray-500 mb-3">Symptoms</p>
        <div className="flex flex-wrap gap-3">
          {caseData.symptoms?.map((symptom, index) => (
            <span
              key={index}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium"
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>

      {caseData.follow_up_answers && (

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6">

          <h3 className="font-semibold text-gray-800 mb-4">
            Clinical Questionnaire
          </h3>

          <div className="space-y-3">

            {Object.entries(caseData.follow_up_answers).map(([key, value]) => (

              <div key={key} className="flex justify-between border-b pb-2 text-sm">

                <span className="text-gray-700">
                  {questionMap[key] || key}
                </span>

                <span className="font-medium text-indigo-600">
                  {value}
                </span>

              </div>

            ))}

          </div>

        </div>

      )}
      {/* AI CLINICAL INSIGHTS */}

      {caseData && (() => {

        const answers = caseData?.follow_up_answers || {}

        let redFlags = []
        let correlation = ""

        Object.entries(answers).forEach(([key, value]) => {

          const answer = String(value).toLowerCase()

          if (key.includes("voice") && answer !== "no") {
            redFlags.push("Voice Weakness")
          }

          if (key.includes("pronouncing") && answer !== "no") {
            redFlags.push("Speech Difficulty")
          }

          if (key.includes("memory") && answer !== "no") {
            redFlags.push("Memory Loss")
          }

          if (key.includes("vision") && answer !== "no") {
            redFlags.push("Visual Disturbance")
          }

          if (key.includes("balance") && answer !== "no") {
            redFlags.push("Balance Issues")
          }

          if (key.includes("fatigue") && answer !== "no") {
            redFlags.push("Systemic Fatigue")
          }

        })

        // remove duplicates
        redFlags = [...new Set(redFlags)]

        if (redFlags.length > 0) {

          correlation =
            "Multiple neurological red flags detected from the clinical questionnaire. Further neurological evaluation is recommended before confirming a suspected disease."

        } else {

          correlation =
            "No strong neurological red flags detected from questionnaire responses. Clinical evaluation is recommended."

        }

        return (

          <div className="bg-indigo-50 border border-indigo-100 rounded-[2rem] p-8 space-y-4 shadow-sm animate-in zoom-in duration-500">

            <div className="flex items-center gap-3">

              <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center shadow-lg shadow-indigo-100">
                <span className="text-xs font-black">AI</span>
              </div>

              <h3 className="text-sm font-black uppercase tracking-widest text-indigo-900">
                Clinical Insights Extract
              </h3>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* RED FLAGS */}

              <div className="bg-white/60 p-4 rounded-2xl border border-indigo-50">

                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">
                  Detected Red Flags
                </p>

                <div className="flex flex-wrap gap-2">

                  {redFlags.length > 0 ? (

                    redFlags.map((flag, i) => (

                      <span
                        key={i}
                        className="px-3 py-1 bg-rose-100 text-rose-700 rounded-lg text-[10px] font-black uppercase tracking-wider"
                      >
                        {flag}
                      </span>

                    ))

                  ) : (

                    <span className="text-xs text-gray-500">
                      No major neurological red flags detected
                    </span>

                  )}

                </div>

              </div>


              {/* CLINICAL CORRELATION */}

              <div className="bg-white/60 p-4 rounded-2xl border border-indigo-50">

                <p className="text-[10px] font-bold text-indigo-400 uppercase mb-2">
                  Clinical Correlation
                </p>

                <p className="text-xs font-semibold text-slate-700 leading-relaxed">
                  {correlation}
                </p>

              </div>

            </div>

          </div>

        )

      })()}
      {/* SET SUSPECTED DISEASE SECTION */}
      {!caseData.suspected_disease && (
        <div className="mb-8">
          <h3 className="font-semibold text-lg text-center mb-6">
            Select Suspected Disease
          </h3>
          <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
            <button
              onClick={() => handleSuspect("alzheimer")}
              className="w-full py-4 text-lg font-semibold bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700 transition"
            >
              Alzheimer’s
            </button>
            <button
              onClick={() => handleSuspect("parkinsons")}
              className="w-full py-4 text-lg font-semibold bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700 transition"
            >
              Parkinson’s
            </button>
            <button
              onClick={() => handleSuspect("ms")}
              className="w-full py-4 text-lg font-semibold bg-blue-600 text-white rounded-2xl shadow-md hover:bg-blue-700 transition"
            >
              Multiple Sclerosis
            </button>
          </div>
        </div>
      )}

      {/* ACTION BUTTONS BASED ON STATUS */}
      {caseData.suspected_disease && (
        <div className="text-center pt-8">
          {/* Status for MRI/Audio Tests */}
          {caseData.status === "test_submitted" && (
            <button
              onClick={() => navigate(`/doctor/case/${id}/review`)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition"
            >
              Proceed to Review & AI
            </button>
          )}

          {/* New Status for Cognitive Path */}
          {caseData.status === "awaiting_cognitive_form" && (
            <button
              onClick={() => navigate(`/doctor/case/${id}/review`)}
              className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-blue-700 transition"
            >
              Manage Slots & View Progress
            </button>
          )}

          {/* New Status when meeting is confirmed */}
          {caseData.status === "mmse_confirmed" && (
            <button
              onClick={() => navigate(`/doctor/case/${id}/review`)}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-purple-700 transition"
            >
              Add MMSE Score & Run AI
            </button>
          )}
        </div>
      )}

      {/* PROGRESS TRACKER */}
<div className="bg-white rounded-2xl shadow p-6 mt-6">

  <h3 className="text-sm font-semibold text-gray-600 mb-6">
    Case Progress
  </h3>

  <div className="flex justify-between items-center relative">

    {steps.map((step, index) => {

      const isCompleted = index < currentStepIndex
      const isCurrent = index === currentStepIndex

      return (

        <div key={step} className="flex-1 text-center relative">

          {/* CONNECTING LINE */}
          {index !== steps.length - 1 && (
            <div
              className={`absolute top-4 left-1/2 w-full h-[2px] -z-10
              ${index < currentStepIndex ? "bg-green-500" : "bg-gray-200"}`}
            />
          )}

          {/* STEP CIRCLE */}
          <div
            className={`w-9 h-9 mx-auto rounded-full flex items-center justify-center text-sm font-semibold transition
              ${
                isCompleted
                  ? "bg-green-600 text-white"
                  : isCurrent
                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                  : "bg-gray-200 text-gray-500"
              }`}
          >
            {index + 1}
          </div>

          {/* STEP LABEL */}
          <p
            className={`text-xs mt-2 capitalize
              ${
                isCurrent
                  ? "text-blue-600 font-semibold"
                  : isCompleted
                  ? "text-green-600"
                  : "text-gray-500"
              }`}
          >
            {step.replaceAll("_", " ")}
          </p>

        </div>

      )

    })}

  </div>

  {/* STATUS SPECIFIC WAITING MESSAGES */}

  {caseData.status === "awaiting_patient_test_choice" && (
    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-2xl mt-6">
      <h3 className="font-semibold text-yellow-700 mb-2">
        Waiting for Patient Action
      </h3>
      <p className="text-sm text-yellow-700">
        The patient has not yet selected or uploaded the required test.
        Please wait until the patient completes submission.
      </p>
    </div>
  )}

  {caseData.status === "awaiting_test_upload" && (
    <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl mt-6">
      <h3 className="font-semibold text-blue-700 mb-2">
        Test Selected — Awaiting Upload
      </h3>
      <p className="text-sm text-blue-700">
        Patient has selected a test but has not uploaded the file yet.
      </p>
    </div>
  )}

</div>
    </div>
  );
};

export default DoctorCaseDetails;  