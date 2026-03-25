import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
// Added Lucide icons for a more professional look
import { Mail, Lock, Loader2, ShieldCheck } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    if (!form.email || !form.password) {
  setError("Please enter email and password");
  setLoading(false);
  return;
}
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(form.email)) {
  setError("Enter a valid email address");
  setLoading(false);
  return;
}
if (form.password.length < 6) {
  setError("Password must be at least 6 characters");
  setLoading(false);
  return;
}

    const result = await login(form.email, form.password);

    setLoading(false);

    if (result.success) {
      if (result.role === "patient") {
        navigate("/patient/dashboard");
      } else if (result.role === "doctor") {
        if (result.verification_status !== "approved") {
          setError("Your account is pending admin approval.");
          return;
        }
        navigate("/doctor/dashboard");
      } else if (result.role === "admin") {
        navigate("/admin/dashboard");
      }
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-indigo-100 px-4">
      <div className="bg-white/80 backdrop-blur-sm w-full max-w-md p-8 rounded-3xl shadow-2xl border border-white">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-10 h-10" />
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            NeuroCare <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest">
            Clinical Decision Support
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold text-slate-800">Welcome Back</h2>
          <p className="text-slate-500 text-sm">Please enter your details to sign in.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg text-sm flex items-center animate-shake">
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                placeholder="dr.name@example.com"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="relative">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">
              Password
            </label>
            <div className="relative mt-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition duration-150"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:-translate-y-0.5"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Authenticating...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            New to NeuroCare?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;