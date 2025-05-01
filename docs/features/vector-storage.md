# Vector Storage Feature Guide

## Overview

The Vector Storage feature of the MCP Integration Platform allows applications to store, retrieve, and search documents using vector embeddings for semantic similarity. This enables powerful use cases like semantic search, document recommendations, and AI memory systems.

## Basic Usage

To use the vector storage feature, send a POST request to `/api/mcp` with the following payload structure:

```json
{
  "id": "request-789",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "documentation",
    "query": "How to integrate with OpenAI",
    "limit": 5
  }
}
```

### Vector Storage Operations

The platform supports four primary operations:

1. **Store**: Add documents to a collection
2. **Search**: Find semantically similar documents
3. **Retrieve**: Get specific documents by ID
4. **Delete**: Remove documents from a collection

## Storing Documents

### Basic Document Storage

```json
{
  "id": "store-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "store",
    "collection": "knowledge_base",
    "documents": [
      {
        "text": "Vector databases store data as high-dimensional vectors, enabling efficient similarity search.",
        "metadata": {
          "title": "Vector Database Basics",
          "source": "internal-docs",
          "category": "database"
        }
      }
    ]
  }
}
```

### Required Parameters for Store

- `operation`: Set to `"store"`
- `collection`: The name of the collection to store documents in
- `documents`: Array of document objects, each containing:
  - `text`: The document content
  - `metadata` (optional): Additional information about the document

### Optional Parameters for Store

- `embedding_model`: Model to use for generating embeddings (default: "text-embedding-3-small")
- `namespace`: Optional namespace to organize documents within a collection
- `batch_size`: Number of documents to process in each batch (for large datasets)

### Response Format for Store

```json
{
  "id": "store-example",
  "status": "success",
  "result": {
    "inserted_count": 1,
    "document_ids": ["doc_7a9bcd123"]
  }
}
```

## Searching Documents

### Basic Semantic Search

```json
{
  "id": "search-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "knowledge_base",
    "query": "How do vector embeddings work?",
    "limit": 3
  }
}
```

### Required Parameters for Search

- `operation`: Set to `"search"`
- `collection`: The name of the collection to search in
- `query`: The search query text

### Optional Parameters for Search

- `limit`: Maximum number of results to return (default: 5, max: 20)
- `embedding_model`: Model to use for query embedding (default: "text-embedding-3-small")
- `namespace`: Namespace to search within
- `filters`: Metadata filters to apply to search results
- `similarity_threshold`: Minimum similarity score for results (0.0 to 1.0)

### Response Format for Search

```json
{
  "id": "search-example",
  "status": "success",
  "result": {
    "matches": [
      {
        "id": "doc_7a9bcd123",
        "text": "Vector databases store data as high-dimensional vectors, enabling efficient similarity search.",
        "metadata": {
          "title": "Vector Database Basics",
          "source": "internal-docs",
          "category": "database"
        },
        "score": 0.89
      },
      // Additional matches...
    ]
  }
}
```

## Retrieving Documents

### Get Documents by ID

```json
{
  "id": "retrieve-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "retrieve",
    "collection": "knowledge_base",
    "document_ids": ["doc_7a9bcd123", "doc_456efgh"]
  }
}
```

### Required Parameters for Retrieve

- `operation`: Set to `"retrieve"`
- `collection`: The name of the collection
- `document_ids`: Array of document IDs to retrieve

### Response Format for Retrieve

```json
{
  "id": "retrieve-example",
  "status": "success",
  "result": {
    "documents": [
      {
        "id": "doc_7a9bcd123",
        "text": "Vector databases store data as high-dimensional vectors, enabling efficient similarity search.",
        "metadata": {
          "title": "Vector Database Basics",
          "source": "internal-docs",
          "category": "database"
        }
      },
      // Additional documents...
    ]
  }
}
```

## Deleting Documents

### Delete Documents by ID

```json
{
  "id": "delete-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "delete",
    "collection": "knowledge_base",
    "document_ids": ["doc_7a9bcd123"]
  }
}
```

### Required Parameters for Delete

- `operation`: Set to `"delete"`
- `collection`: The name of the collection
- `document_ids`: Array of document IDs to delete

### Optional Parameters for Delete

- `namespace`: Delete documents from this namespace only
- `delete_all`: Set to `true` to delete all documents in the collection (use with caution)

### Response Format for Delete

```json
{
  "id": "delete-example",
  "status": "success",
  "result": {
    "deleted_count": 1
  }
}
```

## Advanced Usage

### Metadata Filtering

You can filter search results based on document metadata:

```json
{
  "id": "filter-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "knowledge_base",
    "query": "machine learning algorithms",
    "filters": {
      "category": "technical",
      "date": { "$gt": "2024-01-01" }
    },
    "limit": 10
  }
}
```

### Hybrid Search

Combine semantic search with keyword search for better results:

```json
{
  "id": "hybrid-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "search",
    "collection": "knowledge_base",
    "query": "python multiprocessing examples",
    "hybrid_search": true,
    "keyword_weight": 0.3
  }
}
```

### Choosing Embedding Models

The platform supports various embedding models:

```json
{
  "id": "model-example",
  "name": "vector_storage",
  "parameters": {
    "operation": "store",
    "collection": "knowledge_base",
    "documents": [{ "text": "Document content..." }],
    "embedding_model": "text-embedding-3-large"
  }
}
```

Supported models include:
- `text-embedding-3-small` (default)
- `text-embedding-3-large` (higher quality)
- `text-embedding-ada-002` (legacy support)

## Best Practices

### Document Preparation

1. **Chunking**: Split large documents into smaller chunks (about 1,000 tokens each)
2. **Metadata**: Include rich metadata to enable effective filtering
3. **Deduplication**: Remove duplicate content before storing

### Query Optimization

1. **Be Specific**: Use clear, specific queries for better results
2. **Combine with Filters**: Use metadata filters to narrow down results
3. **Use Hybrid Search**: Combine semantic and keyword search for technical content

### Performance Considerations

1. **Batch Operations**: When storing many documents, use batches of 100-500 documents
2. **Choose Appropriate Models**: Use smaller models for speed, larger models for accuracy
3. **Use Namespaces**: Organize data into namespaces for better performance

## Use Cases

### AI Memory Systems

Store and retrieve conversation history for AI assistants to maintain context over time.

```javascript
async function storeConversation(conversationId, messages) {
  const documents = messages.map(msg => ({
    text: msg.content,
    metadata: {
      conversation_id: conversationId,
      timestamp: msg.timestamp,
      speaker: msg.speaker
    }
  }));
  
  const response = await fetch('https://api.mcp-platform.com/api/mcp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': 'your-api-key-here'
    },
    body: JSON.stringify({
      id: generateUniqueId(),
      name: 'vector_storage',
      parameters: {
        operation: 'store',
        collection: 'conversations',
        documents: documents,
        namespace: conversationId
      }
    })
  });
  
  return await response.json();
}
```

### Knowledge Base Search

Implement intelligent search across internal documentation, support articles, or product information.

### Content Recommendation

Provide semantically relevant content recommendations based on what users are currently viewing.

## Limitations

- Maximum document size: 100,000 characters per document
- Maximum query size: 10,000 characters
- Collections are isolated per API key
- Some operations may have higher latency for very large collections

## FAQ

### What vector databases are supported?

The platform currently supports integration with Pinecone, Weaviate, and internal vector storage. The backend is abstracted so you don't need to know which one is being used.

### How many documents can I store?

Storage limits depend on your plan. Free tier includes storage for up to 10,000 documents, while paid plans offer higher limits.

### How do I choose the right embedding model?

Use `text-embedding-3-small` for most use cases. For higher quality search requiring better semantic understanding, use `text-embedding-3-large`.

### Can I migrate data between collections?

Yes, retrieve documents from one collection and store them in another. For large migrations, contact support for assistance.

### How is billing calculated for vector storage?

Vector storage billing includes three components:
1. API calls for storage/retrieval/search operations
2. Embedding generation costs based on token count
3. Storage costs based on number of vectors and their dimension

## Further Resources

- [API Reference Documentation](/api-docs.yaml)
- [Rate Limiting Details](/docs/rate-limiting.md)
- [Embedding Models Comparison](/docs/embedding-models.md)
- [Vector Database Integrations](/docs/vector-databases.md)
