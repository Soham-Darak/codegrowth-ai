from abc import ABC, abstractmethod


class LLMProvider(ABC):

    @abstractmethod
    async def generate(
        self,
        prompt: str
    ) -> str:
        """
        Generate a text response from the configured LLM.
        """
        raise NotImplementedError

    @abstractmethod
    async def generate_json(
        self,
        prompt: str
    ) -> str:
        """
        Generate a JSON response from the configured LLM.
        """
        raise NotImplementedError