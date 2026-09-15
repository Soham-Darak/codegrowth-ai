from abc import ABC, abstractmethod
from typing import Any, Dict


class BaseAgent(ABC):

    name: str = "base-agent"

    description: str = ""

    @abstractmethod
    async def run(
        self,
        task: str,
        context: Dict[str, Any] | None = None
    ) -> Any:
        """
        Execute the agent's task.
        """

        raise NotImplementedError