import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const { role } = useAuth();

  const baseClasses =
    "flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-sm font-medium transition";

  const activeClasses = "bg-blue-600 text-white shadow";
  const inactiveClasses =
    "text-gray-700 hover:bg-blue-50 hover:text-blue-600";
  const location = useLocation();
  const isDashboard =
    location.pathname === "/doctor/dashboard" && !location.search;

  const isCases =
    location.pathname === "/doctor/dashboard" &&
    location.search.includes("tab=cases");

  return (
    <aside className="w-64 bg-white border-r shadow-sm p-6">

      {/* Logo / Title */}
      <h2 className="text-xl font-bold mb-8 text-blue-600">
        NeuroCare
      </h2>

      {/* PATIENT MENU */}
      {role === "patient" && (
        <div>

          <p className="text-xs text-gray-400 uppercase mb-3">
            Patient Menu
          </p>

          <NavLink
            to="/patient/dashboard"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/patient/submit"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📝 Submit Case
          </NavLink>

          <NavLink
            to="/patient/my-cases"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📁 My Cases
          </NavLink>
          <NavLink
            to="/patient/history"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            🕘 History
          </NavLink>

          <NavLink
            to="/patient/reports"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📄 Reports
          </NavLink>

          <NavLink
            to="/patient/profile"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            👤 Profile
          </NavLink>

        </div>
      )}

      {/* DOCTOR MENU */}
      {role === "doctor" && (
        <>
          <NavLink
            to="/doctor/dashboard"
            className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isDashboard
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📊 Dashboard
          </NavLink>

          <NavLink
            to="/doctor/dashboard?tab=cases"
            className={`flex items-center gap-2 px-4 py-3 rounded-lg ${isCases
              ? "bg-blue-600 text-white"
              : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            📁 Assigned Cases
          </NavLink>
          <NavLink
            to="/doctor/bookings"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            📅 Confirmed Bookings
          </NavLink>

          <NavLink
            to="/doctor/history"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            🕘 Case History
          </NavLink>

          <NavLink
            to="/doctor/profile"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            👤 Profile
          </NavLink>
        </>
      )}

      {/* ADMIN MENU */}
      {role === "admin" && (
        <div>

          <p className="text-xs text-gray-400 uppercase mb-3">
            Admin
          </p>

          <NavLink
            to="/admin/dashboard"
            className={({ isActive }) =>
              `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`
            }
          >
            ⚙️ Dashboard
          </NavLink>

        </div>
      )}

    </aside>
  );
};

export default Sidebar;