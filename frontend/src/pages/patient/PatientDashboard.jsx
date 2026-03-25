import React from "react";
import { useNavigate } from "react-router-dom";
import {
    FileText,
    ClipboardList,
    Stethoscope,
    Activity,
    Search,
    FileCheck,
    AlertCircle,
    PlusCircle,
    ChevronRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

const PatientDashboard = () => {

    const navigate = useNavigate();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([
        {
            message: "Doctor has requested an MRI test for your case."
        }
    ]);


    return (

        <div className="min-h-screen bg-slate-50 p-8 md:p-10">

            <div className="max-w-[1400px] mx-auto">

                {/* Header */}

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">

                    <div>
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Welcome back, {user?.name}
                        </h1>

                        <p className="text-slate-600">
                            NeuroCare helps doctors evaluate neurological conditions using AI and clinical review.
                        </p>
                    </div>

                    <button
                        onClick={() => navigate("/patient/submit")}
                        className="flex items-center gap-3 bg-blue-500 text-white px-7 py-3 rounded-xl font-semibold hover:bg-blue-600 transition shadow-md"
                    >
                        <PlusCircle size={20} />
                        Submit New Case
                    </button>

                </div>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* LEFT SECTION */}

                    <div className="lg:col-span-2 space-y-10">

                        {notifications.length > 0 && (
                            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex justify-between items-center">
                                <p className="text-sm text-yellow-800">
                                    🔔 {notifications[0].message}
                                </p>

                                <button
                                    className="text-blue-600 font-medium text-sm hover:underline"
                                    onClick={() => navigate("/patient/my-cases")}
                                >
                                    View Case
                                </button>
                            </div>
                        )}

                        {/* Journey */}

                        <section className="bg-white p-8 rounded-2xl border border-slate-100 shadow-md">

                            <div className="mb-10">



                                <h2 className="text-xl font-semibold text-slate-800">
                                    Your Journey
                                </h2>

                                <p className="text-slate-500 text-sm">
                                    Follow these steps to understand how NeuroCare evaluates neurological health.
                                </p>

                            </div>


                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                <JourneyCard
                                    number="1"
                                    title="Submit Symptoms"
                                    desc="Enter your symptoms and basic medical details to create a neurological case."
                                    icon={<FileText size={20} />}
                                />

                                <JourneyCard
                                    number="2"
                                    title="Clinical Questionnaire"
                                    desc="Answer follow-up neurological questions to help doctors understand your condition."
                                    icon={<ClipboardList size={20} />}
                                />

                                <JourneyCard
                                    number="3"
                                    title="AI Analysis"
                                    desc="NeuroCare AI analyzes symptoms and patterns to assist doctors."
                                    icon={<Activity size={20} />}
                                />

                                <JourneyCard
                                    number="4"
                                    title="Doctor Review"
                                    desc="A neurologist reviews the AI insights and evaluates your case."
                                    icon={<Stethoscope size={20} />}
                                />

                                <JourneyCard
                                    number="5"
                                    title="Diagnostic Test"
                                    desc="MRI, voice analysis, or cognitive tests may be requested for deeper evaluation."
                                    icon={<Search size={20} />}
                                />

                                <JourneyCard
                                    number="6"
                                    title="Final Diagnosis"
                                    desc="The doctor confirms the diagnosis and provides a detailed report."
                                    icon={<FileCheck size={20} />}
                                />

                            </div>
                            {/* Medical Disclaimer */}

                            <div className="mt-10 bg-amber-50 border border-amber-100 rounded-xl p-6 flex items-start gap-3">

                                <AlertCircle
                                    className="text-amber-500 shrink-0 mt-1"
                                    size={20}
                                />

                                <p className="text-sm text-amber-900 leading-relaxed">
                                    <strong>Medical Disclaimer:</strong> NeuroCare provides clinical decision
                                    support tools to assist doctors. It does not replace professional medical
                                    diagnosis. Final medical decisions are made by qualified healthcare
                                    professionals.
                                </p>

                            </div>

                        </section>



                        {/* Active Cases */}



                    </div>



                    {/* RIGHT PANEL */}

                    <div className="space-y-10">

                        {/* Activity */}

                        <section className="bg-white p-7 rounded-2xl border border-slate-100 shadow-md">

                            <h2 className="text-lg font-semibold text-slate-800 mb-7">
                                Latest Activity
                            </h2>

                            <div className="space-y-6">

                                <ActivityItem
                                    title="AI Analysis Completed"
                                    time="2 hours ago"
                                />

                                <ActivityItem
                                    title="Doctor assigned to Case #8821"
                                    time="5 hours ago"
                                />

                                <ActivityItem
                                    title="New document uploaded"
                                    time="Yesterday"
                                />

                            </div>

                        </section>




                        {/* Help Card */}

                        <section className="bg-gradient-to-br from-blue-500 to-indigo-600 p-8 rounded-2xl text-white shadow-md">

                            <h3 className="font-semibold text-xl mb-3">
                                Need Help?
                            </h3>

                            <p className="text-blue-100 mb-6 text-sm">
                                Our medical assistants are available 24/7 to guide you.
                            </p>

                            <button className="w-full bg-white text-blue-600 py-3 rounded-xl font-semibold hover:bg-blue-50 transition">
                                Contact Support
                            </button>

                        </section>



                    </div>

                </div>

            </div>

        </div>

    );

};



/* ---------- Journey Card ---------- */

const JourneyCard = ({ number, title, desc, icon }) => {

    return (

        <div className="p-7 rounded-xl border border-slate-100 bg-white hover:shadow-sm transition">

            <div className="flex items-start gap-6">

                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-blue-50 text-blue-600">

                    {icon}

                </div>


                <div>

                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                        Step {number}
                    </span>

                    <h3 className="text-base font-semibold text-slate-800">
                        {title}
                    </h3>

                    <p className="text-sm text-slate-500">
                        {desc}
                    </p>

                </div>

            </div>


        </div>


    );

};




/* ---------- Case Row ---------- */

const CaseRow = ({ id, type, status, statusColor }) => (

    <tr className="hover:bg-slate-50 transition-colors cursor-pointer group">

        <td className="px-7 py-5 font-medium text-blue-600">
            {id}
        </td>

        <td className="px-7 py-5 text-slate-700">
            {type}
        </td>

        <td className="px-7 py-5">

            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${statusColor}`}>
                {status}
            </span>

        </td>

        <td className="px-7 py-5 text-right pr-10">

            <div className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-slate-100 text-slate-400 group-hover:bg-blue-500 group-hover:text-white transition-all">

                <ChevronRight size={18} />

            </div>

        </td>

    </tr>

);



/* ---------- Activity Item ---------- */

const ActivityItem = ({ title, time }) => (

    <div className="flex gap-4">

        <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>

        <div>

            <p className="text-sm font-medium text-slate-800">
                {title}
            </p>

            <p className="text-xs text-slate-400">
                {time}
            </p>

        </div>

    </div>

);

export default PatientDashboard;