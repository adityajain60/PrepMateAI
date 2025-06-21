import streamlit as st
import langchain_helper as lch
import os
import json
import components.sidebar as sidebar
from components.pdfProcessing import process_resume_upload, process_jd_upload
from components.resumeAnalysis import render_resume_analysis
from components.home import render_home

# --- Streamlit Configuration ---
st.set_page_config(
    page_title="PrepMate AI",
    page_icon="🎯",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- Sidebar and Input Collection ---
page, resume_file, resume_textbox, jd_file, jd_textbox = sidebar.sidebar()

# --- Resume and JD Upload Processing ---
resume_text = process_resume_upload(resume_file, resume_textbox)
jd_text = process_jd_upload(jd_file, jd_textbox)

# --- Metrics Handling ---
METRICS_FILE = "metrics.json"
def load_metrics():
    """Load metrics from the metrics.json file or return default values."""
    try:
        with open(METRICS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {
            "num_resumes": 0,
            "num_questions": 0,
            "num_answers": 0,
            "resume_scores": []
        }
metrics = load_metrics()
def get_avg_score():
    """Return the average resume score from metrics."""
    scores = metrics["resume_scores"]
    return round(sum(scores) / len(scores), 2) if scores else 0

def save_metrics():
    """Save the current metrics to metrics.json."""
    with open(METRICS_FILE, "w") as f:
        json.dump(metrics, f)






# --- Page Routing and Main Logic ---

def show_resume_analysis():
    """Render the Resume Analysis page UI and logic."""
    st.markdown("""
        <div style='text-align:center; margin-bottom:24px;'>
            <h1 style='color:#4F8BF9; font-size:2.8em; margin-bottom:0.2em;'>AI-Powered Resume Analysis</h1>
            <p style='color:#666; font-size:1.15em; max-width: 700px; margin: 0 auto;'>
                Get instant, detailed feedback on your resume. Upload your resume and the job description to see how you stack up.
            </p>
        </div>
    """, unsafe_allow_html=True)
    st.info("Ensure your resume and job description are uploaded in the sidebar before analyzing.", icon="👈")
    # Centered analyze button
    col1, col2, col3 = st.columns([1, 1, 1])
    with col2:
        analyze_clicked = st.button("🚀 Analyze My Resume", use_container_width=True)
    if analyze_clicked:
        if resume_text and jd_text:
            with st.spinner("Analyzing resume... This may take a moment."):
                analysis = lch.resume_analysis(resume_text, jd_text)
            st.markdown("<hr style='margin:32px 0 24px 0; border:0; border-top:2px solid #f0f0f0;'>", unsafe_allow_html=True)
            if isinstance(analysis, dict) and ("resume_summary" in analysis or "ats_score" in analysis):
                render_resume_analysis(analysis)
            else:
                st.error("Analysis failed. The AI service might be down or returned an unexpected format. Please try again.")
        else:
            st.warning("Please upload both a resume and a job description in the sidebar first.")


def show_mock_interview():
    """Render the Mock Interview page UI and logic."""
    import components.mockInterview as mock
    st.markdown("""
        <div style='text-align:center; margin-top:30px; margin-bottom:18px;'>
            <h2 style='color:#4F8BF9; margin-bottom:0.2em;'>Mock Interview</h2>
            <p style='color:#555; font-size:1.1em;'>Practice with AI-generated, personalized interview questions. Get instant feedback and ideal answers.</p>
        </div>
    """, unsafe_allow_html=True)

    # --- Collect user preferences for question generation ---
    with st.form("mock_interview_setup"):
        st.markdown("#### Interview Setup")
        difficulty = st.selectbox("Question Difficulty", ["Any", "Easy", "Medium", "Hard"])
        qtype = st.multiselect("Question Type (select one or more)", ["DSA", "CS Fundamentals", "Resume", "Behavioral", "System Design", "Other"])
        experience = st.selectbox("Experience Level", ["Fresher", "1-2 years", "Senior", "Other"])
        round_type = st.selectbox("Interview Round Type", ["Technical", "HR", "Managerial", "Other"])
        job_role = st.text_input("Target Job Role", value="Software Engineer")
        skill_focus = st.text_input("Skill Focus (leave empty for random)", value="Python, SQL")
        num_questions = st.slider("Number of Questions", 1, 10, 5)
        submitted = st.form_submit_button("Generate Questions")

    # --- Generate questions and update metrics ---
    if submitted and resume_text and jd_text:
        with st.spinner("Generating questions..."):
            questions = lch.generate_interview_questions(
                resume_text, jd_text, difficulty, ', '.join(qtype), experience, round_type, job_role, skill_focus, num_questions
            )
        if not (isinstance(questions, list) and all(isinstance(q, dict) for q in questions)):
            st.error("Failed to generate valid questions. Please try again.")
            st.write(questions)  # Optionally show the raw output for debugging
        else:
            st.session_state['mock_questions'] = questions
            st.session_state['mock_current_idx'] = 0
            st.session_state['mock_user_answers'] = {}
            st.session_state['show_ideal'] = False
            st.session_state['show_feedback'] = False
            # --- Metrics update for questions generated ---
            metrics['num_questions'] += len(questions)
            save_metrics()
            st.success("Questions generated! Scroll down to start your mock interview.")

    # --- Show mock interview UI if questions are generated ---
    questions = st.session_state.get('mock_questions', None)
    if questions and isinstance(questions, list) and all(isinstance(q, dict) for q in questions):
        current_idx = st.session_state.get('mock_current_idx', 0)
        user_answers = st.session_state.get('mock_user_answers', {})

        def set_user_answers(ans):
            st.session_state['mock_user_answers'] = ans

        # Get current question
        q = questions[current_idx]
        ideal_answer = None
        feedback = None
        if st.session_state.get('show_ideal'):
            with st.spinner("Getting ideal answer..."):
                ideal_answer = lch.generate_ideal_answer(resume_text, jd_text, q['question'])
        if st.session_state.get('show_feedback'):
            with st.spinner("Analyzing your answer..."):
                feedback = lch.answer_feedback(resume_text, jd_text, q['question'], user_answers.get(current_idx, ""))
            
            if not feedback or (isinstance(feedback, dict) and 'error' in feedback):
                st.error("Could not get feedback. The AI service may be down or the request failed.")
                if isinstance(feedback, dict) and feedback.get('raw_output'):
                    st.code(feedback['raw_output'])
                st.session_state['show_feedback'] = False # Reset state
                st.rerun()
            # --- Metrics update for answers generated ---
            metrics['num_answers'] += 1
            save_metrics()

        mock.mock_interview_ui(
            resume_text, jd_text, questions, current_idx, user_answers, None, set_user_answers, ideal_answer, feedback
        )
    else:
        st.info("Generate questions to start your mock interview.")

# --- Main Routing ---
if page == "Home":
    render_home(metrics, get_avg_score)
elif page == "Resume Analysis":
    show_resume_analysis()
elif page == "Mock Interview":
    show_mock_interview()