import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";
import { clinicalQuestions } from "../../data/clinicalQuestions";

const subjectSuggestions = [
  "Acute Severe Headache", // Added
  "Sudden Confusion",
  "Memory Problems",
  "Hand Tremor",
  "Balance Difficulty",
  "Vision Issues",
  "Speech Difficulty",
  "Muscle Weakness",
  "Frequent Confusion",
  "Slow Movement"
];

const commonSymptoms = [
  "Severe Headache",        // Added
  "Nausea/Vomiting",        // Added
  "Dizziness",
  "Tremor",
  "Memory Loss",
  "Confusion",
  "Balance Problems",
  "Vision Problems",
  "Muscle Weakness",
  "Numbness",
  "Slow Movement",
  "Speech Difficulty",
  "Fatigue"
];

const SubmitCase = () => {

  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [email, setEmail] = useState("");

  const [subject, setSubject] = useState("");
  const [symptomInput, setSymptomInput] = useState("");
  const [symptoms, setSymptoms] = useState([]);
  const [doctors, setDoctors] = useState([]);

  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [followUpAnswers, setFollowUpAnswers] = useState({});
  

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await api.get("/doctor/approved");
        setDoctors(res.data);
      } catch (err) {
        console.error("Error fetching doctors", err);
      }
    };

    fetchDoctors();
  }, []);

  const addSymptom = () => {
    if (symptomInput.trim() !== "") {
      if (!symptoms.includes(symptomInput.trim())) {
        setSymptoms([...symptoms, symptomInput.trim()]);
      }
      setSymptomInput("");
    }
  };

  const addSuggestedSymptom = (symptom) => {
    if (!symptoms.includes(symptom)) {
      setSymptoms([...symptoms, symptom]);
    }
  };

  const removeSymptom = (index) => {
    setSymptoms(symptoms.filter((_, i) => i !== index));
  };

  const setSuggestedSubject = (value) => {
    setSubject(value);
  };

  const severityColor = () => {
    if (severity === "Mild") return "bg-green-100 text-green-700";
    if (severity === "Moderate") return "bg-yellow-100 text-yellow-700";
    if (severity === "Severe") return "bg-red-100 text-red-700";
    return "bg-gray-100 text-gray-700";
  };

  const handleSubmit = async () => {

    if (!name || !age || !gender || !doctorId || !subject || symptoms.length === 0 || !duration || !severity) {
      return toast.error("Please complete all required fields.");
    }

    try {

      setLoading(true);

      await api.post("/cases/submit", {
        name,
        age,
        gender,
        doctor_id: doctorId,
        subject,
        symptoms,
        duration,
        severity,
        description,
        follow_up_answers: followUpAnswers 
      });

      toast.success("Case submitted successfully");
      navigate("/patient/dashboard");

    } catch (err) {
      toast.error("Submission failed.");
    } finally {
      setLoading(false);
    }

  };
  

  return (

    <div className="min-h-screen bg-gray-100 flex justify-center p-8">

      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-lg border border-gray-100 p-8">

        <h2 className="text-3xl font-bold mb-6 text-center">
          Patient Case Submission
        </h2>

        {/* Progress */}
        <div className="relative flex justify-between items-center mb-12">

          {/* Progress line */}
          <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 z-0"></div>

          {[1, 2, 3].map((num) => (
            <div key={num} className="flex flex-col items-center flex-1 relative z-10">

              <div
                className={`w-10 h-10 flex items-center justify-center rounded-full font-semibold
        ${step >= num ? "bg-blue-600 text-white" : "bg-gray-300 text-gray-600"}`}
              >
                {num}
              </div>

              <p className={`mt-2 text-sm ${step >= num ? "text-blue-600 font-medium" : "text-gray-500"
                }`}>
                {num === 1 && "Patient Info"}
                {num === 2 && "Case Details"}
                {num === 3 && "Review"}
              </p>

            </div>
          ))}

        </div>


        {/* STEP 1 */}

        {step === 1 && (

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-base text-gray-700">
              Enter basic patient information before describing symptoms.
              This helps doctors evaluate the case more accurately.
            </div>
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-5">👤 Patient Case Submission</h3>

            <div className="grid grid-cols-2 gap-6">

              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Full Name
                </label>

                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-base"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Age
                </label>

                <input
                  type="number"
                  className="w-full p-3 border rounded-lg text-base"
                  placeholder="Age"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Gender
                </label>

                <select
                  className="w-full p-3 border rounded-lg text-base"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Contact Number
                </label>

                <input
                  type="text"
                  className="w-full p-3 border rounded-lg text-base"
                  placeholder="Phone number"
                />
              </div>
              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full p-3 border rounded-lg text-base focus:ring-2 focus:ring-blue-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="text-base font-medium text-gray-700 mb-1 block">
                  Assigned Doctor
                </label>

                <select
                  className="w-full p-3 border rounded-lg text-base"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                >
                  <option value="">Select Doctor</option>

                  {doctors.map((doc) => (
                    <option key={doc._id} value={doc._id}>
                      Dr. {doc.name} ({doc.specialization})
                    </option>
                  ))}

                </select>
              </div>

            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => setStep(2)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-14 py-2.5 rounded-lg font-medium transition shadow focus:ring-2 focus:ring-blue-400"
              >
                Continue →
              </button>
            </div>

          </div>

        )}


        {/* STEP 2 */}

        {step === 2 && (

          <div className="space-y-6">

            <h3 className="text-xl font-semibold text-gray-800">Case Details</h3>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-sm text-blue-700">
              Tip: Select symptoms and describe how long they have been present.
            </div>

            <input
              type="text"
              placeholder="Case Subject (e.g., Memory Problems)"
              className="w-full p-4 border rounded-xl"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />

            <div>

              <p className="text-sm text-gray-600 mb-2">Quick Suggestions</p>

              <div className="flex flex-wrap gap-2">

                {subjectSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setSuggestedSubject(item)}
                    className="bg-gray-100 hover:bg-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    {item}
                  </button>
                ))}

              </div>

            </div>


            <select
              className="w-full p-4 border rounded-xl"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            >

              <option value="">Select Symptom Duration</option>
              <option value="Less than 1 month">Less than 1 month</option>
              <option value="1-6 months">1 – 6 months</option>
              <option value="6-12 months">6 – 12 months</option>
              <option value="More than 1 year">More than 1 year</option>

            </select>


            <select
              className="w-full p-4 border rounded-xl"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >

              <option value="">Select Symptom Severity</option>
              <option value="Mild">Mild</option>
              <option value="Moderate">Moderate</option>
              <option value="Severe">Severe</option>

            </select>


            <div>

              <h4 className="font-semibold text-gray-700 mb-2">Common Symptoms</h4>

              <div className="flex flex-wrap gap-2">

                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    type="button"
                    onClick={() => addSuggestedSymptom(symptom)}
                    className="bg-gray-100 hover:bg-blue-100 px-3 py-1 rounded-full text-sm"
                  >
                    {symptom}
                  </button>
                ))}

              </div>

            </div>


            <div className="flex">

              <input
                type="text"
                placeholder="Add custom symptom"
                className="flex-1 p-4 border rounded-l-xl"
                value={symptomInput}
                onChange={(e) => setSymptomInput(e.target.value)}
              />

              <button
                type="button"
                onClick={addSymptom}
                className="bg-blue-600 text-white px-6 rounded-r-xl"
              >
                Add
              </button>

            </div>


            <div className="flex flex-wrap gap-2">

              {symptoms.map((symptom, index) => (
                <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {symptom}
                  <button
                    className="ml-2 text-red-500"
                    onClick={() => removeSymptom(index)}
                  >
                    ✕
                  </button>
                </div>
              ))}

            </div>
            {symptoms.map((symptom) => {

              const questions = clinicalQuestions[symptom];

              if (!questions) return null;

              return (
                <div key={symptom} className="mt-6 bg-blue-50 p-5 rounded-xl border">

                  <h4 className="font-semibold text-blue-700 mb-3">
                    Additional Questions for {symptom}
                  </h4>

                  {questions.map((q) => (

                    <div key={q.key} className="mb-3">

                      <label className="block text-sm font-medium mb-1">
                        {q.question}
                      </label>

                      <select
                        className="w-full border p-2 rounded"
                        onChange={(e) =>
                          setFollowUpAnswers({
                            ...followUpAnswers,
                            [q.key]: e.target.value
                          })
                        }
                      >
                        <option value="">Select</option>
                        <option value="never">Never</option>
                        <option value="rarely">Rarely</option>
                        <option value="sometimes">Sometimes</option>
                        <option value="often">Often</option>
                        <option value="very_often">Very Often</option>
                      </select>

                    </div>

                  ))}

                </div>
              );
            })}

            <textarea
              placeholder="Describe the condition in more detail (optional)"
              className="w-full p-4 border rounded-xl"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />


            <div className="flex justify-between">

              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-300 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl"
              >
                Continue
              </button>

            </div>

          </div>

        )}


        {/* STEP 3 */}

        {step === 3 && (

          <div className="space-y-6">

            <h3 className="text-xl font-semibold text-gray-800">Review Details</h3>

            <div className="bg-white border rounded-2xl shadow-sm p-8 space-y-8">

              {/* Patient Info */}

              <div>

                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Patient Information
                </h4>

                <div className="grid grid-cols-2 gap-8">

                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-lg font-semibold">{name}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="text-lg font-semibold">{age}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-lg font-semibold">{gender}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="text-lg font-semibold">{duration}</p>
                  </div>

                </div>

              </div>


              {/* Case Details */}

              <div>

                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  Case Details
                </h4>

                <div className="grid grid-cols-2 gap-6">

                  <div>
                    <p className="text-sm text-gray-500">Subject</p>
                    <p className="text-lg font-medium">{subject}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Severity</p>

                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${severityColor()}`}>
                      {severity}
                    </span>

                  </div>

                </div>

              </div>


              {/* Symptoms */}

              <div>

                <h4 className="text-lg font-semibold text-gray-800 mb-3">
                  Symptoms
                </h4>

                <div className="flex flex-wrap gap-2">

                  {symptoms.map((symptom, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {symptom}
                    </span>
                  ))}

                </div>

              </div>
              {/* Follow-up Clinical Answers */}

              {Object.keys(followUpAnswers).length > 0 && (

                <div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Questionnaire
                  </h4>

                  <div className="bg-blue-50 border rounded-lg p-5 space-y-2">

                    {Object.entries(followUpAnswers).map(([key, value]) => (

                      <div key={key} className="flex justify-between text-sm">

                        <span className="text-gray-600 capitalize">
                          {key.replaceAll("_", " ")}
                        </span>

                        <span className="font-medium">
                          {value}
                        </span>

                      </div>

                    ))}

                  </div>

                </div>

              )}

              {/* Description */}

              {description && (

                <div>

                  <h4 className="text-lg font-semibold text-gray-800 mb-3">
                    Patient Description
                  </h4>

                  <div className="bg-gray-50 border rounded-lg p-5 text-base text-gray-700 leading-relaxed">
                    {description}
                  </div>

                </div>

              )}

            </div>


            <div className="flex justify-between">

              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-300 rounded-xl"
              >
                Back
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-xl"
              >
                {loading ? "Submitting..." : "Submit Assessment"}
              </button>

            </div>

          </div>

        )}

      </div>

    </div>

  );
};

export default SubmitCase;

