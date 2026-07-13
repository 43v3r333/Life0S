using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Application.Kernel
{
    public class DecisionRequest
    {
        public Guid DecisionId { get; } = Guid.NewGuid();
        public string Question { get; set; } = string.Empty;
        public string Domain { get; set; } = "General"; // Deen, Career, Finance, Health
        public Dictionary<string, object> Parameters { get; set; } = new();
    }

    /// <summary>
    /// Enterprise diagnostic assessment of a proposed decision action.
    /// </summary>
    public class DecisionOutcome
    {
        public Guid DecisionId { get; set; }
        public string Question { get; set; } = string.Empty;
        public string Recommendation { get; set; } = string.Empty;
        public double ConfidenceScore { get; set; } = 1.0; // 0.0 to 1.0
        public string Explanation { get; set; } = string.Empty;

        // Structured Assessment Verticals
        public double OpportunityCostScore { get; set; } = 0.5;
        public decimal FinancialImpact { get; set; } = 0.00m;
        public double TimeCostHours { get; set; } = 0.0;
        public double EnergyCostScore { get; set; } = 0.5; // 0 (Low) to 1 (Extreme exhaustion)
        public double RiskFactor { get; set; } = 0.1; // 0 to 1
        public bool IsIslamicAligned { get; set; } = true;
        public double StrategicAlignmentScore { get; set; } = 1.0;

        public DateTime DecidedAt { get; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Thread-safe archive of all strategic decisions.
    /// </summary>
    public class DecisionHistory
    {
        private readonly ConcurrentDictionary<Guid, DecisionOutcome> _archive = new();

        public void Save(DecisionOutcome outcome)
        {
            if (outcome == null) throw new ArgumentNullException(nameof(outcome));
            _archive[outcome.DecisionId] = outcome;
        }

        public IReadOnlyCollection<DecisionOutcome> GetAll() => _archive.Values.ToList().AsReadOnly();
    }

    /// <summary>
    /// Multi-criteria decision analysis scoring engine.
    /// </summary>
    public class DecisionScoring
    {
        public double CalculateConfidence(DecisionOutcome outcome)
        {
            if (!outcome.IsIslamicAligned) return 0.0; // Ultimate block condition

            double confidence = 1.0;

            // Reduce confidence with higher risk factors
            confidence -= (outcome.RiskFactor * 0.3);

            // Reduce confidence if energy drain is disproportionately high
            if (outcome.EnergyCostScore > 0.8)
            {
                confidence -= 0.15;
            }

            // High strategic alignment bolsters confidence
            confidence += (outcome.StrategicAlignmentScore * 0.2);

            return Math.Clamp(confidence, 0.1, 1.0);
        }
    }

    /// <summary>
    /// Decoupled auditor inspecting historical recommendations against real outcomes.
    /// </summary>
    public class DecisionAuditing
    {
        private readonly ConcurrentQueue<(Guid DecisionId, bool WasCorrect, string AuditNotes)> _audits = new();

        public void AuditDecision(Guid decisionId, bool wasCorrect, string notes)
        {
            _audits.Enqueue((decisionId, wasCorrect, notes));
        }

        public IReadOnlyCollection<(Guid DecisionId, bool WasCorrect, string AuditNotes)> GetAudits() => _audits.ToList().AsReadOnly();
    }

    /// <summary>
    /// Multi-stage pipeline processing Decisions sequentially.
    /// </summary>
    public class DecisionPipeline
    {
        private readonly DecisionScoring _scorer = new();

        public Task<DecisionOutcome> ProcessAsync(DecisionRequest request, CancellationToken cancellationToken)
        {
            if (request == null) throw new ArgumentNullException(nameof(request));

            // Stage 1-3: Gather context, memories, goals (mocked via structured inputs)
            double opportunityCost = request.Parameters.TryGetValue("OpportunityCost", out var oc) && oc is double o ? o : 0.4;
            decimal financialImpact = request.Parameters.TryGetValue("FinancialImpact", out var fi) && fi is decimal f ? f : 0.00m;
            double timeCost = request.Parameters.TryGetValue("TimeCost", out var tc) && tc is double t ? t : 1.5;
            double energyCost = request.Parameters.TryGetValue("EnergyCost", out var ec) && ec is double e ? e : 0.3;
            double riskFactor = request.Parameters.TryGetValue("RiskFactor", out var rf) && rf is double r ? r : 0.2;
            bool islamicAlignment = !request.Parameters.TryGetValue("IslamicAlignment", out var ia) || ia is not bool b || b;
            double strategicAlignment = request.Parameters.TryGetValue("StrategicAlignment", out var sa) && sa is double s ? s : 0.85;

            // Stage 4: Synthesize recommendation
            string recommendation = strategicAlignment >= 0.7 && islamicAlignment
                ? $"RECOMMENDED: Proceed with proposal for '{request.Question}' under strict resource bounds."
                : $"DECLINED: Proposal for '{request.Question}' is either unaligned strategically or carries non-compliant constraints.";

            var outcome = new DecisionOutcome
            {
                DecisionId = request.DecisionId,
                Question = request.Question,
                Recommendation = recommendation,
                OpportunityCostScore = opportunityCost,
                FinancialImpact = financialImpact,
                TimeCostHours = timeCost,
                EnergyCostScore = energyCost,
                RiskFactor = riskFactor,
                IsIslamicAligned = islamicAlignment,
                StrategicAlignmentScore = strategicAlignment,
                Explanation = $"Evaluated strategic parameters. Islamic Alignment: {islamicAlignment}. Risks audited at {riskFactor:P} factor levels."
            };

            // Stage 5: Score Confidence
            outcome.ConfidenceScore = _scorer.CalculateConfidence(outcome);

            return Task.FromResult(outcome);
        }
    }

    /// <summary>
    /// Enterprise orchestrator for strategic evaluations.
    /// </summary>
    public class DecisionEngine
    {
        public DecisionHistory History { get; } = new();
        public DecisionAuditing Auditing { get; } = new();
        private readonly DecisionPipeline _pipeline = new();

        public async Task<DecisionOutcome> MakeDecisionAsync(DecisionRequest request, CancellationToken cancellationToken)
        {
            var outcome = await _pipeline.ProcessAsync(request, cancellationToken);
            History.Save(outcome);
            return outcome;
        }
    }
}
