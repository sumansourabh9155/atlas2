/**
 * Approval Context
 * Manages clinic versions, approval workflow, and pending changes with deep diff tracking
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import { ClinicWebsite } from "../types/clinic";
import {
  FieldChange,
  ChangeGroupSummary,
  generateDeepDiff,
  groupChangesBySection,
  getChangeStats,
} from "../lib/approval/diffGenerator";

// Re-export for components to use
export type { FieldChange, ChangeGroupSummary };

// ============================================================================
// Base Types (backward compatible)
// ============================================================================

export interface ClinicVersion {
  id: string;
  clinicId: string;
  versionNumber: number;
  createdBy: string; // user ID
  createdAt: string; // ISO timestamp
  changes: ClinicWebsite; // full clinic snapshot
  status: "draft" | "pending_review" | "approved" | "rejected";
  requestedAt?: string; // when submitted for approval
  approvalNotes?: string; // Admin feedback
  approvedBy?: string; // Admin user ID
  approvedAt?: string; // ISO timestamp
  publishedAt?: string; // when went live
}

// ============================================================================
// Enhanced Types (deep tracking)
// ============================================================================

export interface ApprovalFeedback {
  id: string;
  versionId: string;
  createdBy: string; // Admin user ID
  createdAt: string; // ISO timestamp
  type: "request_change" | "needs_review" | "approved" | "rejected";
  fieldPath?: string; // If feedback is for specific field
  message: string; // "Please use the new clinic logo URL from media library"
  resolved: boolean; // Admin marked it as resolved
  resolutionTimestamp?: string;
}

export interface ClinicVersionV2 extends ClinicVersion {
  // Enhanced fields for transparent tracking
  fieldChanges: FieldChange[]; // Detailed per-field changes
  changesSummary: ChangeGroupSummary[]; // Grouped by section for UI
  diffStats: {
    totalChanged: number;
    bySection: Record<string, number>;
    createdItems: number;
    deletedItems: number;
  };
  baseVersionId?: string; // ID of the version this is diffed against
}

export interface ApprovalWorkflow {
  id: string;
  clinicId: string;
  currentVersion: number;
  liveVersion: number;
  draftVersion: ClinicVersion;
  pendingApproval?: ClinicVersion;
  approvalHistory: ClinicVersion[];
}

export interface ApprovalWorkflowV2 extends ApprovalWorkflow {
  feedbackThread: ApprovalFeedback[]; // All feedback on current pending version
  partialApprovals?: Record<string, {
    status: "approved" | "pending" | "rejected";
    approvedAt?: string;
    approvedBy?: string;
  }>;
}

interface ApprovalState {
  workflows: Map<string, ApprovalWorkflowV2>;
  currentClinicId: string;
  pendingApprovals: (ClinicVersion | ClinicVersionV2)[];
}

interface ApprovalContextType {
  // State
  workflows: Map<string, ApprovalWorkflowV2>;
  currentClinicId: string;
  pendingApprovals: ClinicVersionV2[];

  // Original methods (maintained for backward compatibility)
  submitForApproval: (clinicId: string, changes: ClinicWebsite, userId: string) => void;
  approveChanges: (versionId: string, feedback: string, userId: string) => void;
  rejectChanges: (versionId: string, feedback: string, userId: string) => void;
  publishVersion: (versionId: string) => void;
  getPendingCount: () => number;
  getDiffSummary: (oldVersion: ClinicWebsite, newVersion: ClinicWebsite) => string[];
  getWorkflow: (clinicId: string) => ApprovalWorkflowV2 | undefined;
  setCurrentClinicId: (clinicId: string) => void;

  // New enhanced methods for deep diff tracking
  submitForApprovalWithDiff: (clinicId: string, changes: ClinicWebsite, userId: string, baseVersion?: ClinicWebsite | null) => ClinicVersionV2;
  getPendingChangesGrouped: (clinicId: string) => ChangeGroupSummary[];
  getFieldChangeHistory: (clinicId: string, fieldPath: string) => FieldChange[];
  addFeedback: (versionId: string, feedback: ApprovalFeedback) => void;
  getFeedback: (versionId: string) => ApprovalFeedback[];
  resolveFeedback: (feedbackId: string) => void;
  getChangeStats: (versionId: string) => any;
}

const ApprovalContext = createContext<ApprovalContextType | undefined>(undefined);

export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ApprovalState>({
    workflows: new Map(),
    currentClinicId: "",
    pendingApprovals: [],
  });

  const generateId = () => `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const getDiffSummary = useCallback(
    (oldVersion: ClinicWebsite, newVersion: ClinicWebsite): string[] => {
      const diffs: string[] = [];

      // Check general info
      if (oldVersion.general.name !== newVersion.general.name) {
        diffs.push(`Name: "${oldVersion.general.name}" → "${newVersion.general.name}"`);
      }
      if (oldVersion.general.tagline !== newVersion.general.tagline) {
        diffs.push(`Tagline: Updated`);
      }
      if (oldVersion.general.primaryColor !== newVersion.general.primaryColor) {
        diffs.push(`Primary color: Changed`);
      }

      // Check contact info
      if (oldVersion.contact.phone !== newVersion.contact.phone) {
        diffs.push(`Phone: "${oldVersion.contact.phone}" → "${newVersion.contact.phone}"`);
      }
      if (oldVersion.contact.email !== newVersion.contact.email) {
        diffs.push(`Email: "${oldVersion.contact.email}" → "${newVersion.contact.email}"`);
      }

      // Check services
      if (oldVersion.services.length !== newVersion.services.length) {
        diffs.push(`Services: ${oldVersion.services.length} → ${newVersion.services.length}`);
      }

      // Check veterinarians
      if (oldVersion.veterinarians.length !== newVersion.veterinarians.length) {
        diffs.push(
          `Veterinarians: ${oldVersion.veterinarians.length} → ${newVersion.veterinarians.length}`
        );
      }

      // Check blocks
      if (oldVersion.blocks.length !== newVersion.blocks.length) {
        diffs.push(`Page blocks: ${oldVersion.blocks.length} → ${newVersion.blocks.length}`);
      }

      return diffs.length > 0 ? diffs : ["No significant changes detected"];
    },
    []
  );

  const submitForApproval = useCallback(
    (clinicId: string, changes: ClinicWebsite, userId: string) => {
      const versionId = generateId();
      const newVersion: ClinicVersion = {
        id: versionId,
        clinicId,
        versionNumber: 1,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        changes,
        status: "pending_review",
        requestedAt: new Date().toISOString(),
      };

      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);
        const workflow = newWorkflows.get(clinicId) || ({
          id: `w-${clinicId}`,
          clinicId,
          currentVersion: 0,
          liveVersion: 0,
          draftVersion: newVersion,
          approvalHistory: [],
          feedbackThread: [],
        } as ApprovalWorkflowV2);

        workflow.pendingApproval = newVersion;
        newWorkflows.set(clinicId, workflow);

        return {
          ...prevState,
          workflows: newWorkflows,
          pendingApprovals: Array.from(newWorkflows.values()).flatMap(
            (w) => w.pendingApproval ? [w.pendingApproval] : []
          ),
        };
      });
    },
    []
  );

  const approveChanges = useCallback(
    (versionId: string, feedback: string, userId: string) => {
      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);

        for (const workflow of newWorkflows.values()) {
          if (workflow.pendingApproval?.id === versionId) {
            workflow.pendingApproval.status = "approved";
            workflow.pendingApproval.approvedBy = userId;
            workflow.pendingApproval.approvedAt = new Date().toISOString();
            workflow.pendingApproval.approvalNotes = feedback;
            workflow.approvalHistory.push(workflow.pendingApproval);
            workflow.pendingApproval = undefined;
          }
        }

        const pendingApprovals = Array.from(newWorkflows.values()).flatMap(
          (w) => w.pendingApproval ? [w.pendingApproval] : []
        );

        return {
          ...prevState,
          workflows: newWorkflows,
          pendingApprovals,
        } as ApprovalState;
      });
    },
    []
  );

  const rejectChanges = useCallback(
    (versionId: string, feedback: string, userId: string) => {
      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);

        for (const workflow of newWorkflows.values()) {
          if (workflow.pendingApproval?.id === versionId) {
            workflow.pendingApproval.status = "rejected";
            workflow.pendingApproval.approvedBy = userId;
            workflow.pendingApproval.approvedAt = new Date().toISOString();
            workflow.pendingApproval.approvalNotes = feedback;
            workflow.approvalHistory.push(workflow.pendingApproval);
            workflow.pendingApproval = undefined;
          }
        }

        const pendingApprovals = Array.from(newWorkflows.values()).flatMap(
          (w) => w.pendingApproval ? [w.pendingApproval] : []
        );

        return {
          ...prevState,
          workflows: newWorkflows,
          pendingApprovals,
        } as ApprovalState;
      });
    },
    []
  );

  const publishVersion = useCallback((versionId: string) => {
    setState((prevState) => {
      const newWorkflows = new Map(prevState.workflows);

      for (const workflow of newWorkflows.values()) {
        if (workflow.pendingApproval?.id === versionId) {
          workflow.pendingApproval.status = "approved";
          workflow.pendingApproval.publishedAt = new Date().toISOString();
          workflow.liveVersion = workflow.currentVersion + 1;
          workflow.approvalHistory.push(workflow.pendingApproval);
          workflow.pendingApproval = undefined;
        }
      }

      const pendingApprovals = Array.from(newWorkflows.values()).flatMap(
        (w) => w.pendingApproval ? [w.pendingApproval] : []
      );

      return {
        ...prevState,
        workflows: newWorkflows,
        pendingApprovals,
      } as ApprovalState;
    });
  }, []);

  const getPendingCount = useCallback(() => {
    return state.pendingApprovals.length;
  }, [state.pendingApprovals.length]);

  const getWorkflow = useCallback(
    (clinicId: string) => {
      return state.workflows.get(clinicId);
    },
    [state.workflows]
  );

  const setCurrentClinicId = useCallback((clinicId: string) => {
    setState((prevState) => ({
      ...prevState,
      currentClinicId: clinicId,
    }));
  }, []);

  // ============================================================================
  // New enhanced methods for deep diff tracking
  // ============================================================================

  const submitForApprovalWithDiff = useCallback(
    (clinicId: string, changes: ClinicWebsite, userId: string, baseVersion?: ClinicWebsite | null): ClinicVersionV2 => {
      const versionId = generateId();
      const workflow = state.workflows.get(clinicId);

      // Use provided baseVersion, or look up from workflow history
      let compareVersion: ClinicWebsite | null = baseVersion || null;
      if (compareVersion === null && baseVersion === undefined) {
        const historyVersion = workflow?.approvalHistory?.[workflow.approvalHistory.length - 1]?.changes;
        const draftVersion = workflow?.draftVersion?.changes as ClinicWebsite | undefined;
        compareVersion = (historyVersion || draftVersion) as ClinicWebsite | null;
      }

      // Generate deep diff
      const fieldChanges = generateDeepDiff(compareVersion, changes);
      const changesSummary = groupChangesBySection(fieldChanges);
      const diffStats = getChangeStats(fieldChanges);

      const newVersion: ClinicVersionV2 = {
        id: versionId,
        clinicId,
        versionNumber: 1,
        createdBy: userId,
        createdAt: new Date().toISOString(),
        changes,
        status: "pending_review",
        requestedAt: new Date().toISOString(),
        fieldChanges,
        changesSummary,
        diffStats,
        baseVersionId: workflow?.liveVersion ? `v-${workflow.liveVersion}` : undefined,
      };

      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);
        const wf = newWorkflows.get(clinicId) || {
          id: `w-${clinicId}`,
          clinicId,
          currentVersion: 0,
          liveVersion: 0,
          draftVersion: newVersion as ClinicVersion,
          approvalHistory: [],
          feedbackThread: [],
        };

        wf.pendingApproval = newVersion as ClinicVersion;
        newWorkflows.set(clinicId, wf);

        return {
          ...prevState,
          workflows: newWorkflows,
          pendingApprovals: Array.from(newWorkflows.values()).flatMap(
            (w) => w.pendingApproval ? [w.pendingApproval as ClinicVersionV2] : []
          ),
        };
      });

      return newVersion;
    },
    [state.workflows]
  );

  const getPendingChangesGrouped = useCallback(
    (clinicId: string): ChangeGroupSummary[] => {
      const workflow = state.workflows.get(clinicId);
      if (!workflow?.pendingApproval) return [];
      const pending = workflow.pendingApproval as ClinicVersionV2;
      return pending.changesSummary || [];
    },
    [state.workflows]
  );

  const getFieldChangeHistory = useCallback(
    (clinicId: string, fieldPath: string): FieldChange[] => {
      const history: FieldChange[] = [];
      const workflow = state.workflows.get(clinicId);
      if (!workflow) return history;

      // Search through approval history
      for (const version of workflow.approvalHistory) {
        const v2 = version as ClinicVersionV2;
        if (v2.fieldChanges) {
          history.push(...v2.fieldChanges.filter((fc) => fc.path === fieldPath));
        }
      }

      // Check pending approval
      if (workflow.pendingApproval) {
        const pending = workflow.pendingApproval as ClinicVersionV2;
        if (pending.fieldChanges) {
          history.push(...pending.fieldChanges.filter((fc) => fc.path === fieldPath));
        }
      }

      return history;
    },
    [state.workflows]
  );

  const addFeedback = useCallback(
    (versionId: string, feedback: ApprovalFeedback) => {
      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);

        for (const workflow of newWorkflows.values()) {
          if (workflow.pendingApproval?.id === versionId) {
            const wf = workflow as ApprovalWorkflowV2;
            if (!wf.feedbackThread) {
              wf.feedbackThread = [];
            }
            wf.feedbackThread.push({
              ...feedback,
              id: generateId(),
              versionId,
            });
          }
        }

        return {
          ...prevState,
          workflows: newWorkflows,
        };
      });
    },
    []
  );

  const getFeedback = useCallback(
    (versionId: string): ApprovalFeedback[] => {
      for (const workflow of state.workflows.values()) {
        if (workflow.pendingApproval?.id === versionId) {
          const wf = workflow as ApprovalWorkflowV2;
          return wf.feedbackThread || [];
        }
      }
      return [];
    },
    [state.workflows]
  );

  const resolveFeedback = useCallback(
    (feedbackId: string) => {
      setState((prevState) => {
        const newWorkflows = new Map(prevState.workflows);

        for (const workflow of newWorkflows.values()) {
          const wf = workflow as ApprovalWorkflowV2;
          if (wf.feedbackThread) {
            const feedback = wf.feedbackThread.find((f) => f.id === feedbackId);
            if (feedback) {
              feedback.resolved = true;
              feedback.resolutionTimestamp = new Date().toISOString();
            }
          }
        }

        return {
          ...prevState,
          workflows: newWorkflows,
        };
      });
    },
    []
  );

  const getChangeStatsForVersion = useCallback(
    (versionId: string) => {
      for (const workflow of state.workflows.values()) {
        if (workflow.pendingApproval?.id === versionId) {
          const v2 = workflow.pendingApproval as ClinicVersionV2;
          return v2.diffStats;
        }
      }
      return null;
    },
    [state.workflows]
  );

  const value: ApprovalContextType = {
    workflows: state.workflows,
    currentClinicId: state.currentClinicId,
    pendingApprovals: state.pendingApprovals as ClinicVersionV2[],
    submitForApproval,
    approveChanges,
    rejectChanges,
    publishVersion,
    getPendingCount,
    getDiffSummary,
    getWorkflow,
    setCurrentClinicId,
    // New methods
    submitForApprovalWithDiff,
    getPendingChangesGrouped,
    getFieldChangeHistory,
    addFeedback,
    getFeedback,
    resolveFeedback,
    getChangeStats: getChangeStatsForVersion,
  };

  return (
    <ApprovalContext.Provider value={value}>{children}</ApprovalContext.Provider>
  );
}

export function useApproval() {
  const context = useContext(ApprovalContext);
  if (!context) {
    throw new Error("useApproval must be used within ApprovalProvider");
  }
  return context;
}
