import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminCaseDetails = () => {
    const { id } = useParams();
    const [caseData, setCaseData] = useState(null);

    useEffect(() => {
        fetchCase();
    }, []);

    const fetchCase = async () => {
        try {
            const res = await api.get(`/admin/case/${id}`);
            setCaseData(res.data);
        } catch {
            toast.error("Failed to load case details");
        }
    };

    if (!caseData) return <p className="p-8">Loading...</p>;

    return (
        <div className="p-10 bg-gray-100 min-h-screen">
            <div className="bg-white p-8 rounded-xl shadow">

                <h2 className="text-2xl font-bold mb-6">
                    Case Details
                </h2>

                <p><strong>Patient:</strong> {caseData.name}</p>
                <p><strong>Doctor:</strong> {caseData.doctor_name || "Unassigned"}</p>
                <p><strong>Subject:</strong> {caseData.subject}</p>
                <p><strong>Status:</strong> {caseData.status}</p>

                <div className="mt-6">
                    <h3 className="font-semibold mb-2">Symptoms</h3>
                    <ul className="list-disc pl-6">
                        {caseData.symptoms?.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </div>

                {/* ---------------- AI RESULT ---------------- */}

                {caseData.ai_result && (
                    <div className="mt-8 bg-white p-6 rounded-xl shadow">

                        <h3 className="text-xl font-semibold mb-4">
                            AI Analysis Result
                        </h3>

                        <div className="space-y-3">

                            <div>
                                <span className="font-semibold">Diagnosis: </span>
                                {caseData.ai_result.disease}
                            </div>

                            <div>
                                <span className="font-semibold">Risk Level: </span>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${caseData.ai_result.severity === "High"
                                        ? "bg-red-100 text-red-600"
                                        : caseData.ai_result.severity === "Medium"
                                            ? "bg-yellow-100 text-yellow-700"
                                            : "bg-green-100 text-green-600"
                                    }`}>
                                    {caseData.ai_result.severity}
                                </span>
                            </div>

                            <div>
                                <span className="font-semibold">Probability: </span>
                                {Math.round(caseData.ai_result.probability)}%
                            </div>

                            <div>
                                <span className="font-semibold">Prediction Summary: </span>
                                {caseData.ai_result.prediction}
                            </div>

                            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                <span className="font-semibold">Recommendation: </span>
                                {caseData.ai_result.recommendation}
                            </div>

                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default AdminCaseDetails;