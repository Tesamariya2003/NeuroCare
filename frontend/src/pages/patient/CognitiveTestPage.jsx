import React, { useEffect, useState } from "react"; // Added useState here
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import CognitiveQuestionnaire from "../../components/case/CognitiveQuestionnaire";
import Loader from "../../components/common/Loader";
import { FaArrowLeft } from "react-icons/fa";

const CognitiveTestPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Fixed "useSlate" typo
  const [caseData, setCaseData] = useState(null);

  useEffect(() => {
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
    fetchCase();
  }, [id]);

  const handleSubmit = async (formData) => {
    try {
      // Your Flask backend expects the form data here
      await api.post(`/cases/${id}/submit-cognitive`, formData);
      navigate(`/patient/case/${id}`);
    } catch (error) {
      console.error("Submission failed", error);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6 font-sans">
      <div className="max-w-3xl mx-auto">
        <button 
          onClick={() => navigate(`/patient/case/${id}`)}
          className="flex items-center gap-2 text-slate-500 hover:text-blue-600 mb-8 transition-all font-medium"
        >
          <FaArrowLeft /> Back to Case Details
        </button>

        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-10 text-white">
            <h2 className="text-3xl font-bold">Cognitive Evaluation</h2>
            <p className="opacity-90 mt-2 text-blue-100">
              This assessment helps our AI model analyze cognitive patterns. 
              Please answer as accurately as possible.
            </p>
          </div>
          
          <div className="p-10">
            <CognitiveQuestionnaire onSubmit={handleSubmit} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CognitiveTestPage;