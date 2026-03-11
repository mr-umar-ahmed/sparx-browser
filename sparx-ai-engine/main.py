from fastapi import FastAPI
from pydantic import BaseModel
import ollama
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

app = FastAPI(title="Sparx AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    context: str = ""

@app.post("/api/chat")
async def chat_with_sparx(request: ChatRequest):
    system_prompt = """
    You are Sparx, a highly intelligent and concise AI assistant integrated directly into a web browser. 
    Your goal is to help the user understand information, write code, and summarize content.
    """
    
    if request.context:
        system_prompt += f"\n\nHere is the text of the webpage the user is currently viewing:\n{request.context}"

    # This generator function yields words exactly as the AI thinks of them
    def generate_stream():
        try:
            # Setting stream=True is the magic toggle!
            stream = ollama.chat(model='llama3', messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': request.message}
            ], stream=True)
            
            for chunk in stream:
                # Yield each little piece of text
                yield chunk['message']['content']
                
        except Exception as e:
            yield f"Error connecting to the AI core: {str(e)}"

    # We return a StreamingResponse instead of a normal dictionary
    return StreamingResponse(generate_stream(), media_type="text/plain")

@app.get("/")
def read_root():
    return {"status": "Sparx AI Engine is online."}