using System;
using LifeOS.Domain.Common;
using LifeOS.Domain.Events;
using LifeOS.Domain.Exceptions;

namespace LifeOS.Domain.Entities
{
    /// <summary>
    /// Represents an aggregate root tracking a daily Islamic prayer (Salah).
    /// </summary>
    public class SalahLog : AuditableEntity
    {
        public Guid Id { get; private set; }
        public Guid UserId { get; private set; }
        public string PrayerName { get; private set; } // Fajr, Dhuhr, Asr, Maghrib, Isha
        public DateTime PrayedAt { get; private set; }
        public string Status { get; private set; } // PrayedOnTime, PrayedLate, Missed, Excused
        public bool IsCongregation { get; private set; } // Jama'ah
        public string Location { get; private set; } // Masjid, Home, Office

        // Private constructor for EF Core
        private SalahLog() { }

        public static SalahLog Create(Guid userId, string prayerName, string status, bool isCongregation, string location)
        {
            if (string.IsNullOrWhiteSpace(prayerName))
                throw new DomainException("Prayer name cannot be empty.");

            // Standardize prayer names
            string normalizedName = prayerName.Trim();
            if (normalizedName != "Fajr" && normalizedName != "Dhuhr" && normalizedName != "Asr" && normalizedName != "Maghrib" && normalizedName != "Isha")
                throw new DomainException($"Invalid Islamic prayer name: {prayerName}");

            var log = new SalahLog
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                PrayerName = normalizedName,
                PrayedAt = DateTime.UtcNow,
                Status = status ?? "PrayedOnTime",
                IsCongregation = isCongregation,
                Location = location ?? "Home"
            };

            // Register domain event for achievements or statistics updates
            log.AddDomainEvent(new SalahLoggedEvent(log));

            return log;
        }

        public void UpdateStatus(string newStatus)
        {
            if (Status == "Missed" && newStatus == "PrayedOnTime")
                throw new DomainException("Cannot mark a previously missed prayer as prayed on time retrospectively.");

            Status = newStatus;
            AddDomainEvent(new SalahStatusUpdatedEvent(this));
        }
    }
}
namespace LifeOS.Domain.Common {
    public abstract class AuditableEntity {
        public DateTime Created { get; set; } = DateTime.UtcNow;
        public string CreatedBy { get; set; } = "System";
        public DateTime? LastModified { get; set; }
        private readonly System.Collections.Generic.List<object> _domainEvents = new();
        public System.Collections.Generic.IReadOnlyCollection<object> DomainEvents => _domainEvents.AsReadOnly();
        public void AddDomainEvent(object domainEvent) => _domainEvents.Add(domainEvent);
        public void ClearDomainEvents() => _domainEvents.Clear();
    }
}
namespace LifeOS.Domain.Events {
    public class SalahLoggedEvent {
        public object Log { get; }
        public SalahLoggedEvent(object log) { Log = log; }
    }
    public class SalahStatusUpdatedEvent {
        public object Log { get; }
        public SalahStatusUpdatedEvent(object log) { Log = log; }
    }
}
namespace LifeOS.Domain.Exceptions {
    public class DomainException : Exception {
        public DomainException(string message) : base(message) { }
    }
}
