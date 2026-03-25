import { useState } from "react";

const CognitiveQuestionnaire = ({ onSubmit }) => {

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    age: "",
    gender: 0,
    education: 2,
    family_history: 0,
    hypertension: 0,
    diabetes: 0,
    depression: 0,

    MemoryComplaints: 0,
    FunctionalAssessment: 0,
    ADL: 0,
    BehavioralProblems: 0,
    Disorientation: 0,

    RepeatingQuestions: 0,
    MisplacingObjects: 0,
    AppointmentMemory: 0,
    GettingLost: 0,
    PlanningProblems: 0,
    ConcentrationIssues: 0
  });

  const options = [
    { label: "Never", value: 0 },
    { label: "Sometimes", value: 1 },
    { label: "Often", value: 2 },
    { label: "Very Often", value: 3 },
  ];

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: Number(value),
    }));
  };

  /* ================= SCORE CALCULATION ================= */

  const cognitiveFields = [
    "MemoryComplaints",
    "FunctionalAssessment",
    "ADL",
    "BehavioralProblems",
    "Disorientation",
    "RepeatingQuestions",
    "MisplacingObjects",
    "AppointmentMemory",
    "GettingLost",
    "PlanningProblems",
    "ConcentrationIssues"
  ];

  const totalScore = cognitiveFields.reduce(
    (sum, field) => sum + formData[field],
    0
  );

  /* ================= RISK LEVEL ================= */

  let riskLevel = "Low Cognitive Risk";

  if (totalScore >= 20) {
    riskLevel = "High Cognitive Risk";
  } else if (totalScore >= 10) {
    riskLevel = "Moderate Cognitive Concern";
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      questionnaire_total: totalScore,
      cognitive_risk: riskLevel
    });
  };

  return (
    <div className="mt-6 bg-white p-6 rounded-xl shadow-md">

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all"
            style={{ width: step === 1 ? "50%" : "100%" }}
          />
        </div>
      </div>

      {/* ================= STEP 1 ================= */}

      {step === 1 && (
        <>
          <h3 className="text-xl font-semibold mb-4">
            Step 1: Basic Clinical Information
          </h3>

          <label className="block font-medium mb-2">
            How old are you?
          </label>
          <input
            type="number"
            placeholder="Enter your age"
            value={formData.age}
            onChange={(e) =>
              setFormData({ ...formData, age: e.target.value })
            }
            className="w-full border p-2 rounded mb-4"
          />

          <label className="block font-medium mb-2">
            What is your gender?
          </label>
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: Number(e.target.value) })
            }
            className="w-full border p-2 rounded mb-4"
          >
            <option value={0}>Male</option>
            <option value={1}>Female</option>
            <option value={2}>Prefer not to say</option>
          </select>

          <label className="block font-medium mb-2">
            Has anyone in your family been diagnosed with Alzheimer’s or memory disorders?
          </label>
          <select
            value={formData.family_history}
            onChange={(e) =>
              setFormData({ ...formData, family_history: Number(e.target.value) })
            }
            className="w-full border p-2 rounded mb-4"
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
            <option value={2}>Not Sure</option>
          </select>

          <label className="block font-medium mb-2">
            Have you been diagnosed with high blood pressure?
          </label>
          <select
            value={formData.hypertension}
            onChange={(e) =>
              setFormData({ ...formData, hypertension: Number(e.target.value) })
            }
            className="w-full border p-2 rounded mb-4"
          >
            <option value={0}>No</option>
            <option value={1}>Yes</option>
          </select>

          <button
            onClick={() => setStep(2)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Next →
          </button>
        </>
      )}

      {/* ================= STEP 2 ================= */}

      {step === 2 && (
        <>
          <h3 className="text-xl font-semibold mb-4">
            Step 2: Cognitive Assessment
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">

            {[
              ["MemoryComplaints", "Do you often forget recent events or conversations?"],
              ["RepeatingQuestions", "Do you repeat the same questions or stories?"],
              ["MisplacingObjects", "Do you frequently misplace everyday objects?"],
              ["AppointmentMemory", "Do you struggle to remember appointments or dates?"],
              ["GettingLost", "Do you get lost in familiar places?"],
              ["Disorientation", "Do you feel confused about time or place?"],
              ["FunctionalAssessment", "Are daily tasks becoming difficult for you?"],
              ["ADL", "Do you need help with daily activities?"],
              ["PlanningProblems", "Do you have trouble planning or solving simple problems?"],
              ["ConcentrationIssues", "Do you have difficulty concentrating on tasks?"],
              ["BehavioralProblems", "Have you noticed mood changes or unusual behavior?"]
            ].map(([field, question]) => (
              <div key={field}>
                <label className="block font-medium mb-2">
                  {question}
                </label>

                <select
                  className="w-full border rounded-lg p-2"
                  value={formData[field]}
                  onChange={(e) => handleChange(field, e.target.value)}
                >
                  {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {/* Score */}
            

            

            <div className="flex gap-3">

              <button
                type="button"
                onClick={() => setStep(1)}
                className="bg-gray-400 text-white px-4 py-2 rounded-lg"
              >
                ← Back
              </button>

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
              >
                Submit Assessment
              </button>

            </div>

          </form>
        </>
      )}

    </div>
  );
};

export default CognitiveQuestionnaire;