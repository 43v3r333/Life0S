using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;

namespace LifeOS.Domain.Kernel
{
    public enum GoalLevel
    {
        LifeVision,
        Mission,
        CoreValues,
        TenYear,
        ThreeYear,
        Annual,
        Quarterly,
        Monthly,
        Weekly,
        Project,
        Milestone,
        Task,
        Habit
    }

    /// <summary>
    /// Represents a single hierarchical target inside Project Jannah's Life Vision cascade.
    /// </summary>
    public class GoalNode
    {
        public Guid Id { get; } = Guid.NewGuid();
        public string Title { get; set; } = string.Empty;
        public GoalLevel Level { get; set; }
        public double ProgressPercentage { get; set; } = 0.0; // 0.0 to 100.0
        public Guid? ParentId { get; set; }
        public List<Guid> DependencyIds { get; } = new();
        public DateTime TargetCompletion { get; set; } = DateTime.UtcNow.AddMonths(3);
        public DateTime CreatedAt { get; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Checks dependencies and validates tree integrity.
    /// </summary>
    public class GoalDependencies
    {
        private readonly GoalEngine _engine;

        public GoalDependencies(GoalEngine engine)
        {
            _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        }

        public bool HasCyclicDependency(Guid startId, Guid dependencyId)
        {
            if (startId == dependencyId) return true;

            var visited = new HashSet<Guid>();
            var queue = new Queue<Guid>();
            queue.Enqueue(dependencyId);

            while (queue.Count > 0)
            {
                var currentId = queue.Dequeue();
                if (currentId == startId) return true;

                if (_engine.TryGetGoal(currentId, out var currentGoal))
                {
                    foreach (var depId in currentGoal.DependencyIds)
                    {
                        if (!visited.Contains(depId))
                        {
                            visited.Add(depId);
                            queue.Enqueue(depId);
                        }
                    }
                }
            }

            return false;
        }
    }

    /// <summary>
    /// Goal Forecaster projecting end dates based on historical velocity factors.
    /// </summary>
    public class GoalForecasting
    {
        public DateTime ForecastCompletion(GoalNode goal, double currentWeeklyProgressVelocity)
        {
            if (goal.ProgressPercentage >= 100.0) return goal.CreatedAt;
            if (currentWeeklyProgressVelocity <= 0.0) return DateTime.MaxValue; // Stagnation

            double remainingProgress = 100.0 - goal.ProgressPercentage;
            double remainingWeeks = remainingProgress / currentWeeklyProgressVelocity;

            return DateTime.UtcNow.AddDays(remainingWeeks * 7);
        }
    }

    /// <summary>
    /// Scoring algorithms matching completeness with tier urgency metrics.
    /// </summary>
    public class GoalScoring
    {
        public double CalculateIntegrityScore(IEnumerable<GoalNode> goals)
        {
            var goalsList = goals.ToList();
            if (goalsList.Count == 0) return 100.0;

            // Integrity is the weighted average progress across high priority tiers
            double totalWeight = 0.0;
            double accumulatedScore = 0.0;

            foreach (var goal in goalsList)
            {
                double weight = goal.Level switch
                {
                    GoalLevel.LifeVision => 10.0,
                    GoalLevel.Mission => 9.0,
                    GoalLevel.TenYear => 7.0,
                    GoalLevel.Annual => 5.0,
                    GoalLevel.Quarterly => 4.0,
                    GoalLevel.Weekly => 2.0,
                    _ => 1.0
                };

                totalWeight += weight;
                accumulatedScore += (goal.ProgressPercentage * weight);
            }

            return accumulatedScore / totalWeight;
        }
    }

    /// <summary>
    /// Handles evaluations.
    /// </summary>
    public class GoalReview
    {
        public string CreateReviewSummary(GoalNode goal, DateTime forecastDate)
        {
            string status = goal.ProgressPercentage >= 100.0
                ? "COMPLETED"
                : forecastDate > goal.TargetCompletion ? "SLIPPING" : "ON_TRACK";

            return $"Review for Goal '{goal.Title}' [{goal.Level}]: Progress is {goal.ProgressPercentage:F1}%. Status is {status}. Forecast completion: {forecastDate:yyyy-MM-dd}.";
        }
    }

    /// <summary>
    /// Facilitates structural planning operations.
    /// </summary>
    public class GoalPlanner
    {
        private readonly GoalEngine _engine;

        public GoalPlanner(GoalEngine engine)
        {
            _engine = engine ?? throw new ArgumentNullException(nameof(engine));
        }

        public GoalNode CreateGoal(string title, GoalLevel level, Guid? parentId = null)
        {
            if (parentId.HasValue && !_engine.TryGetGoal(parentId.Value, out _))
            {
                throw new KeyNotFoundException($"Specified parent goal ID {parentId} is missing.");
            }

            var node = new GoalNode
            {
                Title = title,
                Level = level,
                ParentId = parentId
            };

            _engine.RegisterGoal(node);
            return node;
        }
    }

    /// <summary>
    /// Primary entry manager hosting the tree structures.
    /// </summary>
    public class GoalEngine
    {
        private readonly ConcurrentDictionary<Guid, GoalNode> _goals = new();
        public GoalDependencies Dependencies { get; }
        public GoalForecasting Forecaster { get; }
        public GoalScoring Scoring { get; }
        public GoalReview Review { get; }
        public GoalPlanner Planner { get; }

        public IEnumerable<GoalNode> AllGoals => _goals.Values;

        public GoalEngine()
        {
            Dependencies = new GoalDependencies(this);
            Forecaster = new GoalForecasting();
            Scoring = new GoalScoring();
            Review = new GoalReview();
            Planner = new GoalPlanner(this);
        }

        public void RegisterGoal(GoalNode goal)
        {
            if (goal == null) throw new ArgumentNullException(nameof(goal));
            _goals[goal.Id] = goal;
        }

        public bool TryGetGoal(Guid id, out GoalNode goal)
        {
            return _goals.TryGetValue(id, out goal);
        }

        public bool AddDependency(Guid sourceId, Guid dependencyId)
        {
            if (!_goals.TryGetValue(sourceId, out var source) || !_goals.TryGetValue(dependencyId, out _))
            {
                return false;
            }

            if (Dependencies.HasCyclicDependency(sourceId, dependencyId))
            {
                return false; // Loop block
            }

            source.DependencyIds.Add(dependencyId);
            return true;
        }

        public void Clear() => _goals.Clear();
    }
}
