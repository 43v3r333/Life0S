export type EntityId = string;
export type IsoDate = string;
export type IsoTimestamp = string;

export interface DomainRecord { id: EntityId; createdAt?: IsoTimestamp; updatedAt?: IsoTimestamp; [key: string]: unknown }
export interface BankAccount extends DomainRecord { name: string; balance: number; accountType?: string; active?: boolean; balanceUpdatedAt?: IsoTimestamp }
export interface BankTransaction extends DomainRecord { date: IsoDate; description: string; amount: number; fingerprint?: string; status: string; bankAccountId?: EntityId; creditCardId?: EntityId; statementDocumentId?: EntityId }
export interface FinanceEntry extends DomainRecord { date: IsoDate; type: "income" | "expense" | "refund" | "transfer"; amount: number; category: string; description?: string }
export interface Liability extends DomainRecord { name: string; accountKind: "balance" | "recurring"; balance: number; minimumPayment: number; status: string; creditLimit?: number; nextDueDate?: IsoDate }
export interface LiabilityPayment extends DomainRecord { liabilityId: EntityId; amount: number; date: IsoDate }
export interface GoalMilestone { id: EntityId; title: string; completed: boolean; targetDate?: IsoDate; targetValue?: number; currentValue?: number; unit?: string }
export interface ProgressHistory { id: EntityId; value: number; date: IsoDate; note?: string; createdAt: IsoTimestamp }
export interface TaskRecurrenceInstance extends DomainRecord { fingerprint:string;rootTaskId:EntityId;sourceTaskId:EntityId;generatedTaskId:EntityId;dueDate:IsoDate }
export interface AccountBalanceHistory extends DomainRecord { accountId:EntityId;accountKind:"debit"|"credit";accountName:string;previousBalance:number;balance:number;effectiveDate:IsoDate;recordedAt:IsoTimestamp;sourceType:"manual"|"balance-screenshot"|"statement"|"transaction-confirmation"|"migration";sourceRecordId?:EntityId;reconciliationStatus:string;authoritative:true }
export interface GoalRecord extends DomainRecord { title: string; status?: string; progress?: number; targetDate?: IsoDate; milestones?: GoalMilestone[]; progressHistory?: ProgressHistory[] }
export interface TaskRecord extends DomainRecord { title: string; status: string; dueDate?: IsoDate; goalId?: EntityId; recurrence?: "None"|"Daily"|"Weekly"|"Monthly"; dependencies?: EntityId[]; completionHistory?: Array<{completedAt:IsoTimestamp;actualTime?:number}>; rescheduleHistory?: Array<{from?:IsoDate;to?:IsoDate;changedAt:IsoTimestamp}> }
export interface HabitRecord extends DomainRecord { name: string; frequency?: string; streak?: number }
export interface WorkShift extends DomainRecord { date: IsoDate; type: string; team?: string }
export interface WorkTask extends DomainRecord { title: string; status: string; dueDate?: IsoDate }
export interface UploadedDocument extends DomainRecord { documentType?: string; storagePath?: string; sha256?: string; accountId?: EntityId; status?: string; originalFileName?: string }
export interface AiMemory extends DomainRecord { content: string; category: string; lifecycleStatus: string; verificationStatus?: string; memoryType?: string; entityType?: string; entityId?: EntityId }
export interface AiProposal extends DomainRecord { status: string; type?: string; payload?: Record<string, unknown> }
export interface Conversation extends DomainRecord { title: string; status: string; messages: Array<{ id: string; role: "user" | "assistant" | "system"; content: string; createdAt: IsoTimestamp; [key: string]: unknown }> }
export interface AuditEvent extends DomainRecord { action: string; timestamp?: IsoTimestamp; details?: Record<string, unknown> }

export interface LifeOsDomainState extends Record<string, unknown> {
  bankAccounts?: BankAccount[]; bankTransactions?: BankTransaction[]; financeEntries?: FinanceEntry[];
  debts?: Liability[]; liabilityPayments?: LiabilityPayment[]; goals?: GoalRecord[]; tasks?: TaskRecord[];
  habits?: HabitRecord[]; workShifts?: WorkShift[]; workTasks?: WorkTask[];
  bankStatementDocuments?: UploadedDocument[]; balanceScreenshotDocuments?: UploadedDocument[];
  aiMemories?: AiMemory[]; aiActionProposals?: AiProposal[]; aiConversations?: Conversation[]; operationAudit?: AuditEvent[];
  taskRecurrenceInstances?:TaskRecurrenceInstance[];accountBalanceHistory?:AccountBalanceHistory[];
}
