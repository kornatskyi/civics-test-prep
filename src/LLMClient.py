from typing import Dict, List
from groq import Groq
from dotenv import load_dotenv
import google.generativeai as genai
import os


LLAMA3_405B_INSTRUCT = "llama-3.3-405b-reasoning"  # Note: Groq currently only gives access here to paying customers for 405B model
LLAMA3_70B_INSTRUCT = "llama-3.3-70b-versatile"
LLAMA3_8B_INSTRUCT = "llama3.3-8b-instant"
GEMINI1_5_FLASH = "gemini-1.5-flash"

DEFAULT_MODEL = LLAMA3_70B_INSTRUCT

load_dotenv()


class LLMClient:
    def __init__(self):
        # Groq AI https://console.groq.com/docs/overview
        GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
        self.groq_client = Groq(api_key=GROQ_API_KEY)

        # Gemini https://ai.google.dev/gemini-api/docs
        GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
        genai.configure(api_key=GEMINI_API_KEY)
        self.gemini_client = genai.GenerativeModel("gemini-1.5-flash")

    def assistant(self, content: str):
        return {"role": "assistant", "content": content}

    def user(self, content: str):
        return {"role": "user", "content": content}

    def groq_chat_completion(
        self,
        messages: List[Dict],
        model=DEFAULT_MODEL,
        temperature: float = 0.6,
        top_p: float = 0.9,
    ) -> str:
        response = self.groq_client.chat.completions.create(
            messages=messages,
            model=model,
            temperature=temperature,
            top_p=top_p,
            max_tokens=10000,
        )
        return response.choices[0].message.content

    def gemini_completion(self, prompt):
        response = self.gemini_client.generate_content(prompt)
        return response.text

    def completion(
        self,
        prompt: str,
        model: str = DEFAULT_MODEL,
        temperature: float = 0.6,
        top_p: float = 0.9,
    ) -> str:
        if model == GEMINI1_5_FLASH:
            return self.gemini_completion(prompt=prompt)
        else:
            return self.groq_chat_completion(
                [self.user(prompt)],
                model=model,
                temperature=temperature,
                top_p=top_p,
            )

    def complete_and_print(self, prompt: str, model: str = DEFAULT_MODEL):
        print(f"==============\n{prompt}\n==============")
        response = self.completion(prompt, model)
        print(response, end="\n\n")
