import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  User, 
  Mail, 
  Lock, 
  Loader2, 
  ShieldCheck, 
  Stethoscope, 
  Award, 
  Hash, 
  Briefcase 
} from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
    specialization: "",
    experience: "",
    license_number: "",
    qualification: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
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
    setSuccess("");
    setLoading(true);

    const result = await register(form);

    setLoading(false);

    if (result.success) {
      setSuccess("Registration successful. Please login.");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-blue-50 to-indigo-100 p-6">
      <div className={`bg-white/80 backdrop-blur-sm w-full ${form.role === 'doctor' ? 'max-w-2xl' : 'max-w-md'} p-8 rounded-3xl shadow-2xl border border-white transition-all duration-500`}>
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-xl mb-3 shadow-lg shadow-blue-200">
            <ShieldCheck className="text-white w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create Account</h1>
          <p className="text-slate-500 text-sm mt-1">Join the NeuroCare AI medical network</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-6 rounded-r-lg text-sm flex items-center animate-shake">
            <span className="font-medium">{error}</span>
          </div>
        )}
        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 p-3 mb-6 rounded-r-lg text-sm flex items-center">
            <span className="font-medium">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className={`grid gap-4 ${form.role === 'doctor' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            
            {/* Common Fields */}
            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Full Name</label>
                <div className="relative mt-1">
                  <User className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Password</label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">I am a...</label>
                <div className="relative mt-1">
                  <select
                    name="role"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none transition-all cursor-pointer"
                    value={form.role}
                    onChange={handleChange}
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Medical Professional (Doctor)</option>
                  </select>
                  <div className="absolute right-3 top-3.5 pointer-events-none">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Doctor Extra Fields */}
            {form.role === "doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Specialization</label>
                  <div className="relative mt-1">
                    <Stethoscope className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="specialization"
                      placeholder="e.g. Neurology"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      value={form.specialization}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Experience (Yrs)</label>
                    <div className="relative mt-1">
                      <Briefcase className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="number"
                        name="experience"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.experience}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="relative">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Qualification</label>
                    <div className="relative mt-1">
                      <Award className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="qualification"
                        placeholder="MBBS, MD"
                        className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        value={form.qualification}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">License Number</label>
                  <div className="relative mt-1">
                    <Hash className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="license_number"
                      placeholder="MED-123456"
                      className="w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                      value={form.license_number}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border-amber-200 border text-amber-800 p-3 rounded-xl text-xs flex gap-2 items-start">
                  <div className="mt-0.5">⚠️</div>
                  <p>Accounts for practitioners require administrative verification before clinical access is granted.</p>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 transform hover:-translate-y-0.5 mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-slate-600">
            Already a member?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:text-blue-700 hover:underline transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;