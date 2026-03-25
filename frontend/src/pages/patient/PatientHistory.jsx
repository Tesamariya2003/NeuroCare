import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const PatientHistory = () => {

    const navigate = useNavigate();

    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {

        try {

            const res = await api.get("/api/patient/history");
            setHistory(res.data);

        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }

    };

    // Risk badge style
    const getRiskStyle = (text) => {

        const t = text?.toLowerCase() || "";

        if (t.includes("high"))
            return "bg-red-50 text-red-700 border-red-200";

        if (t.includes("moderate") || t.includes("chance"))
            return "bg-orange-50 text-orange-700 border-orange-200";

        return "bg-green-50 text-green-700 border-green-200";

    };

    // Statistics
    const total = history.length;

    const highRisk = history.filter(c =>
        c.final_diagnosis?.toLowerCase().includes("high")
    ).length;

    const moderateRisk = history.filter(c =>
        c.final_diagnosis?.toLowerCase().includes("moderate")
    ).length;

    const lowRisk = history.filter(c =>
        c.final_diagnosis?.toLowerCase().includes("low")
    ).length;

    if (loading) return <Loader />;

    return (

        <div className="p-8">

            <h1 className="text-2xl font-semibold text-slate-800 mb-6">
                Case History
            </h1>


            {/* Statistics Cards */}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">

                <div className="bg-white p-4 rounded-xl shadow text-center">
                    <p className="text-sm text-gray-500">Total Cases</p>
                    <p className="text-xl font-semibold">{total}</p>
                </div>

                <div className="bg-red-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-red-600">High Risk</p>
                    <p className="text-xl font-semibold">{highRisk}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-orange-600">Moderate Risk</p>
                    <p className="text-xl font-semibold">{moderateRisk}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl text-center">
                    <p className="text-sm text-green-600">Low Risk</p>
                    <p className="text-xl font-semibold">{lowRisk}</p>
                </div>

            </div>


            {/* Table */}

            <div className="bg-white rounded-xl shadow overflow-hidden">

                <table className="w-full text-left">

                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">

                        <tr>
                            <th className="px-6 py-4">Patient</th>
                            <th className="px-6 py-4">Subject</th>
                            <th className="px-6 py-4">Diagnosis</th>
                            <th className="px-6 py-4 text-right">Report</th>
                        </tr>

                    </thead>

                    <tbody className="divide-y divide-gray-100">

                        {history.map((item) => (

                            <tr key={item._id} className="hover:bg-gray-50">

                                <td className="px-6 py-4 font-medium text-gray-800">
                                    {item.name}
                                </td>

                                <td className="px-6 py-4 text-gray-700">
                                    {item.subject}
                                </td>

                                <td className="px-6 py-4">

                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskStyle(item.final_diagnosis)}`}
                                    >
                                        {item.final_diagnosis}
                                    </span>

                                </td>

                                <td className="px-6 py-4 text-right">

                                    <button
                                        onClick={() => navigate(`/patient/case/${item._id}/report`)}
                                        className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
                                    >
                                        View Report
                                    </button>

                                </td>

                            </tr>

                        ))}

                    </tbody>

                </table>

            </div>

        </div>

    );

};

export default PatientHistory;