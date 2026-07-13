# Project Jannah — Module Contribution and Coding Standards Guide

Welcome to the Project Jannah developer contribution guide. This document establishes step-by-step standards on how to create, implement, and integrate new operational modules (bounded contexts) into our modular monolith using the **43v3r.SDK** platform framework.

---

## 1. Quality Gates & Quality Assurance (QA)

Any pull request or code addition must satisfy the following strict requirements:
* **Zero Warnings & Errors**: Must compile successfully under standard TypeScript configurations (`tsc --noEmit`).
* **Zero Lint Issues**: Must pass all project styling, format, and static analysis checks.
* **100% Strict Typing**: No use of the `any` keyword unless specifically permitted as a wildcard in generic constraints.
* **Architecture Integrity**: No circular dependencies between slices, and absolutely no duplicated platform infrastructure (e.g., creating custom caching maps, database file writers, or manual Gemini clients is strictly forbidden).

---

## 2. Implementing a Vertical Slice (Step-by-Step)

### Step A: Define the Domain Aggregate Root
Create your aggregate model inside the `Domain/Entities` folder, extending `AggregateRoot` from the SDK:

```typescript
import { AggregateRoot } from "../../../sdk/domain.js";

export class JournalEntry extends AggregateRoot<string> {
  constructor(
    id: string,
    tenantId: string,
    createdBy: string,
    modifiedBy: string,
    createdUtc: string,
    modifiedUtc: string,
    public title: string,
    public amount: number,
    public category: string,
    version: number = 1
  ) {
    super(id, tenantId, createdBy, modifiedBy, createdUtc, modifiedUtc, version);
  }
}
```

### Step B: Write the Command, Validator, and Handler
Place them inside your `Application/Commands` vertical slice folder:

```typescript
import { ICommand, IRequestHandler } from "../../../sdk/cqrs.js";
import { Result } from "../../../sdk/result.js";
import { FluentValidator, Guard } from "../../../sdk/validation.js";

// 1. Command Payload
export class PostJournalCommand implements ICommand<string> {
  public readonly correlationId: string;
  constructor(
    public readonly title: string,
    public readonly amount: number,
    public readonly category: string,
    correlationId?: string
  ) {
    this.correlationId = correlationId || "corr_" + Math.random().toString(36).substring(2, 9);
  }
}

// 2. Validator rules
export class PostJournalValidator implements IValidator<PostJournalCommand> {
  public validate(cmd: PostJournalCommand): string | null {
    if (!cmd.title || cmd.title.length < 3) {
      return "Journal entry title must be at least 3 characters long.";
    }
    if (cmd.amount <= 0) {
      return "Transaction amount must be greater than zero.";
    }
    return null;
  }
}

// 3. Command Handler
export class PostJournalHandler implements IRequestHandler<PostJournalCommand, Result<string>> {
  public async handle(cmd: PostJournalCommand): Promise<Result<string>> {
    console.log(`[FINANCE OS] Processing journaling command for: ${cmd.title}`);
    
    // In a real module, you would save this to the Database Repository here!
    const entryId = "journal_" + Math.random().toString(36).substring(2, 7);
    
    return Result.success(entryId);
  }
}
```

### Step C: Map Routing Paths & Register OpenAPI Schema
Expose your new business capabilities inside your Express API router controller, registering endpoints dynamically in the `OpenApiGenerator`:

```typescript
import { Router } from "express";
import { mediator } from "../../../sdk/cqrs.js";
import { openApiGenerator } from "../../../sdk/openapi.js";
import { PostJournalCommand } from "./Application/Commands/PostJournalCommand.js";

export const financeRouter = Router();

// Register metadata dynamically in the OpenAPI Generator to eliminate handwritten duplications!
openApiGenerator.registerEndpoint({
  path: "/finance/journals",
  method: "post",
  summary: "Post Finance Journal Transaction",
  description: "Creates and records a Shariah-compliant financial journal ledger transaction.",
  tags: ["FinanceOS"],
  requestBodySchemaName: "PostJournalInput",
  responseSchemaName: "PostJournalResponse",
  securityRequired: true
});

financeRouter.post("/finance/journals", async (req, res) => {
  const { title, amount, category } = req.body;
  const command = new PostJournalCommand(title, amount, category);
  
  const result = await mediator.send("PostJournalCommand", command);
  if (result.isFailure) {
    return res.status(result.error!.status).json(result.error);
  }
  
  res.status(201).json({ id: result.value });
});
```

### Step D: Register in the Mediator Bootstrapper
Ensure that you register your command validators and handlers in the mediator configuration:

```typescript
import { mediator, ValidationBehavior } from "../../../sdk/index.js";
import { PostJournalCommand, PostJournalHandler, PostJournalValidator } from "./Application/Commands/PostJournal.js";

export function bootstrapFinanceModule() {
  mediator.registerHandler("PostJournalCommand", new PostJournalHandler());
  
  // Register validations to ensure they execute automatically inside the pipeline!
  const valBehavior = mediator["_behaviors"].find(b => b instanceof ValidationBehavior) as ValidationBehavior;
  if (valBehavior) {
    valBehavior.registerValidator("PostJournalCommand", new PostJournalValidator());
  }
}
```
