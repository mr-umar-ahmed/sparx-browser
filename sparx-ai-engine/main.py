from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import ollama
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import PyPDF2
import io

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
        system_prompt += f"\n\nHere is the context the user is currently looking at (Webpage or Document):\n{request.context}"

    def generate_stream():
        try:
            stream = ollama.chat(model='llama3', messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': request.message}
            ], stream=True)
            
            for chunk in stream:
                yield chunk['message']['content']
        except Exception as e:
            yield f"Error connecting to the AI core: {str(e)}"

    return StreamingResponse(generate_stream(), media_type="text/plain")

# --- NEW: PDF Extraction Endpoint ---
@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    try:
        # Read the uploaded PDF file
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        text = ""
        # Extract text from the first 5 pages (to avoid overloading local RAM)
        num_pages = min(len(pdf_reader.pages), 5)
        for i in range(num_pages):
            text += pdf_reader.pages[i].extract_text() + "\n"
            
        return {"text": text.strip()}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"status": "Sparx AI Engine is online."}