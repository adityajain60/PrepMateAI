import streamlit as st
import plotly.graph_objects as go

def render_home(metrics, get_avg_score):
    # --- Page Styling ---
    st.markdown("""
        <style>
            .metric-card {
                background-color: #ffffff;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
                box-shadow: 0 4px 6px rgba(0,0,0,0.04);
                transition: transform 0.2s;
                border: 1px solid #e0e0e0;
            }
            .metric-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 10px rgba(0,0,0,0.07);
            }
            .metric-label {
                font-size: 1.1em;
                font-weight: 600;
                color: #555;
            }
            .metric-value {
                font-size: 2.5em;
                font-weight: 700;
                color: #4F8BF9;
            }
            .feature-card {
                background: #fff;
                border-radius: 14px;
                padding: 24px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(80,120,200,0.08);
                transition: all 0.2s;
                height: 100%;
            }
            .feature-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 6px 16px rgba(80,120,200,0.12);
            }
            .feature-icon {
                font-size: 3.5em;
                margin-bottom: 12px;
            }
            .feature-title {
                font-size: 1.4em;
                font-weight: 700;
                color: #4F8BF9;
                margin-bottom: 8px;
            }
            .feature-desc {
                font-size: 1em;
                color: #666;
            }
        </style>
    """, unsafe_allow_html=True)

    # --- Header ---
    st.markdown("""
        <div style='text-align:center; margin-bottom: 36px;'>
            <h1 style='color:#4F8BF9; font-size:3.2em; margin-bottom:0.2em;'>Welcome to PrepMate AI</h1>
            <p style='color:#666; font-size:1.2em; max-width: 750px; margin: 0 auto;'>
                Your personal AI-powered coach to ace your next job application. Analyze resumes, practice for interviews, and track your progress.
            </p>
        </div>
    """, unsafe_allow_html=True)

    # --- Metrics Dashboard ---
    st.markdown("<h2 style='text-align:center; color:#333; margin-bottom:24px;'>Platform Stats</h2>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.markdown(f"""
            <div class='metric-card'>
                <div class='metric-label'>Resumes Analyzed</div>
                <div class='metric-value'>{metrics.get("num_resumes", 0)}</div>
            </div>
        """, unsafe_allow_html=True)
    with col2:
        st.markdown(f"""
            <div class='metric-card'>
                <div class='metric-label'>Questions Generated</div>
                <div class='metric-value'>{metrics.get("num_questions", 0)}</div>
            </div>
        """, unsafe_allow_html=True)
    with col3:
        st.markdown(f"""
            <div class='metric-card'>
                <div class='metric-label'>Answers Reviewed</div>
                <div class='metric-value'>{metrics.get("num_answers", 0)}</div>
            </div>
        """, unsafe_allow_html=True)
        
    st.markdown("<div style='height: 30px;'></div>", unsafe_allow_html=True)

    # --- Average Score Gauge ---
    avg_score = get_avg_score()
    if avg_score > 0:
        fig = go.Figure(go.Indicator(
            mode = "gauge+number",
            value = avg_score,
            title = {'text': "<b>Average Resume Score</b>", 'font': {'size': 24}},
            gauge = {
                'axis': {'range': [None, 100], 'tickwidth': 1, 'tickcolor': "darkblue"},
                'bar': {'color': "#4F8BF9"},
                'bgcolor': "white",
                'borderwidth': 2,
                'bordercolor': "#e0e0e0",
                'steps' : [
                    {'range': [0, 60], 'color': "#ff7f7f"},
                    {'range': [60, 85], 'color': "#ffdd7f"},
                    {'range': [85, 100], 'color': "#7fff7f"}],
            }))
        fig.update_layout(
            height=300, 
            margin=dict(l=10, r=10, t=60, b=10),
            paper_bgcolor = "rgba(0,0,0,0)",
            font={'color': "#333", 'family': "Arial"}
        )
        st.plotly_chart(fig, use_container_width=True)

    st.markdown("<hr style='margin:40px 0; border:0; border-top:1px solid #ddd;'>", unsafe_allow_html=True)

    # --- Feature Cards ---
    st.markdown("<h2 style='text-align:center; color:#333; margin-bottom:24px;'>Get Started</h2>", unsafe_allow_html=True)
    col1, col2 = st.columns(2)
    with col1:
        st.markdown("""
            <div class='feature-card'>
                <div class='feature-icon'>📄</div>
                <div class='feature-title'>Resume Analysis</div>
                <div class='feature-desc'>
                    Get an in-depth review of your resume against a job description. Find out your score, strengths, and areas for improvement.
                </div>
            </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
            <div class='feature-card'>
                <div class='feature-icon'>🤖</div>
                <div class='feature-title'>Mock Interview</div>
                <div class='feature-desc'>
                    Practice with AI-generated questions tailored to your profile. Get instant feedback on your answers to sharpen your skills.
                </div>
            </div>
        """, unsafe_allow_html=True)
        
    st.info("Use the sidebar on the left to navigate to a feature.")
