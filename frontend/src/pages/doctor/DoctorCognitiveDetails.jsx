import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const DoctorCognitiveDetails = () => {

  const { id } = useParams();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCase();
  }, []);

  const fetchCase = async () => {
    try {
      const res = await api.get(`/cases/${id}`);
      setCaseData(res.data);
    } catch {
      console.log("Error loading case");
    } finally {
      setLoading(false);
    }
  };

  /* ===== LABEL ===== */

  const answerLabel = (value) => {
    if (value === 0) return "Never";
    if (value === 1) return "Sometimes";
    if (value === 2) return "Often";
    if (value === 3) return "Very Often";
    return "Not Answered";
  };

  /* ===== BADGE COLOR ===== */

  const answerColor = (value) => {
    if (value === 0) return "bg-gray-100 text-gray-700";
    if (value === 1) return "bg-blue-100 text-blue-700";
    if (value === 2) return "bg-orange-100 text-orange-700";
    if (value === 3) return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-500";
  };

  /* ===== LEFT INDICATOR COLOR ===== */

  const indicatorColor = (value) => {
    if (value === 0) return "bg-gray-300";
    if (value === 1) return "bg-blue-400";
    if (value === 2) return "bg-orange-400";
    if (value === 3) return "bg-red-500";
    return "bg-gray-300";
  };

  const questions = [
    { key: "MemoryComplaints", question: "Do you often forget recent events or conversations?" },
    { key: "RepeatingQuestions", question: "Do you repeat the same questions or stories?" },
    { key: "MisplacingObjects", question: "Do you frequently misplace everyday objects?" },
    { key: "AppointmentMemory", question: "Do you struggle to remember appointments or dates?" },
    { key: "GettingLost", question: "Do you get lost in familiar places?" },
    { key: "Disorientation", question: "Do you feel confused about time or place?" },
    { key: "FunctionalAssessment", question: "Are daily tasks becoming difficult for you?" },
    { key: "ADL", question: "Do you need help with daily activities?" },
    { key: "PlanningProblems", question: "Do you have trouble planning or solving simple problems?" },
    { key: "ConcentrationIssues", question: "Do you have difficulty concentrating on tasks?" },
    { key: "BehavioralProblems", question: "Have you noticed mood changes or unusual behavior?" }
  ];

  if (loading) return <Loader />;

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Header */}
      <div className="flex justify-between items-center">

        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline text-sm"
        >
          ← Back to Case
        </button>

      </div>

      <div>
        <h2 className="text-2xl font-bold">
          Cognitive Questionnaire Details
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Complete responses provided by the patient during cognitive screening.
        </p>
      </div>

      {/* Main Card */}

      <div className="bg-white border border-gray-200 rounded-2xl shadow-md">

        <div className="divide-y">

          {questions.map((q, index) => {

            const value = caseData?.cognitive_form?.[q.key];

            return (

              <div
                key={q.key}
                className="flex gap-4 p-6 hover:bg-gray-50 transition"
              >

                {/* Left Severity Indicator */}

                <div
                  className={`w-1.5 rounded-full ${indicatorColor(value)}`}
                />

                {/* Question + Answer */}

                <div className="flex-1">

                  <p className="font-semibold text-gray-800">
                    {index + 1}. {q.question}
                  </p>

                  <div className="mt-2 flex items-center gap-3">

                    <span className="text-xs text-gray-500">
                      Patient Response
                    </span>

                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${answerColor(value)}`}
                    >
                      {answerLabel(value)}
                    </span>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </div>

    </div>
  );
};

export default DoctorCognitiveDetails;