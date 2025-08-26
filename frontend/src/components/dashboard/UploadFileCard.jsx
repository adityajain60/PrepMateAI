import React, { useRef } from "react";

const UploadFileCard = ({
  title,
  description,
  fileLabel,
  file,
  onFileChange,
  allowText = false,
  text,
  onTextChange,
  accept = ".pdf",
}) => {
  const fileInputRef = useRef();

  const handleFileRemove = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onFileChange({ target: { files: [] } });
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      {/* File Upload or Preview */}
      <input
        type="file"
        accept={accept}
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        id={`upload-${title}`}
      />

      {file ? (
        <div className="flex items-center justify-between bg-gray-50 border border-gray-300 p-3 rounded-md mb-3">
          <p className="text-sm text-gray-700 truncate max-w-[70%]">{file.name}</p>
          <div className="flex items-center gap-3 text-sm">
            <label
              htmlFor={`upload-${title}`}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              Change
            </label>
            <button
              onClick={handleFileRemove}
              className="text-red-500 hover:underline"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <label
          htmlFor={`upload-${title}`}
          className="block w-full text-center py-3 px-4 border-2 border-dashed border-gray-300 rounded-md cursor-pointer text-sm text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          Click to upload {fileLabel.toLowerCase()}
        </label>
      )}

      {/* Optional Textarea */}
      {allowText && (
        <div className="mt-5">
          <p className="text-sm text-gray-600 mb-1">Or paste your {fileLabel.toLowerCase()} below:</p>
          <textarea
            value={text}
            onChange={onTextChange}
            placeholder={`Paste your ${fileLabel.toLowerCase()} here...`}
            rows={6}
            className="w-full p-3 border border-gray-300 rounded-md text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      )}
    </div>
  );
};

export default UploadFileCard;
