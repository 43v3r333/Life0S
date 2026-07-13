using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Application.Kernel
{
    public class JannahAgent
    {
        public string Name { get; set; } = string.Empty;
        public string RoleIdentity { get; set; } = string.Empty;
        public string CorePrompt { get; set; } = string.Empty;
        public List<string> Skills { get; set; } = new();
        public bool HasMemoryAccess { get; set; } = true;
        public bool HasContextAccess { get; set; } = true;
        public List<string> Permissions { get; set; } = new();
        public string EscalationRules { get; set; } = string.Empty;
        public decimal DecisionLimitFinancial { get; set; } = 0.00m;
        public string ExpectedOutputSchema { get; set; } = "JSON";
    }

    /// <summary>
    /// Registry carrying definitions for specialized agent clones.
    /// </summary>
    public class AgentRegistry
    {
        private readonly ConcurrentDictionary<string, JannahAgent> _agents = new();

        public IReadOnlyCollection<JannahAgent> ActiveAgents => _agents.Values.ToList().AsReadOnly();

        public void Register(JannahAgent agent)
        {
            if (agent == null) throw new ArgumentNullException(nameof(agent));
            _agents[agent.Name.ToLowerInvariant()] = agent;
        }

        public bool TryGet(string name, out JannahAgent agent)
        {
            return _agents.TryGetValue(name.ToLowerInvariant(), out agent);
        }
    }

    /// <summary>
    /// Monitored telemetry metrics for agent loops.
    /// </summary>
    public class AgentTelemetryRecord
    {
        public Guid ExecutionId { get; } = Guid.NewGuid();
        public string AgentName { get; set; } = string.Empty;
        public double ProcessingTimeMs { get; set; }
        public int InputTokens { get; set; }
        public int OutputTokens { get; set; }
        public bool Succeeded { get; set; } = true;
    }

    /// <summary>
    /// Diagnostic telemetry logs.
    /// </summary>
    public class AgentTelemetry
    {
        private readonly ConcurrentQueue<AgentTelemetryRecord> _metrics = new();

        public void LogExecution(string agentName, double timeMs, int inputTokens, int outputTokens, bool success)
        {
            _metrics.Enqueue(new AgentTelemetryRecord
            {
                AgentName = agentName,
                ProcessingTimeMs = timeMs,
                InputTokens = inputTokens,
                OutputTokens = outputTokens,
                Succeeded = success
            });
        }

        public IReadOnlyCollection<AgentTelemetryRecord> GetMetrics() => _metrics.ToList().AsReadOnly();
    }

    /// <summary>
    /// Handles chronological agent scheduling checks.
    /// </summary>
    public class AgentScheduler
    {
        private readonly ConcurrentDictionary<string, string> _schedules = new();

        public void ScheduleAgentTask(string agentName, string cronExpression)
        {
            _schedules[agentName.ToLowerInvariant()] = cronExpression;
        }

        public Dictionary<string, string> GetActiveSchedules() => _schedules.ToDictionary(k => k.Key, v => v.Value);
    }

    /// <summary>
    /// Enables multi-agent team communication, message passing, and escalation protocols.
    /// </summary>
    public class AgentCoordinator
    {
        private readonly AgentRegistry _registry;

        public AgentCoordinator(AgentRegistry registry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
        }

        public string CoordinateOrEscalate(string sourceAgent, string message, decimal proposedCost)
        {
            if (!_registry.TryGet(sourceAgent, out var agent))
            {
                return "Error: Source agent unrecognized.";
            }

            if (proposedCost > agent.DecisionLimitFinancial)
            {
                // Escalate to Gabriel CoS
                return $"ESCALATED: Source '{sourceAgent}' passed message: '{message}' directly to Gabriel Chief of Staff due to financial limit violation of ${agent.DecisionLimitFinancial}.";
            }

            return $"COORDINATED: Message '{message}' handled locally within agent '{sourceAgent}' bounds.";
        }
    }

    /// <summary>
    /// Executes agent pipelines, compiling prompts and binding memories.
    /// </summary>
    public class AgentRuntime
    {
        private readonly AgentRegistry _registry;
        private readonly AgentTelemetry _telemetry;

        public AgentRuntime(AgentRegistry registry, AgentTelemetry telemetry)
        {
            _registry = registry ?? throw new ArgumentNullException(nameof(registry));
            _telemetry = telemetry ?? throw new ArgumentNullException(nameof(telemetry));
        }

        public async Task<string> ExecuteAgentAsync(string agentName, string userInput, string contextFrame, CancellationToken cancellationToken)
        {
            if (!_registry.TryGet(agentName, out var agent))
            {
                throw new KeyNotFoundException($"Agent {agentName} is not registered.");
            }

            var watch = System.Diagnostics.Stopwatch.StartNew();

            // Formulate complete contextually anchored instruction prompt
            string compiledPrompt = $@"
System Instruction: {agent.RoleIdentity}
{agent.CorePrompt}

Active Context Frame:
{contextFrame}

User Query:
{userInput}
";

            // Simulating execution latency
            await Task.Delay(30, cancellationToken);
            watch.Stop();

            // Write telemetry logs
            _telemetry.LogExecution(agentName, watch.ElapsedMilliseconds, compiledPrompt.Length / 4, 150, true);

            return $"[Response from Jannah {agent.Name}]: Acknowledged query. Context elements integrated. Core recommendation formulated successfully.";
        }
    }

    /// <summary>
    /// Master orchestrator pre-loading Gabriel and all Jannah sub-clones.
    /// </summary>
    public class AiOrchestrator
    {
        public AgentRegistry Registry { get; } = new();
        public AgentTelemetry Telemetry { get; } = new();
        public AgentScheduler Scheduler { get; } = new();
        public AgentCoordinator Coordinator { get; }
        public AgentRuntime Runtime { get; }

        public AiOrchestrator()
        {
            Coordinator = new AgentCoordinator(Registry);
            Runtime = new AgentRuntime(Registry, Telemetry);

            LoadDefaultAgents();
        }

        private void LoadDefaultAgents()
        {
            // 1. Chief of Staff (Gabriel)
            Registry.Register(new JannahAgent
            {
                Name = "Gabriel",
                RoleIdentity = "You are Gabriel, Chief of Staff and ultimate strategic commander of LifeOS.",
                CorePrompt = "Analyze all life verticals. Enforce spiritual, personal, and financial alignments.",
                Skills = new List<string> { "ContextSynthesis", "ConflictResolution", "TaskOrchestration" },
                DecisionLimitFinancial = 10000.00m
            });

            // 2. Strategic Planner
            Registry.Register(new JannahAgent
            {
                Name = "StrategicPlanner",
                RoleIdentity = "You are the Jannah Strategic Planner, converting raw life missions into hierarchical sprint goals.",
                CorePrompt = "Convert Ten Year Goals into annual quarterly milestones. Maintain strict dependencies checks.",
                Skills = new List<string> { "GoalPlanning", "DependencyAnalysis" },
                DecisionLimitFinancial = 500.00m
            });

            // 3. Finance Advisor
            Registry.Register(new JannahAgent
            {
                Name = "FinanceAdvisor",
                RoleIdentity = "You are the Jannah Halal Wealth Advisor, auditing transactions and tracking budget portfolios.",
                CorePrompt = "Enforce savings boundaries. Ensure Zakat calculations and 20% savings minimums.",
                Skills = new List<string> { "DoubleEntryAudit", "HalalScreening" },
                DecisionLimitFinancial = 0.00m // Strict escalation on financials
            });

            // 4. Islamic Advisor (Deen Coach)
            Registry.Register(new JannahAgent
            {
                Name = "IslamicAdvisor",
                RoleIdentity = "You are the Jannah Deen Coach, advising on daily spiritual obligations and character growth.",
                CorePrompt = "Prioritize Salah logs consistency, Quranic memorization, and noble moral execution.",
                Skills = new List<string> { "PrayerTracking", "SpiritualAuditing" },
                DecisionLimitFinancial = 0.00m
            });

            // 5. Marriage Advisor
            Registry.Register(new JannahAgent
            {
                Name = "MarriageAdvisor",
                RoleIdentity = "You are the Jannah Marriage Strategy Advisor, optimizing relationship harmony and mutual family support.",
                CorePrompt = "Ensure offline evening family bonding. Audit shared home logs and resolve schedule overlaps.",
                Skills = new List<string> { "FamilyHarmonyAudit", "ConflictRemediation" },
                DecisionLimitFinancial = 100.00m
            });

            // 6. Health Advisor
            Registry.Register(new JannahAgent
            {
                Name = "HealthAdvisor",
                RoleIdentity = "You are the Jannah Health & Vitality Coach, analyzing heart rate variability (HRV), sleep, and gym logs.",
                CorePrompt = "Flag sleep deficits. Ensure 4 weekly gym visits and monitor biometrics trends.",
                Skills = new List<string> { "BiometricsAnalysis", "WorkoutPlanning" },
                DecisionLimitFinancial = 150.00m
            });

            // 7. Business Advisor
            Registry.Register(new JannahAgent
            {
                Name = "BusinessAdvisor",
                RoleIdentity = "You are the Jannah Enterprise Strategy Consultant, advising on halal startups and business systems.",
                CorePrompt = "Optimize commercial monetization, operational models, and regulatory compliance.",
                Skills = new List<string> { "StartupsStrategy", "FintechModeling" },
                DecisionLimitFinancial = 2000.00m
            });

            // 8. Career Advisor
            Registry.Register(new JannahAgent
            {
                Name = "CareerAdvisor",
                RoleIdentity = "You are the Jannah Career Path Consultant, maximizing high-impact professional milestones.",
                CorePrompt = "Map corporate progression, resume enhancements, and professional networking sprints.",
                Skills = new List<string> { "CareerMapping", "NegotiationCoaching" },
                DecisionLimitFinancial = 200.00m
            });

            // 9. Learning Advisor
            Registry.Register(new JannahAgent
            {
                Name = "LearningAdvisor",
                RoleIdentity = "You are the Jannah Continuous Learning Mentor, curating educational curriculums and certification sprints.",
                CorePrompt = "Optimize study habits, tracking technical reading milestones, and course progress.",
                Skills = new List<string> { "CurriculumPlanning", "SkillAudit" },
                DecisionLimitFinancial = 100.00m
            });

            // 10. Knowledge Manager
            Registry.Register(new JannahAgent
            {
                Name = "KnowledgeManager",
                RoleIdentity = "You are the Jannah Second Brain Assistant, indexing academic papers, journals, and RAG knowledge bases.",
                CorePrompt = "Index structured vector memories. Expose relevant RAG nodes and connect semantic summaries.",
                Skills = new List<string> { "SemanticIndexing", "RAGRetrieval" },
                DecisionLimitFinancial = 50.00m
            });

            // 11. Automation Architect
            Registry.Register(new JannahAgent
            {
                Name = "AutomationArchitect",
                RoleIdentity = "You are the Jannah Integrations Engineer, mapping API automation triggers and smart device alerts.",
                CorePrompt = "Map trigger-action workflows, home-automation endpoints, and event schedules.",
                Skills = new List<string> { "WebhookConfiguration", "TriggerParsing" },
                DecisionLimitFinancial = 250.00m
            });

            // 12. Software Architect
            Registry.Register(new JannahAgent
            {
                Name = "SoftwareArchitect",
                RoleIdentity = "You are the Jannah Engineering Architect, guiding microservices design and C# clean architecture patterns.",
                CorePrompt = "Enforce Clean Architecture, SOLID, MediatR CQRS, and standard EF Core configurations.",
                Skills = new List<string> { "CodeGeneration", "DesignPatternAuditing" },
                DecisionLimitFinancial = 500.00m
            });

            // 13. Research Agent
            Registry.Register(new JannahAgent
            {
                Name = "ResearchAgent",
                RoleIdentity = "You are the Jannah Research Intelligence Agent, retrieving web groundings and academic papers.",
                CorePrompt = "Perform deep queries, compile reference citations, and synthesize objective briefings.",
                Skills = new List<string> { "WebGrounding", "CitationCompiling" },
                DecisionLimitFinancial = 200.00m
            });

            // 14. Reflection Coach
            Registry.Register(new JannahAgent
            {
                Name = "ReflectionCoach",
                RoleIdentity = "You are the Jannah Cognitive Reflection Coach, facilitating mental journaling and evening reviews.",
                CorePrompt = "Analyze emotional logs, daily accomplishments, productivity metrics, and give mindful advice.",
                Skills = new List<string> { "JournalAnalysis", "MoodTracking" },
                DecisionLimitFinancial = 0.00m
            });
        }
    }
}
