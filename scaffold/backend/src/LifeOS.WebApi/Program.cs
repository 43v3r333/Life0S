using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace LifeOS.WebApi
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // 1. Add Infrastructure Services (SQL Server & DbContext)
            builder.Services.AddSqlServerDbContext(builder.Configuration.GetConnectionString("DefaultConnection"));

            // 2. Add MediatR CQRS Pipeline & FluentValidation
            builder.Services.AddMediatR(cfg => {
                cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);
            });

            // 3. Add Cognitive AI & Qdrant Client Setup
            builder.Services.AddQdrantVectorStore(builder.Configuration.GetSection("Qdrant"));
            builder.Services.AddGabrielAiChiefOfStaff(builder.Configuration.GetSection("AiEngine"));

            // 4. Configure JWT Authentication & CORS Policies
            builder.Services.AddJwtAuthentication(builder.Configuration.GetSection("Jwt"));
            builder.Services.AddCors(options => {
                options.AddPolicy("AllowFrontend", policy => 
                    policy.WithOrigins("http://localhost:3000").AllowAnyHeader().AllowAnyMethod().AllowCredentials());
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowFrontend");
            app.UseAuthentication();
            app.UseAuthorization();

            // 5. Setup Minimal API endpoints mapping to MediatR CQRS
            app.MapPost("/api/salah/log", async (LogSalahRequest request, IMediator mediator) =>
            {
                var command = new LogSalahCommand(
                    UserId: Guid.Parse("00000000-0000-0000-0000-000000000001"), // Standard single-user default GUID
                    PrayerName: request.PrayerName,
                    Status: request.Status,
                    IsCongregation: request.IsCongregation,
                    Location: request.Location
                );

                Guid logId = await mediator.Send(command);
                return Results.Created($"/api/salah/{logId}", new { Id = logId });
            })
            .WithName("LogSalah")
            .WithOpenApi()
            .RequireAuthorization();

            app.MapGet("/api/health", () => Results.Ok(new { Status = "Healthy", Codename = "Project Jannah", Stage = "Foundation" }));

            app.Run("http://0.0.0.0:3000"); // Standard binding configured for container routing
        }
    }

    // Secondary minimal stubs for Clean Architecture presentation
    public record LogSalahRequest(string PrayerName, string Status, bool IsCongregation, string Location);
    public record LogSalahCommand(Guid UserId, string PrayerName, string Status, bool IsCongregation, string Location);
    
    public interface IMediator
    {
        Task<TResponse> Send<TResponse>(object command);
    }
}

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceExtensions
    {
        public static IServiceCollection AddSqlServerDbContext(this IServiceCollection services, string connectionString) => services;
        public static IServiceCollection AddMediatR(this IServiceCollection services, Action<object> cfg) => services;
        public static IServiceCollection AddQdrantVectorStore(this IServiceCollection services, object config) => services;
        public static IServiceCollection AddGabrielAiChiefOfStaff(this IServiceCollection services, object config) => services;
        public static IServiceCollection AddJwtAuthentication(this IServiceCollection services, object config) => services;
    }
}
namespace Microsoft.AspNetCore.Builder {
    public interface IWebApplication {
        object Environment { get; }
        void UseSwagger();
        void UseSwaggerUI();
        void UseHttpsRedirection();
        void UseCors(string name);
        void UseAuthentication();
        void UseAuthorization();
        object MapPost(string r, object d);
        object MapGet(string r, object d);
        void Run(string b);
    }
    public class WebApplication {
        public static WebApplicationBuilder CreateBuilder(string[] args) => new();
    }
    public class WebApplicationBuilder {
        public ServiceCollection Services { get; } = new();
        public object Configuration { get; } = new();
        public WebApplication Build() => new();
    }
    public class ServiceCollection {}
    public static class Results {
        public static object Ok(object value) => value;
        public static object Created(string url, object value) => value;
    }
}
