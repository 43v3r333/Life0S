using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

namespace LifeOS.Domain.Common
{
    /// <summary>
    /// Base marker interface for all Domain Events in LifeOS.
    /// </summary>
    public interface IDomainEvent
    {
        DateTimeOccurred DateTimeOccurred { get; }
    }

    /// <summary>
    /// Value object representing the exact time an event occurred.
    /// </summary>
    public class DateTimeOccurred : ValueObject
    {
        public DateTime Value { get; }

        public DateTimeOccurred(DateTime value)
        {
            Value = value;
        }

        public static DateTimeOccurred Now() => new(DateTime.UtcNow);

        protected override IEnumerable<object> GetEqualityComponents()
        {
            yield return Value;
        }
    }

    /// <summary>
    /// Base class for all Domain Entities in LifeOS.
    /// </summary>
    public abstract class Entity<TId> : IEquatable<Entity<TId>>
    {
        public TId Id { get; protected set; }

        protected Entity(TId id)
        {
            if (id == null)
                throw new ArgumentNullException(nameof(id));
            Id = id;
        }

        protected Entity() { } // Required for ORM

        public override bool Equals(object obj)
        {
            if (obj is not Entity<TId> other)
                return false;

            if (ReferenceEquals(this, other))
                return true;

            if (Id.Equals(default(TId)) || other.Id.Equals(default(TId)))
                return false;

            return Id.Equals(other.Id);
        }

        public bool Equals(Entity<TId> other)
        {
            return Equals((object)other);
        }

        public override int GetHashCode()
        {
            return (GetType().ToString() + Id).GetHashCode();
        }

        public static bool operator ==(Entity<TId> left, Entity<TId> right)
        {
            if (Equals(left, null))
                return Equals(right, null);

            return left.Equals(right);
        }

        public static bool operator !=(Entity<TId> left, Entity<TId> right)
        {
            return !(left == right);
        }
    }

    /// <summary>
    /// Base class for all Domain Value Objects in LifeOS.
    /// </summary>
    public abstract class ValueObject : IEquatable<ValueObject>
    {
        protected abstract IEnumerable<object> GetEqualityComponents();

        public override bool Equals(object obj)
        {
            if (obj == null || obj.GetType() != GetType())
                return false;

            var other = (ValueObject)obj;
            return GetEqualityComponents().SequenceEqual(other.GetEqualityComponents());
        }

        public bool Equals(ValueObject other)
        {
            return Equals((object)other);
        }

        public override int GetHashCode()
        {
            return GetEqualityComponents()
                .Select(x => x != null ? x.GetHashCode() : 0)
                .Aggregate((x, y) => x ^ y);
        }

        public static bool operator ==(ValueObject left, ValueObject right)
        {
            if (Equals(left, null))
                return Equals(right, null);

            return left.Equals(right);
        }

        public static bool operator !=(ValueObject left, ValueObject right)
        {
            return !(left == right);
        }
    }

    /// <summary>
    /// Base class for all Aggregate Roots in LifeOS.
    /// </summary>
    public abstract class AggregateRoot<TId> : Entity<TId>
    {
        private readonly List<IDomainEvent> _domainEvents = new();
        public IReadOnlyCollection<IDomainEvent> DomainEvents => _domainEvents.AsReadOnly();

        protected AggregateRoot(TId id) : base(id) { }
        protected AggregateRoot() : base() { }

        protected void RaiseDomainEvent(IDomainEvent domainEvent)
        {
            _domainEvents.Add(domainEvent);
        }

        public void ClearDomainEvents()
        {
            _domainEvents.Clear();
        }
    }
}
