import { useState } from "react";

const UploadForm = ({ onUpload }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file first");
      return;
    }

    try {
      setLoading(true);
      await onUpload(file);
      setFile(null);
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-2xl shadow-md mt-6">
      <h3 className="text-lg font-semibold mb-4">
        Upload Test File
      </h3>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          className="block w-full mb-4 border p-2 rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-lg text-white transition ${
            loading
              ? "bg-gray-400"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Uploading..." : "Upload File"}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;