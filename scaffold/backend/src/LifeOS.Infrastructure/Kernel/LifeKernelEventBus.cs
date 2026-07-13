using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using LifeOS.Domain.Kernel;

namespace LifeOS.Infrastructure.Kernel
{
    /// <summary>
    /// Thread-safe, concrete in-memory implementation of the Life Kernel Event Bus.
    /// This represents the central event broker in Project Jannah's Life Kernel.
    /// </summary>
    public class LifeKernelEventBus : ILifeKernelEventBus
    {
        private readonly ConcurrentDictionary<Type, List<object>> _consumers = new();
        private readonly List<ILifeKernelInterceptor> _interceptors = new();

        public LifeKernelEventBus(IEnumerable<ILifeKernelInterceptor> interceptors = null)
        {
            if (interceptors != null)
            {
                _interceptors.AddRange(interceptors);
            }
        }

        public void RegisterInterceptor(ILifeKernelInterceptor interceptor)
        {
            if (interceptor == null) throw new ArgumentNullException(nameof(interceptor));
            if (!_interceptors.Contains(interceptor))
            {
                _interceptors.Add(interceptor);
            }
        }

        public void Subscribe<TEvent>(ILifeKernelEventConsumer<TEvent> consumer) where TEvent : ILifeKernelEvent
        {
            if (consumer == null) throw new ArgumentNullException(nameof(consumer));

            var eventType = typeof(TEvent);
            _consumers.AddOrUpdate(eventType,
                _ => new List<object> { consumer },
                (_, list) =>
                {
                    lock (list)
                    {
                        if (!list.Contains(consumer))
                        {
                            list.Add(consumer);
                        }
                    }
                    return list;
                });
        }

        public void Unsubscribe<TEvent>(ILifeKernelEventConsumer<TEvent> consumer) where TEvent : ILifeKernelEvent
        {
            if (consumer == null) throw new ArgumentNullException(nameof(consumer));

            var eventType = typeof(TEvent);
            if (_consumers.TryGetValue(eventType, out var list))
            {
                lock (list)
                {
                    list.Remove(consumer);
                }
            }
        }

        public async Task PublishAsync<TEvent>(TEvent @event, CancellationToken cancellationToken) where TEvent : ILifeKernelEvent
        {
            if (@event == null) throw new ArgumentNullException(nameof(@event));

            // 1. Run Pre-Publish Interceptors (e.g. Cognitive Logging, Schema Auditing)
            foreach (var interceptor in _interceptors)
            {
                await interceptor.OnPrePublishAsync(@event, cancellationToken);
            }

            // 2. Locate and invoke all registered consumers asynchronously
            var eventType = typeof(TEvent);
            List<Task> executionTasks = new();

            if (_consumers.TryGetValue(eventType, out var list))
            {
                List<object> consumersCopy;
                lock (list)
                {
                    consumersCopy = new List<object>(list);
                }

                foreach (var consumerObj in consumersCopy)
                {
                    if (consumerObj is ILifeKernelEventConsumer<TEvent> consumer)
                    {
                        // Launch in non-blocking tasks to isolate errors and support parallel processing
                        executionTasks.Add(Task.Run(async () =>
                        {
                            try
                            {
                                await consumer.HandleAsync(@event, cancellationToken);
                            }
                            catch (Exception ex)
                            {
                                // Log or handle consumer exception inside the kernel pipeline
                                System.Diagnostics.Debug.WriteLine($"Error executing consumer {consumer.GetType().Name} for event {@event.EventId}: {ex.Message}");
                            }
                        }, cancellationToken));
                    }
                }
            }

            // Wait for all consumers to complete handling the event
            if (executionTasks.Count > 0)
            {
                await Task.WhenAll(executionTasks);
            }

            // 3. Run Post-Publish Interceptors
            foreach (var interceptor in _interceptors)
            {
                await interceptor.OnPostPublishAsync(@event, cancellationToken);
            }
        }
    }

    /// <summary>
    /// Interceptors allow inserting middleware rules directly into the event-driven Life Kernel.
    /// Useful for telemetry loggers, cognitive memory auto-indexers, or audit controls.
    /// </summary>
    public interface ILifeKernelInterceptor
    {
        Task OnPrePublishAsync(ILifeKernelEvent @event, CancellationToken cancellationToken);
        Task OnPostPublishAsync(ILifeKernelEvent @event, CancellationToken cancellationToken);
    }
}
