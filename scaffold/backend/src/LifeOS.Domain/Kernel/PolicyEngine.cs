using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace LifeOS.Domain.Kernel
{
    public enum PolicySeverity
    {
        Info,
        Warning,
        Critical,
        Blocking
    }

    /// <summary>
    /// Represents a model representing an executable policy rule inside LifeOS.
    /// </summary>
    public class PolicyRule
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int Priority { get; set; } = 1; // Higher is more urgent
        public PolicySeverity Severity { get; set; } = PolicySeverity.Warning;
        public Func<Dictionary<string, object>, bool> RuleExpression { get; set; } = _ => true; // Returns true if compliant, false if violated
    }

    /// <summary>
    /// Repositoring dictionary tracking active policies.
    /// </summary>
    public class PolicyRegistry
    {
        private readonly ConcurrentDictionary<string, PolicyRule> _rules = new();

        public IReadOnlyCollection<PolicyRule> ActiveRules => _rules.Values.ToList().AsReadOnly();

        public void Register(PolicyRule rule)
        {
            if (rule == null) throw new ArgumentNullException(nameof(rule));
            _rules[rule.Id.ToLowerInvariant()] = rule;
        }

        public bool TryGet(string id, out PolicyRule rule)
        {
            return _rules.TryGetValue(id.ToLowerInvariant(), out rule);
        }
    }

    /// <summary>
    /// Represents a log of a policy validation attempt.
    /// </summary>
    public class PolicyAuditRecord
    {
        public Guid RecordId { get; } = Guid.NewGuid();
        public string PolicyId { get; set; } = string.Empty;
        public bool IsCompliant { get; set; }
        public string EvaluationNotes { get; set; } = string.Empty;
        public DateTime CheckedAt { get; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Audits and logs historical violations.
    /// </summary>
    public class PolicyAudit
    {
        private readonly ConcurrentQueue<PolicyAuditRecord> _logs = new();

        public void Log(string policyId, bool isCompliant, string notes)
        {
            _logs.Enqueue(new PolicyAuditRecord
            {
                PolicyId = policyId,
                IsCompliant = isCompliant,
                EvaluationNotes = notes
            });
        }

        public IReadOnlyCollection<PolicyAuditRecord> GetHistory() => _logs.ToList().AsReadOnly();
    }

    /// <summary>
    /// Dynamically evaluates user telemetry or proposed schedules against active policy invariants.
    /// </summary>
    public class PolicyEvaluator
    {
        private readonly PolicyRegistry _registry;
        private readonly PolicyAudit _audit;

        public PolicyEvaluator(PolicyRegistry registry, PolicyAudit audit)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
            _audit = audit ?? throw new ArgumentNullException(nameof(audit));
        }

        public List<PolicyRule> EvaluateAll(Dictionary<string, object> facts, out List<string> violations)
        {
            violations = new List<string>();
            var failedRules = new List<PolicyRule>();

            foreach (var rule in _registry.ActiveRules)
            {
                try
                {
                    bool compliant = rule.RuleExpression(facts);
                    _audit.Log(rule.Id, compliant, compliant ? "Passed checks" : "Failed constraints evaluation");

                    if (!compliant)
                    {
                        failedRules.Add(rule);
                        violations.Add($"Policy '{rule.Title}' violated: {rule.Description} (Severity: {rule.Severity})");
                    }
                }
                catch (Exception ex)
                {
                    _audit.Log(rule.Id, false, $"Evaluation Error: {ex.Message}");
                    violations.Add($"Policy '{rule.Title}' evaluation crashed: {ex.Message}");
                }
            }

            return failedRules;
        }
    }

    /// <summary>
    /// Executes corrective workflows or sends notifications when critical policies are violated.
    /// </summary>
    public class PolicyExecutor
    {
        private readonly PolicyEvaluator _evaluator;

        public PolicyExecutor(PolicyEvaluator evaluator)
        {
            _evaluator = evaluator ?? throw new ArgumentNullException(nameof(evaluator));
        }

        public bool Enforce(Dictionary<string, object> facts, Action<string, PolicySeverity> alertDelegate)
        {
            var violations = _evaluator.EvaluateAll(facts, out var violationMessages);
            foreach (var rule in violations)
            {
                alertDelegate($"ALERT: {rule.Title} violated. Details: {rule.Description}", rule.Severity);
            }

            // Return true if there are blocking violations, suggesting blocking action execution
            return violations.Any(r => r.Severity == PolicySeverity.Blocking);
        }
    }

    /// <summary>
    /// Orchestrator for all Policy logic, pre-loaded with standard Jannah policies.
    /// </summary>
    public class PolicyEngine
    {
        public PolicyRegistry Registry { get; } = new();
        public PolicyAudit Audit { get; } = new();
        public PolicyEvaluator Evaluator { get; }
        public PolicyExecutor Executor { get; }

        public PolicyEngine()
        {
            Evaluator = new PolicyEvaluator(Registry, Audit);
            Executor = new PolicyExecutor(Evaluator);

            LoadDefaultPolicies();
        }

        private void LoadDefaultPolicies()
        {
            // 1. Never Miss Salah
            Registry.Register(new PolicyRule
            {
                Id = "pol_deen_never_miss_salah",
                Title = "Never Miss Salah",
                Description = "Every daily prayer must be logged as Completed, PrayedOnTime, or PrayedLate. Missed is a major violation.",
                Severity = PolicySeverity.Blocking,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("SalahStatus", out var status) && status is string s)
                    {
                        return s != "Missed";
                    }
                    return true;
                }
            });

            // 2. No Meetings During Prayer
            Registry.Register(new PolicyRule
            {
                Id = "pol_deen_no_meeting_during_prayer",
                Title = "No Meetings During Prayer",
                Description = "A calendar meeting must not overlap with estimated prayer times.",
                Severity = PolicySeverity.Critical,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("MeetingStart", out var ms) && ms is DateTime meetingStart &&
                        facts.TryGetValue("PrayerTimeStart", out var ps) && ps is DateTime prayerStart &&
                        facts.TryGetValue("PrayerTimeEnd", out var pe) && pe is DateTime prayerEnd)
                    {
                        // Compliance checks: meeting start should not be within prayer boundaries
                        return meetingStart < prayerStart || meetingStart > prayerEnd;
                    }
                    return true;
                }
            });

            // 3. Gym Four Times Weekly
            Registry.Register(new PolicyRule
            {
                Id = "pol_health_gym_four_weekly",
                Title = "Gym 4x Weekly",
                Description = "User must maintain athletic stamina by hitting physical logs 4 or more times a week.",
                Severity = PolicySeverity.Warning,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("WeeklyWorkoutCount", out var count) && count is int c)
                    {
                        return c >= 4;
                    }
                    return true;
                }
            });

            // 4. Save Minimum 20%
            Registry.Register(new PolicyRule
            {
                Id = "pol_wealth_save_twenty_percent",
                Title = "Save Minimum 20%",
                Description = "Ensure financial reserves remain secure by dedicating >= 20% of income streams to savings or investments.",
                Severity = PolicySeverity.Critical,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("SavingsRate", out var rate) && rate is double r)
                    {
                        return r >= 0.20;
                    }
                    return true;
                }
            });

            // 5. Daily Quran Reading
            Registry.Register(new PolicyRule
            {
                Id = "pol_deen_daily_quran_reading",
                Title = "Daily Quran Reading",
                Description = "Must complete or review at least 1 verse (Ayah) or page daily.",
                Severity = PolicySeverity.Warning,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("DailyQuranPagesRead", out var pages) && pages is int p)
                    {
                        return p >= 1;
                    }
                    return true;
                }
            });

            // 6. Family Time Every Evening
            Registry.Register(new PolicyRule
            {
                Id = "pol_marriage_family_time_evening",
                Title = "Family Time Every Evening",
                Description = "A minimum of 1.5 hours of dedicated offline family bonding is required after 6:00 PM.",
                Severity = PolicySeverity.Warning,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("FamilyHoursSpent", out var hours) && hours is double h)
                    {
                        return h >= 1.5;
                    }
                    return true;
                }
            });

            // 7. No Social Media Before Work
            Registry.Register(new PolicyRule
            {
                Id = "pol_productivity_no_sm_before_work",
                Title = "No Social Media Before Work",
                Description = "Social media applications should not be opened prior to standard work hours (9:00 AM).",
                Severity = PolicySeverity.Warning,
                RuleExpression = facts =>
                {
                    if (facts.TryGetValue("SocialMediaMinutesBefore9AM", out var mins) && mins is int m)
                    {
                        return m == 0;
                    }
                    return true;
                }
            });
        }
    }
}
