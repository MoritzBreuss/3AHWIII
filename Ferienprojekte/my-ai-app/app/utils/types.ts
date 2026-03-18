import type { Doc } from "../../convex/_generated/dataModel";

export type PersonWithExpenses = Doc<"people"> & {
  expenses: Doc<"expenses">[];
};
