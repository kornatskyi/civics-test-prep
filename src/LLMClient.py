import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

GEMINI_FLASH = "gemini-2.5-flash"


class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=api_key)

    async def completion(
        self,
        prompt: str,
        model: str = GEMINI_FLASH,
        system_instruction: str | None = None,
    ) -> str:
        config = (
            types.GenerateContentConfig(system_instruction=system_instruction)
            if system_instruction
            else None
        )
        response = await self.client.aio.models.generate_content(  # type: ignore[reportUnknownMemberType]
            model=model, contents=prompt, config=config
        )
        if response.text is None:
            raise ValueError("LLM returned empty response")
        return response.text
