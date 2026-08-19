try:
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer("all-MiniLM-L6-v2")
    _MODEL_AVAILABLE = True
except ImportError:
    model = None
    _MODEL_AVAILABLE = False


def create_embedding(text):
    if not _MODEL_AVAILABLE:
        return None
    return model.encode(text)


def create_embeddings(chunks):
    if not _MODEL_AVAILABLE:
        return [None] * len(chunks)
    return [model.encode(chunk) for chunk in chunks]