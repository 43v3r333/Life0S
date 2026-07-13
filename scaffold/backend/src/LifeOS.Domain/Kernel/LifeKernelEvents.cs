using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LifeOS.Domain.Common;

namespace LifeOS.Domain.Kernel
{
    /// <summary>
    /// Represents any event of significance occurring inside the LifeOS ecosystem.
    /// </summary>
    public interface ILifeKernelEvent : IDomainEvent
    {
        Guid EventId { get; }
        string Source { get; } // e.g., "DeenModule", "HealthSensor"
        string EventType { get; } // e.g., "SalahLogged", "SleepDeficitDetected"
        string PayloadJson { get; }
    }

    /// <summary>
    /// Standard implementation of a Life Kernel Event.
    /// </summary>
    public class LifeKernelEvent : ILifeKernelEvent
    {
        public Guid EventId { get; } = Guid.NewGuid();
        public string Source { get; }
        public string EventType { get; }
        public string PayloadJson { get; }
        public DateTimeOccurred DateTimeOccurred { get; } = DateTimeOccurred.Now();

        public LifeKernelEvent(string source, string eventType, string payloadJson)
        {
            Source = source ?? throw new ArgumentNullException(nameof(source));
            EventType = eventType ?? throw new ArgumentNullException(nameof(eventType));
            PayloadJson = payloadJson ?? "{}";
        }
    }

    /// <summary>
    /// Interface for a consumer of Life Kernel Events.
    /// </summary>
    public interface ILifeKernelEventConsumer<in TEvent> where TEvent : ILifeKernelEvent
    {
        Task HandleAsync(TEvent @event, CancellationToken cancellationToken);
    }

    /// <summary>
    /// The core dispatcher & bus of LifeOS that handles modular, event-driven communication.
    /// </summary>
    public interface ILifeKernelEventBus
    {
        void Subscribe<TEvent>(ILifeKernelEventConsumer<TEvent> consumer) where TEvent : ILifeKernelEvent;
        void Unsubscribe<TEvent>(ILifeKernelEventConsumer<TEvent> consumer) where TEvent : ILifeKernelEvent;
        Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken) where TEvent : ILifeKernelEvent;
    }
}
