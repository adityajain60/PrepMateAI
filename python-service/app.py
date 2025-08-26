from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
from functools import wraps

import langchain_helper as lch

load_dotenv()

app = Flask(__name__)
CORS(app)

TEMP_FILES = {
    "resume": "temp_resume.pdf",
    "job_desc": "temp_job_desc.pdf"
}

def _cleanup_temp_files():
    """A simple function to remove temporary files."""
    for path in TEMP_FILES.values():
        if os.path.exists(path):
            try:
                os.remove(path)
            except OSError as e:
                print(f"Failed to remove temp file {path}: {e}")


def extract_resume_and_jd(request, resume_query, jd_query):
    """
    Parse a Flask request that may contain PDF files or plain‑text fields
    for a resume and a job description, build vector DBs for each, and
    return (resume_info, jd_info, None) on success or
    (None, None, flask_response_tuple) on failure.
    """
    is_multipart = "multipart/form-data" in (request.content_type or "")
    try:
        # ---------- Resume ----------
        resume_db = None
        if is_multipart and "resume" in request.files and request.files["resume"].filename:
            file = request.files["resume"]
            if not file.filename.lower().endswith(".pdf"):
                return None, None, (jsonify({"error": "Resume must be a PDF"}), 400)

            # If lch supports file‑like objects, pass the stream directly.
            # Otherwise, save to a temp path.
            file.save(TEMP_FILES["resume"])
            resume_db = lch.create_vectorDB_from_pdf(TEMP_FILES["resume"])
        else:
            resume_text = (
                request.form.get("resumeText") if is_multipart
                else (request.get_json(silent=True) or {}).get("resumeText", "")
            ).strip()
            if resume_text:
                resume_db = lch.create_vectorDB_from_text(resume_text)

        if resume_db is None:
            return None, None, (jsonify({"error": "Missing resume file or text"}), 400)

        resume_info = lch.extract_info(resume_db, resume_query)

        # ---------- Job description ----------
        jd_db = None
        if is_multipart and "jobDescriptionFile" in request.files and request.files["jobDescriptionFile"].filename:
            file = request.files["jobDescriptionFile"]
            if not file.filename.lower().endswith(".pdf"):
                return None, None, (jsonify({"error": "Job description must be a PDF"}), 400)

            file.save(TEMP_FILES["job_desc"])
            jd_db = lch.create_vectorDB_from_pdf(TEMP_FILES["job_desc"])
        else:
            jd_text = (
                request.form.get("jobDescription") if is_multipart
                else (request.get_json(silent=True) or {}).get("jobDescription", "")
            ).strip()
            if jd_text:
                jd_db = lch.create_vectorDB_from_text(jd_text)

        if jd_db is None:
            return None, None, (jsonify({"error": "Missing job description file or text"}), 400)

        jd_info = lch.extract_info(jd_db, jd_query)

        return resume_info, jd_info, None

    except Exception as exc:
        # Optional: app.logger.exception("Document processing failed")
        return None, None, (jsonify({"error": f"Document processing failed: {exc}"}), 500)


@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "AI service running"})


@app.route('/resume/analyze', methods=['POST'])
def analyze_resume():
    print("Content‑Type ->", request.content_type)
    print("Raw data len ->", len(request.data)) 
    try:
        resume_query = "Extract skills, education, work experience, and projects from resume."
        jd_query = "Extract required skills and technologies from job description."

        resume_text, jd_text, error_response = extract_resume_and_jd(request, resume_query, jd_query)
        if error_response:
            return error_response

        analysis = lch.resume_analysis(resume_text, jd_text)
        return jsonify(analysis) if not analysis.get("error") else (jsonify(analysis), 500)
    
    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500
    finally:
        _cleanup_temp_files()


@app.route('/interview/generate', methods=['POST'])
def generate_mock_questions():
    try:
        resume_query = "Extract skills, experience, and projects from resume for mock questions."
        jd_query = "Extract responsibilities and requirements from job description."

        resume_text, jd_text, error_response = extract_resume_and_jd(request, resume_query, jd_query)
        if error_response:
            return error_response

        data = request.form if 'multipart/form-data' in request.content_type else request.get_json()

        questions = lch.generate_interview_questions(
            resume_content=resume_text,
            jd_content=jd_text,
            num_questions=int(data.get('numQuestions', 5)),
            skill_focus=data.get('skillFocus', "As per JD"),
            question_type=data.get('questionType', "Technical, Behavioral"),
            question_difficulty=data.get('questionDifficulty', "Medium"),
            experience_level=data.get('experienceLevel', "1-2 years"),
            round_type=data.get('roundType', "Technical"),
            target_job_role=data.get('targetJobRole', "Software Engineer")
        )

        if isinstance(questions, dict) and questions.get("error"):
            return jsonify(questions), 500
        
        return jsonify(questions)
    
    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500
    finally:
        _cleanup_temp_files()


@app.route('/answer-feedback', methods=['POST'])
def feedback_on_answer():
    try:
        resume_query = "Extract relevant resume details for answer evaluation."
        jd_query = "Extract job requirements for answer evaluation."

        resume_text, jd_text, error_response = extract_resume_and_jd(request, resume_query, jd_query)
        if error_response:
            return error_response

        data = request.get_json()
        if not data.get("question") or not data.get("answer"):
            return jsonify({"error": "Missing question or answer"}), 400

        feedback = lch.answer_feedback(resume_text, jd_text, data["question"], data["answer"])
        return jsonify(feedback)
    
    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500
    finally:
        _cleanup_temp_files()


@app.route('/ideal-answer', methods=['POST'])
def generate_ideal_response():
    try:
        resume_query = "Extract candidate strengths and experiences for ideal response."
        jd_query = "Extract job expectations for crafting ideal answer."

        resume_text, jd_text, error_response = extract_resume_and_jd(request, resume_query, jd_query)
        if error_response:
            return error_response

        question = request.get_json().get("question")
        if not question:
            return jsonify({"error": "Missing interview question"}), 400

        ideal_response = lch.generate_ideal_answer(resume_text, jd_text, question)
        return jsonify(ideal_response)
    
    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500
    finally:
        _cleanup_temp_files()


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True)
