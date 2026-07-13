using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Application.Kernel
{
    public enum ContextType
    {
        Working,
        Daily,
        Session,
        Goal,
        Calendar,
        Financial,
        Relationship,
        Health,
        Faith,
        Business,
        Career,
        Learning
    }

    /// <summary>
    /// Holds a single structured node of contextual metadata ready for AI injection.
    /// </summary>
    public class ContextNode
    {
        public Guid Id { get; } = Guid.NewGuid();
        public ContextType Type { get; set; }
        public string ContentJson { get; set; } = "{}";
        public double ImportanceScore { get; set; } = 1.0; // 0.0 to 1.0
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;

        public double CalculateRelevance(DateTime evaluationTime)
        {
            double elapsedHours = (evaluationTime - TimestampUtc).TotalHours;
            if (elapsedHours <= 0) return ImportanceScore;
            
            // Context degrades relatively rapidly (linear half-life of 24 hours)
            double decay = 0.04 * elapsedHours;
            return Math.Max(0.1, ImportanceScore - decay);
        }
    }

    /// <summary>
    /// Validates context constraints to prevent injection leaks, prompt breaks, or malformed data frames.
    /// </summary>
    public class ContextValidator
    {
        public bool ValidateNode(ContextNode node, out string errorMessage)
        {
            if (node == null)
            {
                errorMessage = "Context node cannot be null.";
                return false;
            }

            if (string.IsNullOrWhiteSpace(node.ContentJson))
            {
                errorMessage = "Content payload is empty.";
                return false;
            }

            // Simple sanitation: Prevent raw system instructions hacks
            if (node.ContentJson.Contains("ignore previous instructions") || node.ContentJson.Contains("systemInstruction"))
            {
                errorMessage = "Security violation: detected instruction-injection payload inside telemetry.";
                return false;
            }

            errorMessage = string.Empty;
            return true;
        }
    }

    /// <summary>
    /// Evaluates, ranks, and filters context nodes to maximize dynamic density.
    /// </summary>
    public class ContextScorer
    {
        public List<ContextNode> ScoreAndRank(IEnumerable<ContextNode> nodes)
        {
            if (nodes == null) return new List<ContextNode>();
            var now = DateTime.UtcNow;
            return nodes
                .OrderByDescending(node => node.CalculateRelevance(now))
                .ThenByDescending(node => node.ImportanceScore)
                .ToList();
        }
    }

    /// <summary>
    /// Compresses rich structural context blocks to fit the strict 4KB token budget limits.
    /// </summary>
    public class ContextCompressor
    {
        private readonly int _maxBudgetBytes;

        public ContextCompressor(int maxBudgetBytes = 4096)
        {
            _maxBudgetBytes = maxBudgetBytes;
        }

        public string CompressFrame(List<ContextNode> rankedNodes)
        {
            if (rankedNodes == null || rankedNodes.Count == 0) return "{}";

            var contextBlock = new Dictionary<string, object>();
            int currentLength = 2; // "{}" base length

            foreach (var node in rankedNodes)
            {
                string key = node.Type.ToString();
                object parsedPayload;
                try
                {
                    parsedPayload = JsonSerializer.Deserialize<object>(node.ContentJson) ?? node.ContentJson;
                }
                catch
                {
                    parsedPayload = node.ContentJson;
                }

                string candidateJson = JsonSerializer.Serialize(parsedPayload);
                int payloadLength = candidateJson.Length + key.Length + 4; // Quotes & commas

                if (currentLength + payloadLength <= _maxBudgetBytes)
                {
                    contextBlock[key] = parsedPayload;
                    currentLength += payloadLength;
                }
                else
                {
                    // Truncate or omit further nodes as we have exhausted the prompt budget
                    break;
                }
            }

            return JsonSerializer.Serialize(contextBlock, new JsonSerializerOptions { WriteIndented = false });
        }
    }

    /// <summary>
    /// Facilitates building localized context packets.
    /// </summary>
    public class ContextBuilder
    {
        private readonly List<ContextNode> _nodes = new();

        public ContextBuilder AddNode(ContextType type, object content, double importance = 1.0)
        {
            var json = JsonSerializer.Serialize(content);
            _nodes.Add(new ContextNode
            {
                Type = type,
                ContentJson = json,
                ImportanceScore = importance,
                TimestampUtc = DateTime.UtcNow
            });
            return this;
        }

        public List<ContextNode> Build() => _nodes.ToList();
    }

    /// <summary>
    /// Full contextual pipelines coordinating gather, validation, scoring, compression, and delivery.
    /// </summary>
    public class ContextPipeline
    {
        private readonly ContextValidator _validator = new();
        private readonly ContextScorer _scorer = new();
        private readonly ContextCompressor _compressor;

        public ContextPipeline(ContextCompressor compressor = null)
        {
            _compressor = compressor ?? new ContextCompressor();
        }

        public string Process(IEnumerable<ContextNode> nodes)
        {
            if (nodes == null) return "{}";

            var validNodes = new List<ContextNode>();
            foreach (var node in nodes)
            {
                if (_validator.ValidateNode(node, out _))
                {
                    validNodes.Add(node);
                }
            }

            var rankedNodes = _scorer.ScoreAndRank(validNodes);
            return _compressor.CompressFrame(rankedNodes);
        }
    }

    /// <summary>
    /// Serves as the central service providing real-time sliding context windows to Gabriel CoS.
    /// </summary>
    public class ContextProvider
    {
        private readonly ContextPipeline _pipeline;
        private readonly List<ContextNode> _activeWorkspaceNodes = new();

        public ContextProvider(ContextPipeline pipeline = null)
        {
            _pipeline = pipeline ?? new ContextPipeline();
        }

        public void RegisterContext(ContextType type, string contentJson, double importance)
        {
            _activeWorkspaceNodes.Add(new ContextNode
            {
                Type = type,
                ContentJson = contentJson,
                ImportanceScore = importance,
                TimestampUtc = DateTime.UtcNow
            });
        }

        public void ClearWorkspace()
        {
            _activeWorkspaceNodes.Clear();
        }

        public string AssembleCurrentFrame()
        {
            // Retain only those fresher than 48 hours for active operational contexts
            var cutoff = DateTime.UtcNow.AddHours(-48);
            var freshNodes = _activeWorkspaceNodes.Where(n => n.TimestampUtc >= cutoff).ToList();

            return _pipeline.Process(freshNodes);
        }
    }
}
