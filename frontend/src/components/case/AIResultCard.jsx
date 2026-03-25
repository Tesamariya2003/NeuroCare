const AIResultCard = ({ result,selectedTest }) => {
  if (!result) return null;

  return (
    <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-6">
      <h3 className="text-lg font-semibold mb-2">
        AI Analysis Result
      </h3>

      <p><strong>Disease:</strong> {result.disease}</p>
      <p><strong>Prediction:</strong> {result.prediction}</p>

      {typeof result.probability === "number" && (
        <p><strong>Probability:</strong> {result.probability}</p>
      )}

      {result.confidence && (
        <p><strong>Confidence:</strong> {result.confidence}</p>
      )}

      <p><strong>Severity:</strong> {result.severity}</p>
      <p><strong>Recommendation:</strong> {result.recommendation}</p>
      <p className="text-sm text-gray-600 mt-2">
        Model Used: {result.model_used}
      </p>
    </div>
  );
};

export default AIResultCard;