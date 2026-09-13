import {
  createContext,
  useContext,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

const DecisionsContext = createContext<
  | {
      decisions: string[];
      setDecisions: Dispatch<SetStateAction<string[]>>;
    }
  | undefined
>(undefined);

/** The result container remounts this provider when the interpretation or context changes. */
export function RecurrenceDecisionsProvider({ children }: { children: ReactNode }) {
  const [decisions, setDecisions] = useState<string[]>([]);
  return (
    <DecisionsContext.Provider value={{ decisions, setDecisions }}>
      {children}
    </DecisionsContext.Provider>
  );
}

export function useRecurrenceDecisions() {
  const value = useContext(DecisionsContext);
  if (!value) throw new Error("RecurrenceDecisionsProvider is required");
  return value;
}
