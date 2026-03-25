import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white px-8 py-4 flex justify-between items-center shadow-md">
      
      {/* Left */}
      <h1 className="text-xl font-bold tracking-wide">
        NeuroCare AI System
      </h1>

      {/* Right */}
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user?.name} ({user?.role})
        </span>

        <button
          onClick={logout}
          className="bg-white text-blue-600 px-4 py-1 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;