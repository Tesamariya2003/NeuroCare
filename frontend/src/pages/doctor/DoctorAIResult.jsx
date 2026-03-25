import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import toast from "react-hot-toast";

const DoctorAIResult = () => {
    const { id } = useParams();
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctorNotes, setDoctorNotes] = useState("");
    const [finalDiagnosis, setFinalDiagnosis] = useState("");
    const [previewOpen, setPreviewOpen] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(1);
    const [slotDate, setSlotDate] = useState("");
    const [slotTime, setSlotTime] = useState("");
    const [slots, setSlots] = useState([]);
    const [savedSlots, setSavedSlots] = useState([]);
    const [showWhy, setShowWhy] = useState(false);
    const selectedTest = caseData?.selected_test;
    const handleReopen = async () => {
        try {
            await api.post(`/cases/doctor/reopen/${id}`);
            toast.success("Case reopened successfully");
            fetchCase();
        } catch {
            toast.error("Failed to reopen case");
        }
    };

    useEffect(() => {
        fetchCase();
    }, []);

    /* ================= LOAD SAVED DRAFT ================= */
    useEffect(() => {
        const savedNotes = localStorage.getItem(`notes_${id}`);
        const savedDiagnosis = localStorage.getItem(`diagnosis_${id}`);

        if (savedNotes) setDoctorNotes(savedNotes);
        if (savedDiagnosis) setFinalDiagnosis(savedDiagnosis);
    }, [id]);
    /* ================= AUTO SAVE DRAFT ================= */
    useEffect(() => {
        localStorage.setItem(`notes_${id}`, doctorNotes);
    }, [doctorNotes, id]);

    useEffect(() => {
        localStorage.setItem(`diagnosis_${id}`, finalDiagnosis);
    }, [finalDiagnosis, id]);



    const fetchCase = async () => {
        try {
            const res = await api.get(`/cases/${id}`);

            const data = res.data;

            setCaseData(data);

            // ⭐ Load saved notes
            if (data.doctor_notes) {
                setDoctorNotes(data.doctor_notes);
            }

            if (data.final_diagnosis) {
                setFinalDiagnosis(data.final_diagnosis);
            }

        } catch {
            toast.error("Failed to fetch case");
        } finally {
            setLoading(false);
        }
    };

    const reviewCase = async () => {
        try {
            await api.post(`/cases/doctor/review/${id}`, {
                doctor_notes: doctorNotes,
            });
            toast.success("Clinical notes saved");
            fetchCase();
        } catch {
            toast.error("Failed to save notes");
        }
    };

    const finalizeCase = async () => {
        if (!finalDiagnosis)
            return toast.error("Enter final diagnosis");

        try {
            await api.post(`/cases/doctor/finalize/${id}`, {
                final_diagnosis: finalDiagnosis,
                doctor_notes: doctorNotes,
            });
            toast.success("Case finalized successfully");
            fetchCase();
            localStorage.removeItem(`notes_${id}`);
            localStorage.removeItem(`diagnosis_${id}`);
        } catch {
            toast.error("Failed to finalize case");
        }
    };
    const addSlot = () => {

        if (!slotDate || !slotTime) {
            return toast.error("Select date and time");
        }

        const newSlot = {
            date: slotDate,
            time: slotTime
        };

        const exists = slots.find(
            s => s.date === slotDate && s.time === slotTime
        );

        if (exists) {
            return toast.error("Slot already added");
        }

        setSlots([...slots, newSlot]);
        setSlotTime("");

    };
    const saveSlots = async () => {

        if (!slotDate || slots.length === 0) {
            return toast.error("Add at least one slot");
        }

        try {

            await api.post(`/doctor/case/${id}/create-slots`, {
                slots: slots
            });

            toast.success("Slots created successfully");

            setSlots([]);
            setSlotDate("");
            fetchCase();

        } catch (err) {

            console.log(err);
            toast.error("Failed to create slots");

        }

    };
    const handleEdit = (slot) => {

        setSlotDate(slot.date);
        setSlotTime(slot.time);

    };
    const handleDelete = async (slot) => {

        try {

            await api.delete(`/doctor/delete-slot`, {
                data: slot
            });

            toast.success("Slot removed");

            fetchCase();

        } catch {

            toast.error("Failed to delete slot");

        }

    };
    if (loading) return <Loader />;
    if (!caseData) return <div className="p-6">Case not found</div>;

    const ai = caseData.ai_result;
    // Get probability value safely (confidence first, then probability)
    const rawProb =
        ai?.confidence ?? null;

    const numericProb = rawProb !== null ? parseFloat(rawProb) : null;



    const generateClinicalSuggestion = () => {
        if (!ai?.severity) return "";

        const severity = ai.severity.toLowerCase();

        if (severity.includes("low")) {
            return `
Low risk of the suspected disease detected.

Findings do not indicate strong pathological evidence of the suspected condition. 
Immediate pharmacological intervention is not required at this stage.

Clinical monitoring and routine follow-up are recommended.
Consultation with a neurologist is advised for further evaluation if symptoms persist.
    `.trim();
        }

        if (severity.includes("moderate")) {
            return `
Moderate risk level detected.

Findings indicate borderline abnormalities. 
The condition does not appear critical at this stage.

Immediate aggressive treatment may not be necessary; however, 
a neurological consultation is strongly recommended for detailed evaluation and management planning.
    `.trim();
        }

        if (severity.includes("high")) {
            return `
High risk of the suspected disease detected.

Findings strongly correlate with pathological indicators 
consistent with the suspected condition.

Immediate consultation with a neurologist is strongly recommended. 
Early intervention and further diagnostic workup are advised.
    `.trim();
        }

        return "";
    };

    const isFinalized = caseData.status === "finalized";
    const canEdit =
        caseData.status === "ai_completed" ||
        caseData.status === "reviewed";

    const formatTime = (time) => {
        const [hour, minute] = time.split(":");
        let h = parseInt(hour);
        const ampm = h >= 12 ? "PM" : "AM";

        h = h % 12;
        h = h ? h : 12;

        return `${h}:${minute} ${ampm}`;
    };
    const timeSlots = {
        morning: ["09:30", "10:00", "10:30", "11:00"],
        afternoon: ["13:00", "14:00", "15:00"],
        evening: ["17:00", "18:00", "19:00"]
    };
    const toggleSlot = (time) => {

        if (!slotDate) {
            return toast.error("Select date first");
        }

        const newSlot = {
            date: slotDate,
            time: time
        };

        const exists = slots.find(
            s => s.date === slotDate && s.time === time
        );

        if (exists) {
            setSlots(slots.filter(
                s => !(s.date === slotDate && s.time === time)
            ));
        } else {
            setSlots([...slots, newSlot]);
        }

    };
    console.log("AI RESULT:", caseData?.ai_result);
    console.log("Selected Test in Card:", selectedTest);

    return (
        <div className="max-w-6xl mx-auto p-8">

            <div className="bg-white shadow-xl rounded-3xl p-10 space-y-10">

                {/* ================= TITLE ================= */}
                <h2 className="text-2xl font-bold">
                    Clinical Decision & Finalization
                </h2>

                {/* ================= PATIENT SUMMARY ================= */}
                <div className="bg-white rounded-2xl shadow-lg p-10 space-y-10">

                    {/* ================= PATIENT SECTION ================= */}
                    <div>

                        <h3 className="text-xl font-semibold mb-6">
                            Patient Overview
                        </h3>

                        <div className="grid grid-cols-2 gap-8 text-base">

                            <div>
                                <p className="text-gray-500 uppercase text-l tracking-wide">
                                    Patient Name
                                </p>
                                <p className="text-lg font-semibold">
                                    {caseData.name}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 uppercase text-l tracking-wide">
                                    Age
                                </p>
                                <p className="text-lg font-semibold">
                                    {caseData.age}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 uppercase text-l tracking-wide">
                                    Gender
                                </p>
                                <p className="text-lg font-semibold">
                                    {caseData.gender}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 uppercase text-l tracking-wide">
                                    Test Type
                                </p>
                                <p className="text-lg font-semibold capitalize">
                                    {caseData.selected_test}
                                </p>
                            </div>

                        </div>

                        {/* Symptoms */}
                        <div className="mt-6">
                            <p className="text-gray-500 uppercase text-l tracking-wide mb-3">
                                Reported Symptoms
                            </p>

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

                    {/* Divider */}
                    <div className="border-t" />

                    {/* ================= FILE SECTION ================= */}
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
                            {caseData.test_file.match(/\.(wav|mp3|webm)$/i) && (
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
                    {/* Divider */}
                    <div className="border-t" />

                    {/* ================= AI ASSESSMENT ================= */}
                    <div>

                        <h3 className="text-xl font-semibold mb-6">
                            AI Clinical Assessment
                        </h3>

                        <div className="grid grid-cols-2 gap-8">

                            <div>
                                <p className="text-gray-500 uppercase text-l">
                                    Detected Condition
                                </p>
                                <p className="text-xl font-bold text-blue-700">
                                    {ai?.disease}
                                </p>
                            </div>

                            <div>
                                <p className="text-gray-500 uppercase text-l">
                                    Severity Level
                                </p>
                                <span className={`px-4 py-1 rounded-full text-sm font-semibold ${ai?.severity?.toLowerCase().includes("high")
                                    ? "bg-red-100 text-red-600"
                                    : ai?.severity?.toLowerCase().includes("moderate")
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-green-100 text-green-600"
                                    }`}>
                                    {ai?.severity}
                                </span>
                            </div>

                            <div>
                                <p className="text-gray-500 uppercase text-l tracking-wide">
                                    Probability
                                </p>

                                <p className="text-lg font-semibold mt-1">
                                    {(() => {
                                        const raw =
                                            ai?.confidence ?? ai?.probability ?? null;

                                        if (raw === null || raw === undefined || isNaN(raw)) {
                                            return "Not Available";
                                        }

                                        let percent = parseFloat(raw);

                                        // If backend already sends percentage (like 92.6)
                                        if (percent > 1) {
                                            percent = percent;
                                        } else {
                                            percent = percent * 100;
                                        }

                                        // Avoid unrealistic 100%
                                        if (percent >= 100) {
                                            percent = 99.9;
                                        }

                                        return `${percent.toFixed(2)}%`;
                                    })()}
                                </p>
                            </div>



                            <div>
                                <p className="text-gray-500 uppercase text-l">
                                    Clinical Prediction
                                </p>
                                <p className="text-base font-medium">
                                    {ai?.prediction}
                                </p>
                            </div>

                        </div>

                        <div className="mt-6">
                            <p className="text-gray-500 uppercase text-l">
                                AI Recommendation
                            </p>
                            <p className="text-l mt-2">
                                {ai?.recommendation}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowWhy(!showWhy)}
                            className="text-blue-600 text-lg font-medium mt-3 hover:underline"
                        >
                            Why this result?
                        </button>
                        {showWhy && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl text-lg text-gray-700 space-y-2">

                                {/* PARKINSON */}
                                {caseData?.ai_result?.disease === "Parkinson’s" && (
                                    <>
                                        {caseData?.ai_result?.severity === "High" && (
                                            <p>
                                                The analysis detected strong irregularities in voice patterns, including unstable pitch and amplitude variations.
                                                These changes are commonly associated with motor control impairments seen in Parkinson’s disease.
                                                Based on these observations, the system indicates a higher risk level and further clinical evaluation is recommended.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Moderate" && (
                                            <p>
                                                The system detected mild variations in voice stability which may indicate early neurological changes.
                                                While not conclusive, these patterns suggest a moderate risk and should be further evaluated clinically.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Low" && (
                                            <p>
                                                The voice patterns are within normal range with minimal variation.
                                                No strong indicators of neurological impairment were detected, suggesting a low risk level.
                                            </p>
                                        )}
                                    </>
                                )}

                                {/* MULTIPLE SCLEROSIS */}
                                {caseData?.ai_result?.disease === "Multiple Sclerosis" && (
                                    <>
                                        {caseData?.ai_result?.severity === "High" && (
                                            <p>
                                                The MRI analysis identified structural abnormalities that may resemble lesion-like regions in the brain.
                                                These findings are commonly associated with Multiple Sclerosis and indicate a higher risk level.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Moderate" && (
                                            <p>
                                                Some irregular patterns were observed in the MRI scan, but they are not strongly conclusive.
                                                These may indicate early or mild abnormalities requiring further clinical evaluation.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Low" && (
                                            <p>
                                                No significant abnormalities were detected in the MRI scan.
                                                The brain structure appears within normal limits, suggesting a low risk level.
                                            </p>
                                        )}
                                    </>
                                )}

                                {/* ALZHEIMER */}
                                {caseData?.ai_result?.disease === "Alzheimer’s" && (
                                    <>
                                        {caseData?.ai_result?.severity === "High" && (
                                            <p>
                                                The cognitive assessment indicates significant decline in memory and functional abilities.
                                                Combined with MMSE score and behavioral indicators, these findings suggest a higher risk of Alzheimer’s disease.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Moderate" && (
                                            <p>
                                                Some cognitive decline indicators were observed, including memory issues and reduced functional performance.
                                                These patterns suggest a moderate risk and should be monitored with further evaluation.
                                            </p>
                                        )}

                                        {caseData?.ai_result?.severity === "Low" && (
                                            <p>
                                                Cognitive performance appears within normal range.
                                                No major indicators of decline were detected, suggesting a low risk level.
                                            </p>
                                        )}
                                    </>
                                )}
                                {/* ALZHEIMER MRI */}
                                {caseData?.ai_result?.disease === "Alzheimer’s" &&
                                    caseData?.selected_test === "mri" && (
                                        <>
                                            {caseData?.ai_result?.severity === "High Risk" && (
                                                <p>
                                                    The MRI analysis identified significant structural changes in key brain regions such as the hippocampus,
                                                    which are strongly associated with Alzheimer’s disease. These abnormalities indicate a high risk level
                                                    and require immediate neurological evaluation.
                                                </p>
                                            )}

                                            {caseData?.ai_result?.severity === "Moderate Risk" && (
                                                <p>
                                                    The MRI scan shows mild to moderate structural variations in brain regions linked to cognitive function.
                                                    While not definitive, these findings suggest a moderate risk and should be further evaluated clinically.
                                                </p>
                                            )}

                                            {caseData?.ai_result?.severity === "Low Risk" && (
                                                <p>
                                                    The MRI findings are within normal structural limits with no significant abnormalities detected.
                                                    This suggests a low risk level of Alzheimer’s disease at this stage.
                                                </p>
                                            )}
                                        </>
                                    )}
                                {/* FINAL NOTE */}
                                <p className="font-medium text-gray-600">
                                    This is a clinical decision support output and not a final diagnosis.
                                </p>

                            </div>
                        )}

                    </div>

                </div>


                {/* ================= DOCTOR NOTES ================= */}
                <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">

                    <h3 className="text-xl font-semibold">
                        Doctor Clinical Decision
                    </h3>
                    {ai?.severity && (
                        <div className="mb-4">
                            <button
                                onClick={() => setDoctorNotes(generateClinicalSuggestion())}
                                className="text-blue-600 font-medium hover:underline"
                            >
                                Use AI-Based Clinical Recommendation
                            </button>
                        </div>
                    )}
                    {/* Clinical Notes */}
                    <div>
                        <label className="block text-l font-medium text-gray-600 mb-2">
                            Clinical Notes
                        </label>

                        <textarea
                            disabled={!canEdit || isFinalized}
                            className={`w-full border border-gray-300 rounded-xl p-4 min-h-[130px] focus:ring-2 focus:ring-blue-500 outline-none ${isFinalized ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                            placeholder="Enter clinical findings..."
                            value={doctorNotes}
                            onChange={(e) => setDoctorNotes(e.target.value)}
                        />
                    </div>

                    {/* Divider */}
                    <div className="border-t pt-6">

                        <label className="block text-l font-medium text-gray-600 mb-2">
                            Final Confirmed Diagnosis
                        </label>

                        <textarea
                            disabled={!canEdit || isFinalized}
                            className={`w-full border border-gray-300 rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-red-500 outline-none ${isFinalized ? "bg-gray-100 cursor-not-allowed" : ""
                                }`}
                            placeholder="Enter final confirmed diagnosis..."
                            value={finalDiagnosis}
                            onChange={(e) => setFinalDiagnosis(e.target.value)}
                        />

                        <p className="text-xs text-red-500 mt-2">
                            ⚠ Once finalized, this case will be locked and cannot be edited.
                        </p>

                    </div>
                    {/* ================= CONSULTATION SLOT ================= */}
                    {caseData?.status === "ai_completed" && ai?.severity === "High" && (

                        <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl">

                            <h3 className="font-semibold text-lg mb-4">
                                Create Consultation Slots
                            </h3>

                            <label className="block font-medium mb-2">Select Date</label>

                            <input
                                type="date"
                                className="border p-3 rounded-lg mb-4"
                                value={slotDate}
                                onChange={(e) => setSlotDate(e.target.value)}
                            />


                            {/* MORNING */}

                            <h4 className="font-semibold mb-2">Morning</h4>

                            <div className="flex flex-wrap gap-2 mb-4">

                                {timeSlots.morning.map(time => {

                                    const selected = slots.find(
                                        s => s.date === slotDate && s.time === time
                                    );

                                    return (

                                        <button
                                            key={time}
                                            onClick={() => toggleSlot(time)}
                                            className={`px-4 py-2 rounded-lg border ${selected
                                                ? "bg-blue-600 text-white"
                                                : "bg-white hover:bg-gray-100"
                                                }`}
                                        >

                                            {formatTime(time)}

                                        </button>

                                    );

                                })}

                            </div>


                            {/* AFTERNOON */}

                            <h4 className="font-semibold mb-2">Afternoon</h4>

                            <div className="flex flex-wrap gap-2 mb-4">

                                {timeSlots.afternoon.map(time => {

                                    const selected = slots.find(
                                        s => s.date === slotDate && s.time === time
                                    );

                                    return (

                                        <button
                                            key={time}
                                            onClick={() => toggleSlot(time)}
                                            className={`px-4 py-2 rounded-lg border ${selected
                                                ? "bg-blue-600 text-white"
                                                : "bg-white hover:bg-gray-100"
                                                }`}
                                        >

                                            {formatTime(time)}

                                        </button>

                                    );

                                })}

                            </div>


                            {/* EVENING */}

                            <h4 className="font-semibold mb-2">Evening</h4>

                            <div className="flex flex-wrap gap-2 mb-4">

                                {timeSlots.evening.map(time => {

                                    const selected = slots.find(
                                        s => s.date === slotDate && s.time === time
                                    );

                                    return (

                                        <button
                                            key={time}
                                            onClick={() => toggleSlot(time)}
                                            className={`px-4 py-2 rounded-lg border ${selected
                                                ? "bg-blue-600 text-white"
                                                : "bg-white hover:bg-gray-100"
                                                }`}
                                        >

                                            {formatTime(time)}

                                        </button>

                                    );

                                })}

                            </div>


                            {/* SLOT LIST */}

                            <div className="space-y-2 mb-4">

                                {slots.map((slot, index) => (

                                    <div
                                        key={index}
                                        className="flex justify-between items-center bg-white border rounded-lg px-4 py-2 shadow-sm"
                                    >

                                        <div className="text-sm text-gray-700">

                                            <span className="font-semibold">
                                                {new Date(slot.date).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}
                                            </span>

                                            <span className="mx-2 text-gray-400">•</span>

                                            <span className="font-medium">
                                                {formatTime(slot.time)}
                                            </span>

                                        </div>

                                        <button
                                            onClick={() =>
                                                setSlots(slots.filter((_, i) => i !== index))
                                            }
                                            className="text-red-500 font-bold text-lg"
                                        >
                                            ×
                                        </button>

                                    </div>

                                ))}

                            </div>


                            <button
                                onClick={saveSlots}
                                className="bg-green-600 text-white px-6 py-2 rounded"
                            >
                                Save Slots
                            </button>

                        </div>

                    )}
                    {/* ================= SAVED SLOTS ================= */}

                    {savedSlots.length > 0 && (

                        <div className="mt-6 bg-gray-50 border rounded-xl p-6">

                            <h3 className="font-semibold text-lg mb-4">
                                Existing Consultation Slots
                            </h3>

                            <div className="space-y-2">

                                {savedSlots.map((slot, index) => (

                                    <div
                                        key={index}
                                        className="flex justify-between items-center bg-white border rounded-lg px-4 py-2"
                                    >

                                        <div>

                                            <span className="font-semibold">

                                                {new Date(slot.date).toLocaleDateString("en-GB", {
                                                    day: "2-digit",
                                                    month: "short",
                                                    year: "numeric"
                                                })}

                                            </span>

                                            <span className="mx-2 text-gray-400">•</span>

                                            <span>

                                                {formatTime(slot.time)}

                                            </span>

                                        </div>

                                        <div className="flex gap-3">

                                            <button
                                                onClick={() => handleEdit(slot)}
                                                className="text-blue-600 font-medium"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => handleDelete(slot)}
                                                className="text-red-600 font-medium"
                                            >
                                                Delete
                                            </button>

                                        </div>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-4 pt-4">

                        {!isFinalized && (
                            <>
                                <button
                                    onClick={reviewCase}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
                                >
                                    Save Notes
                                </button>

                                <button
                                    onClick={finalizeCase}
                                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-semibold shadow-md"
                                >
                                    Finalize Case
                                </button>
                            </>
                        )}

                    </div>

                </div>
                {previewOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                        {/* White Modal Container */}
                        <div className="bg-white rounded-2xl shadow-2xl w-[85%] max-w-6xl p-6 relative">

                            {/* Close Button */}
                            <button
                                onClick={() => setPreviewOpen(false)}
                                className="absolute top-4 right-5 text-gray-600 text-2xl"
                            >
                                ×
                            </button>

                            <div className="flex">

                                {/* Image Section */}
                                <div className="flex-1 flex items-center justify-center bg-black rounded-xl p-6">

                                    <div className="w-full h-[70vh] flex items-center justify-center overflow-hidden">

                                        <img
                                            src={`http://127.0.0.1:5000/uploads/${caseData.test_file}`}
                                            alt="MRI Scan"
                                            className="h-full object-contain transition-transform duration-200"
                                            style={{ transform: `scale(${zoomLevel})` }}
                                        />

                                    </div>

                                </div>

                                {/* Zoom Controls Sidebar */}
                                <div className="w-24 flex flex-col items-center justify-center space-y-5 ml-6">

                                    <button
                                        onClick={() => setZoomLevel(zoomLevel + 0.2)}
                                        className="w-12 h-12 bg-blue-600 text-white rounded-full text-xl shadow-md"
                                    >
                                        +
                                    </button>

                                    <button
                                        onClick={() => setZoomLevel(1)}
                                        className="w-12 h-12 bg-gray-500 text-white rounded-full text-xs"
                                    >
                                        Reset
                                    </button>

                                    <button
                                        onClick={() =>
                                            setZoomLevel(Math.max(1, zoomLevel - 0.2))
                                        }
                                        className="w-12 h-12 bg-blue-600 text-white rounded-full text-xl shadow-md"
                                    >
                                        −
                                    </button>

                                </div>

                            </div>

                        </div>
                    </div>
                )}
            </div>

        </div >
    );
};

export default DoctorAIResult;