from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from app.core.config import settings

# Initialize Gemini
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=settings.GOOGLE_API_KEY,
    temperature=0.3 # Slightly creative but focused
)

from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder

async def generate_interview_response(history: list, job_role: str, difficulty: str):
    """
    Takes the chat history and generates the next AI response.
    """
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"""
        You are "Aria", a highly experienced Technical Lead and Interviewer for the role of {job_role} (Difficulty: {difficulty}).
        
        Your Goal: Conduct a realistic, structured, and professional technical interview that simulates a real-world top-tier company experience (e.g., Google or Meta).
        
        Guidelines:
        1. STARTING THE INTERVIEW (First message): 
           - Introduce yourself briefly as Aria.
           - Mention something POSITIVE about the candidate's interest in the {job_role} role.
           - Set a professional yet encouraging tone.
           - DO NOT use placeholders like [Your Name] or [Interviewer Name].
           - Immediately ask the **FIRST** technical question to get the interview started.
        
        2. TECHNICAL ANSWERS: 
           - Provide brief, constructive feedback on the previous answer.
           - Assign a silent internal score (1-10) and mention areas of improvement if necessary in the 'Feedback' section.
           - Ask the **NEXT** relevant technical question.
        
        3. OFF-TOPIC/IRRELEVANT INPUT: 
           - If the user asks general questions or tries to chat off-topic, acknowledge it politely: "I appreciate the conversational spirit, but let's stay focused on the {job_role} assessment."
           - Immediately steer back to the technical evaluation.
        
        4. STAY IN CHARACTER: Never break character. You are here to evaluate their technical depth.
        
        Format (ALWAYS USE THIS EXACT STRUCTURE):
        **Feedback:** (Your feedback, acknowledgement, or "N/A" if starting)
        **Next Question:** (The next technical question to continue the interview)
        """),
        MessagesPlaceholder(variable_name="history"),
    ])

    # Convert history dicts to message tuples for LangChain
    formatted_history = []
    for msg in history:
        if msg["role"] == "user":
            formatted_history.append(("human", msg["content"]))
        else:
            formatted_history.append(("ai", msg["content"]))

    # If history is empty, we need at least one human message for some Gemini versions
    # or just rely on the system prompt if the library handles it.
    # To be safe, let's add an internal trigger if empty.
    if not formatted_history:
        formatted_history.append(("human", "I am ready for the interview. Please start."))

    chain = prompt | llm
    
    try:
        response = await chain.ainvoke({"history": formatted_history})
        ai_content = response.content.strip()
        
        if not ai_content:
            return "**Feedback:** N/A\n**Next Question:** Let's get back to the interview. Could you tell me more about your technical experience with " + job_role + "?"
            
        return ai_content
    except Exception as e:
        print(f"DEBUG: LLM Call failed: {str(e)}")
        # Provide a graceful fallback instead of crashing
        return f"**Feedback:** I'm having a slight technical synchronization issue.\n**Next Question:** Let's proceed. Could you explain another key concept related to {job_role}?"
