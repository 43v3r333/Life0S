# Project Jannah: LifeOS Coding Standards
Version: 0.1.0-Foundation

This document establishes the official development and style guidelines for **LifeOS (Project Jannah)** to ensure maintainability, scalability, and strict isolation of concerns.

---

## 1. Domain-Driven Design (DDD) Rules

### Entities and Aggregates
1. **Protected Constructors**: All entity constructors must be protected or private to prevent bypassing domain rules. Use public static factory methods (e.g., `Create`) to instantiate entities safely.
2. **Read-Only Collections**: Expose collections in entities as `IReadOnlyCollection<T>` backed by private lists to prevent external collection modifications:
   ```csharp
   private readonly List<SalahRecord> _salahRecords = new();
   public IReadOnlyCollection<SalahRecord> SalahRecords => _salahRecords.AsReadOnly();
   ```
3. **No Anemic Models**: Do not write entities with only getter and setter properties. State changes must happen through explicit, descriptive domain methods (e.g., `CompleteHabit(DateTime timestamp)` instead of `IsCompleted = true`).
4. **Id Encapsulation**: Use strongly-typed IDs (e.g., `UserId`, `SalahId` wrapping GUIDs or records) to prevent mixing up entity identifiers.

### Value Objects
1. Value objects must be **immutable**.
2. Value objects must inherit from a base `ValueObject` class (C#) or be structured as deep-frozen objects (TypeScript) that compare by value rather than reference.
3. Example: `Money` should package `decimal Amount` and `string Currency`.

---

## 2. Backend Coding Standards (ASP.NET Core 9 / C#)

### Clean Code Practices
- **Nullability**: Enable nullable reference types (`<Nullable>enable</Nullable>`) and strictly check for nulls.
- **Asynchronous Everything**: Use `async` and `await` for all I/O operations (Database, AI requests, File system). Always pass `CancellationToken` through the stack.
- **Explicit Access Modifiers**: Avoid default access modifiers. Explicitly declare `public`, `private`, `protected`, `internal`.

### CQRS & MediatR Pattern
- Place Commands, Queries, Handlers, and DTOs in the **Application** layer under specific domain feature folders.
- Follow the suffix naming conventions:
  - Commands: `Create[Entity]Command`, `Update[Entity]Command`, `Delete[Entity]Command`.
  - Queries: `Get[Entity]ByIdQuery`, `Get[Entity]ListQuery`, `Get[Entity]StatisticsQuery`.
- Separate Command Handlers into their own classes to maintain small, cohesive files:
  ```csharp
  public class CreateHabitCommandHandler : IRequestHandler<CreateHabitCommand, Guid>
  {
      private readonly IApplicationDbContext _context;
      // Constructor injection...
  }
  ```

---

## 3. Frontend Coding Standards (NextJS / React 19 / TypeScript)

### Modular Architecture
- **Do NOT consolidate all logic into single massive files.**
- Declare shared interfaces in `src/types/` (or `src/types.ts` in Vite).
- Split large files into smaller React components under `/src/components/` (or `/components/ui/` for low-level components).
- Business logic should be kept in **custom hooks** (e.g., `useSalahTracker.ts`, `useWealthLedger.ts`) rather than component bodies to allow mock testing.

### Component Structure & Tailwind v4 Style
- Write components as pure functional components using TypeScript.
- Define prop interfaces explicitly.
- Use **Tailwind v4** classes directly for structural, text, color, and animation designs.
- Ensure 100% responsiveness using mobile-first screens (`sm:`, `md:`, `lg:`, `xl:`).
- Keep focus on excellent typography, negative space, and appropriate padding-density (Swiss-modern UI vibe).
- Ensure high-contrast dark and light states (defaulting to high-contrast modern off-white or slate backgrounds).

### State Management
- **Local State**: Use standard React `useState` and `useReducer` for layout and single-view transient state.
- **Server Cache**: Use `@tanstack/react-query` to handle all server-side API data fetching, caching, invalidation, and synchronization.
- **Persistent State**: Use `localStorage` on the client only for local configurations (e.g., local mock, theme preference).

---

## 4. Error Handling and Logging

### Backend Pipeline
1. Do not use generic `try-catch` blocks everywhere. Let exceptions bubble up to a global **Exception Handling Middleware**.
2. Map custom Domain Exceptions (e.g., `SalahAlreadyLoggedException`, `InsufficientZakatFundsException`) to appropriate HTTP status codes (400 Bad Request, 409 Conflict) inside the middleware.
3. Use Structured Logging (Serilog) with properties rather than raw strings:
   ```csharp
   _logger.LogInformation("Salah logged successfully for user {UserId} with status {Status}", userId, status);
   ```

### Frontend Guarding
1. Wrap key pages/features in React **Error Boundaries** to catch component render crashes and display interactive recovery panels.
2. Gracefully handle API failures with user-friendly alerts, toast messages, and visual empty/retry states.
