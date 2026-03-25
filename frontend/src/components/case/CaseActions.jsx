import UploadForm from "./UploadForm";
import MMSESlotCreator from "./MMSESlotCreator";
import MMSESlotSelector from "./MMSESlotSelector";
import AIResultCard from "./AIResultCard";
import toast from "react-hot-toast";
import CognitiveQuestionnaire from "./CognitiveQuestionnaire";
import FinalReportCard from "./FinalReportCard";

const CaseActions = ({
  caseData,
  role,
  onChooseTest,
  onUpload,
  onSelectSlot,
  onRunAI,
  onSubmitCognitive,
  onRefresh
}) => {

  if (!caseData) return null;

  const {
    status,
    available_tests,
    mmse_slots,
    ai_result,
    cognitive_form,
    questionnaire_total
  } = caseData;

  const mapValue = (v) =>
    ["Never", "Sometimes", "Often", "Very Often"][v] || "Unknown";

  /* =============================
     PATIENT ACTIONS
  ============================== */
  if (role === "patient") {

    // 1️⃣ Select test
    if (status === "awaiting_patient_test_choice") {
      return (
        <div className="mt-6 bg-gray-100 p-4 rounded-xl">
          <h3 className="font-semibold mb-3">Select Test</h3>

          {available_tests?.map((test) => (
            <button
              key={test}
              onClick={() => onChooseTest(test)}
              className="block w-full mb-2 bg-blue-600 text-white p-2 rounded-lg"
            >
              {test.toUpperCase()}
            </button>
          ))}
        </div>
      );
    }

    // 2️⃣ Cognitive form
    if (status === "awaiting_cognitive_form") {
      return (
        <CognitiveQuestionnaire
          onSubmit={async (data) => {
            await onSubmitCognitive(data);
            toast.success("Cognitive form submitted");
          }}
        />
      );
    }

    // 3️⃣ Upload MRI / Audio
    if (status === "test_requested") {
      return (
        <UploadForm
          onUpload={async (file) => {
            await onUpload(file);
            toast.success("File uploaded");
          }}
        />
      );
    }

    // 4️⃣ Select MMSE slot (🔥 FIXED STATUS HERE)
    if (status === "awaiting_mmse_slot_selection" && mmse_slots?.length > 0) {
      return (
        <MMSESlotSelector
          slots={mmse_slots}
          onSelect={async (slot) => {
            try {
              await onSelectSlot(slot);
              toast.success("MMSE slot selected");
            } catch {
              toast.error("Slot selection failed");
            }
          }}
        />
      );
    }

    // 5️⃣ Show AI result
    

    return null;
  }

  /* =============================
     DOCTOR ACTIONS
  ============================== */
  if (role === "doctor") {

    // 🔥 Cognitive preview + slot creator
    if (status === "awaiting_mmse_slot_selection") {
      return (
        <div className="mt-6 space-y-6">

          <div className="bg-yellow-50 border p-4 rounded-lg">
            <h3 className="font-semibold mb-3">
              Patient Cognitive Assessment
            </h3>

            {cognitive_form && (
              <>
                <p><strong>Memory Issues:</strong> {mapValue(cognitive_form.MemoryComplaints)}</p>
                <p><strong>Daily Task Difficulty:</strong> {mapValue(cognitive_form.FunctionalAssessment)}</p>
                <p><strong>Needs Help in Activities:</strong> {mapValue(cognitive_form.ADL)}</p>
                <p><strong>Behavior Changes:</strong> {mapValue(cognitive_form.BehavioralProblems)}</p>
                <p><strong>Disorientation:</strong> {mapValue(cognitive_form.Disorientation)}</p>

                <p className="mt-3 font-semibold text-blue-700">
                  Questionnaire Score: {questionnaire_total} / 15
                </p>
              </>
            )}
          </div>

          <MMSESlotCreator
            caseId={caseData._id}
            onSlotsCreated={onRefresh}
          />
        </div>
      );
    }

    // Submit MMSE score (after patient selects slot)
    if (status === "mmse_confirmed") {
      return (
        <div className="mt-6">
          <button
            onClick={onRunAI}
            className="bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            Run AI Analysis
          </button>
        </div>
      );
    }

    if (["ai_completed", "reviewed", "closed"].includes(status)) {
      return <AIResultCard result={ai_result} />;
    }
  }

  return null;
};

export default CaseActions;