import { useEffect, useState } from "react";
import api from "../../services/api";

const DoctorProfile = () => {
  const [doctor, setDoctor] = useState({});

  useEffect(() => {
    api.get("/doctor/profile").then((res) => {
      setDoctor(res.data);
    });
  }, []);

  return (
    <div className="p-10 bg-gray-100 min-h-screen">

      <div className="max-w-6xl mx-auto space-y-8">

        {/* PROFILE HEADER */}
        <div className="bg-white rounded-3xl shadow-lg p-10 flex items-center justify-between">

          <div className="flex items-center space-x-8">

            {/* Avatar */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-4xl font-bold shadow-md">
              {doctor.name?.charAt(0)}
            </div>

            {/* Name + Specialization */}
            <div>
              <h2 className="text-3xl font-bold">
                Dr. {doctor.name}
              </h2>

              <span className="inline-block mt-3 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                {doctor.specialization}
              </span>

              <p className="mt-3 text-gray-500 text-sm">
                Licensed Medical Practitioner
              </p>
            </div>

          </div>

          <button className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition shadow">
            Edit Profile
          </button>

        </div>

        {/* PROFILE DETAILS GRID */}
        <div className="bg-white rounded-3xl shadow-lg p-10">

          <h3 className="text-xl font-semibold mb-8 border-b pb-4">
            Professional Information
          </h3>

          <div className="grid grid-cols-3 gap-10 text-sm">

            <InfoItem label="Email" value={doctor.email} />
            <InfoItem label="Experience" value={`${doctor.experience} years`} />
            <InfoItem label="License Number" value={doctor.license_number} />
            <InfoItem label="Department" value={doctor.specialization} />
            <InfoItem label="Role" value="Doctor" />
            <InfoItem label="Status" value="Active" />

          </div>

        </div>
        {/* PERFORMANCE OVERVIEW */}
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <h3 className="text-xl font-semibold mb-6">
            Performance Overview
          </h3>

          <div className="grid grid-cols-4 gap-6">
            <StatMini title="Total Cases" value={doctor.total_cases || 0} />
            <StatMini title="Reviewed" value={doctor.reviewed_cases || 0} />
            <StatMini title="Completed" value={doctor.completed_cases || 0} />
            <StatMini title="Pending" value={doctor.pending_cases || 0} />
          </div>
        </div>
        {/* COMPLETION RATE */}
        <div className="bg-white rounded-3xl shadow-lg p-10">
          <h3 className="text-xl font-semibold mb-6">
            Case Completion Rate
          </h3>

          <div className="w-full bg-gray-200 rounded-full h-4">
            <div
              className="bg-green-500 h-4 rounded-full"
              style={{
                width: doctor.total_cases
                  ? `${(doctor.completed_cases / doctor.total_cases) * 100}%`
                  : "0%"
              }}
            />
          </div>
          {/* ABOUT DOCTOR */}
          <div className="bg-white rounded-3xl shadow-lg p-10">
            <h3 className="text-xl font-semibold mb-4">
              About
            </h3>

            <p className="text-gray-600">
              {doctor.bio || "No biography added yet."}
            </p>
          </div>

          <p className="text-sm mt-3 text-gray-600">
            {doctor.completed_cases || 0} of {doctor.total_cases || 0} cases completed
          </p>
        </div>


        {/* ACCOUNT STATUS CARD */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">

          <h3 className="font-semibold mb-2 text-green-700">
            Account Status
          </h3>

          <p className="text-sm text-green-700">
            Your account is verified and active.
          </p>

        </div>

      </div>

    </div>
  );
};
const InfoItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-gray-800 mt-1">
      {value || "-"}
    </span>
  </div>
);
const StatMini = ({ title, value }) => (
  <div className="bg-gray-50 p-6 rounded-xl text-center">
    <p className="text-gray-500 text-sm">{title}</p>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default DoctorProfile;