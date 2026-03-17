import { useState, useCallback } from "react";
import { useAIEditorContext } from "./AIEditorContext";
import { runMockAI, type AIActionType } from "./mockAI";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UseAIFieldOptions {
  value:    string;
  onChange: (v: string) => void;
  /** Dot-separated key identifying this field, e.g. "headline", "services.title" */
  fieldKey: string;
}

export interface UseAIFieldReturn {
  /** Run an AI action on the current field value */
  run: (action: AIActionType) => void;
  isLoading:     boolean;
  /** Which action is currently loading — null when idle */
  loadingAction: AIActionType | null;
  /** True when there is a value saved to undo */
  canUndo:       boolean;
  /** Restore the value that existed before the last AI action */
  undo:          () => void;
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useAIField({
  value,
  onChange,
  fieldKey,
}: UseAIFieldOptions): UseAIFieldReturn {
  const { clinicContext, activeSectionId } = useAIEditorContext();

  const [isLoading,     setIsLoading]     = useState(false);
  const [loadingAction, setLoadingAction] = useState<AIActionType | null>(null);
  const [undoValue,     setUndoValue]     = useState<string | null>(null);

  const run = useCallback(
    async (action: AIActionType) => {
      if (isLoading) return;

      setIsLoading(true);
      setLoadingAction(action);
      setUndoValue(value); // snapshot for undo

      try {
        const result = await runMockAI({
          action,
          value,
          fieldKey,
          sectionId:       activeSectionId ?? "unknown",
          clinicName:      clinicContext.name,
          clinicType:      clinicContext.type,
          clinicLocation:  clinicContext.location,
        });
        onChange(result);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value, onChange, fieldKey, activeSectionId, clinicContext, isLoading]
  );

  const undo = useCallback(() => {
    if (undoValue !== null) {
      onChange(undoValue);
      setUndoValue(null);
    }
  }, [undoValue, onChange]);

  return {
    run,
    isLoading,
    loadingAction,
    canUndo: undoValue !== null,
    undo,
  };
}
