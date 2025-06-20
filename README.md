# PrepMate AI: Your Personal AI-Powered Career Coach

PrepMate AI is a comprehensive Streamlit web application designed to help users prepare for job interviews and optimize their resumes. It leverages the power of Large Language Models (LLMs) through the Groq API to provide instant, insightful feedback on resumes and conduct realistic mock interviews.

![PrepMate AI Screenshot](https://user-images.githubusercontent.com/your-username/your-repo/your-screenshot.png) <!-- It's recommended to add a screenshot of the app here -->

---

## ✨ Features

*   **🏠 Home Dashboard:** A modern, interactive dashboard displaying platform usage statistics like the total number of resumes analyzed and mock interviews conducted.
*   **📄 Resume Analysis:**
    *   Upload your resume (PDF) and the job description (PDF).
    *   Receive a holistic ATS (Applicant Tracking System) score based on an AI-driven analysis.
    *   Get detailed feedback on how to improve your resume, including suggestions for skills, keywords, and experience alignment.
*   **🎙️ Mock Interview:**
    *   Start a mock interview session tailored to a specific job description.
    *   Select interview difficulty (Easy, Medium, Hard, or Any).
    *   Choose from various question types (Behavioral, Technical, Situational).
    *   Receive AI-generated ideal answers and constructive feedback on your own responses.
    *   Navigate through questions with an interactive slider.
*   **🎨 Modern UI/UX:** A beautiful, intuitive, and responsive user interface built with Streamlit, featuring a custom sidebar for easy navigation.

---

## 🛠️ Tech Stack

*   **Frontend:** [Streamlit](https://streamlit.io/)
*   **Backend & AI:**
    *   [Python](https://www.python.org/)
    *   [LangChain](https://www.langchain.com/) for LLM orchestration.
    *   [Groq](https://groq.com/) for fast LLM inference.
*   **Data Visualization:** [Plotly](https://plotly.com/python/)

---

## 🚀 Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites

*   Python 3.8+
*   A [GroqCloud](https://console.groq.com/keys) account and API Key.

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/PMAI.git
cd PMAI
```

### 2. Create a Virtual Environment

It's recommended to use a virtual environment to manage project dependencies.

*   **On Windows:**
    ```bash
    python -m venv venv
    .\venv\Scripts\activate
    ```

*   **On macOS/Linux:**
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

### 3. Install Dependencies

Install all the required Python packages using the `requirements.txt` file.

```bash
pip install -r requirements.txt
```

### 4. Configure API Keys

The application uses Streamlit's secrets management for API keys.

1.  Create a directory named `.streamlit` in the root of your project folder.
2.  Inside the `.streamlit` directory, create a new file named `secrets.toml`.
3.  Add your Groq API key to the `secrets.toml` file as shown below:

    ```toml
    # .streamlit/secrets.toml

    GROQ_API_KEY="gsk_YourSecretGroqApiKey"
    ```

### 5. Run the Application

Once the setup is complete, you can run the Streamlit app with the following command:

```bash
streamlit run app.py
```

The application will open in your default web browser.

---

## 📁 Project Structure

```
PMAI/
│
├── .streamlit/
│   └── secrets.toml        # API keys and secrets (add to .gitignore)
│
├── app.py                  # Main application entry point
├── requirements.txt        # Python dependencies
├── langchain_helper.py     # Helper functions for LangChain & Groq API calls
├── metrics.json            # Stores platform usage statistics
│
├── components/             # Directory for different UI pages/modules
│   ├── home.py             # Home page UI
│   ├── resumeAnalysis.py   # Resume Analysis page UI and logic
│   ├── mockInterview.py    # Mock Interview page UI and logic
│   ├── pdfProcessing.py    # PDF text extraction utility
│   └── sidebar.py          # Sidebar navigation component
│
└── venv/                   # Virtual environment directory
``` 