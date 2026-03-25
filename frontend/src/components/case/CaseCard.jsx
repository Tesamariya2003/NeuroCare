import StatusBadge from "../common/StatusBadge";

const CaseCard = ({ caseItem, onClick }) => {
  return (
    <div
      className="bg-white p-4 rounded shadow hover:shadow-md transition cursor-pointer"
      onClick={onClick}
    >
      <h2 className="font-semibold text-lg">
        {caseItem.subject}
      </h2>

      <p className="text-sm text-gray-600 mt-1">
        Symptoms: {caseItem.symptoms?.join(", ")}
      </p>

      <div className="mt-2">
        <StatusBadge status={caseItem.status} />
      </div>

      {caseItem.suspected_disease && (
        <p className="mt-1 text-sm text-gray-700">
          Suspected: {caseItem.suspected_disease}
        </p>
      )}
    </div>
  );
};

export default CaseCard;