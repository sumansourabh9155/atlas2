/**
 * CSVImportModal — 3-step CSV bulk import flow.
 *
 * Step 1 — Upload:   Download template → drag-drop or click to choose CSV
 * Step 2 — Preview:  Parsed table with row-level validation, error highlighting
 * Step 3 — Done:     Import summary with counts and any error details
 *
 * Usage:
 *   <CSVImportModal
 *     open={showImport}
 *     onClose={() => setShowImport(false)}
 *     schema={VET_SCHEMA}
 *     onImport={(rows) => addVets(rows)}
 *   />
 *
 * schema defines the columns, labels, required flag, and validation function.
 */

import React, { useState, useRef, useCallback } from "react";
import {
  Download, Upload, AlertCircle, CheckCircle2,
  X, ChevronRight, FileText, ArrowLeft,
} from "lucide-react";
import { Button } from "./Button";

/* ── Schema types ─────────────────────────────────────────────────── */

export interface CSVColumn {
  key:       string;
  label:     string;
  required?: boolean;
  validate?: (val: string) => string | null;  // null = valid, string = error message
  hint?:     string;                          // shown in template header comment
}

export interface CSVSchema {
  entityName: string;  // e.g. "Veterinarian"
  columns:    CSVColumn[];
  /** Used to generate the example row in the template */
  exampleRow: Record<string, string>;
}

/** A parsed CSV row: column key → string value */
export type ParsedRow = Record<string, string>;

/** Validated row with optional per-column errors */
export interface ValidatedRow {
  rowIndex:  number;
  data:      ParsedRow;
  errors:    Record<string, string>;  // column key → error message
  hasErrors: boolean;
}

/* ── CSV parser (native, no external deps) ────────────────────────── */

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch   = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') { field += '"'; i++; }
      else if (ch === '"')            { inQuotes = false; }
      else                            { field += ch; }
    } else {
      if      (ch === '"')                 { inQuotes = true; }
      else if (ch === ",")                 { row.push(field.trim()); field = ""; }
      else if (ch === "\r" && next === "\n") { row.push(field.trim()); rows.push(row); row = []; field = ""; i++; }
      else if (ch === "\n" || ch === "\r") { row.push(field.trim()); rows.push(row); row = []; field = ""; }
      else                                 { field += ch; }
    }
  }
  if (field || row.length) { row.push(field.trim()); rows.push(row); }

  return rows.filter((r) => r.some((c) => c !== ""));
}

function buildTemplate(schema: CSVSchema): string {
  const headers = schema.columns.map((c) => c.label).join(",");
  const example = schema.columns.map((c) => {
    const val = schema.exampleRow[c.key] ?? "";
    return val.includes(",") ? `"${val}"` : val;
  }).join(",");
  return `${headers}\n${example}\n`;
}

function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function validateRows(raw: string[][], schema: CSVSchema): ValidatedRow[] {
  if (raw.length < 2) return [];

  const headers = raw[0].map((h) => h.trim().toLowerCase());
  const colMap  = schema.columns.map((col) => {
    const idx = headers.findIndex((h) =>
      h === col.label.toLowerCase() || h === col.key.toLowerCase()
    );
    return { col, idx };
  });

  return raw.slice(1).map((rawRow, i) => {
    const data: ParsedRow  = {};
    const errors: Record<string, string> = {};

    for (const { col, idx } of colMap) {
      const val = idx >= 0 ? (rawRow[idx] ?? "").trim() : "";
      data[col.key] = val;

      if (col.required && !val) {
        errors[col.key] = `${col.label} is required`;
      } else if (col.validate) {
        const err = col.validate(val);
        if (err) errors[col.key] = err;
      }
    }

    return { rowIndex: i + 2, data, errors, hasErrors: Object.keys(errors).length > 0 };
  });
}

/* ── Step indicator ───────────────────────────────────────────────── */

function StepPip({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
      done   ? "bg-teal-600 text-white" :
      active ? "bg-teal-600 text-white ring-4 ring-teal-100" :
               "bg-gray-200 text-gray-400"
    }`}>
      {done ? <CheckCircle2 size={12} /> : n}
    </div>
  );
}

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  const labels = ["Upload", "Preview & Validate", "Done"];
  return (
    <div className="flex items-center gap-0 px-6 py-4 border-b border-gray-100 bg-gray-50/60">
      {labels.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex items-center gap-2">
            <StepPip n={i + 1} active={step === i + 1} done={step > i + 1} />
            <span className={`text-xs font-medium ${step === i + 1 ? "text-teal-700" : step > i + 1 ? "text-gray-500" : "text-gray-300"}`}>
              {label}
            </span>
          </div>
          {i < labels.length - 1 && (
            <ChevronRight size={14} className="mx-2 text-gray-300 flex-shrink-0" aria-hidden="true" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */

interface CSVImportModalProps {
  open:       boolean;
  onClose:    () => void;
  schema:     CSVSchema;
  onImport:   (rows: ParsedRow[]) => void;
}

export function CSVImportModal({ open, onClose, schema, onImport }: CSVImportModalProps) {
  const [step,     setStep]     = useState<1 | 2 | 3>(1);
  const [rows,     setRows]     = useState<ValidatedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number }>({ imported: 0, skipped: 0 });
  const fileRef = useRef<HTMLInputElement>(null);

  const validRows   = rows.filter((r) => !r.hasErrors);
  const invalidRows = rows.filter((r) =>  r.hasErrors);

  const resetState = () => {
    setStep(1);
    setRows([]);
    setFileName("");
    setIsDragging(false);
    setParseError(null);
    setImportResult({ imported: 0, skipped: 0 });
  };

  const handleClose = () => { resetState(); onClose(); };

  const processFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv") && file.type !== "text/csv" && file.type !== "application/vnd.ms-excel") {
      setParseError("Please upload a .csv file.");
      return;
    }
    setParseError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text  = (e.target?.result as string) ?? "";
        const raw   = parseCSV(text);
        if (raw.length < 2) {
          setParseError("The file appears to be empty or has no data rows.");
          return;
        }
        const validated = validateRows(raw, schema);
        if (validated.length === 0) {
          setParseError("No data rows found after the header.");
          return;
        }
        setRows(validated);
        setStep(2);
      } catch {
        setParseError("Could not parse this file. Please check it matches the template.");
      }
    };
    reader.readAsText(file);
  }, [schema]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleImport = () => {
    const toImport = validRows.map((r) => r.data);
    onImport(toImport);
    setImportResult({ imported: toImport.length, skipped: invalidRows.length });
    setStep(3);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-import-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl flex flex-col overflow-hidden max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 id="csv-import-title" className="text-base font-semibold text-gray-900">
              Import {schema.entityName}s via CSV
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {step === 1 && "Upload a CSV file using the template below"}
              {step === 2 && `${rows.length} row${rows.length !== 1 ? "s" : ""} found — review before importing`}
              {step === 3 && "Import complete"}
            </p>
          </div>
          <button
            onClick={handleClose}
            aria-label="Close import modal"
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Step indicator */}
        <StepIndicator step={step} />

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto">

          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <div className="p-6 space-y-5">

              {/* Template download */}
              <div className="flex items-start gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <FileText size={20} className="text-blue-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-blue-900 mb-0.5">Step 1: Download the template</p>
                  <p className="text-xs text-blue-600 mb-3">
                    Use the official template to ensure your data matches the expected format.
                    Required columns are marked with <strong>*</strong>.
                  </p>
                  <div className="text-[11px] text-blue-500 mb-3">
                    <strong>Columns:</strong>{" "}
                    {schema.columns.map((c) => `${c.label}${c.required ? "*" : ""}`).join(" · ")}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Download}
                    onClick={() => downloadCSV(buildTemplate(schema), `${schema.entityName.toLowerCase()}s-template.csv`)}
                  >
                    Download Template
                  </Button>
                </div>
              </div>

              {/* Drop zone */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Step 2: Upload your CSV</p>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fileRef.current?.click(); } }}
                  aria-label="Upload CSV file"
                  className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                    isDragging
                      ? "border-teal-400 bg-teal-50/60 scale-[1.01]"
                      : "border-gray-300 hover:border-teal-300 hover:bg-teal-50/20"
                  }`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleFileChange}
                    aria-hidden="true"
                  />
                  <Upload size={28} className={`mx-auto mb-3 ${isDragging ? "text-teal-500" : "text-gray-300"}`} aria-hidden="true" />
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {isDragging ? "Drop your CSV here" : "Drag & drop your CSV file here"}
                  </p>
                  <p className="text-xs text-gray-400">or click to browse · .csv files only</p>
                </div>

                {parseError && (
                  <div className="flex items-center gap-2 mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle size={14} className="text-red-500 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs text-red-600">{parseError}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Preview ── */}
          {step === 2 && (
            <div className="p-6 space-y-4">

              {/* Validation summary */}
              <div className={`flex items-center gap-4 p-3 rounded-xl ${
                invalidRows.length === 0 ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"
              }`}>
                {invalidRows.length === 0 ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0" aria-hidden="true" />
                    <p className="text-xs font-semibold text-emerald-800">
                      All {rows.length} rows are valid — ready to import!
                    </p>
                  </>
                ) : (
                  <>
                    <AlertCircle size={16} className="text-amber-600 flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">
                        {validRows.length} of {rows.length} rows are valid.{" "}
                        {invalidRows.length} row{invalidRows.length !== 1 ? "s" : ""} will be skipped.
                      </p>
                      <p className="text-[10px] text-amber-600 mt-0.5">
                        Fix errors in your CSV and re-upload, or import only the valid rows now.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Table preview */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: "360px" }}>
                  <table className="w-full text-xs border-collapse">
                    <thead className="sticky top-0 bg-gray-50 z-10">
                      <tr>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-500 border-b border-gray-200 w-10">
                          Row
                        </th>
                        {schema.columns.map((col) => (
                          <th key={col.key} className="px-3 py-2.5 text-left font-semibold text-gray-500 border-b border-gray-200 whitespace-nowrap">
                            {col.label}
                            {col.required && <span className="text-red-400 ml-0.5">*</span>}
                          </th>
                        ))}
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-500 border-b border-gray-200 w-20">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr
                          key={row.rowIndex}
                          className={`border-b border-gray-50 last:border-0 ${
                            row.hasErrors ? "bg-red-50/60" : "hover:bg-gray-50/40"
                          }`}
                        >
                          <td className="px-3 py-2.5 text-gray-400 font-mono">{row.rowIndex}</td>
                          {schema.columns.map((col) => {
                            const err = row.errors[col.key];
                            return (
                              <td key={col.key} className="px-3 py-2.5">
                                {err ? (
                                  <div>
                                    <span className={`inline-block max-w-[160px] truncate align-bottom ${!row.data[col.key] ? "text-gray-300 italic" : "text-gray-600"}`}>
                                      {row.data[col.key] || "—"}
                                    </span>
                                    <p className="text-[10px] text-red-500 mt-0.5">{err}</p>
                                  </div>
                                ) : (
                                  <span className="inline-block max-w-[180px] truncate text-gray-700" title={row.data[col.key]}>
                                    {row.data[col.key] || <span className="text-gray-300 italic">—</span>}
                                  </span>
                                )}
                              </td>
                            );
                          })}
                          <td className="px-3 py-2.5">
                            {row.hasErrors ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-semibold whitespace-nowrap">
                                <X size={9} /> Invalid
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-semibold whitespace-nowrap">
                                <CheckCircle2 size={9} /> Valid
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── Step 3: Done ── */}
          {step === 3 && (
            <div className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" aria-hidden="true" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Import Complete</h3>
              <p className="text-sm text-gray-500 mb-6">
                Your {schema.entityName.toLowerCase()}s have been added to the list.
              </p>

              <div className="flex gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{importResult.imported}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{schema.entityName}{importResult.imported !== 1 ? "s" : ""} imported</p>
                </div>
                {importResult.skipped > 0 && (
                  <div className="text-center">
                    <p className="text-3xl font-bold text-amber-500">{importResult.skipped}</p>
                    <p className="text-xs text-gray-500 mt-0.5">row{importResult.skipped !== 1 ? "s" : ""} skipped</p>
                  </div>
                )}
              </div>

              {importResult.skipped > 0 && (
                <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-xl text-left max-w-sm mb-6">
                  <AlertCircle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <p className="text-xs text-amber-700">
                    {importResult.skipped} row{importResult.skipped !== 1 ? "s were" : " was"} skipped due to validation errors.
                    Download the template again, fix the issues, and re-import.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => { resetState(); }}>
                  Import more
                </Button>
                <Button variant="primary" onClick={handleClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer (steps 1 & 2 only) */}
        {step !== 3 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white">
            <div>
              {step === 2 && (
                <button
                  onClick={() => { setStep(1); setRows([]); setFileName(""); }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ArrowLeft size={13} aria-hidden="true" />
                  Back to upload
                </button>
              )}
              {step === 1 && fileName && (
                <p className="text-xs text-gray-500">
                  Selected: <span className="font-medium text-gray-700">{fileName}</span>
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              {step === 2 && validRows.length > 0 && (
                <Button variant="primary" onClick={handleImport}>
                  Import {validRows.length} {schema.entityName}{validRows.length !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
