# Project Jannah — Folder Standards & Module Structure
Every module (bounded context) within the modular monolith follows **Vertical Slice Architecture** and **Domain-Driven Design (DDD)** standards. This file outlines directory standards and file-placement policies.

---

## 1. Directory Structure Standards

```
/src/modules/FinanceOS/                 <-- Bounded Context Directory
├── Domain/                             <-- 1. Domain Layer (Pure business logic)
│   ├── Entities/                       <-- Entity classes inheriting from Entity / AggregateRoot
│   ├── ValueObjects/                   <-- Immutable ValueObjects
│   ├── DomainEvents/                   <-- Domain events raised by Aggregates
│   ├── Specifications/                 <-- Specifications implementing BaseSpecification
│   └── BusinessRules/                  <-- Custom business rules inheriting BusinessRule
│
├── Application/                        <-- 2. Application Layer (State coordination)
│   ├── Commands/                       <-- Command payloads and RequestHandlers
│   │   ├── CreateJournal/
│   │   │   ├── CreateJournalCommand.ts
│   │   │   ├── CreateJournalHandler.ts
│   │   │   └── CreateJournalValidator.ts
│   │   └── VoidTransaction/
│   ├── Queries/                        <-- Query payloads and RequestHandlers
│   │   ├── GetLedgerSummary/
│   │   └── GetTimeline/
│   └── DTOs/                           <-- Data transfer objects
│
├── Infrastructure/                     <-- 3. Infrastructure Layer (Integration drivers)
│   ├── Persistence/                    <-- Concrete repository implementations
│   │   └── JournalRepository.ts
│   └── Services/                       <-- Concrete integrations (e.g. Stripe, bank APIs)
│
└── API/                                <-- 4. Entrypoint and Routing Controllers
    ├── FinanceController.ts            <-- Express route map matching CQRS payloads
    └── Models/                         <-- HTTP request mapping models
```

---

## 2. Layer Constraints & Rules

1. **Pure Domain Core**: The `Domain/` directory must remain completely isolated from databases, routers, and third-party SDKs. It only depends on the core primitives provided in `43v3r.SDK/domain.ts`.
2. **Feature Grouping (Vertical Slices)**: Keep commands and queries logically grouped in descriptive sub-directories rather than generic folders. For example, all code related to `CreateJournal` should reside in a single directory containing the Command, the Handler, and the Validator. This ensures ease of development, maintainability, and prevents circular dependencies.
3. **Immutability of DTOs**: DTOs returned from Queries must be immutable. Avoid modifying DTO fields once returned.
4. **Explicit Mapping**: Map database entities to DTOs in the Application layer, keeping database models separated from UI consumers.
