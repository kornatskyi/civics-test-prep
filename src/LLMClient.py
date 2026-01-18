import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

GEMINI_FLASH = "gemini-2.5-flash"


class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=api_key)

    async def completion(self, prompt: str, model: str = GEMINI_FLASH) -> str:
        response = await self.client.aio.models.generate_content(  # type: ignore[reportUnknownMemberType]
            model=model, contents=prompt
        )
        if response.text is None:
            raise ValueError("LLM returned empty response")
        return response.text
