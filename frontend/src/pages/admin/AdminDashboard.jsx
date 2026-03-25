import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import toast from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  const [overview, setOverview] = useState({});
  const [doctors, setDoctors] = useState([]);
  const [pendingDoctors, setPendingDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [cases, setCases] = useState([]);

  useEffect(() => {
    fetchOverview();
    fetchDoctors();
    fetchPendingDoctors();
    fetchPatients();
    fetchCases();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchOverview = async () => {
    try {
      const res = await api.get("/admin/overview");
      setOverview(res.data);
    } catch {
      toast.error("Failed to load overview");
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/admin/all-doctors");
      setDoctors(res.data);
    } catch {
      toast.error("Failed to load doctors");
    }
  };

  const fetchPendingDoctors = async () => {
    try {
      const res = await api.get("/admin/pending-doctors");
      setPendingDoctors(res.data);
    } catch {
      toast.error("Failed to load pending doctors");
    }
  };

  const fetchPatients = async () => {
    try {
      const res = await api.get("/admin/all-patients");
      setPatients(res.data);
    } catch {
      toast.error("Failed to load patients");
    }
  };

  const fetchCases = async () => {
    try {
      const res = await api.get("/admin/cases");
      setCases(res.data);
    } catch {
      toast.error("Failed to load cases");
    }
  };

  /* ---------------- APPROVE / REJECT ---------------- */

  const approveDoctor = async (id) => {
    try {
      await api.put(`/admin/approve-doctor/${id}`);
      toast.success("Doctor Approved");
      fetchPendingDoctors();
      fetchDoctors();
      fetchOverview();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectDoctor = async (id) => {
    try {
      await api.put(`/admin/reject-doctor/${id}`);
      toast.success("Doctor Rejected");
      fetchPendingDoctors();
      fetchOverview();
    } catch {
      toast.error("Rejection failed");
    }
  };

  /* ---------------- CASE HELPERS ---------------- */

  const handleViewCase = (id) => {
    navigate(`/admin/case/${id}`);
  };

  const getProgressLabel = (caseObj) => {
    switch (caseObj.status) {
      case "submitted":
        return "Waiting for Doctor";
      case "awaiting_test":
        return "Waiting for Test Upload";
      case "awaiting_cognitive_form":
        return "Cognitive Form Pending";
      case "ai_completed":
        return "AI Completed";
      case "closed":
        return "Case Closed";
      default:
        return caseObj.status;
    }
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>

      {/* TABS */}
      <div className="flex border-b mb-8 space-x-6">
        <Tab label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} />
        <Tab label="Doctors" active={activeTab === "doctors"} onClick={() => setActiveTab("doctors")} />
        <Tab label="Pending Doctors" active={activeTab === "pending"} onClick={() => setActiveTab("pending")} />
        <Tab label="Patients" active={activeTab === "patients"} onClick={() => setActiveTab("patients")} />
        <Tab label="Cases" active={activeTab === "cases"} onClick={() => setActiveTab("cases")} />
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-3 gap-6">
          <StatCard title="Total Doctors" value={overview.total_doctors} />
          <StatCard title="Total Patients" value={overview.total_patients} />
          <StatCard title="Total Cases" value={overview.total_cases} />
          <StatCard title="Active Cases" value={overview.active_cases} />
          <StatCard title="Closed Cases" value={overview.closed_cases} />
          <StatCard title="Pending Doctors" value={overview.pending_doctors} />
        </div>
      )}

      {/* DOCTORS */}
      {activeTab === "doctors" && (
        <Table
          headers={["Name", "Email", "Specialization", "Status"]}
          rows={doctors.map(d => [
            d.name,
            d.email,
            d.specialization || "-",
            <StatusBadge status={d.verification_status} />
          ])}
        />
      )}

      {/* PENDING DOCTORS */}
      {activeTab === "pending" && (
        pendingDoctors.length === 0 ? (
          <p className="text-gray-500">No pending doctors</p>
        ) : (
          <div className="space-y-4">
            {pendingDoctors.map(doc => (
              <div key={doc._id} className="bg-white p-5 rounded shadow">
                <p><strong>Name:</strong> {doc.name}</p>
                <p><strong>Email:</strong> {doc.email}</p>

                <div className="mt-4 space-x-3">
                  <button onClick={() => approveDoctor(doc._id)} className="bg-green-600 text-white px-4 py-2 rounded">
                    Approve
                  </button>
                  <button onClick={() => rejectDoctor(doc._id)} className="bg-red-600 text-white px-4 py-2 rounded">
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* PATIENTS */}
      {activeTab === "patients" && (
        <Table
          headers={["Name", "Email"]}
          rows={patients.map(p => [p.name, p.email])}
        />
      )}

      {/* CASES */}
      {activeTab === "cases" && (
        <Table
          headers={["Patient", "Doctor", "Subject", "Progress", "Status", "Action"]}
          rows={cases.map(c => [
            c.name,
            c.doctor_name || "Unassigned",
            c.subject,
            getProgressLabel(c),
            <StatusBadge status={c.status} />,
            <button
              onClick={() => handleViewCase(c._id)}
              className="text-blue-600 hover:underline"
            >
              View
            </button>
          ])}
        />
      )}
    </div>
  );
};

/* COMPONENTS */

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium border-b-2 transition ${
      active ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-black"
    }`}
  >
    {label}
  </button>
);

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value || 0}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    submitted: "bg-yellow-100 text-yellow-700",
    awaiting_test: "bg-blue-100 text-blue-700",
    awaiting_cognitive_form: "bg-purple-100 text-purple-700",
    ai_completed: "bg-green-100 text-green-700",
    closed: "bg-gray-200 text-gray-700",
    approved: "bg-green-100 text-green-700",
    pending: "bg-yellow-100 text-yellow-700",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

const Table = ({ headers, rows }) => (
  <div className="bg-white rounded-xl shadow overflow-hidden">
    <table className="w-full">
      <thead className="bg-gray-200">
        <tr>
          {headers.map((h, i) => (
            <th key={i} className="p-3 text-left">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b">
            {row.map((cell, j) => (
              <td key={j} className="p-3">{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;