import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const PatientReportPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCase();
  }, []);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/api/patient/case/${id}/report`);
      setCaseData(res.data);
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- 1. DISEASE DATABASE (BLUE BOX) ---
  const diseaseInfo = {
    ms: {
      title: "Multiple Sclerosis (MS)",
      description: "Multiple Sclerosis is a condition affecting the brain and spinal cord. It may cause vision problems, fatigue, and coordination difficulties.",
      symptoms: "Blurred vision, numbness, fatigue, balance issues, muscle stiffness.",
      nextSteps: "Consult a neurologist for detailed evaluation and management planning."
    },
    parkinson: {
      title: "Parkinson’s Disease",
      description: "Parkinson’s Disease is a neurological condition affecting movement and coordination. Early detection helps in managing motor functions.",
      symptoms: "Tremors, slow movements, stiffness, speech changes.",
      nextSteps: "A neurological consultation is recommended for confirmation and treatment planning."
    },
    alzheimer: {
      title: "Alzheimer’s Disease",
      description: "Alzheimer’s disease affects memory and cognitive function. It is a progressive condition that requires clinical support.",
      symptoms: "Memory loss, confusion, difficulty performing daily tasks.",
      nextSteps: "Cognitive assessment and neurological evaluation are recommended."
    }
  };

  // --- 2. RISK CONTENT MAPPING (GREEN/ORANGE/SLATE) ---
  const getRiskDetails = (diagnosis) => {
    const text = diagnosis?.toLowerCase() || "";

    if (text.includes("high") || text.includes("severe")) {
      return {
        level: "High Priority",
        bg: "bg-slate-50",
        text: "text-slate-700",
        border: "border-slate-200",
        note: "Analysis indicates a high priority for clinical follow-up. MRI findings show indicators consistent with the suspected condition. Immediate consultation with a neurologist is strongly recommended for a definitive diagnostic workup."
      };
    }

    if (text.includes("moderate") || text.includes("chance")) {
      return {
        level: "Moderate Risk",
        bg: "bg-orange-50",
        text: "text-orange-700",
        border: "border-orange-200",
        note: "Moderate risk level detected. Findings indicate borderline abnormalities. The condition does not appear critical at this stage; however, a neurological consultation is recommended for detailed management planning."
      };
    }

    return {
      level: "Low Risk",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      note: "Low risk level detected. Biomarker analysis shows minimal deviation from normal ranges. No immediate cause for concern was identified. We recommend regular monitoring to ensure continued neurological health."
    };
  };

  // --- 3. SPELLING & KEY CLEANER ---
  const cleanDisease = (diagnosis) => {
    const text = diagnosis?.toLowerCase() || "";
    if (text.includes("multiple") || text.includes("ms")) return { key: "ms", name: "Multiple Sclerosis (MS)" };
    if (text.includes("parkin")) return { key: "parkinson", name: "Parkinson’s Disease" };
    if (text.includes("alzh")) return { key: "alzheimer", name: "Alzheimer’s Disease" };
    return { key: null, name: diagnosis };
  };

  if (loading) return <Loader />;
  if (!caseData) return <div className="p-10 text-center">Report not found.</div>;

  const risk = getRiskDetails(caseData.final_diagnosis);
  const disease = cleanDisease(caseData.final_diagnosis);

  return (
    <div className="medical-report-container">
      {/* Paper Card - Matches Screenshot 2 spacing */}
      <div className="bg-white max-w-4xl mx-auto rounded-3xl shadow-sm p-12 space-y-10 border border-gray-100">

        {/* Header */}
        <div className="flex justify-between items-baseline border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight">
              Medical Report
            </h1>            <p className="text-gray-400 font-medium text-sm mt-1">Report ID: {caseData._id?.slice(-6)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Issued Date</p>
            <p className="text-gray-900 font-bold">{new Date().toLocaleDateString('en-GB')}</p>
          </div>
        </div>

        {/* Case Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <section>
            <p className="label-text">Case Subject</p>
            <p className="text-xl font-medium text-gray-800">{caseData.subject}</p>
          </section>
          <section>
            <p className="label-text">Reported Symptoms</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {caseData.symptoms?.map((s, i) => (
                <span key={i} className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-semibold border border-blue-100">
                  {s}
                </span>
              ))}
            </div>
          </section>
        </div>

        {/* BLUE BOX: ABOUT DISEASE */}
        {disease.key && diseaseInfo[disease.key] && (
          <div className="bg-blue-50/50 border border-blue-200 p-8 rounded-2xl space-y-4">
            <h4 className="text-blue-800 font-bold text-lg">About {diseaseInfo[disease.key].title}</h4>
            <p className="text-sm text-gray-600 leading-relaxed italic">{diseaseInfo[disease.key].description}</p>
            <div className="text-sm text-gray-800 space-y-1 pt-2">
              <p><strong>Common Symptoms:</strong> {diseaseInfo[disease.key].symptoms}</p>
              <p><strong>Next Steps:</strong> {diseaseInfo[disease.key].nextSteps}</p>
            </div>
          </div>
        )}

        {/* RISK BOX: DIAGNOSIS & PATIENT NOTES */}
        <section className={`${risk.bg} ${risk.border} border rounded-2xl p-10 space-y-8`}>
          <div className="flex justify-between items-center">
            <h4 className={`${risk.text} font-bold text-lg`}>Doctor's Final Diagnosis</h4>
            <span className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border border-current ${risk.bg} ${risk.text}`}>
              {risk.level}
            </span>
          </div>

          <p className="text-2xl font-bold text-gray-900 leading-tight">
            {risk.level} of {disease.name}
          </p>

          <div className="pt-8 border-t border-gray-200/50">
            <p className="label-text mb-3">Doctor's Clinical Notes</p>
            <p className="italic-note text-lg">
              {risk.note}
            </p>
          </div>
        </section>
        {/* ================= APPOINTMENT RECOMMENDATION ================= */}
        {/* ================= APPOINTMENT RECOMMENDATION ================= */}
        {risk.level === "High Priority" && (
          <div className="max-w-xl mx-auto overflow-hidden rounded-2xl border border-blue-200">
            {caseData?.consultation_booked ? (
              /* APPOINTMENT VIEW */
              <div className="bg-white">
                {/* Header - Full Width */}
                <div className="bg-emerald-600 px-6 py-3 flex justify-between items-center">
                  <h3 className="text-white font-bold text-sm uppercase tracking-wider">
                    Appointment Confirmed
                  </h3>
                  <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                </div>

                <div className="p-8 space-y-6 text-left">
                  {/* Doctor Info */}
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                      <svg className="w-6 h-6 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-slate-900 font-bold text-xl leading-tight">Dr. {caseData?.doctor_name}</p>
                      <p className="text-slate-500 text-sm font-medium">{caseData?.doctor_specialization}</p>
                    </div>
                  </div>

                  {/* Ticket-style Divider */}
                  <div className="border-t border-dashed border-slate-200" />

                  {/* Date & Time Grid */}
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Date</p>
                      <p className="text-slate-700 font-bold text-lg">
                        {new Date(caseData?.consultation_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                    <div className="border-l border-slate-100 pl-8">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-2">Time</p>
                      <p className="text-slate-700 font-bold text-lg uppercase">
                        {(() => {
                          if (!caseData?.consultation_time) return "";
                          const [hours, minutes] = caseData.consultation_time.split(':');
                          const date = new Date();
                          date.setHours(parseInt(hours), parseInt(minutes));
                          return date.toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          });
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* RECOMMENDATION VIEW */
              <div className="bg-blue-50 p-8 text-center space-y-6">
                <div className="inline-flex p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <div className="space-y-2">
                  <h3 className="text-blue-900 font-bold text-xl tracking-tight">
                    Specialist Consultation Recommended
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed max-w-sm mx-auto">
                    Based on your evaluation results, your doctor recommends scheduling a consultation with a specialist for a definitive diagnostic workup.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/patient/book-appointment/${caseData?._id}`)}
                  className="w-full max-w-xs bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                >
                  Schedule Consultation
                </button>
              </div>
            )}
          </div>
        )}
        {/* Footer Disclaimer */}
        <div className="flex items-start gap-4 text-xs text-gray-400 pt-6">
          <span className="text-orange-400 text-lg">⚠️</span>
          <p className="italic leading-relaxed font-medium">
            This report summarizes your doctor's evaluation based on AI biomarkers and clinical observations. Please consult your healthcare provider for formal medical clarification.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-6 border-t border-gray-50 flex justify-between items-center no-print">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 font-bold text-sm hover:underline"
          >
            ← Back to Case
          </button>
          
        </div>

      </div>
    </div>
  );
};

export default PatientReportPage;