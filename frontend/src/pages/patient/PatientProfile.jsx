import { useAuth } from "../../context/AuthContext";

const PatientProfile = () => {

  const { user } = useAuth();

  return (

    <div className="p-8">

      <h1 className="text-2xl font-semibold text-slate-800 mb-6">
        Patient Profile
      </h1>


      <div className="bg-white p-8 rounded-xl shadow border border-gray-100 space-y-8">


        {/* Basic Info */}

        <div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium text-gray-800">{user?.name}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium text-gray-800">{user?.email}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Role</p>
              <p className="font-medium text-gray-800 capitalize">
                {user?.role}
              </p>
            </div>

          </div>

        </div>


        {/* Medical Info */}

        <div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Medical Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-500">Primary Condition</p>
              <p className="font-medium text-gray-700">
                Neurological Monitoring
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">System Used</p>
              <p className="font-medium text-gray-700">
                NeuroCare AI Clinical Support
              </p>
            </div>

          </div>

        </div>


        {/* Account Info */}

        <div>

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Account Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <p className="text-sm text-gray-500">Account Type</p>
              <p className="font-medium text-gray-700">
                Patient
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium text-green-600">
                Active
              </p>
            </div>

          </div>

        </div>


        {/* Edit Button */}

        <div className="pt-4 border-t border-gray-100">

          <button
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
          >
            Edit Profile
          </button>

        </div>


      </div>

    </div>

  );

};

export default PatientProfile;