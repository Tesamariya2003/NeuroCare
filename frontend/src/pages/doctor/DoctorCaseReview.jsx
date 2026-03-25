import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import AIResultCard from "../../components/case/AIResultCard";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const DoctorCaseReview = () => {
    const { id } = useParams();

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const [mmseScore, setMmseScore] = useState("");
    const [finalDiagnosis, setFinalDiagnosis] = useState("");
    const [doctorNotes, setDoctorNotes] = useState("");
    const [slotDate, setSlotDate] = useState("");
    const [slotTime, setSlotTime] = useState("");
    const [slotsList, setSlotsList] = useState([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const navigate = useNavigate();




    useEffect(() => {
        fetchCase();
    }, []);

    const fetchCase = async () => {
        try {
            const res = await api.get(`/cases/${id}`);
            setCaseData(res.data);

            if (res.data.selected_mmse_slot) {
                setSlotDate(res.data.selected_mmse_slot.split('T')[0]);
            }
            // Load existing slots into the list if they exist in DB
            if (res.data.mmse_slots) {
                setSlotsList(res.data.mmse_slots);
            }
        } catch (error) {
            toast.error("Failed to fetch case");
        } finally {
            setLoading(false); // Add this to stop the infinite spinner
        }
    };

    /* ================= MMSE SLOT HANDLING ================= */
    const addSlot = () => {
        if (!slotDate || !slotTime) {
            return toast.error("Select date and time");
        }

        const formatted = `${slotDate}T${slotTime}`; // Change space to 'T'
        setSlotsList([...slotsList, formatted]);

        setSlotDate("");
        setSlotTime("");
    };
    const removeSlot = (index) => {
        const updated = slotsList.filter((_, i) => i !== index);
        setSlotsList(updated);
    };

    const saveSlots = async () => {
        if (slotsList.length === 0) {
            return toast.error("Add at least one slot");
        }

        try {
            await api.post(`/cases/doctor/set-mmse-slots/${id}`, {
                mmse_slots: slotsList,
            });

            toast.success("MMSE slots saved");
            fetchCase();
        } catch {
            toast.error("Failed to save slots");
        }
    };

    /* ================= MMSE SCORE ================= */

    const submitMMSEScore = async () => {
        if (!mmseScore) return toast.error("Enter MMSE score");

        try {
            await api.post(`/cases/doctor/submit-mmse/${id}`, {
                mmse_score: Number(mmseScore),
            });

            toast.success("MMSE score submitted");
            fetchCase();
        } catch {
            toast.error("Failed to submit score");
        }
    };

    /* ================= AI ================= */

    const runAI = async () => {
        try {
            await api.post(`/cases/doctor/run-ai/${id}`);
            toast.success("AI Analysis Completed");
            navigate(`/doctor/case/${id}/result`);
        } catch {
            toast.error("AI failed");
        }
    };

    /* ================= REVIEW ================= */

    const reviewCase = async () => {
        try {
            await api.post(`/cases/doctor/review/${id}`, {
                doctor_notes: doctorNotes,
            });

            toast.success("Review saved");
            fetchCase();
        } catch {
            toast.error("Failed to save review");
        }
    };

    /* ================= FINALIZE ================= */

    const finalizeCase = async () => {
        if (!finalDiagnosis) return toast.error("Enter final diagnosis");

        try {
            await api.post(`/cases/doctor/finalize/${id}`, {
                final_diagnosis: finalDiagnosis,
                doctor_notes: doctorNotes,
            });

            toast.success("Case finalized");
            fetchCase();
        } catch {
            toast.error("Failed to finalize");
        }
    };
    const createSlot = async () => {

        if (!slotDate || !slotTime) {
            return toast.error("Select date and time");
        }

        try {

            await api.post(`/doctor/case/${id}/create-slot`, {
                date: slotDate,
                time: slotTime
            });

            toast.success("Consultation slot created");

            setSlotDate("");
            setSlotTime("");

            fetchCase();

        } catch {
            toast.error("Failed to create slot");
        }
    };
    if (loading) return <Loader />;
    if (!caseData) return <div className="p-6">Case not found</div>;
    let cognitiveSeverity = "Low Cognitive Risk";

    if (caseData?.questionnaire_total >= 20) {
        cognitiveSeverity = "High Cognitive Risk";
    }
    else if (caseData?.questionnaire_total >= 10) {
        cognitiveSeverity = "Moderate Cognitive Concern";
    }
    console.log(caseData?.ai_result?.severity)
    console.log(caseData?.status)
    console.log("FULL CASE DATA:", caseData);
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* ================= AVAILABLE ACTIONS WRAPPER ================= */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

                {/* Section Header */}
                <div className="px-10 py-8 border-b">
                    <h2 className="text-2xl font-bold">
                        Review and Analysis
                    </h2>
                </div>

                {/* ================= PATIENT INPUT REVIEW CARD ================= */}
                <div className="p-10">

                    <div className="bg-gray-50 rounded-2xl border overflow-hidden">

                        {/* Card Header */}
                        <div className="px-8 py-6 border-b bg-white">
                            <h3 className="text-2xl font-semibold">
                                Patient Input Data Review
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Review all patient-provided data before running AI analysis.
                            </p>
                        </div>

                        {/* Card Body */}
                        <div className="p-8 space-y-8">

                            {/* Case Information */}
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h4 className="font-semibold mb-4">
                                    Case Information
                                </h4>

                                <div className="grid grid-cols-2 gap-6 text-sm">
                                    <div>
                                        <p className="text-base text-gray-500">Subject</p>
                                        <p className="text-lg font-semibold">{caseData.subject}</p>
                                    </div>

                                    <div>
                                        <p className="text-base text-gray-500">Suspected Disease</p>
                                        <p className="text-lg font-semibold capitalize">
                                            {caseData.suspected_disease}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-base text-gray-500">Test Type</p>
                                        <p className="text-lg font-semibold capitalize">
                                            {caseData.selected_test}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-base text-gray-500">Status</p>
                                        <p className="font-medium capitalize">
                                            {caseData.status}
                                        </p>
                                    </div>
                                </div>

                                {/* Symptoms */}
                                <div className="mt-6">
                                    <p className="text-gray-500 mb-3">Symptoms</p>
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
                            </div>

                            {/* Uploaded File */}
                            {caseData.test_file && (
                                <div className="space-y-4 mt-4">

                                    <p className="text-base font-medium">
                                        {caseData.test_file}
                                    </p>

                                    {/* MRI IMAGE */}
                                    {caseData.test_file.match(/\.(jpg|jpeg|png)$/i) && (
                                        <button
                                            onClick={() => setPreviewOpen(true)}
                                            className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                                        >
                                            Preview MRI
                                        </button>
                                    )}

                                    {/* AUDIO */}
                                    {caseData.test_file.match(/\.(wav|mp3)$/i) && (
                                        <audio
                                            controls
                                            className="w-full bg-gray-100 rounded-xl p-3"
                                            src={`http://127.0.0.1:5000/uploads/${caseData.test_file}`}
                                        />
                                    )}

                                    {/* PDF */}
                                    {/* 📄 PDF VIEW BUTTON */}
                                    {caseData.test_file?.match(/\.pdf$/i) && (
                                        <button
                                            onClick={() =>
                                                window.open(
                                                    `http://127.0.0.1:5000/uploads/${caseData.test_file}`,
                                                    "_blank"
                                                )
                                            }
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl"
                                        >
                                            View PDF
                                        </button>
                                    )}

                                </div>
                            )}
                            {/* Data Verification */}
                            <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl">
                                <h4 className="font-semibold text-yellow-700 mb-3">
                                    Data Verification
                                </h4>

                                <ul className="text-sm text-yellow-700 space-y-2">
                                    <li>✔ Case subject provided</li>
                                    <li>✔ Test type selected</li>
                                    <li>✔ Test file uploaded</li>
                                </ul>
                            </div>



                        </div>
                    </div>

                </div>
                {/* ================= COGNITIVE SUMMARY ================= */}
                {caseData.suspected_disease === "alzheimer" &&
                    caseData.selected_test?.toLowerCase() === "cognitive" && (
                        <div className="p-10 space-y-6">

                            <h3 className="text-2xl font-bold">
                                Cognitive Evaluation Report
                            </h3>

                            <p className="text-base text-gray-500">
                                Initial cognitive screening based on patient questionnaire.
                            </p>

                            {/* SUMMARY */}
                            {caseData.cognitive_form && (
                                <div className="p-6">

                                    <h4 className="font-semibold mb-3">
                                        Assessment Summary
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4 text-base">

                                        <p><strong>Memory Issues:</strong> {caseData.cognitive_form.MemoryComplaints}</p>

                                        <p><strong>Daily Task Difficulty:</strong> {caseData.cognitive_form.FunctionalAssessment}</p>

                                        <p><strong>ADL Support:</strong> {caseData.cognitive_form.ADL}</p>

                                        <p><strong>Behavior Changes:</strong> {caseData.cognitive_form.BehavioralProblems}</p>

                                        <p><strong>Disorientation:</strong> {caseData.cognitive_form.Disorientation}</p>

                                    </div>

                                    <p className="mt-4 text-lg font-semibold text-blue-700">
                                        Questionnaire Score: {caseData.questionnaire_total} / 33
                                    </p>

                                    <div className="mt-3 border-l-4 border-red-400 pl-4">
                                        <p className="text-base font-semibold text-red-700">
                                            Alzheimer's Risk Level: {cognitiveSeverity}
                                        </p>
                                    </div>
                                    <div className="border-l-4 border-blue-400 pl-4 text-base mt-4">

                                        <p className="font-semibold mb-2">
                                            Clinical Interpretation
                                        </p>

                                        {cognitiveSeverity === "High Cognitive Risk" && (
                                            <p>
                                                Patient responses indicate significant Alzheimer's symptoms.
                                                A full cognitive evaluation using MMSE is strongly recommended.
                                            </p>
                                        )}

                                        {cognitiveSeverity === "Moderate Cognitive Concern" && (
                                            <p>
                                                Patient shows Moderate Alzheimer's concerns. Further clinical
                                                evaluation and MMSE screening should be considered.
                                            </p>
                                        )}

                                        {cognitiveSeverity === "Low Cognitive Risk" && (
                                            <p>
                                                Patient responses indicate mild Alzheimer's symptoms.
                                                Continue monitoring and reassess if symptoms worsen.
                                            </p>
                                        )}

                                    </div>

                                </div>
                            )}

                            {/* VIEW DETAILS BUTTON */}
                            <button
                                onClick={() => navigate(`/doctor/case/${id}/cognitive-details`)}
                                className="text-blue-600 font-medium"
                            >
                                View Full Cognitive Questionnaire →
                            </button>


                            {/* CLINICAL NOTE */}
                            <div className="bg-blue-50 border border-blue-200 p-5 rounded-xl text-sm">

                                <p className="font-semibold mb-2">
                                    Clinical Instruction
                                </p>

                                <p>
                                    This questionnaire is an initial cognitive screening tool.
                                    Results should be interpreted alongside clinical evaluation
                                    and confirmed using the <b>Mini-Mental State Examination (MMSE)</b>
                                    conducted by a qualified healthcare professional.
                                </p>

                            </div>

                            {/* MMSE APPOINTMENT */}
                            <div className="space-y-4">

                                <h4 className="font-semibold">
                                    MMSE Appointment
                                </h4>

                                {caseData.selected_mmse_slot ? (

                                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl">
                                        <p className="text-xs font-bold text-emerald-600 uppercase mb-1">
                                            Confirmed Time
                                        </p>

                                        <p className="text-lg font-bold">
                                            {new Date(caseData.selected_mmse_slot).toLocaleString([], {
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </p>
                                    </div>

                                ) : (

                                    <div className="space-y-4">

                                        <div className="flex gap-3">
                                            <input
                                                type="date"
                                                className="border p-2 rounded w-full"
                                                value={slotDate}
                                                onChange={(e) => setSlotDate(e.target.value)}
                                            />

                                            <input
                                                type="time"
                                                className="border p-2 rounded w-full"
                                                value={slotTime}
                                                onChange={(e) => setSlotTime(e.target.value)}
                                            />

                                            <button
                                                onClick={addSlot}
                                                className="bg-green-600 text-white px-4 rounded"
                                            >
                                                Add
                                            </button>
                                        </div>

                                        {slotsList.map((slot, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between items-center bg-gray-100 p-3 rounded"
                                            >
                                                <span>{new Date(slot).toLocaleString()}</span>

                                                <button
                                                    onClick={() => removeSlot(index)}
                                                    className="text-red-600"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}

                                        <button
                                            onClick={saveSlots}
                                            className="bg-blue-600 text-white px-6 py-2 rounded-xl"
                                        >
                                            Save MMSE Slots
                                        </button>

                                    </div>

                                )}

                            </div>

                        </div>
                    )}
                {/* ================= MMSE SCORE ================= */}
                {/* ================= MMSE SCORE ================= */}
                {caseData.status === "mmse_confirmed" && (
                    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-5">

                        <h3 className="text-xl font-semibold">
                            Submit MMSE Score
                        </h3>

                        <input
                            type="number"
                            min="0"
                            max="30"
                            placeholder="Enter MMSE Score (0 - 30)"
                            className="border p-3 rounded-xl w-full text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={mmseScore}
                            onChange={(e) => setMmseScore(e.target.value)}
                        />

                        {/* LIVE INTERPRETATION */}
                        {mmseScore && (
                            <div className="text-sm font-semibold">
                                {mmseScore >= 24 && (
                                    <span className="text-green-600">
                                        Normal Cognitive Function
                                    </span>
                                )}

                                {mmseScore >= 18 && mmseScore <= 23 && (
                                    <span className="text-yellow-600">
                                        Mild Cognitive Impairment
                                    </span>
                                )}

                                {mmseScore >= 10 && mmseScore <= 17 && (
                                    <span className="text-orange-600">
                                        Moderate Cognitive Impairment
                                    </span>
                                )}

                                {mmseScore <= 9 && (
                                    <span className="text-red-600">
                                        Severe Cognitive Impairment
                                    </span>
                                )}
                            </div>
                        )}

                        {/* RANGE GUIDE */}
                        <div className="bg-gray-50 border rounded-xl p-4 text-sm">
                            <p className="font-semibold mb-2">
                                MMSE Score Interpretation
                            </p>

                            <ul className="space-y-1 text-gray-700">
                                <li>
                                    <span className="font-semibold text-green-700">24 – 30 :</span> Normal Cognition
                                </li>

                                <li>
                                    <span className="font-semibold text-yellow-700">18 – 23 :</span> Mild Cognitive Impairment
                                </li>

                                <li>
                                    <span className="font-semibold text-orange-700">10 – 17 :</span> Moderate Cognitive Impairment
                                </li>

                                <li>
                                    <span className="font-semibold text-red-700">0 – 9 :</span> Severe Cognitive Impairment
                                </li>
                            </ul>
                        </div>

                        <button
                            onClick={submitMMSEScore}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md transition"
                        >
                            Submit MMSE Score
                        </button>

                    </div>
                )}
                {/* Run AI */}
                {caseData.status === "test_submitted" && (
                    <button
                        onClick={runAI}
                        className="w-full bg-green-600 text-white py-4 rounded-2xl text-lg font-semibold shadow-md hover:bg-green-700 transition"
                    >
                        Run AI Analysis
                    </button>
                )}
            </div>


            {/* ================= AI RESULT ================= */}
            {caseData.ai_result && (
                <AIResultCard result={caseData.ai_result}
                selectedTest={caseData.selected_test} />
            )}

            {caseData?.status === "ai_completed" &&
                caseData?.ai_result?.severity === "High" && (

                    <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mt-6">

                        <h3 className="font-semibold text-lg mb-4">
                            Create Consultation Slots
                        </h3>

                        <input
                            type="date"
                            className="border p-2 rounded mr-3"
                            value={slotDate}
                            onChange={(e) => setSlotDate(e.target.value)}
                        />

                        <input
                            type="time"
                            className="border p-2 rounded mr-3"
                            value={slotTime}
                            onChange={(e) => setSlotTime(e.target.value)}
                        />

                        <button
                            onClick={createSlot}
                            className="bg-blue-600 text-white px-4 py-2 rounded"
                        >
                            Add Slot
                        </button>

                    </div>
                )}
            {caseData.consultation_slots?.map((slot, index) => (

                <div key={index} className="flex justify-between bg-white p-3 rounded mt-2">

                    <span>
                        {new Date(slot).toLocaleString()}
                    </span>

                </div>

            ))}

            {/* ================= DOCTOR REVIEW ================= */}
            {caseData.status === "ai_completed" && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                        Doctor Review
                    </h3>

                    <textarea
                        className="border p-3 rounded w-full"
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Enter review notes..."
                    />

                    <button
                        onClick={reviewCase}
                        className="bg-blue-600 text-white px-6 py-3 rounded-xl"
                    >
                        Save Review
                    </button>
                </div>
            )}

            {/* ================= FINALIZE ================= */}
            {caseData.status === "reviewed" && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-lg">
                        Finalize Case
                    </h3>

                    <input
                        type="text"
                        className="border p-2 rounded w-full"
                        placeholder="Final Diagnosis"
                        value={finalDiagnosis}
                        onChange={(e) => setFinalDiagnosis(e.target.value)}
                    />

                    <textarea
                        className="border p-3 rounded w-full"
                        placeholder="Doctor Notes"
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                    />

                    <button
                        onClick={finalizeCase}
                        className="bg-red-600 text-white px-6 py-3 rounded-xl"
                    >
                        Finalize Case
                    </button>
                </div>
            )}

            {previewOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">

                    <div className="relative bg-white rounded-2xl p-6 max-w-4xl w-full mx-6">

                        {/* Close Button */}
                        <button
                            onClick={() => setPreviewOpen(false)}
                            className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
                        >
                            ✕
                        </button>

                        {/* Image */}
                        <img
                            src={`http://127.0.0.1:5000/uploads/${caseData.test_file}`}
                            alt="MRI Preview"
                            className="w-full max-h-[80vh] object-contain rounded-xl"
                        />

                    </div>
                </div>
            )}

        </div>

    );
};

export default DoctorCaseReview;