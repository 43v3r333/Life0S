using System;
using System.Collections.Generic;
using System.Linq;

namespace LifeOS.Application.Kernel
{
    public enum ReviewType
    {
        Daily,
        Weekly,
        Monthly,
        Quarterly,
        Annual
    }

    /// <summary>
    /// Holds performance ratings and textual comments for all LifeOS Jannah verticals.
    /// </summary>
    public class DomainReviewMetric
    {
        public string DomainName { get; set; } = string.Empty; // Faith, Marriage, Family, Health, Finance, Business, Career, Learning, Goals, Habits, Productivity
        public double Score { get; set; } = 5.0; // 1.0 (Critical) to 10.0 (Outstanding alignment)
        public string Observations { get; set; } = string.Empty;
    }

    /// <summary>
    /// Completed reflection report carrying quantitative scores, deep AI insights, and strategic action plans.
    /// </summary>
    public class ReflectionReport
    {
        public Guid ReportId { get; } = Guid.NewGuid();
        public ReviewType Type { get; set; }
        public DateTime GeneratedAt { get; } = DateTime.UtcNow;
        public List<DomainReviewMetric> DomainMetrics { get; set; } = new();
        public string AiInsights { get; set; } = string.Empty;
        public List<string> ActionItems { get; set; } = new();
        public double AverageSystemScore => DomainMetrics.Count > 0 ? DomainMetrics.Average(m => m.Score) : 0.0;
    }

    /// <summary>
    /// Core intelligence engine evaluating life progression, spiritual metrics, productivity, and marital harmony.
    /// </summary>
    public class ReflectionEngine
    {
        public ReflectionReport CompileReview(ReviewType type, List<DomainReviewMetric> metrics)
        {
            if (metrics == null || metrics.Count == 0)
            {
                metrics = PopulateDefaultMetrics();
            }

            var report = new ReflectionReport
            {
                Type = type,
                DomainMetrics = metrics
            };

            // Synthesize AI Insights based on score distributions
            double averageScore = report.AverageSystemScore;
            var criticalDomains = metrics.Where(m => m.Score < 6.0).Select(m => m.DomainName).ToList();

            string insights;
            var actions = new List<string>();

            if (averageScore >= 8.5)
            {
                insights = "Outstanding holistic alignment. Your spiritual constancy is bolstering your professional focus and domestic tranquility. Excellent energy discipline.";
                actions.Add("Maintain current early morning habit loops.");
                actions.Add("Consider elevating financial savings target beyond the 20% minimum.");
            }
            else if (averageScore >= 6.5)
            {
                insights = "Solid core performance. Some friction noted between career milestones and personal health routines. Your Deen metrics are stabilizing well.";
                actions.Add("Protect evening family time bounds aggressively.");
                if (criticalDomains.Count > 0)
                {
                    actions.Add($"Urgent: Address bottlenecks in {string.Join(", ", criticalDomains)}.");
                }
            }
            else
            {
                insights = "Systemic exhaustion or scheduling fragmentation detected. Spiritual habits are slipping under extreme meeting pressure. Immediate re-alignment recommended.";
                actions.Add("Restore mandatory evening offline hours.");
                actions.Add("Block Fajr and Dhuhr prayer zones on your work calendars.");
                foreach (var cd in criticalDomains)
                {
                    actions.Add($"Draft restorative recovery plan for {cd}.");
                }
            }

            report.AiInsights = insights;
            report.ActionItems = actions;

            return report;
        }

        private List<DomainReviewMetric> PopulateDefaultMetrics()
        {
            return new List<DomainReviewMetric>
            {
                new() { DomainName = "Faith", Score = 8.5, Observations = "Salah on time is solid. Regular daily Quran reading of 2 pages maintained." },
                new() { DomainName = "Marriage", Score = 7.5, Observations = "Dedicated family time is consistent, though occasional late meetings cause slight pressure." },
                new() { DomainName = "Family", Score = 8.0, Observations = "Excellent bonding during weekends." },
                new() { DomainName = "Health", Score = 6.0, Observations = "Sleep levels degraded to 6.2 hours. Workout count missed; only hit 2 sessions." },
                new() { DomainName = "Finance", Score = 9.0, Observations = "Savings rate maintained at 25% of gross income. Zakat balance calculated correctly." },
                new() { DomainName = "Business", Score = 7.0, Observations = "Revenue generation is steady but operational bottlenecks remain unresolved." },
                new() { DomainName = "Career", Score = 8.5, Observations = "Core sprint project completed on schedule." },
                new() { DomainName = "Learning", Score = 7.0, Observations = "Completed 1 certification lesson, slight slippage due to workspace workload." },
                new() { DomainName = "Goals", Score = 8.0, Observations = "Annual milestones are fully aligned with quarterly projects." },
                new() { DomainName = "Habits", Score = 7.5, Observations = "Morning routines are strong, but evening routines are slightly fragmented." },
                new() { DomainName = "Productivity", Score = 8.0, Observations = "Deep work sessions averaged 3 hours daily." }
            };
        }
    }
}
