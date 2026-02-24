import os
import logging
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GEMINI_FLASH = os.getenv("GEMINI_MODEL", "gemini-3-flash-preview")


class LLMClient:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY", "")
        self.client = genai.Client(api_key=api_key)

    async def completion(
        self,
        prompt: str,
        model: str = GEMINI_FLASH,
        system_instruction: str | None = None,
        max_output_tokens: int | None = None,
    ) -> str:
        config_kwargs: dict[str, object] = {}
        if system_instruction:
            config_kwargs["system_instruction"] = system_instruction
        if max_output_tokens is not None:
            config_kwargs["max_output_tokens"] = max_output_tokens
        config = (
            types.GenerateContentConfig(**config_kwargs) if config_kwargs else None
        )
        response = await self.client.aio.models.generate_content(  # type: ignore[reportUnknownMemberType]
            model=model, contents=prompt, config=config
        )
        usage = getattr(response, "usage_metadata", None)
        if usage is not None:
            logger.info(
                "Gemini usage model=%s prompt_tokens=%s candidate_tokens=%s total_tokens=%s",
                model,
                getattr(usage, "prompt_token_count", None),
                getattr(usage, "candidates_token_count", None),
                getattr(usage, "total_token_count", None),
            )
        if response.text is None:
            raise ValueError("LLM returned empty response")
        return response.text
