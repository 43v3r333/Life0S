using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Infrastructure.Services
{
    public class QdrantVectorStore : IVectorStore
    {
        private readonly IQdrantClient _qdrantClient;
        private readonly IAiEmbeddingGenerator _embeddingGenerator;

        public QdrantVectorStore(IQdrantClient qdrantClient, IAiEmbeddingGenerator embeddingGenerator)
        {
            _qdrantClient = qdrantClient ?? throw new ArgumentNullException(nameof(qdrantClient));
            _embeddingGenerator = embeddingGenerator ?? throw new ArgumentNullException(nameof(embeddingGenerator));
        }

        public async Task UpsertMemoryAsync(Guid userId, Guid memoryId, string content, string domain, CancellationToken cancellationToken)
        {
            // 1. Generate deep vector embeddings from content using LLM Embedding API
            float[] vector = await _embeddingGenerator.GenerateEmbeddingsAsync(content, cancellationToken);

            // 2. Prepare Point parameters with vector and metadata payloads for Qdrant storage
            var payload = new Dictionary<string, object>
            {
                { "userId", userId.ToString() },
                { "domain", domain },
                { "content", content },
                { "timestamp", DateTimeOffset.UtcNow.ToUnixTimeSeconds() }
            };

            // 3. Upsert into Qdrant collection named "project_jannah_memories"
            await _qdrantClient.UpsertPointAsync(
                collectionName: "project_jannah_memories",
                id: memoryId,
                vector: vector,
                payload: payload,
                cancellationToken: cancellationToken
            );
        }

        public async Task<List<string>> QuerySimilarMemoriesAsync(Guid userId, string query, string domain, int limit, CancellationToken cancellationToken)
        {
            // 1. Convert user's query into the same vector space
            float[] queryVector = await _embeddingGenerator.GenerateEmbeddingsAsync(query, cancellationToken);

            // 2. Filter criteria (User Isolation and optional Domain filter)
            var filter = new Dictionary<string, string>
            {
                { "userId", userId.ToString() }
            };
            if (!string.IsNullOrEmpty(domain))
            {
                filter.Add("domain", domain);
            }

            // 3. Execute vector search in Qdrant Vector database
            var results = await _qdrantClient.SearchAsync(
                collectionName: "project_jannah_memories",
                vector: queryVector,
                filter: filter,
                limit: limit,
                cancellationToken: cancellationToken
            );

            // 4. Return matching content strings
            return results.Select(r => r.Payload["content"].ToString()).ToList();
        }
    }

    // Secondary scaffold contracts for vector store architecture
    public interface IVectorStore
    {
        Task UpsertMemoryAsync(Guid userId, Guid memoryId, string content, string domain, CancellationToken cancellationToken);
        Task<List<string>> QuerySimilarMemoriesAsync(Guid userId, string query, string domain, int limit, CancellationToken cancellationToken);
    }

    public interface IQdrantClient
    {
        Task UpsertPointAsync(string collectionName, Guid id, float[] vector, Dictionary<string, object> payload, CancellationToken cancellationToken);
        Task<List<QdrantPointResult>> SearchAsync(string collectionName, float[] vector, Dictionary<string, string> filter, int limit, CancellationToken cancellationToken);
    }

    public class QdrantPointResult
    {
        public Guid Id { get; set; }
        public Dictionary<string, object> Payload { get; set; }
        public float Score { get; set; }
    }

    public interface IAiEmbeddingGenerator
    {
        Task<float[]> GenerateEmbeddingsAsync(string text, CancellationToken cancellationToken);
    }
}
