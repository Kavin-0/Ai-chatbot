import chromadb

client = chromadb.PersistentClient(path="chroma_db")

collection = client.get_or_create_collection(
    name="documents"
)


def store_chunks(chunks, embeddings):

    for i in range(len(chunks)):

        collection.add(
            ids=[str(i)],
            documents=[chunks[i]],
            embeddings=[embeddings[i].tolist()]
        )


def search(query_embedding):

    results = collection.query(
        query_embeddings=[query_embedding.tolist()],
        n_results=3
    )

    return results