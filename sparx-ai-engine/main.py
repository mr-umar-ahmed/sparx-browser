from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import ollama
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import PyPDF2
import io
import uuid
import chromadb
from langchain_text_splitters import RecursiveCharacterTextSplitter
from ddgs import DDGS

app = FastAPI(title="Sparx AI Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# INITIALIZE VECTOR DATABASE (Memory)
chroma_client = chromadb.PersistentClient(path="./sparx_memory")
collection = chroma_client.get_or_create_collection(name="sparx_docs")

text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len,
)

class ChatRequest(BaseModel):
    message: str
    context: str = ""
    model: str = "llama3" # <-- NEW: Allows the UI to choose the model

@app.post("/api/chat")
async def chat_with_sparx(request: ChatRequest):
    system_prompt = """
    You are Sparx, a highly intelligent and precise AI assistant integrated directly into a web browser. 
    You have access to different layers of context below. 
    CRITICAL INSTRUCTION: Read the user's prompt. If the SAVED MEMORY is irrelevant to their question, IGNORE IT COMPLETELY. If the user asks for real-time data, prices, or news, rely EXCLUSIVELY on the LIVE WEB RESULTS. 
    Provide the answer naturally without saying "Based on the web search".
    """
    
    if request.context and len(request.context) > 50:
        system_prompt += f"\n\n--- ACTIVE PAGE CONTEXT ---\n{request.context}"

    try:
        results = collection.query(query_texts=[request.message], n_results=2)
        if results and results['documents'] and len(results['documents'][0]) > 0:
            memory_context = "\n\n".join(results['documents'][0])
            system_prompt += f"\n\n--- SAVED MEMORY ---\n{memory_context}"
    except Exception as e:
        print(f"Memory search warning: {e}")

    try:
        print(f"Searching the web for: {request.message}")
        ddg_results = DDGS().text(request.message, max_results=3)
        if ddg_results:
            web_context = "\n".join([f"- {r.get('title', '')}: {r.get('body', '')}" for r in ddg_results])
            system_prompt += f"\n\n--- LIVE WEB RESULTS ---\n{web_context}"
            print("Web search successful!")
    except Exception as e:
        print(f"Web search error: {e}")

    def generate_stream():
        try:
            # <-- NEW: Uses the requested model from the UI dropdown
            stream = ollama.chat(model=request.model, messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': request.message}
            ], stream=True)
            
            for chunk in stream:
                yield chunk['message']['content']
        except Exception as e:
            yield f"Error connecting to the AI core. Is Ollama running and the model downloaded? Details: {str(e)}"

    return StreamingResponse(generate_stream(), media_type="text/plain")

@app.post("/api/extract-pdf")
async def extract_pdf(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        full_text = ""
        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                full_text += extracted + "\n"
        
        if full_text.strip():
            chunks = text_splitter.split_text(full_text)
            ids = [str(uuid.uuid4()) for _ in chunks]
            metadatas = [{"source": file.filename} for _ in chunks]
            
            collection.add(documents=chunks, metadatas=metadatas, ids=ids)
            return {"text": f"Successfully memorized {len(chunks)} chunks from {file.filename}."}
        else:
            return {"error": "No readable text found in PDF."}
            
    except Exception as e:
        return {"error": str(e)}

# --- NEW: Wipe Memory Endpoint ---
@app.delete("/api/memory")
async def clear_memory():
    try:
        global collection
        chroma_client.delete_collection(name="sparx_docs")
        collection = chroma_client.create_collection(name="sparx_docs")
        return {"status": "Memory completely wiped."}
    except Exception as e:
        return {"error": str(e)}

@app.get("/")
def read_root():
    return {"status": "Sparx AI Engine is online."}