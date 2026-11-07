from abc import ABC, abstractmethod
from typing import List, Tuple, Type, TypeVar, Optional, Any, Dict
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class LLMClient(ABC):
    @abstractmethod
    def generate_structured(
        self,
        system_prompt: str,
        user_prompt: str,
        response_schema: Type[T],
        temperature: float = 0.2,
        max_tokens: int = 700
    ) -> Tuple[T, Dict[str, Any]]:
        """Trả về (parsed_object, usage_dict)"""
        pass

    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        pass

class Embedder(ABC):
    @property
    @abstractmethod
    def dim(self) -> int:
        pass

    @abstractmethod
    def embed_texts(self, texts: List[str], task_type: str = "RETRIEVAL_DOCUMENT") -> List[List[float]]:
        pass

    @abstractmethod
    def embed_query(self, query: str) -> List[float]:
        pass

class Reranker(ABC):
    @abstractmethod
    def rerank(self, query: str, candidate_texts: List[str]) -> List[Tuple[int, float]]:
        """Trả về list (index, score_in_0_1)"""
        pass
