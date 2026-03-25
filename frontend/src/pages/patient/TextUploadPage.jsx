import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../../services/api";
import Loader from "../../components/common/Loader";

const TestUploadPage = () => {

    const { id } = useParams();

    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);

    // Recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordTime, setRecordTime] = useState(0);

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const timerRef = useRef(null);

    useEffect(() => {
        fetchCase();
    }, []);

    const fetchCase = async () => {
        try {
            const res = await api.get(`/cases/${id}`);
            setCaseData(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- RECORDING LOGIC ---------------- */

    const startRecording = async () => {

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            let options = {};

            if (MediaRecorder.isTypeSupported("audio/webm")) {
                options.mimeType = "audio/webm";
            }

            mediaRecorderRef.current = new MediaRecorder(stream, options);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                audioChunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.onstop = () => {

                const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });

                const recordedFile = new File(
                    [audioBlob],
                    "recording.webm",
                    { type: "audio/webm" }
                );

                setFile(recordedFile);

                // stop microphone stream
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordTime(0);

            // recording timer
            timerRef.current = setInterval(() => {

                setRecordTime(prev => {

                    if (prev >= 14) {
                        stopRecording();
                        return 15;
                    }

                    return prev + 1;

                });

            }, 1000);

        } catch (err) {
            alert("Microphone permission denied");
        }

    };

    const stopRecording = () => {

        if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
        }

        clearInterval(timerRef.current);
        setIsRecording(false);

    };

    /* ---------------- UPLOAD FILE ---------------- */

    const uploadFile = async () => {

        if (!file) return alert("Please select or record a file");

        const formData = new FormData();
        formData.append("file", file);
        if (file.name.endsWith(".webm")) {
            formData.append("source", "browser");
        }

        try {

            setUploading(true);

            await api.post(
                `/cases/${id}/upload-file`,
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" }
                }
            );

            alert("Upload successful");

        } catch (err) {
            console.error(err);
        } finally {
            setUploading(false);
        }

    };

    if (loading) return <Loader />;

    const test = caseData?.selected_test;

    return (

        <div className="min-h-screen bg-gray-100 flex justify-center pt-12 px-6">

            <div className="bg-white max-w-5xl w-full p-10 rounded-3xl shadow-xl h-fit">

                <h2 className="text-3xl font-bold mb-6 text-gray-800">
                    Upload Diagnostic Test
                </h2>

                <p className="text-gray-600 mb-8 text-lg">
                    Follow the instructions below and upload your test result or record directly.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* ---------------- INSTRUCTIONS ---------------- */}

                    <div className="bg-blue-50 border border-blue-200 p-8 rounded-2xl">

                        <h3 className="font-semibold text-xl mb-4 text-blue-900">
                            Test Instructions
                        </h3>

                        {test === "audio" && (
                            <ul className="list-disc pl-5 space-y-3 text-gray-700">
                                <li>Record in a quiet room</li>
                                <li>Say “AAAA” continuously for 15 seconds</li>
                                <li>You can upload a file OR use the "Record Live"</li>
                                <li>Supported formats: WAV</li>
                            </ul>
                        )}

                        {test === "mri" && (
                            <ul className="list-disc pl-5 space-y-3 text-gray-700">
                                <li>Visit a hospital or diagnostic center</li>
                                <li>Request Brain MRI scan</li>
                                <li>Download image in JPG or PNG</li>
                                <li>Upload scan here</li>
                            </ul>
                        )}
                        {test === "features" && (
                            <ul className="list-disc pl-5 space-y-3 text-gray-700">
                                <li>Visit a hospital, speech clinic, or diagnostic laboratory.</li>
                                <li>Request a <b>voice acoustic analysis test</b>.</li>
                                <li>The report should include voice parameters like Fo, Jitter, Shimmer, HNR, etc.</li>
                                <li>Ask the lab to provide the results in a <b>PDF report</b>.</li>
                                <li>Download the report and upload the PDF file here.</li>
                                <li>Ensure the report clearly lists the acoustic feature values.</li>
                            </ul>
                        )}

                    </div>

                    {/* ---------------- ACTION SECTION ---------------- */}

                    <div className="flex flex-col space-y-6">

                        {/* File Upload */}

                        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-gray-50">

                            <input
                                type="file"
                                className="block w-full text-sm text-gray-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-blue-50 file:text-blue-700
                                hover:file:bg-blue-100"
                                onChange={(e) => setFile(e.target.files[0])}
                            />

                        </div>

                        {/* Recording Section */}

                        {test === "audio" && (

                            <div className="flex items-center justify-between p-6 border border-gray-200 rounded-2xl bg-white shadow-sm">

                                <div>

                                    <p className="font-medium">
                                        Direct Recording
                                    </p>

                                    <p className="text-xs text-gray-400">
                                        Record using microphone
                                    </p>

                                </div>

                                {!isRecording ? (

                                    <button
                                        onClick={startRecording}
                                        className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full flex items-center gap-2 transition"
                                    >
                                        <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                                        Start Recording
                                    </button>

                                ) : (

                                    <button
                                        onClick={stopRecording}
                                        className="bg-gray-800 hover:bg-black text-white px-5 py-2 rounded-full"
                                    >
                                        Stop ({recordTime}s)
                                    </button>

                                )}

                            </div>

                        )}

                        {/* Selected file */}

                        {file && (

                            <div className="p-4 bg-green-50 rounded-xl border border-green-200 text-green-700 text-sm">

                                <strong>Selected:</strong> {file.name || "Live Recording"}

                                {/* audio preview */}

                                {file.type.includes("audio") && (
                                    <audio
                                        controls
                                        className="mt-3 w-full"
                                        src={URL.createObjectURL(file)}
                                    />
                                )}

                            </div>

                        )}

                    </div>

                </div>

                {/* Submit */}

                <div className="flex justify-end mt-12 pt-6 border-t border-gray-100">

                    <button
                        onClick={uploadFile}
                        disabled={!file || uploading}
                        className={`${!file
                            ? "bg-gray-300"
                            : "bg-green-600 hover:bg-green-700"
                            } text-white px-10 py-4 rounded-2xl font-bold text-lg transition shadow-lg`}
                    >

                        {uploading ? "Uploading..." : "Submit Diagnostic Test"}

                    </button>

                </div>

            </div>

        </div>

    );

};

export default TestUploadPage;