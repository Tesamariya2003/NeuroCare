const StatusBadge = ({ status }) => {
  const getColor = () => {
    switch (status) {
      case "submitted":
        return "bg-gray-200 text-gray-700";

      case "awaiting_patient_test_choice":
        return "bg-yellow-100 text-yellow-700";

      case "test_requested":
        return "bg-blue-100 text-blue-700";

      case "test_submitted":
        return "bg-indigo-100 text-indigo-700";

      case "mmse_pending":
      case "awaiting_mmse_slot_selection":
        return "bg-purple-100 text-purple-700";

      case "mmse_confirmed":
        return "bg-cyan-100 text-cyan-700";

      case "ai_completed":
        return "bg-green-100 text-green-700";

      case "reviewed":
        return "bg-orange-100 text-orange-700";

      case "closed":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-sm font-medium ${getColor()}`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
};

export default StatusBadge;