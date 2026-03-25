import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const TestSelectionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);

    const testDisease = caseData?.suspected_disease?.toLowerCase();

    useEffect(() => {
        fetchCase();
    }, []);

    const fetchCase = async () => {
        try {
            const res = await api.get(`/cases/${id}`);
            setCaseData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const chooseTest = async (test) => {

        try {

            await api.post(`/cases/${id}/choose-test`, {
                selected_test: test
            });

            if (test === "cognitive") {
                navigate(`/patient/case/${id}/cognitive-test`);
            } else {
                navigate(`/patient/case/${id}/upload`);
            }

        } catch (err) {
            console.error(err);
        }

    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-gray-100 flex justify-center items-center p-10">

            <div className="bg-white w-full max-w-3xl p-10 rounded-3xl shadow-xl">

                <h2 className="text-2xl font-bold text-center mb-6">
                    Select Diagnostic Test
                </h2>

                {/* Show suspected disease */}
                {testDisease && (
                    <p className="text-center text-gray-600 mb-6">
                        Your doctor suspects:{" "}
                        <span className="font-semibold capitalize text-blue-600">
                            {testDisease}
                        </span>
                    </p>
                )}

                {/* How system works */}
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-xl mb-8">

                    <h3 className="font-semibold text-lg mb-2">
                        How This Works
                    </h3>

                    <p className="text-gray-700 text-sm">
                        Our AI system helps doctors analyze neurological conditions.
                        Please choose the diagnostic test recommended by your doctor.
                    </p>

                    <ul className="list-disc pl-5 text-sm mt-3 text-gray-700 space-y-1">
                        <li>Select the recommended test</li>
                        <li>Follow instructions carefully</li>
                        <li>Upload the test result</li>
                        <li>AI analyzes the data</li>
                        <li>Doctor reviews the result</li>
                    </ul>

                </div>

                {/* TEST OPTIONS */}
                <div className="space-y-4">

                    {/* Parkinson Tests */}
                    {testDisease?.includes("parkinson") && (
                        <>
                            <div
                                onClick={() => chooseTest("audio")}
                                className="bg-purple-50 border border-purple-200 p-6 rounded-xl hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                            >

                                <div className="flex items-center gap-3 mb-2">

                                    <span className="text-2xl">🎤</span>

                                    <h3 className="text-lg font-semibold text-purple-700">
                                        Voice Recording Test
                                    </h3>

                                </div>

                                <p className="text-sm text-gray-600">
                                    Record your voice so the AI system can analyze speech patterns related to Parkinson's disease.
                                </p>

                            </div>

                            <div
                                onClick={() => chooseTest("features")}
                                className="bg-blue-50 border border-blue-200 p-6 rounded-xl hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                            >

                                <div className="flex items-center gap-3 mb-2">

                                    <span className="text-2xl">📄</span>

                                    <h3 className="text-lg font-semibold text-blue-700">
                                        Voice Feature Report
                                    </h3>

                                </div>

                                <p className="text-sm text-gray-600">
                                    Upload a PDF report containing acoustic voice feature analysis from a diagnostic lab.
                                </p>

                            </div>
                        </>
                    )}

                    {/* Alzheimer Tests */}
                    {testDisease?.includes("alzheimer") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                            {/* 🧠 Cognitive Test */}
                            <div
                                onClick={() => chooseTest("cognitive")}
                                className="bg-orange-50 border border-orange-200 p-6 rounded-xl hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">📝</span>
                                    <h3 className="text-lg font-semibold text-orange-700">
                                        Cognitive Assessment
                                    </h3>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Evaluate memory and thinking ability through cognitive testing.
                                </p>
                            </div>

                            {/* 🧬 MRI Test */}
                            <div
                                onClick={() => chooseTest("mri")}
                                className="bg-green-50 border border-green-200 p-6 rounded-xl hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">🧠</span>
                                    <h3 className="text-lg font-semibold text-green-700">
                                        MRI Brain Scan
                                    </h3>
                                </div>

                                <p className="text-sm text-gray-600">
                                    Brain imaging test used to detect structural changes in the brain.
                                </p>
                            </div>

                        </div>
                    )}

                    {/* Multiple Sclerosis */}
                    {testDisease?.includes("ms") && (

                        <div
                            onClick={() => chooseTest("mri")}
                            className="bg-green-50 border border-green-200 p-6 rounded-xl hover:shadow-lg cursor-pointer transition transform hover:-translate-y-1"
                        >

                            <div className="flex items-center gap-3 mb-2">

                                <span className="text-2xl">🧠</span>

                                <h3 className="text-lg font-semibold text-green-700">
                                    MRI Scan
                                </h3>

                            </div>

                            <p className="text-sm text-gray-600">
                                MRI scans help detect lesions or damage in the brain and spinal cord,
                                which are commonly associated with Multiple Sclerosis.
                            </p>

                        </div>

                    )}

                    {/* If doctor has not selected disease */}
                    {!testDisease && (
                        <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl text-sm text-yellow-800">
                            Your doctor has not selected a diagnostic test yet.
                            Please wait for doctor evaluation.
                        </div>
                    )}

                </div>

            </div>
        </div>
    );
};

export default TestSelectionPage;