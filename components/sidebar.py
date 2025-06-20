import streamlit as st

def sidebar():
    # Styling
    st.markdown("""
        <style>
        [data-testid="stSidebar"] {
            background: linear-gradient(135deg, #e3f0ff 0%, #f8fcff 100%);
            min-width: 370px;
            max-width: 420px;
            width: 420px;
            padding-right: 18px;
            padding-left: 18px;
            box-shadow: 2px 0 16px 0 rgba(80,120,200,0.07);
        }
        .sidebar-logo {
            text-align: center;
            margin-bottom: 18px;
        }
        .sidebar-logo img {
            width: 70px;
            margin-bottom: 8px;
            filter: drop-shadow(0 2px 8px #b3c6f7);
        }
        .sidebar-title {
            color: #3264d6;
            font-size: 2.2em;
            font-weight: 800;
            letter-spacing: 1px;
            margin-bottom: 0.1em;
            font-family: 'Segoe UI', 'Roboto', sans-serif;
        }
        .sidebar-subtitle {
            color: #6a7ba2;
            font-size: 1.08em;
            margin-bottom: 0.7em;
        }
        .sidebar-footer {
            color: #aab6d6;
            font-size: 0.98em;
            text-align: center;
            margin-top: 32px;
            margin-bottom: 8px;
        }
        textarea {
            min-height: 110px !important;
            max-height: 140px !important;
            border-radius: 8px !important;
            font-size: 1.01em;
        }
        /* Uniform button style */
        div[data-testid^="baseButton"] {
            width: 100% !important;
            margin-bottom: 10px;
        }
        button[kind] {
            font-size: 1.05em !important;
            font-weight: 600 !important;
            padding: 0.6em 1em;
            width: 100% !important;
            display: block;
            text-align: left;
        }
        </style>
    """, unsafe_allow_html=True)

    with st.sidebar:
        # Logo and title
        st.markdown("""
            <div class='sidebar-logo'>
                <img src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png' alt='PrepMate AI logo'>
                <div class='sidebar-title'>PrepMate AI</div>
                <div class='sidebar-subtitle'>Your AI Interview & Resume Coach</div>
            </div>
        """, unsafe_allow_html=True)

        # Navigation
        nav_items = [
            (" Home", "Home"),
            (" Resume Analysis", "Resume Analysis"),
            (" Mock Interview", "Mock Interview")
        ]
        if 'sidebar_page' not in st.session_state:
            st.session_state['sidebar_page'] = 'Home'
        for label, value in nav_items:
            is_selected = st.session_state['sidebar_page'] == value
            button_type = "primary" if is_selected else "secondary"
            if st.button(label, key=f"nav_btn_{value}", type=button_type):
                st.session_state['sidebar_page'] = value
        page = st.session_state['sidebar_page']

        # Resume input
        st.markdown("<h4>Resume (PDF or Text)</h4>", unsafe_allow_html=True)
        resume_file = st.file_uploader("Upload your Resume (PDF)", type=["pdf"], key="resume")
        resume_textbox = st.text_area("Or paste your Resume here:", key="resume_text")

        # JD input
        st.markdown("<h4>Job Description (PDF or Text)</h4>", unsafe_allow_html=True)
        jd_file = st.file_uploader("Upload Job Description (PDF)", type=["pdf"], key="jd")
        jd_textbox = st.text_area("Or paste the Job Description here:", key="jd_text")

        # Footer
        st.markdown("""
            <div class='sidebar-footer'>
                Made by <b>Aditya Jain</b>
            </div>
        """, unsafe_allow_html=True)

    return page, resume_file, resume_textbox, jd_file, jd_textbox
