import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";
import type { ClarificationSelection } from "@/shared/sdk";

const DecisionsContext = createContext<
  | {
      selection: ClarificationSelection | undefined;
      setSelection: Dispatch<SetStateAction<ClarificationSelection | undefined>>;
    }
  | undefined
>(undefined);

/** The result container remounts this provider when the interpretation or context changes. */
export function RecurrenceDecisionsProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<ClarificationSelection>();
  return (
    <DecisionsContext.Provider value={{ selection, setSelection }}>
      {children}
    </DecisionsContext.Provider>
  );
}

export function useRecurrenceDecisions() {
  const value = useContext(DecisionsContext);
  if (!value) throw new Error("RecurrenceDecisionsProvider is required");
  return value;
}
