import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">

{/* NAVBAR */}
<nav className="bg-white shadow-sm px-8 py-4 flex justify-between items-center">

  {/* Logo + Name */}
  <div className="flex items-center gap-3">

    <img
      src="/logoo.png"
      alt="NeuroCare AI Logo"
      className="w-8 h-8"
    />

    <h1 className="text-2xl font-bold text-blue-600">
      NeuroCare AI
    </h1>

  </div>

        <div className="flex gap-6 items-center">
          <Link to="/" className="text-gray-700 hover:text-blue-600">
            Home
          </Link>

          <Link to="/login" className="text-gray-700 hover:text-blue-600">
            Login
          </Link>

          <Link
            to="/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto text-center py-24 px-6">

        <h1 className="text-5xl font-bold text-gray-800 leading-tight">
          AI-Powered Neurological
          <span className="text-blue-600"> Disease Detection</span>
        </h1>

        <p className="text-gray-600 mt-6 max-w-2xl mx-auto text-lg">
          NeuroCare AI helps detect Alzheimer, Parkinson and Multiple
          Sclerosis using advanced AI models and clinical decision
          support systems.
        </p>

        <div className="mt-10 flex justify-center gap-5">
          <Link
            to="/register"
            className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>

          <Link
            to="/login"
            className="border border-gray-300 px-8 py-4 rounded-xl text-lg hover:bg-gray-100 transition"
          >
            Login
          </Link>
        </div>

      </section>

      {/* DISEASE SECTION */}
      <section className="max-w-6xl mx-auto px-6 py-16">

        <h2 className="text-3xl font-bold text-center mb-12">
          Diseases We Detect
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          

          {/* Parkinson */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-green-600 mb-3">
              Parkinson Detection
            </h3>

            <p className="text-gray-600">
              Voice recordings and clinical features are analyzed
              using AI to detect Parkinson patterns.
            </p>
          </div>

          {/* MS */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-purple-600 mb-3">
              Multiple Sclerosis Detection
            </h3>

            <p className="text-gray-600">
              Deep learning models analyze MRI scans to detect
              MS lesions and neurological abnormalities.
            </p>
          </div>
          {/* Alzheimer */}
          <div className="bg-white shadow-md rounded-2xl p-8 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-600 mb-3">
              Alzheimer Detection
            </h3>

            <p className="text-gray-600">
              Cognitive tests are analyzed using
              machine learning to detect early Alzheimer symptoms.
            </p>
          </div>

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="bg-blue-50 py-16">

        <div className="max-w-6xl mx-auto px-6 text-center">

          <h2 className="text-3xl font-bold mb-12">
            How It Works
          </h2>

          <div className="grid md:grid-cols-4 gap-8">

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-3">1</div>
              <p className="text-gray-700">
                Submit symptoms and medical information
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-3">2</div>
              <p className="text-gray-700">
                Upload MRI scan or voice recording
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-3">3</div>
              <p className="text-gray-700">
                AI models analyze the medical data
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-blue-600 mb-3">4</div>
              <p className="text-gray-700">
                Doctor reviews results and confirms diagnosis
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* CTA */}
      <section className="text-center py-20">

        <h2 className="text-3xl font-bold mb-4">
          Start Early Detection Today
        </h2>

        <p className="text-gray-600 mb-8">
          AI-powered neurological screening in minutes.
        </p>

        <Link
          to="/register"
          className="bg-blue-600 text-white px-8 py-4 rounded-xl text-lg hover:bg-blue-700"
        >
          Create Account
        </Link>

      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white text-center py-6">

        <p className="text-sm">
          © 2026 NeuroCare AI • Clinical Decision Support System
        </p>

      </footer>

    </div>
  );
};

export default Home;