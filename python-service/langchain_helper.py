from langchain.document_loaders import PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.vectorstores import FAISS
from langchain.prompts import PromptTemplate
from langchain_core.runnables import Runnable
from langchain_groq import ChatGroq
from langchain.embeddings import HuggingFaceEmbeddings
from dotenv import load_dotenv
import os
import json
import re

load_dotenv()


def get_embeddings():
    return HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-MiniLM-L3-v2")



def create_vectorDB_from_pdf(pdf_path: str, persist_path: str = "./faiss_index"):
    # Step 1: Load the PDF
    loader = PyPDFLoader(pdf_path)
    documents = loader.load()

    # Step 2: Split the text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.split_documents(documents)

    # Step 3: Create embeddings
    embeddings = get_embeddings()
    

    # Step 4: Create FAISS vector store
    db = FAISS.from_documents(docs, embeddings)

    return db


def create_vectorDB_from_text(text: str, persist_path: str = "./faiss_index"):
    # Step 1: Split the text
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    docs = text_splitter.create_documents([text])

    # Step 2: Create embeddings
    embeddings = get_embeddings()
    
    # Step 3: Create FAISS vector store
    db = FAISS.from_documents(docs, embeddings)

    return db


def extract_info(db, query):
    docs = db.similarity_search(query, k=10)
    content = " ".join([doc.page_content for doc in docs])
    return content


def clean_and_parse_json(text: str):
    import re
    import json

    # Remove Markdown code block markers (triple backticks)
    text = re.sub(r'^```(?:json)?\s*', '', text.strip(), flags=re.IGNORECASE)
    text = re.sub(r'```\s*$', '', text, flags=re.IGNORECASE)

    # Replace smart quotes and dashes (optional, for robustness)
    text = text.replace(""", '"').replace(""", '"')
    text = text.replace("'", "'").replace("'", "'")
    text = text.replace("–", "-").replace("—", "-")
    # Remove non-printable control characters
    text = re.sub(r"[\x00-\x1F\x7F]", "", text)

    # Try to parse as JSON array or object
    try:
        return json.loads(text)
    except Exception:
        # Fallback: extract the first {...} or [...] block
        match = re.search(r"(\[.*\]|\{.*\})", text, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return None


def resume_analysis(resume_content: str, jd_content: str):
    """
    Analyze a candidate's resume against a job description and return a structured JSON object with detailed feedback, ATS score, strengths, weaknesses, and suggestions.
    """
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.85,
    )
    prompt = PromptTemplate(
        input_variables=["resume_content", "jd_content"],
        template="""
        You are an expert technical recruiter and resume analyst. Your goal is to go beyond simple keyword matching and provide a deep, insightful analysis of the candidate's suitability for the role. Evaluate the substance, impact, and narrative of the resume, not just the presence of keywords.

        Given the candidate's **resume** and the **job description**, provide a comprehensive, structured analysis to help the candidate understand their fit and how to improve their resume for this job.

        Resume:
        {resume_content}

        Job Description:
        {jd_content}

        Your output MUST be a valid JSON object with the following structure (use these exact keys and nesting):

        {{
          "resume_summary": "<short summary>",
          "jd_summary": "<short summary>",
          "ats_score": {{
            "total_score": <int>,
            "skills_match": <int>,
            "keyword_match": <int>,
            "format_penalty": <int>,
            "final_assessment": "<short assessment>"
          }},
          "sections": {{
            "basic_info": {{
              "name": "<name>",
              "email": "<email>",
              "phone": "<phone>"
            }},
            "education": [
              {{
                "degree": "<degree>",
                "institute": "<institute>",
                "cgpa": "<cgpa>",
                "years": "<years>"
              }}
            ],
            "work_experience": [
              {{
                "title": "<title>",
                "company": "<company>",
                "duration": "<duration>",
                "tech_stack": ["<tech>"]
              }}
            ],
            "projects": [
              {{
                "name": "<name>",
                "description": "<description>",
                "tech_stack": ["<tech>", ...],
                "impact": "<impact>"
              }}
            ],
            "skills": ["<skill>", ...],
            "certifications": ["<certification>"]
          }},
          "strengths": {{
            "technical": ["<point>", ...],
            "resume_quality": ["<point>", ...],
            "alignment_with_jd": ["<point>", ...]
          }},
          "weaknesses": {{
            "missing_skills": ["<skill>", ...],
            "weak_phrasing": {{
              "verbs": ["<verb>", ...],
              "examples": ["<example>", ...]
            }},
            "format_issues": {{
              "layout": ["<issue>", ...],
              "technical": ["<issue>", ...]
            }},
            "content_gaps": ["<gap>", ...]
          }},
          "suggestions": {{
            "formatting": {{
              "high_priority": ["<tip>", ...],
              "low_priority": ["<tip>", ...]
            }},
            "keyword_optimization": {{
              "missing_keywords": ["<keyword>", ...],
              "overused_words": ["<word>", ...]
            }},
            "content_improvements": ["<suggestion>", ...],
            "rewrite_examples": [
              {{
                "current": "<current>",
                "suggested": "<suggested>"
              }}
            ]
          }},
          "red_flags": ["<flag>", ...],
          "suggested_resume_title": "<title>"
        }}

        Guidelines:
        - The total_score (out of 100) should be a result of your holistic AI analysis.
        - Output only the JSON object, nothing else.
        - Do NOT wrap the JSON in markdown code blocks (no ```json or ```).
        - If a section is missing, use an empty string, empty list, or empty object as appropriate.
        - Ensure the JSON is valid and parsable by Python's json.loads().
        """
    )

    chain: Runnable = prompt | llm

    response = chain.invoke(
        {
            "resume_content": resume_content,
            "jd_content": jd_content,
        }
    )
    print("LLM raw response:", response)

    text = response.content.strip()
    
    try:
        return clean_and_parse_json(text)
    except Exception as e:
        print(f"[resume_analysis] JSON decode error: {e}\nRaw output: {text}")
        # Always return the original LLM output for debugging
        return {"error": "Invalid JSON", "raw_output": text}


def generate_interview_questions(
    resume_content: str,
    jd_content: str,
    question_difficulty: str,
    question_type: str,
    experience_level: str,
    round_type: str,
    target_job_role: str,
    skill_focus: str,
    num_questions: int
    ):
    
    
    
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.85,
    )
    prompt = PromptTemplate(
        input_variables=[
            "resume_content", "jd_content", "question_difficulty", "question_type", "experience_level", "round_type", "target_job_role", "skill_focus", "num_questions"
        ],
        template="""
        You are an expert technical interviewer.

        Given the following inputs, generate {num_questions} highly personalized, high-quality mock interview questions. Each question should be tailored to the candidate's background, the job description, and the requirements below. Output a JSON array, where each element is an object with these keys: question_type, question_difficulty, question_num, question.

        Candidate Resume:
        {resume_content}

        Job Description:
        {jd_content}

        Requirements for the questions:
        - Question Type: {question_type} (e.g., DSA, CS Fundamentals, Resume, Behavioral, System Design, etc.)
        - Question Difficulty: {question_difficulty} (e.g., Easy, Medium, Hard)
        - Experience Level: {experience_level} (e.g., Fresher, 1-2 years, Senior, etc.)
        - Interview Round Type: {round_type} (e.g., Technical, HR, Managerial, etc.)
        - Target Job Role: {target_job_role}
        - Skill Focus: {skill_focus} (e.g., Python, SQL, System Design, etc.)

        Guidelines:
        - Each question must be relevant to the candidate's experience, the job description, and the above requirements.
        - Vary the style and depth of questions as appropriate for the experience level and round type.
        - Do not repeat or rephrase questions.
        - For each question, output a JSON object with:
            - question_type: category of the question
            - question_difficulty: difficulty level
            - question_num: the question number (starting from 1)
            - question: the question text
        - Output only the JSON object, nothing else.
        - Do NOT wrap the JSON in markdown code blocks (no ```json or ```).
        - Ensure the JSON is valid and parsable by Python's json.loads().
        """
    )

    chain: Runnable = prompt | llm

    response = chain.invoke(
        {
            "resume_content": resume_content,
            "jd_content": jd_content,
            "question_difficulty": question_difficulty,
            "question_type": question_type,
            "experience_level": experience_level,
            "round_type": round_type,
            "target_job_role": target_job_role,
            "skill_focus": skill_focus,
            "num_questions": num_questions,
        }
    )
    text = response.content.strip()
    try:
        return clean_and_parse_json(text)
    except Exception as e:
        print(f"[resume_analysis] JSON decode error: {e}\nRaw output: {text}")
        # Always return the original LLM output for debugging
        return {"error": "Invalid JSON", "raw_output": text}


def answer_feedback(
    resume_content: str,
    jd_content: str,
    question: str,
    answer: str
    ):
   
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.85,
    )
    prompt = PromptTemplate(
        input_variables=["resume_content", "jd_content", "question", "answer"],
        template="""
        You are an expert technical interviewer.

        Given the candidate's resume, job description, interview question, and the candidate's answer, provide a comprehensive, structured feedback to help the candidate understand their performance and how to improve.

        Resume:
        {resume_content}

        Job Description:
        {jd_content}

        Interview Question:
        {question}

        Candidate's Answer:
        {answer}

        Your output MUST be a valid JSON object with the following fields:
        {{
          "strengths": ["<point>", ...],
          "areas_to_improve": ["<point>", ...],
          "score_out_of_10": <int>,
          "improvement_suggestions": ["<suggestion>", ...],
          "follow_up_questions": ["<question>", ...],
          "overall_feedback": "<short summary>"
        }}

        Guidelines:
        - Be specific and actionable in your feedback.
        - If a section is not applicable, use an empty list or string.
        - Output only the JSON object, nothing else.
        - Do NOT wrap the JSON in markdown code blocks (no ```json or ```).
        - Ensure the JSON is valid and parsable by Python's json.loads().
        """
    )

    chain: Runnable = prompt | llm

    response = chain.invoke(
        {
            "resume_content": resume_content,
            "jd_content": jd_content,
            "question": question,
            "answer": answer,
        }
    )
    text = response.content.strip()
    try:
        return clean_and_parse_json(text)
    except Exception as e:
        print(f"[resume_analysis] JSON decode error: {e}\nRaw output: {text}")
        # Always return the original LLM output for debugging
        return {"error": "Invalid JSON", "raw_output": text}


def generate_ideal_answer(
    resume_content: str,
    jd_content: str,
    question: str
    ):
    """
    Generate an ideal answer for the given interview question, tailored to the candidate's resume and the job description.
    Returns a JSON object: {"ideal_answer": <answer>}.
    """
    llm = ChatGroq(
        api_key=os.getenv("GROQ_API_KEY"),
        model="llama-3.3-70b-versatile",
        temperature=0.85,
    )
    prompt = PromptTemplate(
        input_variables=["resume_content", "jd_content", "question"],
        template="""
        You are an expert technical interviewer and career coach.

        Given the candidate's resume, the job description, and an interview question, generate an ideal answer for the candidate. The answer should:
        - Be tailored to the candidate's background and experience as shown in the resume.
        - Address the requirements and expectations in the job description.
        - Demonstrate strong communication, relevant skills, and depth of knowledge.
        - Be detailed, specific, and realistic for the candidate's profile.
        - Present the answer in clear, concise bullet points for easy reading.

        After generating the ideal answer, provide a clear, step-by-step explanation in bullet points to help the candidate understand:
        - Why this answer is strong and effective.
        - How it addresses the question and job requirements.
        - What key points or strategies make this answer stand out.

        Resume:
        {resume_content}

        Job Description:
        {jd_content}

        Interview Question:
        {question}

        Output:
        Return only a valid JSON object with this structure:
        {{"ideal_answer": "• [First bullet point]\\n\\n• [Second bullet point]\\n\\n• [Third bullet point]", "explanation": "• [First explanation point]\\n\\n• [Second explanation point]\\n\\n• [Third explanation point]"}}

        Guidelines:
        - Format the ideal_answer and explanation as bullet points using "• " at the start of each line
        - Use \\n\\n (double line break) between bullet points for better readability
        - Each bullet point should be on its own line with proper spacing
        - Make the content readable and well-structured
        - Output only the JSON object, nothing else.
        - Do NOT wrap the JSON in markdown code blocks (no ```json or ```).
        - Ensure the JSON is valid and parsable by Python's json.loads().
        """
    )

    chain: Runnable = prompt | llm

    response = chain.invoke(
        {
            "resume_content": resume_content,
            "jd_content": jd_content,
            "question": question,
        }
    )
    text = response.content.strip()
    try:
        return clean_and_parse_json(text)
    except Exception as e:
        print(f"[generate_ideal_answer] JSON decode error: {e}\nRaw output: {text}")
        # Always return the original LLM output for debugging
        return {"error": "Invalid JSON", "raw_output": text} 