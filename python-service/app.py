from flask import Flask, request, jsonify
from flask_cors import CORS
import langchain_helper as lch
import os
from dotenv import load_dotenv
import PyPDF2
import io

load_dotenv()

app = Flask(__name__)
CORS(app)

def cleanup_temp_files():
    """Clean up temporary PDF files"""
    temp_files = ["temp_resume.pdf", "temp_jd.pdf"]
    for file in temp_files:
        if os.path.exists(file):
            try:
                os.remove(file)
            except:
                pass

def extract_text_from_pdf(pdf_file):
    """Extract text from uploaded PDF file."""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_file.read()))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text.strip()
    except Exception as e:
        raise Exception(f"Error reading PDF: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "OK", "message": "Python AI Service is running"})

@app.route('/resume/analyze', methods=['POST'])
def analyze_resume():
    try:
        resume_content = ""
        jd_content = ""
        
        # Handle multipart form data (file upload)
        if request.content_type and 'multipart/form-data' in request.content_type:
            if 'resume' in request.files:
                resume_file = request.files['resume']
                if resume_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_resume.pdf", "wb") as f:
                        f.write(resume_file.read())
                    resumeDB = lch.create_vectorDB_from_pdf("temp_resume.pdf")
                    resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
                else:
                    return jsonify({"error": "Resume must be a PDF file"}), 400
            elif 'resumeText' in request.form:
                resume_text = request.form.get('resumeText', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
            else:
                return jsonify({"error": "Resume file or text is required"}), 400
            
            if 'jobDescriptionFile' in request.files:
                jd_file = request.files['jobDescriptionFile']
                if jd_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_jd.pdf", "wb") as f:
                        f.write(jd_file.read())
                    jdDB = lch.create_vectorDB_from_pdf("temp_jd.pdf")
                    jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
                else:
                    return jsonify({"error": "Job description must be a PDF file"}), 400
            elif 'jobDescription' in request.form:
                jd_text = request.form.get('jobDescription', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
            else:
                return jsonify({"error": "Job description file or text is required"}), 400
        else:
            # Handle JSON data (text input) - also use RAG
            data = request.get_json()
            resume_text = data.get('resumeText', '').strip()
            jd_text = data.get('jobDescription', '').strip()
            
            # Use RAG workflow for both resume and JD
            if resume_text:
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
            
            if jd_text:
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
        
        if not resume_content:
            return jsonify({"error": "Resume content is required"}), 400
        if not jd_content:
            return jsonify({"error": "Job description is required"}), 400
        
        # Call the LLM analysis with enhanced RAG-extracted content
        result = lch.resume_analysis(resume_content, jd_content)
        
        # Check if the result has an error
        if isinstance(result, dict) and result.get('error'):
            cleanup_temp_files()
            return jsonify({"error": "Analysis failed", "details": result.get('raw_output', 'Unknown error')}), 500
        
        # Format the response for the frontend
        if isinstance(result, dict) and 'ats_score' in result:
            # Extract the match score for the frontend
            match_score = result.get('ats_score', {}).get('total_score', 0)
            
            # Create a simplified response structure for the frontend
            analysis_summary = result.get('resume_summary', '')
            if result.get('jd_summary'):
                analysis_summary += f"\n\nJob Description Summary: {result.get('jd_summary')}"
            
            strengths = []
            if result.get('strengths'):
                for category, items in result['strengths'].items():
                    if isinstance(items, list):
                        strengths.extend(items)
            
            suggestions = []
            if result.get('suggestions'):
                for category, items in result['suggestions'].items():
                    if isinstance(items, list):
                        suggestions.extend(items)
                    elif isinstance(items, dict):
                        for subcategory, subitems in items.items():
                            if isinstance(subitems, list):
                                suggestions.extend(subitems)
            
            cleanup_temp_files()
            return jsonify({
                "matchScore": match_score,
                "analysisSummary": analysis_summary,
                "strengths": strengths,
                "suggestions": suggestions,
                "fullAnalysis": result  # Include the full analysis for detailed views
            })
        else:
            cleanup_temp_files()
            return jsonify({"error": "Invalid analysis result format"}), 500
    
    except Exception as e:
        cleanup_temp_files()
        return jsonify({"error": str(e)}), 500

@app.route('/interview/generate', methods=['POST'])
def generate_questions():
    try:
        resume_content = ""
        jd_content = ""
        
        # Handle multipart form data (file upload)
        if request.content_type and 'multipart/form-data' in request.content_type:
            if 'resume' in request.files:
                resume_file = request.files['resume']
                if resume_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_resume.pdf", "wb") as f:
                        f.write(resume_file.read())
                    resumeDB = lch.create_vectorDB_from_pdf("temp_resume.pdf")
                    resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
                else:
                    return jsonify({"error": "Resume must be a PDF file"}), 400
            elif 'resumeText' in request.form:
                resume_text = request.form.get('resumeText', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
            else:
                return jsonify({"error": "Resume file or text is required"}), 400
            
            if 'jobDescriptionFile' in request.files:
                jd_file = request.files['jobDescriptionFile']
                if jd_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_jd.pdf", "wb") as f:
                        f.write(jd_file.read())
                    jdDB = lch.create_vectorDB_from_pdf("temp_jd.pdf")
                    jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
                else:
                    return jsonify({"error": "Job description must be a PDF file"}), 400
            elif 'jobDescription' in request.form:
                jd_text = request.form.get('jobDescription', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
            else:
                return jsonify({"error": "Job description file or text is required"}), 400
        else:
            # Handle JSON data (text input) - also use RAG
            data = request.get_json()
            resume_text = data.get('resumeText', '').strip()
            jd_text = data.get('jobDescription', '').strip()
            
            # Use RAG workflow for both resume and JD
            if resume_text:
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
            
            if jd_text:
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
        
        if not resume_content:
            return jsonify({"error": "Resume content is required"}), 400
        if not jd_content:
            return jsonify({"error": "Job description is required"}), 400
        
        # Get interview configuration parameters
        if request.content_type and 'multipart/form-data' in request.content_type:
            question_difficulty = request.form.get('questionDifficulty', "Medium")
            question_types = request.form.get('questionType', "Technical")
            # Handle comma-separated string from backend
            if ',' in question_types:
                question_types = [q.strip() for q in question_types.split(',')]
            else:
                question_types = [question_types]
            experience_level = request.form.get('experienceLevel', "1-2 years")
            round_type = request.form.get('roundType', "Technical")
            target_job_role = request.form.get('targetJobRole', "Software Engineer")
            skill_focus = request.form.get('skillFocus', "Python, SQL")
            num_questions = int(request.form.get('numQuestions', 5))
        else:
            # Handle JSON data
            data = request.get_json()
            question_difficulty = data.get('questionDifficulty', "Medium")
            question_types = data.get('questionType', "Technical")
            if isinstance(question_types, list):
                question_types = question_types
            else:
                question_types = [question_types]
            experience_level = data.get('experienceLevel', "1-2 years")
            round_type = data.get('roundType', "Technical")
            target_job_role = data.get('targetJobRole', "Software Engineer")
            skill_focus = data.get('skillFocus', "Python, SQL")
            num_questions = int(data.get('numQuestions', 5))
        
        # Handle "Any" difficulty
        if question_difficulty == "Any":
            question_difficulty = "Mixed"
        
        # Convert question types list to string for the LLM
        question_type_str = ", ".join(question_types)
        
        # Call the LLM question generation with enhanced RAG-extracted content
        result = lch.generate_interview_questions(
            resume_content, jd_content, question_difficulty, question_type_str,
            experience_level, round_type, target_job_role, skill_focus, num_questions
        )
        
        # Check if the result has an error
        if isinstance(result, dict) and result.get('error'):
            cleanup_temp_files()
            return jsonify({"error": "Question generation failed", "details": result.get('raw_output', 'Unknown error')}), 500
        
        # Format the response for the frontend
        if isinstance(result, list) and len(result) > 0:
            # Extract just the questions for the frontend
            questions = []
            for item in result:
                if isinstance(item, dict) and 'question' in item:
                    questions.append(item['question'])
            
            cleanup_temp_files()
            return jsonify({
                "questions": questions,
                "fullQuestions": result  # Include the full questions for detailed views
            })
        else:
            cleanup_temp_files()
            return jsonify({"error": "Invalid question generation result format"}), 500
    
    except Exception as e:
        cleanup_temp_files()
        return jsonify({"error": str(e)}), 500

@app.route('/answer-feedback', methods=['POST'])
def get_answer_feedback():
    try:
        data = request.get_json()
        resume_content_raw = data.get('resume_content')
        jd_content_raw = data.get('jd_content')
        question = data.get('question')
        answer = data.get('answer')
        
        if not all([resume_content_raw, jd_content_raw, question, answer]):
            return jsonify({"error": "All fields are required"}), 400
        
        # Use RAG workflow: Create FAISS vector DBs and extract info
        resumeDB = lch.create_vectorDB_from_text(resume_content_raw)
        resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
        
        jdDB = lch.create_vectorDB_from_text(jd_content_raw)
        jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
        
        result = lch.answer_feedback(resume_content, jd_content, question, answer)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ideal-answer', methods=['POST'])
def get_ideal_answer():
    try:
        data = request.get_json()
        resume_content_raw = data.get('resume_content')
        jd_content_raw = data.get('jd_content')
        question = data.get('question')
        
        if not all([resume_content_raw, jd_content_raw, question]):
            return jsonify({"error": "All fields are required"}), 400
        
        # Use RAG workflow: Create FAISS vector DBs and extract info
        resumeDB = lch.create_vectorDB_from_text(resume_content_raw)
        resume_content = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
        
        jdDB = lch.create_vectorDB_from_text(jd_content_raw)
        jd_content = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
        
        result = lch.generate_ideal_answer(resume_content, jd_content, question)
        return jsonify(result)
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ask', methods=['POST'])
def ask_question():
    """User-driven Q&A endpoint using RAG"""
    try:
        user_question = ""
        resume_content = ""
        jd_content = ""
        
        # Handle multipart form data (file upload)
        if request.content_type and 'multipart/form-data' in request.content_type:
            user_question = request.form.get('question', '').strip()
            
            if 'resume' in request.files:
                resume_file = request.files['resume']
                if resume_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_resume.pdf", "wb") as f:
                        f.write(resume_file.read())
                    resumeDB = lch.create_vectorDB_from_pdf("temp_resume.pdf")
                    resume_content = lch.extract_info(resumeDB, user_question)
                else:
                    return jsonify({"error": "Resume must be a PDF file"}), 400
            elif 'resumeText' in request.form:
                resume_text = request.form.get('resumeText', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, user_question)
            else:
                return jsonify({"error": "Resume file or text is required"}), 400
            
            if 'jobDescriptionFile' in request.files:
                jd_file = request.files['jobDescriptionFile']
                if jd_file.filename.endswith('.pdf'):
                    # Use RAG workflow: Create FAISS vector DB and extract info
                    with open("temp_jd.pdf", "wb") as f:
                        f.write(jd_file.read())
                    jdDB = lch.create_vectorDB_from_pdf("temp_jd.pdf")
                    jd_content = lch.extract_info(jdDB, user_question)
                else:
                    return jsonify({"error": "Job description must be a PDF file"}), 400
            elif 'jobDescription' in request.form:
                jd_text = request.form.get('jobDescription', '').strip()
                # Use RAG workflow: Create FAISS vector DB and extract info
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, user_question)
            else:
                return jsonify({"error": "Job description file or text is required"}), 400
        else:
            # Handle JSON data (text input)
            data = request.get_json()
            user_question = data.get('question', '').strip()
            resume_text = data.get('resume_content', '').strip()
            jd_text = data.get('jd_content', '').strip()
            
            # Use RAG workflow for both resume and JD
            if resume_text:
                resumeDB = lch.create_vectorDB_from_text(resume_text)
                resume_content = lch.extract_info(resumeDB, user_question)
            
            if jd_text:
                jdDB = lch.create_vectorDB_from_text(jd_text)
                jd_content = lch.extract_info(jdDB, user_question)
        
        if not user_question:
            return jsonify({"error": "Question is required"}), 400
        if not resume_content:
            return jsonify({"error": "Resume content is required"}), 400
        if not jd_content:
            return jsonify({"error": "Job description is required"}), 400
        
        # Combine context for comprehensive answer
        combined_context = f"Resume Information: {resume_content}\n\nJob Description Information: {jd_content}"
        
        # Generate answer using LLM with retrieved context
        llm = lch.ChatGroq(
            api_key=os.getenv("GROQ_API_KEY"),
            model="llama-3.3-70b-versatile",
            temperature=0.7,
        )
        
        prompt = f"""
        Based on the following context from a resume and job description, answer the user's question.

        Context:
        {combined_context}

        User Question: {user_question}

        Provide a clear, helpful answer based on the retrieved information. Be specific and actionable.
        """
        
        response = llm.invoke(prompt)
        
        # Clean up temporary files
        cleanup_temp_files()
        
        return jsonify({
            "question": user_question,
            "answer": response.content.strip()
        })
        
    except Exception as e:
        cleanup_temp_files()
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=True, use_reloader=False) 