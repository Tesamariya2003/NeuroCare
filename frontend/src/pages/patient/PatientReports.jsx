import { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";

const PatientReports = () => {

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {

        try {

            const res = await api.get("/api/patient/reports");
            setReports(res.data);

        } catch (error) {
            console.error("Error fetching reports", error);
        } finally {
            setLoading(false);
        }

    };

    if (loading) return <Loader />;

    return (

        <div className="p-8">

            <h1 className="text-2xl font-semibold text-slate-800 mb-6">
                Medical Reports
            </h1>

            {reports.length === 0 ? (

                <div className="bg-white p-6 rounded-xl shadow">
                    <p className="text-gray-600">
                        No reports available yet.
                    </p>
                </div>

            ) : (

                <div className="grid md:grid-cols-2 gap-6">

                    {reports.slice().reverse().map((report) => (

                        <div
                            key={report._id}
                            className="bg-white p-6 rounded-xl shadow border border-gray-100 flex flex-col justify-between"
                        >

                            <div>
                                <h3 className="font-semibold text-lg mb-1">
                                    {report.subject}
                                </h3>

                                <p className="text-sm text-gray-500">
                                    Diagnosis
                                </p>

                                <p className="text-blue-600 font-medium mt-1">
                                    {report.final_diagnosis}
                                </p>
                            </div>

                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => navigate(`/patient/case/${report._id}/report`)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                                >
                                    View Report
                                </button>
                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>

    );

};

export default PatientReports;