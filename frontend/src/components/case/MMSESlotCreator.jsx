import { useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";
import { FaCalendarPlus, FaTrash, FaCheckCircle, FaClock } from "react-icons/fa";

const MMSESlotCreator = ({ caseId, onSlotsCreated }) => {
  const [slots, setSlots] = useState([""]);

  const handleChange = (index, value) => {
    const updated = [...slots];
    updated[index] = value;
    setSlots(updated);
  };

  const addSlot = () => setSlots([...slots, ""]);

  const removeSlot = (index) => {
    if (slots.length > 1) {
      setSlots(slots.filter((_, i) => i !== index));
    } else {
      setSlots([""]);
    }
  };

  const handleSubmit = async () => {
    const validSlots = slots.filter((s) => s !== "");
    if (validSlots.length === 0) {
      return toast.error("Please add at least one valid slot");
    }

    try {
      await api.post(`/cases/doctor/set-mmse-slots/${caseId}`, {
        mmse_slots: validSlots
      });
      toast.success("Availability published to patient");
      onSlotsCreated();
    } catch {
      toast.error("Failed to set slots");
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg text-xl">
          <FaClock />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-lg">Set Appointment Availability</h3>
          <p className="text-sm text-slate-500">Add multiple time slots for the patient to choose from.</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        {slots.map((slot, index) => (
          <div key={index} className="flex gap-2 group animate-in fade-in slide-in-from-top-1">
            <input
              type="datetime-local"
              value={slot}
              onChange={(e) => handleChange(index, e.target.value)}
              className="flex-1 border border-slate-200 rounded-xl p-3 text-slate-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none"
            />
            <button
              onClick={() => removeSlot(index)}
              className="p-3 text-slate-400 hover:text-red-500 transition-colors"
              title="Remove Slot"
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <button
          onClick={addSlot}
          className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 hover:border-purple-300 hover:text-purple-600 transition-all font-medium"
        >
          <FaCalendarPlus /> Add Another Slot
        </button>

        <button
          onClick={handleSubmit}
          className="flex items-center justify-center gap-2 bg-purple-600 text-white py-4 rounded-xl font-bold hover:bg-purple-700 shadow-lg shadow-purple-100 transition-all transform hover:-translate-y-1 active:scale-95"
        >
          <FaCheckCircle /> Publish Availability
        </button>
      </div>
    </div>
  );
};

export default MMSESlotCreator;