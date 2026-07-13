using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Application.Kernel
{
    public enum MemoryLayer
    {
        Working,
        ShortTerm,
        LongTerm,
        Semantic,
        Episodic,
        Reflection,
        Ai
    }

    /// <summary>
    /// Represents a high-fidelity semantic block of user history, rules, or behavior.
    /// </summary>
    public class MemoryRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public MemoryLayer Layer { get; set; }
        public string Content { get; set; } = string.Empty;
        public List<float> Embedding { get; set; } = new();
        public Dictionary<string, string> Metadata { get; set; } = new();
        public List<string> Tags { get; set; } = new();
        public double Confidence { get; set; } = 1.0;
        public double Importance { get; set; } = 1.0;
        public Dictionary<Guid, string> Relationships { get; set; } = new(); // TargetId -> RelationType
        public List<string> VersionHistory { get; set; } = new();
        public double RecallScore { get; set; } = 1.0;
        public DateTime? ExpirationUtc { get; set; }
        public string SourceTracking { get; set; } = "System";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastRecalledAt { get; set; } = DateTime.UtcNow;

        public void Touch()
        {
            LastRecalledAt = DateTime.UtcNow;
            RecallScore = Math.Min(1.0, RecallScore + 0.1);
        }

        public void Decay(DateTime now)
        {
            double elapsedDays = (now - CreatedAt).TotalDays;
            if (elapsedDays <= 0) return;

            // Simple linear decay mapping
            RecallScore = Math.Max(0.0, RecallScore - (0.02 * elapsedDays));
        }
    }

    /// <summary>
    /// Indexer class for cataloging semantic metadata inside relational and vector bounds.
    /// </summary>
    public class MemoryIndexer
    {
        private readonly ConcurrentDictionary<Guid, MemoryRecord> _registry;

        public MemoryIndexer(ConcurrentDictionary<Guid, MemoryRecord> registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public void Index(MemoryRecord record)
        {
            if (record == null) throw new ArgumentNullException(nameof(record));
            record.VersionHistory.Add($"Indexed at {DateTime.UtcNow:O}");
            _registry[record.Id] = record;
        }
    }

    /// <summary>
    /// Retrieves nodes by exact filters or similarity criteria.
    /// </summary>
    public class MemoryRetrieval
    {
        private readonly ConcurrentDictionary<Guid, MemoryRecord> _registry;

        public MemoryRetrieval(ConcurrentDictionary<Guid, MemoryRecord> registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public IEnumerable<MemoryRecord> Query(Func<MemoryRecord, bool> predicate)
        {
            return _registry.Values.Where(predicate);
        }

        public IEnumerable<MemoryRecord> RetrieveSimilar(string query, CancellationToken cancellationToken)
        {
            // Simple string matching similarity model for standard mock environment
            string cleanQuery = query.ToLowerInvariant();
            return _registry.Values
                .Where(r => r.Content.ToLowerInvariant().Contains(cleanQuery) || r.Tags.Any(t => t.ToLowerInvariant().Contains(cleanQuery)))
                .OrderByDescending(r => r.Importance);
        }
    }

    /// <summary>
    /// Ranks memory nodes based on cosine scores, relevance scores, and importance metrics.
    /// </summary>
    public class MemoryRanking
    {
        public List<MemoryRecord> Rank(IEnumerable<MemoryRecord> records, string query)
        {
            string cleanQuery = query.ToLowerInvariant();
            return records.OrderByDescending(r =>
            {
                double score = r.Importance * r.RecallScore;
                if (r.Content.ToLowerInvariant().Contains(cleanQuery))
                {
                    score += 0.5; // Similarity bump
                }
                return score;
            }).ToList();
        }
    }

    /// <summary>
    /// Consolidates short-term transactional activities into long-term general summaries.
    /// </summary>
    public class MemoryConsolidation
    {
        public MemoryRecord Consolidate(IEnumerable<MemoryRecord> shortTermMemories, string consolidatedContent)
        {
            var memories = shortTermMemories.ToList();
            if (memories.Count == 0) throw new InvalidOperationException("No memories available to consolidate.");

            var tags = memories.SelectMany(m => m.Tags).Distinct().ToList();
            var relations = memories.SelectMany(m => m.Relationships).Distinct().ToDictionary(x => x.Key, x => x.Value);

            var longTermRecord = new MemoryRecord
            {
                Layer = MemoryLayer.LongTerm,
                Content = consolidatedContent,
                Tags = tags,
                Relationships = relations,
                Importance = memories.Max(m => m.Importance),
                Confidence = memories.Average(m => m.Confidence),
                SourceTracking = "ConsolidationEngine",
                CreatedAt = DateTime.UtcNow
            };

            return longTermRecord;
        }
    }

    /// <summary>
    /// Compresses and minifies textual blocks into dense records.
    /// </summary>
    public class MemoryCompression
    {
        public string Compress(string fullContent)
        {
            if (string.IsNullOrWhiteSpace(fullContent)) return string.Empty;
            // Concrete mockup compression representing a semantic core pipeline
            return $"[Compressed Memory: {fullContent.Substring(0, Math.Min(60, fullContent.Length))}...]";
        }
    }

    /// <summary>
    /// Handles summarizing specific categories.
    /// </summary>
    public class MemorySummaries
    {
        public string GenerateSummary(IEnumerable<MemoryRecord> records)
        {
            var items = records.Select(r => $"- {r.Content} ({r.Layer})").ToList();
            return string.Join("\n", items);
        }
    }

    /// <summary>
    /// Governs memory degradation schedules, archivals, and strict expirations.
    /// </summary>
    public class MemoryLifecycleManager
    {
        private readonly ConcurrentDictionary<Guid, MemoryRecord> _registry;

        public MemoryLifecycleManager(ConcurrentDictionary<Guid, MemoryRecord> registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public void RunPruningCycle()
        {
            var now = DateTime.UtcNow;

            foreach (var record in _registry.Values)
            {
                // 1. Remove expired items
                if (record.ExpirationUtc.HasValue && record.ExpirationUtc.Value <= now)
                {
                    _registry.TryRemove(record.Id, out _);
                    continue;
                }

                // 2. Apply decay curves
                record.Decay(now);

                // 3. Demote if recall score is exceptionally low
                if (record.RecallScore < 0.1 && record.Layer == MemoryLayer.ShortTerm)
                {
                    record.Layer = MemoryLayer.LongTerm; // Archive
                    record.RecallScore = 0.5; // Reset basic anchor
                }
            }
        }
    }

    /// <summary>
    /// Primary entry point coordinating memory read-write pipelines.
    /// </summary>
    public class MemoryManager
    {
        private readonly ConcurrentDictionary<Guid, MemoryRecord> _registry = new();
        public MemoryIndexer Indexer { get; }
        public MemoryRetrieval Retrieval { get; }
        public MemoryRanking Ranking { get; }
        public MemoryConsolidation Consolidation { get; }
        public MemoryCompression Compression { get; }
        public MemorySummaries Summaries { get; }
        public MemoryLifecycleManager Lifecycle { get; }

        public MemoryManager()
        {
            Indexer = new MemoryIndexer(_registry);
            Retrieval = new MemoryRetrieval(_registry);
            Ranking = new MemoryRanking();
            Consolidation = new MemoryConsolidation();
            Compression = new MemoryCompression();
            Summaries = new MemorySummaries();
            Lifecycle = new MemoryLifecycleManager(_registry);
        }

        public void StoreMemory(MemoryLayer layer, string content, List<string> tags = null)
        {
            var record = new MemoryRecord
            {
                Layer = layer,
                Content = content,
                Tags = tags ?? new List<string>(),
                CreatedAt = DateTime.UtcNow
            };
            Indexer.Index(record);
        }

        public IEnumerable<MemoryRecord> Recall(string query)
        {
            var results = Retrieval.RetrieveSimilar(query, CancellationToken.None);
            foreach (var record in results)
            {
                record.Touch();
            }
            return Ranking.Rank(results, query);
        }
    }
}
