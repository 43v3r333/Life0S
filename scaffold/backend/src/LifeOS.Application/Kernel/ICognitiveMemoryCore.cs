using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Application.Kernel
{
    /// <summary>
    /// Represents a stored cognitive unit inside the vector and relational spaces of LifeOS.
    /// </summary>
    public class CognitiveMemoryNode
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Domain { get; set; } // Deen, Family, Health, Wealth, Career, Personal
        public string Content { get; set; }
        public double PriorityWeight { get; set; } = 1.0;
        public string DecayType { get; set; } = "linear"; // static, linear, exponential
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastRecalledAt { get; set; } = DateTime.UtcNow;
        public List<string> Tags { get; set; } = new();

        public double CalculateCurrentWeight(DateTime evaluationTime)
        {
            double elapsedDays = (evaluationTime - CreatedAt).TotalDays;
            if (elapsedDays <= 0) return PriorityWeight;

            return DecayType.ToLower() switch
            {
                "static" => PriorityWeight,
                "exponential" => PriorityWeight * Math.Exp(-0.15 * elapsedDays),
                "linear" or _ => Math.Max(0, PriorityWeight - (0.05 * elapsedDays))
            };
        }
    }

    /// <summary>
    /// Contract for assembling structured context for the AI Chief of Staff (Gabriel).
    /// </summary>
    public interface IContextAggregationEngine
    {
        /// <summary>
        /// Generates the standard 4KB Context Frame containing real-time telemetry and relevant RAG memory anchors.
        /// </summary>
        Task<string> AssembleContextFrameAsync(Guid userId, string userIntent, CancellationToken cancellationToken);
    }

    /// <summary>
    /// Core memory-compaction service designed to compact transactional raw logs into dense semantic memory nodes.
    /// </summary>
    public interface ICognitiveCompactionService
    {
        /// <summary>
        /// Gathers raw historical telemetry logs and compresses them into cohesive, long-term memory nodes.
        /// </summary>
        Task CompactDailyTelemetryAsync(Guid userId, DateTime date, CancellationToken cancellationToken);
    }
}
