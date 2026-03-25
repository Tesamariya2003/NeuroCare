const FinalReportCard = ({ caseData }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md">

      <h3 className="text-xl font-semibold mb-6">
        Medical Report Summary
      </h3>

      {/* Doctor Diagnosis */}
      <div className="bg-green-50 border border-green-200 p-5 rounded-xl">

        <p className="font-semibold mb-2">
          Doctor’s Final Diagnosis:
        </p>

        <p className="text-lg">
          {caseData.final_diagnosis}
        </p>

        {caseData.doctor_notes && (
          <div className="mt-4">
            <p className="font-semibold mb-1">
              Doctor’s Notes:
            </p>
            <p>{caseData.doctor_notes}</p>
          </div>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        ⚠ This report summarizes your doctor’s evaluation.
        Please consult your healthcare provider for further clarification.
      </div>

    </div>
  );
};

export default FinalReportCard;