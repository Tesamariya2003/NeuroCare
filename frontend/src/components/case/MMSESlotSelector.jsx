import React from "react";
import { FaCalendarAlt, FaClock, FaChevronRight } from "react-icons/fa";

const MMSESlotSelector = ({ slots, onSelect }) => {
  if (!slots || slots.length === 0) {
    return (
      <div className="mt-8 p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl text-center">
        <FaCalendarAlt className="text-4xl text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">No available slots yet.</p>
        <p className="text-slate-400 text-sm mt-1">The doctor will publish availability soon.</p>
      </div>
    );
  }

  // Helper to format the datetime-local string
  const formatSlot = (slotStr) => {
    const dateObj = new Date(slotStr);
    return {
      date: dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric' }),
      time: dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
        <h3 className="text-xl font-bold text-slate-800">
          Book Your MMSE Appointment
        </h3>
      </div>

      <p className="text-slate-500 text-sm mb-6">
        Select a preferred time for your cognitive evaluation with the specialist.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {slots.map((slot, index) => {
          const { date, time } = formatSlot(slot);
          return (
            <button
              key={index}
              onClick={() => onSelect(slot)}
              className="group relative flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 transition-all text-left overflow-hidden"
            >
              {/* Blue accent bar on hover */}
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                  <FaClock className="text-lg" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-lg group-hover:text-blue-700 transition-colors">
                    {time}
                  </p>
                  <p className="text-sm text-slate-500 font-medium flex items-center gap-1">
                    <FaCalendarAlt className="text-xs" /> {date}
                  </p>
                </div>
              </div>

              <div className="text-slate-300 group-hover:text-blue-500 transition-all transform group-hover:translate-x-1">
                <FaChevronRight />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MMSESlotSelector;