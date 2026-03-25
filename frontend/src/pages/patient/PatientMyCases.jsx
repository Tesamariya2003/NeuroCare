import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import StatusBadge from "../../components/common/StatusBadge";

const PatientMyCases = () => {

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const res = await api.get("/cases/my-cases");
      setCases(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  const filters = [
    { key: "all", label: "All" },
    { key: "submitted", label: "Submitted" },
    { key: "ai_completed", label: "AI Analysis" },
    { key: "test_stage", label: "Test Requested" },
    { key: "closed", label: "Closed" }
  ];

  const counts = {
    all: cases.length,
    submitted: cases.filter(c => c.status === "submitted").length,
    ai_completed: cases.filter(c => c.status === "ai_completed").length,
    test_stage: cases.filter(
      c =>
        c.status === "test_requested" ||
        c.status === "awaiting_patient_test_choice"
    ).length,
    closed: cases.filter(c => c.status === "closed").length
  };

  const filteredCases = cases.filter((c) => {

    if (filter === "all") return true;

    if (filter === "test_stage") {
      return (
        c.status === "test_requested" ||
        c.status === "awaiting_patient_test_choice"
      );
    }

    return c.status === filter;

  });

  return (
    <div className="p-8 min-h-screen bg-gray-100">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">My Cases</h1>

        <button
          onClick={() => navigate("/patient/submit")}
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition"
        >
          + New Case
        </button>
      </div>

      {/* Filter Bar */}

      <div className="flex gap-3 mb-8 flex-wrap">

        {filters.map((item) => (

          <button
            key={item.key}
            onClick={() => setFilter(item.key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition
              ${
                filter === item.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-700 hover:bg-gray-50"
              }`}
          >
            {item.label} ({counts[item.key]})
          </button>

        ))}

      </div>

      {/* Cases */}

      {filteredCases.length === 0 ? (

        <div className="bg-white p-8 rounded-2xl shadow text-center">
          <p className="text-gray-600">No cases found for this category.</p>
        </div>

      ) : (

        <div className="grid md:grid-cols-2 gap-6">

          {filteredCases.slice().reverse().map((caseItem) => (

            <div
              key={caseItem._id}
              onClick={() => navigate(`/patient/case/${caseItem._id}`)}
              className="bg-white p-6 rounded-3xl shadow-md hover:shadow-xl transition cursor-pointer border border-gray-100"
            >

              <div className="flex justify-between items-start mb-4">

                <h3 className="font-semibold text-lg">
                  {caseItem.subject}
                </h3>

                <StatusBadge status={caseItem.status} />

              </div>

              <div className="flex flex-wrap gap-2 mt-3">

                {caseItem.symptoms?.slice(0, 3).map((symptom, index) => (

                  <span
                    key={index}
                    className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs"
                  >
                    {symptom}
                  </span>

                ))}

              </div>

              {/* Test status */}

              {caseItem.status === "awaiting_patient_test_choice" && (

                <p className="text-blue-600 text-sm mt-3">
                  Select a diagnostic test
                </p>

              )}

              {caseItem.status === "test_requested" && (

                <p className="text-orange-600 text-sm mt-3">
                  Test requested: {caseItem.selected_test?.toUpperCase()}
                </p>

              )}

              {caseItem.status === "closed" && (

                <p className="text-green-600 text-sm mt-3">
                  Final Diagnosis: {caseItem.final_diagnosis}
                </p>

              )}

              <div className="mt-4 text-sm text-gray-500">
                Click to view details →
              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );

};

export default PatientMyCases;