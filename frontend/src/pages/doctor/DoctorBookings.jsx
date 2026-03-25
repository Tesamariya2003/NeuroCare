import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

const DoctorBookings = () => {

const [bookings, setBookings] = useState([]);
const navigate = useNavigate();

useEffect(() => {
fetchBookings();
}, []);

const fetchBookings = async () => {
try {
const res = await api.get("/doctor/bookings");


  const sorted = res.data.sort((a, b) => {
    const d1 = new Date(`${a.date}T${a.time}`);
    const d2 = new Date(`${b.date}T${b.time}`);
    return d1 - d2;
  });

  setBookings(sorted);

} catch (err) {
  console.log(err);
}


};

const isUpcoming = (date, time) => {
const now = new Date();
const slot = new Date(`${date}T${time}`);
return slot > now;
};

const formatTime = (time) => {
const [h, m] = time.split(":");
let hour = parseInt(h);
const ampm = hour >= 12 ? "PM" : "AM";
hour = hour % 12 || 12;
return `${hour}:${m} ${ampm}`;
};

return ( <div className="p-10">

  <h2 className="text-3xl font-bold mb-8">
    Confirmed Consultations
  </h2>

  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

    <table className="w-full">

      <thead className="bg-gray-100 text-gray-700 text-sm uppercase">

        <tr>

          <th className="px-6 py-4 text-left">Patient</th>
          <th className="px-6 py-4 text-left">Age</th>
          <th className="px-6 py-4 text-left">Disease</th>
          <th className="px-6 py-4 text-left">Date</th>
          <th className="px-6 py-4 text-left">Time</th>
          <th className="px-6 py-4 text-left">Status</th>
          <th className="px-6 py-4 text-left">Case</th>

        </tr>

      </thead>

      <tbody>

        {bookings.map((b, index) => {

          const upcoming = isUpcoming(b.date, b.time);

          return (

            <tr
              key={index}
              className={`border-b transition hover:bg-gray-50 ${upcoming ? "bg-blue-50" : ""
                }`}
            >

              <td className="px-6 py-4 font-semibold text-gray-800 text-lg">
                {b.patient}
              </td>

              <td className="px-6 py-4 text-gray-600">
                {b.age}
              </td>

              <td className="px-6 py-4 text-gray-700 font-medium">
                {b.disease}
              </td>

              <td className="px-6 py-4">
                {new Date(b.date).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                {formatTime(b.time)}
              </td>

              <td className="px-6 py-4">

                <span
                  className={`px-3 py-1 text-xs rounded-full font-medium ${upcoming
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {upcoming ? "Upcoming" : "Completed"}
                </span>

              </td>

              <td className="px-6 py-4">

                <button
                  onClick={() => navigate(`/doctor/case/${b.case_id}`)}
                  className="text-blue-600 font-medium hover:underline"
                >
                  View Case
                </button>

              </td>

            </tr>

          );

        })}

      </tbody>

    </table>

  </div>

</div>

);

};

export default DoctorBookings;
