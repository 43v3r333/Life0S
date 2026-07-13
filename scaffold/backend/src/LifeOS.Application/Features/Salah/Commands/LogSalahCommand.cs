using System;
using System.Threading;
using System.Threading.Tasks;
using LifeOS.Domain.Entities;

namespace LifeOS.Application.Features.Salah.Commands
{
    // Define the Command record (MediatR request returning Guid)
    public record LogSalahCommand(
        Guid UserId,
        string PrayerName,
        string Status,
        bool IsCongregation,
        string Location
    ) : IRequest<Guid>;

    // Define the Command Handler
    public class LogSalahCommandHandler : IRequestHandler<LogSalahCommand, Guid>
    {
        private readonly IApplicationDbContext _context;
        private readonly IAiService _aiService; // Optional integration with Gabriel CoS cognitive memory log

        public LogSalahCommandHandler(IApplicationDbContext context, IAiService aiService)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _aiService = aiService ?? throw new ArgumentNullException(nameof(aiService));
        }

        public async Task<Guid> Handle(LogSalahCommand request, CancellationToken cancellationToken)
        {
            // 1. Create the Domain Entity (Invariants are validated inside the factory method)
            var salahLog = SalahLog.Create(
                request.UserId,
                request.PrayerName,
                request.Status,
                request.IsCongregation,
                request.Location
            );

            // 2. Add entity to change tracker
            _context.SalahLogs.Add(salahLog);

            // 3. Persist changes to SQL Server
            await _context.SaveChangesAsync(cancellationToken);

            // 4. Background task: Index prayer telemetry into Cognitive Memory (Qdrant) via AI integration service
            _ = Task.Run(async () => {
                try
                {
                    await _aiService.IndexCognitiveMemoryAsync(
                        request.UserId,
                        $"Logged {request.PrayerName} Salah as {request.Status} at {DateTime.UtcNow}.",
                        cancellationToken: default
                    );
                }
                catch
                {
                    // Fail silently in background thread to preserve transaction success
                }
            }, default);

            return salahLog.Id;
        }
    }

    // Temporary basic interfaces for Clean Architecture representation
    public interface IRequest<T> {}
    public interface IRequestHandler<TRequest, TResponse> where TRequest : IRequest<TResponse>
    {
        Task<TResponse> Handle(TRequest request, CancellationToken cancellationToken);
    }
    public interface IApplicationDbContext
    {
        System.Collections.Generic.List<SalahLog> SalahLogs { get; }
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
    public interface IAiService
    {
        Task IndexCognitiveMemoryAsync(Guid userId, string description, CancellationToken cancellationToken);
    }
}
