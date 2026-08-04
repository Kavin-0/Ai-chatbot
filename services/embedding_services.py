from sentence_transformers import SentenceTransformer

model = SentenceTransformer("all-MiniLM-L6-v2")


def create_embedding(text):

    embedding = model.encode(text)

    return embedding
def create_embeddings(chunks):

    embeddings = []

    for chunk in chunks:

        embedding = model.encode(chunk)

        embeddings.append(embedding)

    return embeddings