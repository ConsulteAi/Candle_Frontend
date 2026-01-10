# Frontend Guide: Credit Assessment API

## Endpoint

**GET** `/credit/assess-cpf/:cpf`

### Description

Retrieves credit report data for a specific CPF, including a summary status, personal details, debts, protests, and query history.

## Response Interface (TypeScript)

Use this interface to type the response in your frontend application.

```typescript
export interface CreditReportResponse {
  /** Unique protocol ID for this query */
  protocol: string;

  /**
   * Computed Credit Status
   * - 'RESTRICTED': Has debts or protests
   * - 'CLEAR': No debts or protests found
   */
  status: "RESTRICTED" | "CLEAR";

  /** Personal Information */
  person: {
    name: string;
    document: string; // CPF
    birthDate: string;
    revenueStatus: string; // e.g., 'REGULAR'
    motherName: string;
    gender: string;
    email: string;
    mainEconomicActivity: string;
  };

  /** Financial Summary */
  financialSummary: {
    totalDebts: number;
    totalProtests: number;
    totalQueries: number;
  };

  /** List of Financial Debts */
  debts: Array<{
    value: string;
    contract: string;
    origin: string; // Creditor
    date: string; // Due date
  }>;

  /** List of Notary Protests */
  protests: Array<{
    value: string;
    notary: string; // Cartório - City
    date: string;
  }>;

  /** History of Queries (Who checked this CPF) */
  queries: Array<{
    date: string;
    entity: string;
  }>;
}
```

## Consumption Examples

### Using Fetch

```typescript
async function checkCredit(cpf: string): Promise<CreditReportResponse> {
  // Remove symbols just in case, though the API might handle it
  const cleanCpf = cpf.replace(/\D/g, "");

  const response = await fetch(`/api/credit/assess-cpf/${cleanCpf}`);

  if (!response.ok) {
    throw new Error("Failed to fetch credit report");
  }

  return response.json();
}
```

### Display Logic Example (React)

```tsx
const StatusBadge = ({ status }: { status: "RESTRICTED" | "CLEAR" }) => {
  const isRestricted = status === "RESTRICTED";

  return (
    <span style={{ color: isRestricted ? "red" : "green" }}>
      {isRestricted ? "Restrição Encontrada" : "Nada Consta"}
    </span>
  );
};
```
