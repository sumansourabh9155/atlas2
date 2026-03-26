/**
 * Website Scanner Modal Component
 * Multi-step modal for importing clinic data from existing websites
 */

import React, { useState } from "react";
import { X, Loader, AlertCircle, CheckCircle, Zap } from "lucide-react";
import { scrapeWebsite } from "../lib/scraper/websiteScraper";
import { ScrapeResult } from "../lib/scraper/types";
import { useClinic } from "../context/ClinicContext";

type Step = "url-input" | "scanning" | "review" | "complete";

interface WebsiteScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WebsiteScannerModal({ isOpen, onClose }: WebsiteScannerModalProps) {
  const { updateGeneral, updateTaxonomy, updateContact } = useClinic();
  const [step, setStep] = useState<Step>("url-input");
  const [url, setUrl] = useState("https://yourvetclinic.com");
  const [progress, setProgress] = useState(0);
  const [progressStatus, setProgressStatus] = useState("");
  const [result, setResult] = useState<ScrapeResult | null>(null);
  const [error, setError] = useState<string>("");
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const handleScan = async () => {
    setError("");
    setProgress(0);
    setProgressStatus("");
    setStep("scanning");

    try {
      const scanResult = await scrapeWebsite(url, {}, (prog: number, status: string) => {
        setProgress(Math.round(prog));
        setProgressStatus(status);
      });

      if (!scanResult.success) {
        setError(
          scanResult.warnings[0] || "Failed to scan website. Please check the URL and try again."
        );
        setStep("url-input");
        return;
      }

      setResult(scanResult);
      setStep("review");

      // Pre-select high-confidence fields
      const selected = new Set<string>();
      Object.entries(scanResult.scrapedContent).forEach(([key, extraction]) => {
        const ext = extraction as { value: unknown; confidence: number };
        if (ext.confidence >= 0.6 && ext.value !== null) {
          selected.add(key);
        }
      });
      setSelectedFields(selected);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred while scanning");
      setStep("url-input");
    }
  };

  const handleImport = () => {
    if (!result) return;

    // Build partial clinic data from selected fields
    const updates = {
      general: {} as Record<string, unknown>,
      taxonomy: {} as Record<string, unknown>,
      contact: {} as Record<string, unknown>,
    };

    if (selectedFields.has("clinicName") && result.scrapedContent.clinicName.value) {
      updates.general.name = result.scrapedContent.clinicName.value;
      updates.general.slug = result.scrapedContent.clinicName.value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
    }

    if (selectedFields.has("primaryColor") && result.scrapedContent.primaryColor.value) {
      updates.general.primaryColor = result.scrapedContent.primaryColor.value;
    }

    if (selectedFields.has("secondaryColor") && result.scrapedContent.secondaryColor.value) {
      updates.general.secondaryColor = result.scrapedContent.secondaryColor.value;
    }

    if (selectedFields.has("logo") && result.scrapedContent.logo.value) {
      updates.general.logoUrl = result.scrapedContent.logo.value;
    }

    if (selectedFields.has("tagline") && result.scrapedContent.tagline.value) {
      updates.general.tagline = result.scrapedContent.tagline.value;
    }

    if (selectedFields.has("phone") && result.scrapedContent.phone.value) {
      updates.contact.phone = result.scrapedContent.phone.value;
    }

    if (selectedFields.has("email") && result.scrapedContent.email.value) {
      updates.contact.email = result.scrapedContent.email.value;
    }

    if (selectedFields.has("address") && result.scrapedContent.address.value) {
      updates.contact.address = result.scrapedContent.address.value;
    }

    if (selectedFields.has("hospitalType") && result.scrapedContent.hospitalType.value) {
      updates.taxonomy.hospitalType = result.scrapedContent.hospitalType.value;
    }

    if (selectedFields.has("petTypes") && result.scrapedContent.petTypes.value) {
      updates.taxonomy.petTypes = result.scrapedContent.petTypes.value;
    }

    // Update context with selected data
    if (Object.keys(updates.general).length > 0) {
      updateGeneral(updates.general as Parameters<typeof updateGeneral>[0]);
    }

    if (Object.keys(updates.taxonomy).length > 0) {
      updateTaxonomy(updates.taxonomy as Parameters<typeof updateTaxonomy>[0]);
    }

    if (Object.keys(updates.contact).length > 0) {
      updateContact(updates.contact as Parameters<typeof updateContact>[0]);
    }

    setStep("complete");
  };

  const toggleField = (fieldName: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(fieldName)) {
      newSelected.delete(fieldName);
    } else {
      newSelected.add(fieldName);
    }
    setSelectedFields(newSelected);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-900 text-white rounded-full w-10 h-10 flex items-center justify-center">
              <Zap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Import from Existing Website</h2>
              <p className="text-sm text-gray-600">
                We'll scan your live site and pre-fill your clinic profile automatically
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            aria-label="Close modal"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-6 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            {["url-input", "scanning", "review", "complete"].map((s, idx) => (
              <React.Fragment key={s}>
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm ${
                    s === step
                      ? "bg-blue-900 text-white"
                      : ["url-input", "scanning", "review"].includes(step) &&
                        ["url-input", "scanning", "review", "complete"].indexOf(s) <
                          ["url-input", "scanning", "review", "complete"].indexOf(step)
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {["url-input", "scanning", "review"].indexOf(s) <
                    ["url-input", "scanning", "review", "complete"].indexOf(step) ? (
                    <CheckCircle size={20} />
                  ) : (
                    idx + 1
                  )}
                </div>

                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 ${
                      ["url-input", "scanning", "review", "complete"].indexOf(s) <
                      ["url-input", "scanning", "review", "complete"].indexOf(step)
                        ? "bg-emerald-500"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex justify-between text-xs font-medium text-gray-600 mt-3">
            <span className={step === "url-input" ? "text-teal-900" : ""}>Enter URL</span>
            <span className={step === "scanning" ? "text-teal-900" : ""}>Scanning</span>
            <span className={step === "review" ? "text-teal-900" : ""}>Review</span>
            <span className={step === "complete" ? "text-teal-900" : ""}>Done</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === "url-input" && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Your current website URL
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    🌐
                  </span>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://yourvetclinic.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-teal-600 rounded-lg focus:outline-none focus:border-teal-700"
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  We'll scan your public website — no login or credentials needed.
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">WHAT WE'LL EXTRACT</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏥</span>
                    <span className="text-gray-700">Clinic name & branding</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <span className="text-gray-700">Contact details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">📍</span>
                    <span className="text-gray-700">Location</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🕐</span>
                    <span className="text-gray-700">Business hours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🏷️</span>
                    <span className="text-gray-700">Clinic type & pets</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🔍</span>
                    <span className="text-gray-700">SEO metadata</span>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="inline-block mr-2">🛡️</span>
                  We only read publicly accessible pages — no login, no cookies, no stored credentials. You review and approve
                  every field before anything is saved.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-semibold text-sm text-red-900">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={onClose}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleScan}
                  disabled={!url.trim()}
                  className="flex-1 px-4 py-3 bg-gray-400 hover:bg-gray-500 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  Start Import Scan
                </button>
              </div>
            </div>
          )}

          {step === "scanning" && (
            <div className="flex flex-col items-center justify-center py-12 gap-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-gray-200 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-600 rounded-full animate-spin" />
              </div>

              <div className="text-center">
                <p className="text-sm font-medium text-gray-900 mb-1">{progressStatus}</p>
                <p className="text-xs text-gray-600 mb-3">Scanning {url}...</p>

                <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">{progress}%</p>
              </div>
            </div>
          )}

          {step === "review" && result && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle size={20} className="text-emerald-600" />
                  Scan Complete — Review & Select Data to Import
                </h3>

                <p className="text-sm text-gray-600 mb-4">
                  We found {result.executionTime}ms of data. Select which fields you'd like to import:
                </p>

                <div className="space-y-3">
                  {/* Clinic Info Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-sm text-gray-900">
                      Clinic Information
                    </div>
                    <div className="p-4 space-y-3">
                      {renderField(
                        "clinicName",
                        result.scrapedContent.clinicName,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "primaryColor",
                        result.scrapedContent.primaryColor,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "logo",
                        result.scrapedContent.logo,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "tagline",
                        result.scrapedContent.tagline,
                        selectedFields,
                        toggleField
                      )}
                    </div>
                  </div>

                  {/* Contact Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-sm text-gray-900">
                      Contact Details
                    </div>
                    <div className="p-4 space-y-3">
                      {renderField(
                        "phone",
                        result.scrapedContent.phone,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "email",
                        result.scrapedContent.email,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "address",
                        {
                          ...result.scrapedContent.address,
                          value: result.scrapedContent.address.value
                            ? JSON.stringify(result.scrapedContent.address.value)
                            : null,
                        },
                        selectedFields,
                        toggleField
                      )}
                    </div>
                  </div>

                  {/* Taxonomy Section */}
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 font-semibold text-sm text-gray-900">
                      Clinic Type & Pets
                    </div>
                    <div className="p-4 space-y-3">
                      {renderField(
                        "hospitalType",
                        result.scrapedContent.hospitalType,
                        selectedFields,
                        toggleField
                      )}
                      {renderField(
                        "petTypes",
                        {
                          ...result.scrapedContent.petTypes,
                          value: result.scrapedContent.petTypes.value
                            ? result.scrapedContent.petTypes.value.join(", ")
                            : null,
                        },
                        selectedFields,
                        toggleField
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setStep("url-input")}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition"
                >
                  Back
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedFields.size === 0}
                  className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition"
                >
                  Import Selected Data
                </button>
              </div>
            </div>
          )}

          {step === "complete" && (
            <div className="flex flex-col items-center justify-center py-12 gap-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle size={32} className="text-emerald-600" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Import Successful!</h3>
                <p className="text-sm text-gray-600">
                  Your clinic information has been imported. Continue setting up your profile.
                </p>
              </div>

              <button
                onClick={onClose}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition"
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Field renderer with confidence indicator
 */
function renderField(
  fieldName: string,
  extraction: { value: unknown; confidence: number; source: string },
  selectedFields: Set<string>,
  toggleField: (name: string) => void
) {
  if (extraction.value === null || extraction.value === undefined) {
    return null;
  }

  const displayValue =
    typeof extraction.value === "string"
      ? extraction.value
      : JSON.stringify(extraction.value);

  return (
    <label className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition">
      <input
        type="checkbox"
        checked={selectedFields.has(fieldName)}
        onChange={() => toggleField(fieldName)}
        className="mt-1 w-4 h-4 rounded border-gray-300 text-teal-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-gray-900 capitalize">
            {fieldName.replace(/([A-Z])/g, " $1")}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            extraction.confidence >= 0.8
              ? "bg-emerald-100 text-emerald-700"
              : extraction.confidence >= 0.6
              ? "bg-blue-100 text-blue-700"
              : "bg-amber-100 text-amber-700"
          }`}>
            {Math.round(extraction.confidence * 100)}%
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{displayValue}</p>
        <p className="text-xs text-gray-500 mt-1">From: {extraction.source}</p>
      </div>
    </label>
  );
}
