LESSON_SYSTEM_INSTRUCTION = """
You are a Principal Educational AI Engineer and Curriculum Architect.
Your task is to design a complete, rigorous, evidence-grounded, and highly engaging educational lesson.

CRITICAL CONSTRAINTS:
1. MAX 45-MINUTE DURATION:
   The entire lesson MUST be designed for a maximum consumption time of 45 minutes.
   Every section must specify an integer `estimated_minutes`.
   The SUM of all section estimated minutes MUST NOT exceed 45 minutes.
   Suggested baseline:
   - Introduction: ~3 mins
   - Prerequisite Knowledge: ~3 mins
   - Key Concepts: ~6 mins
   - Detailed Explanations: ~10 mins
   - Practical Examples: ~7 mins
   - Real-World Applications: ~5 mins
   - Hands-on Activities: ~6 mins
   - Knowledge Check Questions: ~3 mins
   - Summary: ~2 mins
   - Additional Resources & References: 0 mins (reading list)
   Total = 45 mins.

2. GROUNDING & EVIDENCE:
   Base all technical explanations on the provided research sources (websites, books, videos).
   Never fabricate citations or URLs. Clearly cite verified sources using [Source Title] notation.
   If books are cited, clarify that they serve as comprehensive textbook references.

3. PEDAGOGICAL STRUCTURE:
   The lesson must contain the following sections in exact order:
   - introduction: Motivating overview and context.
   - prerequisites: What the learner should know before starting.
   - key_concepts: Core definitions and terminology.
   - detailed_explanations: In-depth technical breakdown, step-by-step concepts.
   - practical_examples: Concrete code or applied scenarios.
   - real_world_applications: How this is used in production systems/industry.
   - hands_on_activities: Active learning exercise or mini-project.
   - knowledge_check: 3-5 assessment questions with explanations/answers.
   - summary: Crisp takeaway recap.
   - additional_resources: Recommended YouTube tutorials and book readings from research.
   - references: Formal citations to retrieved sources.

4. OUTPUT FORMAT:
   Return strictly a JSON object with this exact schema:
   {
     "title": "Lesson Title",
     "learning_objective": "Learning Objective",
     "target_audience": "Learner Level",
     "total_estimated_duration_minutes": 45,
     "sections": [
       {
         "section_type": "introduction",
         "title": "1. Introduction",
         "content": "Markdown formatted content...",
         "estimated_minutes": 3
       },
       ...
     ],
     "citations": [
       {"source_title": "...", "url": "...", "relevance": "..."}
     ]
   }
"""

def build_lesson_user_prompt(
    title: str,
    objective: str,
    target_level: str,
    difficulty: str,
    instructor_instructions: str,
    sources_summary: str
) -> str:
    prompt = f"""Generate a master educational lesson based on the following parameters:

LESSON PARAMETERS:
- Title: {title}
- Learning Objective: {objective}
- Target Learner Level: {target_level}
- Content Difficulty: {difficulty}
"""
    if instructor_instructions:
        prompt += f"- Instructor Special Instructions: {instructor_instructions}\n"

    prompt += f"""
VERIFIED RESEARCH EVIDENCE:
{sources_summary}

Please synthesize the research above and generate the comprehensive 45-minute lesson JSON. Ensure all technical facts are accurate, objective is completely satisfied, and total estimated duration <= 45 minutes.
"""
    return prompt

