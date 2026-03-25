import { useEffect, useState } from "react";
import api from "../../services/api";
import Loader from "../../components/common/Loader";
import { useNavigate } from "react-router-dom";

const DoctorCaseHistory = () => {

  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get("/doctor/history");
      setCases(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">
        Case History
      </h2>

      {cases.length === 0 ? (
        <div className="bg-white p-6 rounded-xl shadow">
          No case history available.
        </div>
      ) : (

        <div className="bg-white rounded-xl shadow overflow-hidden">

          <table className="w-full">

            <thead className="bg-gray-200">
              <tr>
                <th className="p-3 text-left">Patient</th>
                <th className="p-3 text-left">Subject</th>
                <th className="p-3 text-left">Diagnosis</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>

            <tbody>

              {cases.map((c) => (

                <tr key={c._id} className="border-b">

                  <td className="p-3">{c.name}</td>

                  <td className="p-3">{c.subject}</td>

                  <td className="p-3">
                    {c.final_diagnosis || "Not specified"}
                  </td>

                  <td className="p-3">
                    {new Date(c.updated_at).toLocaleDateString()}
                  </td>

                  <td className="p-3">

                    <button
                      onClick={() =>
                        navigate(`/doctor/case/${c._id}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </button>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
};

export default DoctorCaseHistory;