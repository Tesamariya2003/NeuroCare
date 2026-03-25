import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">

      {/* 🔹 Top Navbar */}
      <Navbar />

      {/* 🔹 Body Section */}
      <div className="flex flex-1">

        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
};

export default Layout;