from typing import Optional

from app.services.llm_provider import LLMProvider
from app.exceptions import BadGatewayError, ServiceUnavailableError


class LLMRuntime:

    def __init__(
        self,
        provider: LLMProvider,
        max_retries: int = 2
    ):
        if provider is None:
            raise ValueError(
                "LLM provider is required"
            )

        if max_retries < 0:
            raise ValueError(
                "max_retries cannot be negative"
            )

        self.provider = provider
        self.max_retries = max_retries

    async def generate(
        self,
        prompt: str
    ) -> str:

        self._validate_prompt(prompt)

        return await self._execute_with_retry(
            lambda: self.provider.generate(prompt)
        )

    async def generate_json(
        self,
        prompt: str
    ) -> str:

        self._validate_prompt(prompt)

        return await self._execute_with_retry(
            lambda: self.provider.generate_json(prompt)
        )

    async def _execute_with_retry(
        self,
        operation
    ) -> str:

        last_error: Optional[Exception] = None

        for attempt in range(
            self.max_retries + 1
        ):

            try:

                result = await operation()

                if not isinstance(
                    result,
                    str
                ):
                    raise BadGatewayError(
                        "LLM provider returned "
                        "an invalid response"
                    )

                if not result.strip():
                    raise BadGatewayError(
                        "LLM provider returned "
                        "an empty response"
                    )

                return result

            except (
                RuntimeError,
                TimeoutError,
                ServiceUnavailableError,
                BadGatewayError,
            ) as exc:

                last_error = exc

                if attempt >= self.max_retries:
                    break

        raise ServiceUnavailableError(
            f"LLM request failed after "
            f"{self.max_retries + 1} attempts"
        ) from last_error

    @staticmethod
    def _validate_prompt(
        prompt: str
    ) -> None:

        if (
            not isinstance(prompt, str)
            or not prompt.strip()
        ):
            raise ValueError(
                "Prompt must be a "
                "non-empty string"
            )