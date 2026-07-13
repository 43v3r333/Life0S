using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace LifeOS.Domain.Kernel
{
    /// <summary>
    /// Metadata detailing event telemetry, tracing context, and identity attributes.
    /// </summary>
    public class EventMetadata
    {
        public Guid CorrelationId { get; set; } = Guid.NewGuid();
        public Guid CausationId { get; set; } = Guid.NewGuid();
        public string InitiatorUser { get; set; } = "System";
        public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
        public string AssemblyQualifiedType { get; set; } = string.Empty;
    }

    /// <summary>
    /// Root definition of a domain event in LifeOS.
    /// </summary>
    public abstract class DomainEvent : IDomainEvent
    {
        public Guid EventId { get; } = Guid.NewGuid();
        public EventMetadata Metadata { get; } = new();
        public Common.DateTimeOccurred DateTimeOccurred { get; } = Common.DateTimeOccurred.Now();
    }

    /// <summary>
    /// Interface representing a physical record inside our event sourcing pipeline.
    /// </summary>
    public interface IEventRecord
    {
        Guid EventId { get; }
        string StreamId { get; }
        long Sequence { get; }
        string EventType { get; }
        string PayloadJson { get; }
        DateTime CreatedAt { get; }
    }

    /// <summary>
    /// Concrete record for the Event Store ledger.
    /// </summary>
    public class EventRecord : IEventRecord
    {
        public Guid EventId { get; set; }
        public string StreamId { get; set; } = string.Empty;
        public long Sequence { get; set; }
        public string EventType { get; set; } = string.Empty;
        public string PayloadJson { get; set; } = "{}";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Production-ready Event Store for persistence, auditing, and state rebuilding.
    /// </summary>
    public class EventStore
    {
        private readonly ConcurrentDictionary<string, List<EventRecord>> _streams = new();
        private readonly ConcurrentQueue<EventRecord> _allEvents = new();
        private long _globalSequence = 0;

        public Task SaveEventsAsync(string streamId, IEnumerable<DomainEvent> events, long expectedVersion, CancellationToken cancellationToken)
        {
            if (string.IsNullOrWhiteSpace(streamId)) throw new ArgumentNullException(nameof(streamId));
            if (events == null) throw new ArgumentNullException(nameof(events));

            var stream = _streams.GetOrAdd(streamId, _ => new List<EventRecord>());

            lock (stream)
            {
                if (expectedVersion != -1 && stream.Count != expectedVersion)
                {
                    throw new InvalidOperationException($"Concurrency violation. Expected version {expectedVersion}, actual version {stream.Count}");
                }

                foreach (var @event in events)
                {
                    long seq = Interlocked.Increment(ref _globalSequence);
                    var record = new EventRecord
                    {
                        EventId = @event.EventId,
                        StreamId = streamId,
                        Sequence = seq,
                        EventType = @event.GetType().Name,
                        PayloadJson = JsonSerializer.Serialize(@event, @event.GetType()),
                        CreatedAt = DateTime.UtcNow
                    };

                    stream.Add(record);
                    _allEvents.Enqueue(record);
                }
            }

            return Task.CompletedTask;
        }

        public Task<IReadOnlyCollection<EventRecord>> GetStreamAsync(string streamId, CancellationToken cancellationToken)
        {
            if (_streams.TryGetValue(streamId, out var stream))
            {
                lock (stream)
                {
                    return Task.FromResult<IReadOnlyCollection<EventRecord>>(stream.ToList().AsReadOnly());
                }
            }
            return Task.FromResult<IReadOnlyCollection<EventRecord>>(new List<EventRecord>().AsReadOnly());
        }

        public IReadOnlyCollection<EventRecord> GetAllEvents() => _allEvents.ToList().AsReadOnly();
    }

    /// <summary>
    /// Captures events that failed processing after exhausting all retry policy configurations.
    /// </summary>
    public class DeadLetterQueue
    {
        private readonly ConcurrentQueue<(DomainEvent Event, Exception Exception, string TargetConsumer)> _dlq = new();

        public void Enqueue(DomainEvent @event, Exception exception, string targetConsumer)
        {
            _dlq.Enqueue((@event, exception, targetConsumer));
        }

        public IReadOnlyCollection<(DomainEvent Event, Exception Exception, string TargetConsumer)> GetFailedEvents()
        {
            return _dlq.ToList().AsReadOnly();
        }

        public void Clear() => _dlq.Clear();
    }

    /// <summary>
    /// Exponential backoff policy to gracefully retry transient consumer faults.
    /// </summary>
    public class RetryPolicy
    {
        private readonly int _maxAttempts;
        private readonly TimeSpan _baseDelay;

        public RetryPolicy(int maxAttempts = 3, TimeSpan? baseDelay = null)
        {
            _maxAttempts = maxAttempts;
            _baseDelay = baseDelay ?? TimeSpan.FromMilliseconds(50);
        }

        public async Task ExecuteAsync(Func<Task> action, Func<Exception, Task> onFailure)
        {
            int attempt = 0;
            while (true)
            {
                try
                {
                    await action();
                    return;
                }
                catch (Exception ex)
                {
                    attempt++;
                    if (attempt >= _maxAttempts)
                    {
                        await onFailure(ex);
                        throw;
                    }

                    int delayMs = (int)(_baseDelay.TotalMilliseconds * Math.Pow(2, attempt));
                    await Task.Delay(delayMs);
                }
            }
        }
    }

    /// <summary>
    /// Replay Engine that streams events from the Event Store to recreate historical aggregate states.
    /// </summary>
    public class ReplayEngine
    {
        private readonly EventStore _eventStore;

        public ReplayEngine(EventStore eventStore)
        {
            _eventStore = eventStore ?? throw new ArgumentNullException(nameof(eventStore));
        }

        public async Task ReplayStreamAsync(string streamId, Func<string, string, Task> applyEventAction, CancellationToken cancellationToken)
        {
            var records = await _eventStore.GetStreamAsync(streamId, cancellationToken);
            foreach (var record in records.OrderBy(r => r.Sequence))
            {
                await applyEventAction(record.EventType, record.PayloadJson);
            }
        }
    }

    #region LifeOS Core Events List

    public class GoalCreatedEvent : DomainEvent
    {
        public Guid GoalId { get; }
        public string Title { get; }
        public GoalCreatedEvent(Guid goalId, string title) { GoalId = goalId; Title = title; }
    }

    public class GoalCompletedEvent : DomainEvent
    {
        public Guid GoalId { get; }
        public GoalCompletedEvent(Guid goalId) { GoalId = goalId; }
    }

    public class HabitCompletedEvent : DomainEvent
    {
        public Guid HabitId { get; }
        public string HabitName { get; }
        public HabitCompletedEvent(Guid habitId, string habitName) { HabitId = habitId; HabitName = habitName; }
    }

    public class PrayerLoggedEvent : DomainEvent
    {
        public Guid LogId { get; }
        public string PrayerName { get; }
        public string Status { get; }
        public PrayerLoggedEvent(Guid logId, string prayerName, string status)
        {
            LogId = logId;
            PrayerName = prayerName;
            Status = status;
        }
    }

    public class WorkoutCompletedEvent : DomainEvent
    {
        public string WorkoutType { get; }
        public double DurationMinutes { get; }
        public WorkoutCompletedEvent(string workoutType, double duration) { WorkoutType = workoutType; DurationMinutes = duration; }
    }

    public class ExpenseAddedEvent : DomainEvent
    {
        public decimal Amount { get; }
        public string Category { get; }
        public ExpenseAddedEvent(decimal amount, string category) { Amount = amount; Category = category; }
    }

    public class ProjectCreatedEvent : DomainEvent
    {
        public Guid ProjectId { get; }
        public string ProjectName { get; }
        public ProjectCreatedEvent(Guid projectId, string projectName) { ProjectId = projectId; ProjectName = projectName; }
    }

    public class TaskCompletedEvent : DomainEvent
    {
        public Guid TaskId { get; }
        public string TaskTitle { get; }
        public TaskCompletedEvent(Guid taskId, string title) { TaskId = taskId; TaskTitle = title; }
    }

    public class MeetingFinishedEvent : DomainEvent
    {
        public string Topic { get; }
        public DateTime EndTime { get; }
        public MeetingFinishedEvent(string topic) { Topic = topic; EndTime = DateTime.UtcNow; }
    }

    public class JournalCreatedEvent : DomainEvent
    {
        public Guid JournalId { get; }
        public string Title { get; }
        public JournalCreatedEvent(Guid journalId, string title) { JournalId = journalId; Title = title; }
    }

    public class MemoryStoredEvent : DomainEvent
    {
        public Guid MemoryId { get; }
        public string ContentSummary { get; }
        public MemoryStoredEvent(Guid memoryId, string summary) { MemoryId = memoryId; ContentSummary = summary; }
    }

    public class MemoryUpdatedEvent : DomainEvent
    {
        public Guid MemoryId { get; }
        public MemoryUpdatedEvent(Guid memoryId) { MemoryId = memoryId; }
    }

    public class AgentExecutedEvent : DomainEvent
    {
        public string AgentName { get; }
        public string ActionType { get; }
        public AgentExecutedEvent(string agentName, string actionType) { AgentName = agentName; ActionType = actionType; }
    }

    public class PolicyViolatedEvent : DomainEvent
    {
        public string PolicyName { get; }
        public string ViolationReason { get; }
        public PolicyViolatedEvent(string policyName, string reason) { PolicyName = policyName; ViolationReason = reason; }
    }

    public class DecisionMadeEvent : DomainEvent
    {
        public string Topic { get; }
        public double ConfidenceScore { get; }
        public DecisionMadeEvent(string topic, double score) { Topic = topic; ConfidenceScore = score; }
    }

    #endregion
}
