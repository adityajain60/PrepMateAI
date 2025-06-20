import langchain_helper as lch

def process_resume_upload(resume_file, resume_textbox):
    """
    Process the uploaded resume (PDF or text). Returns (resume_text, resumeDB)
    """
    resume_text = ""
    resumeDB = None
    if resume_file:
        with open("temp_resume.pdf", "wb") as f:
            f.write(resume_file.getbuffer())
        resumeDB = lch.create_vectorDB_from_pdf("temp_resume.pdf")
        resume_text = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
    elif resume_textbox:
        resume_text = resume_textbox
        resumeDB = lch.create_vectorDB_from_text(resume_text)
        resume_text = lch.extract_info(resumeDB, "Extract all important information from this resume including skills, education, work experience, projects, certifications, and achievements.")
    return resume_text

def process_jd_upload(jd_file, jd_textbox):
    """
    Process the uploaded job description (PDF or text). Returns (jd_text, jdDB)
    """
    jd_text = ""
    jdDB = None
    if jd_file:
        with open("temp_jd.pdf", "wb") as f:
            f.write(jd_file.getbuffer())
        jdDB = lch.create_vectorDB_from_pdf("temp_jd.pdf")
        jd_text = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
    elif jd_textbox:
        jd_text = jd_textbox
        jdDB = lch.create_vectorDB_from_text(jd_text)
        jd_text = lch.extract_info(jdDB, "Extract key requirements and skills from this job description.")
    return jd_text
