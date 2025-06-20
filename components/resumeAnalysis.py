import streamlit as st
from typing import Any, Dict, List

# --- Utilities ---
def tag_list(items: List[str], color="#e0f7fa", label=None):
    if not items:
        st.markdown(f"<span style='color:gray'>None</span>", unsafe_allow_html=True)
        return
    tag_html = "".join([
        f"<span style='background:{color}; border-radius:8px; padding:4px 12px; margin:2px 4px; display:inline-block;'>{item}</span>"
        for item in items if item
    ])
    if label:
        st.markdown(f"<b>{label}:</b><br>{tag_html}", unsafe_allow_html=True)
    else:
        st.markdown(tag_html, unsafe_allow_html=True)

def card(title, content, color="#f8f9fa", border="#e0e0e0"):
    st.markdown(f"""
    <div style='background:{color}; border-radius:12px; border:1.5px solid {border}; padding:16px; margin-bottom:12px;'>
        <b style='font-size:1.1em'>{title}</b><br>
        <div style='margin-top:6px'>{content}</div>
    </div>
    """, unsafe_allow_html=True)

# --- Render Sections ---
def render_contact_info(basic_info):
    st.markdown("<h4>Contact Information</h4>", unsafe_allow_html=True)
    cols = st.columns(3)
    cols[0].markdown(f"<b>Name:</b> {basic_info.get('name', '-')}", unsafe_allow_html=True)
    cols[1].markdown(f"<b>Email:</b> {basic_info.get('email', '-')}", unsafe_allow_html=True)
    cols[2].markdown(f"<b>Phone:</b> {basic_info.get('phone', '-')}", unsafe_allow_html=True)
    cols = st.columns(2)

def render_education(education):
    st.markdown("<h4>Education</h4>", unsafe_allow_html=True)
    for edu in education:
        card(
            f"{edu.get('degree', '-')}, {edu.get('institute', '-')} ({edu.get('years', '-')})",
            f"<span style='color:#888'>CGPA: {edu.get('cgpa', '-')}</span>",
            color="#f0f4c3", border="#d4e157"
        )

def render_work_experience(work_experience):
    st.markdown("<h4>Work Experience</h4>", unsafe_allow_html=True)
    for exp in work_experience:
        card(
            f"{exp.get('title', '-')} at {exp.get('company', '-')} ({exp.get('duration', '-')})",
            f"<span style='color:#888'>Tech: {', '.join(exp.get('tech_stack', [])) or '-'}</span>",
            color="#e3f2fd", border="#64b5f6"
        )

def render_projects(projects):
    st.markdown("<h4>Projects</h4>", unsafe_allow_html=True)
    for proj in projects:
        content = f"{proj.get('description', '-')}<br><span style='color:#888'>Tech: {', '.join(proj.get('tech_stack', [])) or '-'}</span>"
        if proj.get('impact'):
            content += f"<br><span style='color:#43a047'>Impact: {proj.get('impact')}</span>"
        card(proj.get('name', '-'), content, color="#fff3e0", border="#ffb74d")

def render_rewrite_examples(examples):
    st.markdown("<h4>Rewrite Examples</h4>", unsafe_allow_html=True)
    for ex in examples:
        col1, col2 = st.columns(2)
        with col1:
            card("Current", ex.get('current', '-'), color="#ffcdd2", border="#e57373")
        with col2:
            card("Suggested", ex.get('suggested', '-'), color="#c8e6c9", border="#43a047")

# --- Main Renderer ---
def render_resume_analysis(data: dict):
    st.markdown("<h2 style='color:#4F8BF9'>Resume Analysis Report</h2>", unsafe_allow_html=True)
    st.markdown(f"<div style='font-size:1.1em; color:#222; margin-bottom:16px'>{data.get('resume_summary', '-')}</div>", unsafe_allow_html=True)
    st.markdown(f"<div style='font-size:1.1em; color:#222; margin-bottom:16px'>{data.get('jd_summary', '-')}</div>", unsafe_allow_html=True)

    ats_score = data.get("ats_score", {})
    st.markdown("<h4>ATS & Job Fit Score</h4>", unsafe_allow_html=True)
    cols = st.columns(4)
    cols[0].metric("Total Score", ats_score.get("total_score", "-"))
    cols[1].metric("Skills Match", ats_score.get("skills_match", "-"))
    cols[2].metric("Keyword Match", ats_score.get("keyword_match", "-"))
    cols[3].metric("Format Penalty", ats_score.get("format_penalty", "-"))
    if ats_score.get("final_assessment"):
        st.markdown(f"<div style='color:#666; font-style:italic; margin-bottom:16px'>{ats_score.get('final_assessment')}</div>", unsafe_allow_html=True)

    sections = data.get("sections", {})
    if sections.get("basic_info"):
        render_contact_info(sections["basic_info"])
    if sections.get("education"):
        render_education(sections["education"])
    if sections.get("work_experience"):
        render_work_experience(sections["work_experience"])
    if sections.get("projects"):
        render_projects(sections["projects"])
    if sections.get("skills"):
        tag_list(sections["skills"], color="#b3e5fc", label="Skills")
    if sections.get("certifications"):
        tag_list(sections["certifications"], color="#ffe082", label="Certifications")

    # Strengths - Tabular
    strengths = data.get("strengths", {})
    if strengths:
        st.markdown("<h4>Strengths</h4>", unsafe_allow_html=True)
        cols = st.columns(3)
        keys = list(strengths.keys())
        for i in range(len(cols)):
            if i < len(keys):
                with cols[i]:
                    tag_list(strengths[keys[i]], color="#c8e6c9", label=keys[i].replace('_', ' ').title())

    # Weaknesses - Tabular
    weaknesses = data.get("weaknesses", {})
    if weaknesses:
        st.markdown("<h4>Weaknesses</h4>", unsafe_allow_html=True)
        flat_items = []
        for k, v in weaknesses.items():
            if isinstance(v, dict):
                for subk, subv in v.items():
                    flat_items.append((f"{k} - {subk}", subv))
            else:
                flat_items.append((k, v))
        for i in range(0, len(flat_items), 2):
            cols = st.columns(2)
            for j in range(2):
                if i + j < len(flat_items):
                    label, val = flat_items[i + j]
                    with cols[j]:
                        tag_list(val, color="#ffcdd2", label=label.replace("_", " ").title())

    # Suggestions - Tabular
    suggestions = data.get("suggestions", {})
    if suggestions:
        st.markdown("<h4>Suggestions</h4>", unsafe_allow_html=True)
        if suggestions.get("rewrite_examples"):
            render_rewrite_examples(suggestions["rewrite_examples"])

        other_items = []
        for k, v in suggestions.items():
            if k == "rewrite_examples":
                continue
            if isinstance(v, dict):
                for subk, subv in v.items():
                    other_items.append((f"{k} - {subk}", subv))
            else:
                other_items.append((k, v))

        for i in range(0, len(other_items), 2):
            cols = st.columns(2)
            for j in range(2):
                if i + j < len(other_items):
                    label, val = other_items[i + j]
                    with cols[j]:
                        tag_list(val, color="#b3e5fc", label=label.replace("_", " ").title())

    red_flags = data.get("red_flags", [])
    if red_flags:
        st.markdown("<h4>Red Flags</h4>", unsafe_allow_html=True)
        for flag in red_flags:
            st.warning(f" {flag}")

    st.markdown("<h4>Suggested Resume Title</h4>", unsafe_allow_html=True)
    st.markdown(f"<div style='font-size:1.2em; color:#1976d2'><b>{data.get('suggested_resume_title', '-')}</b></div>", unsafe_allow_html=True)
