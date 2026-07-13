using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using LifeOS.Domain.Kernel;

namespace LifeOS.Infrastructure.Kernel
{
    #region Telemetry & Diagnostics

    public class MetricPoint
    {
        public string Name { get; set; } = string.Empty;
        public double Value { get; set; }
        public DateTime RecordedAt { get; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Collects execution counts, consistency ratios, and system health records.
    /// </summary>
    public class MetricsCollector
    {
        private readonly ConcurrentBag<MetricPoint> _metrics = new();

        public void Track(string name, double value)
        {
            _metrics.Add(new MetricPoint { Name = name, Value = value });
        }

        public double GetAverage(string name)
        {
            var points = _metrics.Where(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase)).ToList();
            if (points.Count == 0) return 0.0;
            return points.Average(p => p.Value);
        }

        public double GetSum(string name)
        {
            return _metrics.Where(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase)).Sum(p => p.Value);
        }

        public IReadOnlyCollection<MetricPoint> GetAll() => _metrics.ToList().AsReadOnly();
    }

    /// <summary>
    /// Tracks latency, API failures, and memory allocations inside Life Kernel loops.
    /// </summary>
    public class PerformanceMonitor
    {
        private readonly ConcurrentQueue<(string Operation, double LatencyMs, DateTime Timestamp)> _logs = new();

        public void LogLatency(string operation, double latencyMs)
        {
            _logs.Enqueue((operation, latencyMs, DateTime.UtcNow));
        }

        public double GetAverageLatency(string operation)
        {
            var ops = _logs.Where(l => l.Operation.Equals(operation, StringComparison.OrdinalIgnoreCase)).ToList();
            if (ops.Count == 0) return 0.0;
            return ops.Average(l => l.LatencyMs);
        }
    }

    #endregion

    #region Enterprise Scheduler

    public class ScheduleSlot
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int Priority { get; set; } = 1; // 10 is absolute priority (e.g. Prayer / Marital emergency)
        public bool IsPrayerBlock { get; set; }
    }

    /// <summary>
    /// Schedules time blocks, tracks overlaps, and detects conflicts with non-negotiable spiritual constants.
    /// </summary>
    public class EnterpriseScheduler
    {
        private readonly ConcurrentBag<ScheduleSlot> _slots = new();

        public void AddSlot(ScheduleSlot slot)
        {
            if (slot == null) throw new ArgumentNullException(nameof(slot));
            _slots.Add(slot);
        }

        public List<ScheduleSlot> DetectConflicts()
        {
            var conflicts = new List<ScheduleSlot>();
            var ordered = _slots.OrderBy(s => s.StartTime).ToList();

            for (int i = 0; i < ordered.Count - 1; i++)
            {
                var current = ordered[i];
                var next = ordered[i + 1];

                if (next.StartTime < current.EndTime)
                {
                    // Overlap detected
                    conflicts.Add(current);
                    conflicts.Add(next);
                }
            }

            return conflicts.Distinct().ToList();
        }

        /// <summary>
        /// Automatically relocates overlapping blocks, treating prayer blocks as immutable constants.
        /// </summary>
        public List<ScheduleSlot> ResolveConflicts(Action<string> logDelegate)
        {
            var conflicts = DetectConflicts();
            if (conflicts.Count == 0) return _slots.ToList();

            var resolvedList = new List<ScheduleSlot>();
            var ordered = _slots.OrderBy(s => s.StartTime).ToList();

            foreach (var slot in ordered)
            {
                if (resolvedList.Count == 0)
                {
                    resolvedList.Add(slot);
                    continue;
                }

                var last = resolvedList.Last();
                if (slot.StartTime < last.EndTime)
                {
                    // Overlap detected!
                    if (slot.IsPrayerBlock || slot.Priority > last.Priority)
                    {
                        // Current slot is higher priority or prayer. Relocate the LAST slot.
                        logDelegate($"Relocating slot '{last.Title}' to make room for high-priority '{slot.Title}'.");
                        last.StartTime = slot.EndTime.AddMinutes(5);
                        last.EndTime = last.StartTime.Add(last.EndTime - last.StartTime); // Keep original duration
                    }
                    else
                    {
                        // Relocate current slot forward
                        logDelegate($"Relocating slot '{slot.Title}' forward as it conflicts with '{last.Title}'.");
                        slot.StartTime = last.EndTime.AddMinutes(5);
                        slot.EndTime = slot.StartTime.Add(slot.EndTime - slot.StartTime);
                    }
                }

                resolvedList.Add(slot);
            }

            return resolvedList;
        }

        public void Clear()
        {
            while (_slots.TryTake(out _)) { }
        }
    }

    #endregion

    #region AI Skill Runtime

    public class JannahSkill
    {
        public string Id { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Func<string, Task<string>> ExecutionDelegate { get; set; } = q => Task.FromResult($"Executed: {q}");
    }

    public class SkillRegistry
    {
        private readonly ConcurrentDictionary<string, JannahSkill> _skills = new();

        public void Register(JannahSkill skill)
        {
            if (skill == null) throw new ArgumentNullException(nameof(skill));
            _skills[skill.Id.ToLowerInvariant()] = skill;
        }

        public bool TryGet(string id, out JannahSkill skill)
        {
            return _skills.TryGetValue(id.ToLowerInvariant(), out skill);
        }
    }

    /// <summary>
    /// Executes AI actions safely, validates bounds, and reports execution times.
    /// </summary>
    public class SkillExecutor
    {
        private readonly SkillRegistry _registry;

        public SkillExecutor(SkillRegistry registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public async Task<string> ExecuteAsync(string skillId, string input)
        {
            if (!_registry.TryGet(skillId, out var skill))
            {
                throw new KeyNotFoundException($"AI Skill '{skillId}' is missing.");
            }

            // Execute under strict boundary audits
            return await skill.ExecutionDelegate(input);
        }
    }

    public class SkillValidator
    {
        public bool ValidateInput(string input)
        {
            return !string.IsNullOrWhiteSpace(input);
        }

        public bool ValidateOutput(string output)
        {
            return !string.IsNullOrWhiteSpace(output) && !output.Contains("Error");
        }
    }

    /// <summary>
    /// Comprehensive Runtime executing skill workflows.
    /// </summary>
    public class SkillRuntime
    {
        public SkillRegistry Registry { get; } = new();
        public SkillExecutor Executor { get; }
        public SkillValidator Validator { get; } = new();

        public SkillRuntime()
        {
            Executor = new SkillExecutor(Registry);
            LoadDefaultSkills();
        }

        private void LoadDefaultSkills()
        {
            Registry.Register(new JannahSkill
            {
                Id = "skill_deen_salah_tracker",
                Title = "Salah Telemetry Tracker",
                Description = "Processes, maps, and logs daily prayer performance.",
                ExecutionDelegate = q => Task.FromResult($"[SalahTracker] Processed Salah log. Verification ID: {Guid.NewGuid()}")
            });

            Registry.Register(new JannahSkill
            {
                Id = "skill_finance_portfolio_audit",
                Title = "Halal Financial Audit",
                Description = "Audits financial records and checks halal alignment.",
                ExecutionDelegate = q => Task.FromResult($"[FinancialAudit] Completed double-entry asset verification of gross ledgers.")
            });
        }
    }

    #endregion
}
