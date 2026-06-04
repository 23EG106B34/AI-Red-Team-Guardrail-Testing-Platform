from __future__ import annotations

from app.core.config import get_settings


class SecurityKnowledgeBase:
    def __init__(self) -> None:
        self.settings = get_settings()
        self._collection = None
        self._fallback_docs = [
            "Prompt injection defenses: preserve instruction hierarchy, isolate retrieved text, and refuse requests to reveal hidden policy.",
            "Data leakage controls: redact secrets, block credential exfiltration, and audit context windows containing sensitive data.",
            "Hallucination mitigation: require retrieval-backed citations, calibrate abstention, and evaluate faithfulness with RAGAS metrics.",
            "Guardrail testing: measure attack success rate, refusal correctness, toxic content leakage, latency, and cost by model provider.",
        ]

    def collection(self):
        if self._collection is not None:
            return self._collection
        try:
            import chromadb

            client = chromadb.PersistentClient(path=self.settings.chroma_path)
            self._collection = client.get_or_create_collection("security_controls")
            if self._collection.count() == 0:
                self._collection.add(ids=[f"kb-{i}" for i in range(len(self._fallback_docs))], documents=self._fallback_docs)
            return self._collection
        except Exception:
            return None

    def search(self, query: str, limit: int = 4) -> list[str]:
        collection = self.collection()
        if collection:
            result = collection.query(query_texts=[query], n_results=limit)
            return list(result.get("documents", [[]])[0])
        terms = set(query.lower().split())
        return sorted(self._fallback_docs, key=lambda doc: len(terms.intersection(doc.lower().split())), reverse=True)[:limit]
