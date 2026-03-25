import { useEffect, useState } from "react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [doctor, setDoctor] = useState({});
  const [cases, setCases] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const location = useLocation();

  const navigate = useNavigate();

  useEffect(() => {
    fetchDoctorProfile();
    fetchAssignedCases();
  }, []);
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "cases") {
      setActiveTab("cases");
    } else {
      setActiveTab("overview");
    }
  }, [location]);

  const fetchDoctorProfile = async () => {
    const res = await api.get("/doctor/profile");
    setDoctor(res.data);
  };

  const fetchAssignedCases = async () => {
    const res = await api.get("/doctor/cases");

    // PRIORITY SORTING
    const priority = {
      submitted: 1,
      ai_completed: 2,
      test_submitted: 3,
      test_requested: 4,
      awaiting_patient_test_choice: 5,
      closed: 6,
    };

    const sorted = res.data.sort(
      (a, b) => priority[a.status] - priority[b.status]
    );

    setCases(sorted);
  };

  const handleView = (id) => {
    navigate(`/doctor/case/${id}`);
  };

  /* ---------------- FILTERED DATA ---------------- */

  const filteredCases = cases.filter((c) => {
    const matchesSearch =
      !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.subject?.toLowerCase().includes(search.toLowerCase());

    const matchesFilter = (() => {
      if (filter === "all") return true;

      if (filter === "test_requested") {
        return (
          c.status === "test_requested" ||
          c.status === "awaiting_patient_test_choice" ||
          c.status === "test_submitted"
        );
      }

      return c.status === filter;
    })();

    return matchesSearch && matchesFilter;
  });

  /* ---------------- STATS ---------------- */

  const statusCounts = {
    all: cases.length,

    submitted: cases.filter((c) => c.status === "submitted").length,

    test_requested: cases.filter(
      (c) =>
        c.status === "test_requested" ||
        c.status === "awaiting_patient_test_choice" ||
        c.status === "test_submitted"
    ).length,

    ai_completed: cases.filter((c) => c.status === "ai_completed").length,

    reviewed: cases.filter((c) => c.status === "reviewed").length,

    finalized: cases.filter((c) => c.status === "closed").length,
  };

  /* ---------------- HELPER ---------------- */

  const getNextStep = (status) => {
    switch (status) {
      case "submitted":
        return "Review patient symptoms and start AI analysis";
      case "ai_completed":
        return "Verify AI results and prepare diagnosis";
      case "test_requested":
        return "Waiting for patient to upload diagnostic test";
      case "test_submitted":
        return "Review patient test results";
      case "awaiting_patient_test_choice":
        return "Patient must select a diagnostic test";
      case "closed":
        return "Case finalized";
      default:
        return "No action required";
    }
  };

  const getUrgency = (status) => {
    if (["submitted", "ai_completed"].includes(status)) return "🔴 Urgent";
    if (["test_submitted"].includes(status)) return "🟠 Review Needed";
    if (["test_requested", "awaiting_patient_test_choice"].includes(status))
      return "🟡 Waiting for Patient";
    return "⚪ Completed";
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <h2 className="text-2xl font-bold mb-6">
        Welcome Dr. {doctor.name}
      </h2>

      {/* TABS */}
      <div className="flex border-b mb-8 space-x-6">
        <Tab
          label="Overview"
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
        />
        <Tab
          label="Assigned Cases"
          active={activeTab === "cases"}
          onClick={() => setActiveTab("cases")}
        />
      </div>

      {/* ================= OVERVIEW ================= */}

      {activeTab === "overview" && (
        <div className="space-y-6">

          {/* WORKFLOW GUIDE */}

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">

            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              📘 Clinical Workflow Guide
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-sm">

              <div className="flex items-start gap-3">
                <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold">
                  Submitted
                </span>
                <p className="text-gray-700">
                  Patient submitted symptoms and case details. Awaiting AI analysis.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                  AI Completed
                </span>
                <p className="text-gray-700">
                  AI has analyzed the case. Doctor should review the results.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">
                  Test Requested
                </span>
                <p className="text-gray-700">
                  Additional diagnostic test required (MRI / Cognitive Test).
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold">
                  Test Submitted
                </span>
                <p className="text-gray-700">
                  Patient uploaded requested test. Ready for clinical review.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-semibold">
                  Finalized
                </span>
                <p className="text-gray-700">
                  Case closed with final diagnosis and doctor notes.
                </p>
              </div>

            </div>
          </div>

          {/* NOTIFICATIONS */}

          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
            <h3 className="font-semibold mb-2">🔔 Notifications</h3>

            <ul className="text-sm space-y-1">
              {statusCounts.submitted > 0 && (
                <li>• {statusCounts.submitted} new submissions awaiting review</li>
              )}
              {statusCounts.ai_completed > 0 && (
                <li>• {statusCounts.ai_completed} AI results ready for review</li>
              )}
              {statusCounts.test_requested > 0 && (
                <li>• {statusCounts.test_requested} diagnostic tests pending</li>
              )}
              {statusCounts.all === 0 && (
                <li>No new notifications.</li>
              )}
            </ul>
          </div>

          {/* SUMMARY CARDS */}

          <div className="grid grid-cols-4 gap-6">
            <StatCard title="Total Assigned" value={statusCounts.all} />
            <StatCard title="Awaiting Review" value={statusCounts.submitted} />
            <StatCard title="AI Completed" value={statusCounts.ai_completed} />
            <StatCard title="Finalized" value={statusCounts.finalized} />
          </div>

          {/* ACTION REQUIRED */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              ⚠ Cases Requiring Your Action
            </h3>

            {cases.filter((c) =>
              ["submitted", "ai_completed", "test_submitted"].includes(c.status)
            ).length === 0 ? (
              <p className="text-gray-500">No pending actions.</p>
            ) : (
              <ul className="space-y-3">
                {cases
                  .filter((c) =>
                    ["submitted", "ai_completed", "test_submitted"].includes(
                      c.status
                    )
                  )
                  .slice(0, 5)
                  .map((c) => (
                    <li
                      key={c._id}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{c.name}</p>
                        <p className="text-l text-500">{c.subject}</p>
                        <p className="text-sm text-400">
                          Next Step: {getNextStep(c.status)}
                        </p>
                      </div>

                      <button
                        onClick={() => handleView(c._id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Review
                      </button>
                    </li>
                  ))}
              </ul>
            )}
          </div>

          {/* TODAY UPDATES */}

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4">
              📅 Cases Updated Today
            </h3>

            {cases.filter((c) => {
              const today = new Date().toDateString();
              return new Date(c.updated_at).toDateString() === today;
            }).length === 0 ? (
              <p className="text-gray-500">No updates today.</p>
            ) : (
              <ul className="space-y-3">
                {cases
                  .filter((c) => {
                    const today = new Date().toDateString();
                    return new Date(c.updated_at).toDateString() === today;
                  })
                  .map((c) => (
                    <li key={c._id} className="flex justify-between">
                      <span>
                        {c.name} – {c.subject}
                      </span>
                      <StatusBadge status={c.status} />
                    </li>
                  ))}
              </ul>
            )}
          </div>

        </div>
      )}

      {/* ================= CASES ================= */}

      {activeTab === "cases" && (
        <>
          {/* FILTER BAR */}

          <div className="flex space-x-6 mb-6 border-b pb-3 text-sm font-medium">

            <FilterTab
              label={`All Cases (${statusCounts.all})`}
              active={filter === "all"}
              onClick={() => setFilter("all")}
            />

            <FilterTab
              label={`Submitted (${statusCounts.submitted})`}
              active={filter === "submitted"}
              onClick={() => setFilter("submitted")}
            />

            <FilterTab
              label={`Test Requested (${statusCounts.test_requested})`}
              active={filter === "test_requested"}
              onClick={() => setFilter("test_requested")}
            />

            <FilterTab
              label={`AI Completed (${statusCounts.ai_completed})`}
              active={filter === "ai_completed"}
              onClick={() => setFilter("ai_completed")}
            />

            <FilterTab
              label={`Finalized (${statusCounts.finalized})`}
              active={filter === "closed"}
              onClick={() => setFilter("closed")}
            />

          </div>

          {/* SEARCH */}

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search patient or subject..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border p-2 rounded w-1/2"
            />
          </div>

          {/* TABLE */}

          {filteredCases.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow">
              No matching cases found.
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="p-3 text-left">Patient</th>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Urgency</th>
                    <th className="p-3 text-left">Status</th>
                    <th className="p-3 text-left">Next Step</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCases.map((c) => (
                    <tr key={c._id} className="border-b">

                      <td className="p-3">{c.name}</td>

                      <td className="p-3">{c.subject}</td>

                      <td className="p-3 text-sm">
                        {getUrgency(c.status)}
                      </td>

                      <td className="p-3">
                        <StatusBadge status={c.status} />
                      </td>

                      <td className="p-3 text-sm text-gray-500">
                        {getNextStep(c.status)}
                      </td>

                      <td className="p-3">
                        <button
                          onClick={() => handleView(c._id)}
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
        </>
      )}
    </div>
  );
};

/* SMALL COMPONENTS */

const Tab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 font-medium border-b-2 transition ${active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-500 hover:text-black"
      }`}
  >
    {label}
  </button>
);

const StatCard = ({ title, value }) => (
  <div className="bg-white p-6 rounded-xl shadow">
    <p className="text-sm text-gray-500">{title}</p>
    <p className="text-3xl font-bold mt-2">{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    submitted: "bg-yellow-100 text-yellow-700",
    ai_completed: "bg-green-100 text-green-700",
    test_requested: "bg-blue-100 text-blue-700",
    test_submitted: "bg-purple-100 text-purple-700",
    awaiting_patient_test_choice: "bg-orange-100 text-orange-700",
    closed: "bg-gray-200 text-gray-700",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || "bg-gray-100 text-gray-600"
        }`}
    >
      {status.replaceAll("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
    </span>
  );
};

const FilterTab = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`pb-2 border-b-2 transition ${active
        ? "border-blue-600 text-blue-600"
        : "border-transparent text-gray-600 hover:text-black"
      }`}
  >
    {label}
  </button>
);

export default DoctorDashboard;