import streamlit as st
import re

def render_feedback(feedback: dict):
    st.markdown("#### Feedback")
    cols = st.columns(3)
    cols[0].metric("Score", feedback.get("score_out_of_10", "-"))
    cols[1].markdown(f"**Strengths:**")
    for s in feedback.get("strengths", []):
        cols[1].markdown(f"<span style='color:#388e3c'>✅ {s}</span>", unsafe_allow_html=True)
    cols[2].markdown(f"**Areas to Improve:**")
    for w in feedback.get("areas_to_improve", []):
        cols[2].markdown(f"<span style='color:#d32f2f'>❌ {w}</span>", unsafe_allow_html=True)
    st.markdown("**Suggestions:**")
    for sug in feedback.get("improvement_suggestions", []):
        st.markdown(f"💡 {sug}")
    st.markdown("**Follow-up Questions:**")
    for fq in feedback.get("follow_up_questions", []):
        st.markdown(f"🔄 {fq}")
    st.markdown(f"**Overall Feedback:** {feedback.get('overall_feedback', '-')}")


def render_ideal_answer(ideal_answer_data: dict):
    st.markdown("#### Ideal Answer & Explanation")
    
    with st.container(border=True):
        # Render Ideal Answer
        st.markdown("**Ideal Answer:**")
        answer_content = ideal_answer_data.get("ideal_answer")
        
        if isinstance(answer_content, list):
            for item in answer_content:
                # Heuristic to detect and format code blocks. 
                # Looks for 'python\n' and separates the intro text from the code.
                parts = re.split(r'\\bpython\\b\\s*\\n', item, maxsplit=1)
                if len(parts) == 2:
                    if parts[0].strip():
                        st.markdown(f"- {parts[0]}")
                    st.code(parts[1], language='python')
                else:
                    st.markdown(f"- {item}")
        elif answer_content:
            # Convert \n to actual line breaks and display properly
            formatted_answer = answer_content.replace('\\n', '\n')
            
            # If the content doesn't have proper line breaks, try to format it
            if '•' in formatted_answer and '\n' not in formatted_answer:
                # Split by bullet points and format properly
                bullet_points = formatted_answer.split('•')
                formatted_bullets = []
                for point in bullet_points:
                    if point.strip():
                        formatted_bullets.append(f"• {point.strip()}")
                formatted_answer = '\n\n'.join(formatted_bullets)
            
            st.markdown(formatted_answer)
        else:
            st.warning("No ideal answer available.")

        # Render Explanation
        explanation = ideal_answer_data.get("explanation")
        if explanation:
            st.markdown("---")
            st.markdown("**Explanation:**")
            if isinstance(explanation, list):
                for point in explanation:
                    st.markdown(f"- {point}")
            else:
                # Convert \n to actual line breaks and display properly
                formatted_explanation = explanation.replace('\\n', '\n')
                
                # If the content doesn't have proper line breaks, try to format it
                if '•' in formatted_explanation and '\n' not in formatted_explanation:
                    # Split by bullet points and format properly
                    bullet_points = formatted_explanation.split('•')
                    formatted_bullets = []
                    for point in bullet_points:
                        if point.strip():
                            formatted_bullets.append(f"• {point.strip()}")
                    formatted_explanation = '\n\n'.join(formatted_bullets)
                
                st.markdown(formatted_explanation)


def mock_interview_ui(
    resume_text, jd_text, 
    question_list, 
    current_idx, 
    user_answers, 
    set_idx, # No longer used
    set_user_answers, 
    ideal_answer=None, 
    feedback=None
):
    total = len(question_list)
    q = question_list[current_idx]
    st.markdown(f"<div style='display:flex; justify-content:space-between; align-items:center;'>"
                f"<h4 style='margin-bottom:0'>Question {current_idx+1}</h4>"
                f"<div style='text-align:right;'>"
                f"<span style='background:#e3f2fd; border-radius:8px; padding:4px 10px; margin-right:8px;'>"
                f"{q.get('question_type', '').title()}</span>"
                f"<span style='background:#ffe082; border-radius:8px; padding:4px 10px;'>"
                f"{q.get('question_difficulty', '').title()}</span>"
                f"</div></div>", unsafe_allow_html=True)
    st.markdown(f"<div style='font-size:1.2em; margin-bottom:12px'>{q['question']}</div>", unsafe_allow_html=True)

    # Answer input
    user_answer = st.text_area("Your Answer", value=user_answers.get(current_idx, ""), height=120)
    user_answers[current_idx] = user_answer
    set_user_answers(user_answers)

    # --- Consolidated Navigation ---
    
    # Previous/Next buttons
    nav_col1, nav_col2, nav_col3 = st.columns([1, 5, 1])
    with nav_col1:
        if st.button("⬅️ Previous", use_container_width=True, disabled=(current_idx == 0)):
            st.session_state['mock_current_idx'] -= 1
            st.session_state['show_ideal'] = False
            st.session_state['show_feedback'] = False
            st.rerun()
            
    with nav_col3:
        if st.button("Next ➡️", use_container_width=True, disabled=(current_idx >= total - 1)):
            st.session_state['mock_current_idx'] += 1
            st.session_state['show_ideal'] = False
            st.session_state['show_feedback'] = False
            st.rerun()
            
    # Slider for direct navigation
    new_question_num = st.slider(
        "Navigate Questions",
        min_value=1,
        max_value=total,
        value=current_idx + 1,
        key="q_nav_slider"
    )
    if new_question_num - 1 != current_idx:
        st.session_state['mock_current_idx'] = new_question_num - 1
        st.session_state['show_ideal'] = False
        st.session_state['show_feedback'] = False
        st.rerun()


    # Get Ideal Answer / Feedback buttons
    col1, col2 = st.columns(2)
    with col1:
        if st.button("Get Ideal Answer"):
            st.session_state['show_ideal'] = not st.session_state.get('show_ideal', False)
            st.session_state['show_feedback'] = False
            st.rerun()
    with col2:
        if st.button("Get Feedback"):
            st.session_state['show_feedback'] = not st.session_state.get('show_feedback', False)
            st.session_state['show_ideal'] = False
            st.rerun()
            
    # Show ideal answer
    if st.session_state.get('show_ideal') and ideal_answer:
        render_ideal_answer(ideal_answer)

    # Show feedback
    if st.session_state.get('show_feedback') and feedback:
        render_feedback(feedback)