import React, { useState } from "react";
import axios from "axios";

export default function UploadImageFolder() {
  const [className, setClassName] = useState("Class 6");
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [invalidFiles, setInvalidFiles] = useState<string[]>([]);

  // ✅ Handle folder selection
  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const allFiles = Array.from(e.target.files);
    const validFiles = allFiles.filter((file) =>
      /\.(jpe?g|png)$/i.test(file.name)
    );
    const invalid = allFiles
      .filter((file) => !/\.(jpe?g|png)$/i.test(file.name))
      .map((file) => file.name);

    setImages(validFiles);
    setInvalidFiles(invalid);
  };

  // ✅ Upload images to backend
  const handleUpload = async () => {
    if (!images.length) return alert("Please select a folder with valid images.");

    const formData = new FormData();
    formData.append("className", className);
    images.forEach((file) => formData.append("images", file));

    try {
      setLoading(true);
      const res = await axios.post(
        "http://localhost:8081/api/images/upload-folder",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(res.data.message);
      console.log("Response:", res.data);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: 30 }}>
      <h2>📁 Upload Image Folder</h2>

      <label>
        Class Name:{" "}
        <input
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={{ marginLeft: 10, padding: "5px 8px" }}
        />
      </label>

      <div style={{ margin: "20px 0" }}>
        <input
          type="file"
          multiple
          webkitdirectory="true"
          mozdirectory="true"
          directory="true"
          onChange={handleFolderSelect}
        />
      </div>

      {invalidFiles.length > 0 && (
        <div style={{ color: "red", marginBottom: 10 }}>
          <strong>⚠️ Ignored non-image files:</strong>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {invalidFiles.map((file, i) => (
              <li key={i}>{file}</li>
            ))}
          </ul>
        </div>
      )}

      <div style={{ marginBottom: 10 }}>
        <strong>✅ {images.length}</strong> image files selected
      </div>

      <button
        onClick={handleUpload}
        disabled={loading}
        style={{
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          borderRadius: 8,
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Uploading..." : "Upload Folder"}
      </button>
    </div>
  );
}
