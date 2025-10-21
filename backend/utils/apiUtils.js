import FormData from "form-data";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL;

/**
  Prepares the data payload and headers for Python service calls.
  If files are present, it packages data into FormData.
  Otherwise, it returns the raw JSON body.
 */

export const prepareApiRequest = (req) => {
  // Check if there are any files in the request
  const hasFiles = req.files && Object.keys(req.files).length > 0;

  if (hasFiles) {
    const formData = new FormData();

    // Append all text fields from the request body
    Object.keys(req.body).forEach((key) => {
      formData.append(key, req.body[key]);
    });

    // Append files
    if (req.files.resume) {
      formData.append("resume", req.files.resume[0].buffer, {
        filename: req.files.resume[0].originalname,
      });
    }
    if (req.files.jobDescriptionFile) {
      formData.append(
        "jobDescriptionFile",
        req.files.jobDescriptionFile[0].buffer,
        { filename: req.files.jobDescriptionFile[0].originalname }
      );
    }

    return {
      pythonServiceData: formData,
      headers: formData.getHeaders(),
    };
  } else {
    // No files, return raw JSON body and appropriate headers
    return {
      pythonServiceData: req.body,
      headers: { "Content-Type": "application/json" },
    };
  }
};

export const callPythonService = async (
  endpoint,
  data,
  headers,
  timeout = 60000
) => {
  const response = await axios.post(`${PYTHON_SERVICE_URL}${endpoint}`, data, {
    headers,
    timeout,
  });
  return response.data;
};
