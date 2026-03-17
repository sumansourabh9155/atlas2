// ─── DomainManagementPage ─────────────────────────────────────────────────────
// Full domain publishing workflow: custom domains, SSL, DNS, publish status.

import { useState } from "react";
import {
  Globe, Shield, CheckCircle2, XCircle, Clock, AlertTriangle,
  Copy, ExternalLink, Plus, Trash2, Star, StarOff,
  ChevronRight, ChevronDown, Server, Lock, Wifi, RefreshCw,
  ArrowRight, Check, X, Info, Zap, CreditCard,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type DomainStatus = "pending_dns" | "pending_ssl" | "active" | "error";
type PublishStatus = "draft" | "pending_approval" | "published";

interface Domain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  status: DomainStatus;
  ssl: "pending" | "active" | "error";
  dns: "unverified" | "verified" | "error";
  addedAt: string;
}

interface DNSRecord {
  type: "A" | "CNAME";
  name: string;
  value: string;
  ttl: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const SERVER_IP = "104.21.73.42";

const DNS_RECORDS: DNSRecord[] = [
  { type: "A",     name: "@",   value: SERVER_IP,          ttl: "3600" },
  { type: "A",     name: "www", value: SERVER_IP,          ttl: "3600" },
  { type: "CNAME", name: "www", value: "clinics.vetcms.io", ttl: "3600" },
];

const INITIAL_DOMAINS: Domain[] = [
  {
    id: "d1",
    hostname: "austinpawsvet.com",
    isPrimary: true,
    status: "active",
    ssl: "active",
    dns: "verified",
    addedAt: "Mar 12, 2026",
  },
  {
    id: "d2",
    hostname: "austinpaws.vetcms.io",
    isPrimary: false,
    status: "active",
    ssl: "active",
    dns: "verified",
    addedAt: "Mar 10, 2026",
  },
];

// ─── Helper components ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: DomainStatus }) {
  const map: Record<DomainStatus, { label: string; className: string; Icon: React.ElementType }> = {
    active:      { label: "Active",      className: "bg-emerald-50 text-emerald-700 border-emerald-200",  Icon: CheckCircle2  },
    pending_dns: { label: "Pending DNS", className: "bg-amber-50  text-amber-700  border-amber-200",     Icon: Clock         },
    pending_ssl: { label: "Pending SSL", className: "bg-blue-50   text-blue-700   border-blue-200",      Icon: Lock          },
    error:       { label: "Error",       className: "bg-red-50    text-red-700    border-red-200",        Icon: XCircle       },
  };
  const { label, className, Icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${className}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function SSLBadge({ status }: { status: Domain["ssl"] }) {
  if (status === "active") return (
    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
      <Lock className="w-3 h-3" /> SSL Active
    </span>
  );
  if (status === "pending") return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
      <Lock className="w-3 h-3" /> SSL Pending
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium">
      <Lock className="w-3 h-3" /> SSL Error
    </span>
  );
}

function DNSBadge({ status }: { status: Domain["dns"] }) {
  if (status === "verified") return (
    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium">
      <Wifi className="w-3 h-3" /> DNS Verified
    </span>
  );
  if (status === "unverified") return (
    <span className="inline-flex items-center gap-1 text-[10px] text-amber-600 font-medium">
      <Wifi className="w-3 h-3" /> DNS Unverified
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[10px] text-red-500 font-medium">
      <Wifi className="w-3 h-3" /> DNS Error
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button
      type="button"
      onClick={copy}
      className="p-1 rounded hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

// ─── Add Domain Wizard ────────────────────────────────────────────────────────

const WIZARD_STEPS = [
  { label: "Domain Name",   icon: Globe   },
  { label: "Ownership",     icon: Shield  },
  { label: "DNS Records",   icon: Server  },
  { label: "SSL & Status",  icon: Lock    },
];

interface AddDomainWizardProps {
  onClose: () => void;
  onAdd: (domain: Domain) => void;
}

function AddDomainWizard({ onClose, onAdd }: AddDomainWizardProps) {
  const [step, setStep]           = useState(0);
  const [hostname, setHostname]   = useState("");
  const [purchased, setPurchased] = useState<boolean | null>(null);
  const [registrar, setRegistrar] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified]   = useState(false);

  const isValidDomain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(hostname.trim());

  const handleVerify = () => {
    setVerifying(true);
    setTimeout(() => { setVerifying(false); setVerified(true); }, 2000);
  };

  const handleFinish = () => {
    onAdd({
      id: `d${Date.now()}`,
      hostname: hostname.trim().toLowerCase(),
      isPrimary: false,
      status: "pending_dns",
      ssl: "pending",
      dns: "unverified",
      addedAt: "Just now",
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-[560px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Add Custom Domain</h2>
            <p className="text-[11px] text-slate-400 mt-0.5">Connect your domain to this website</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Step progress */}
        <div className="flex items-center gap-0 px-6 py-3 border-b border-slate-100 bg-slate-50/60">
          {WIZARD_STEPS.map(({ label, icon: Icon }, i) => (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-1.5 shrink-0">
                <div className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors",
                  i < step  ? "bg-emerald-500 text-white" :
                  i === step ? "bg-[#003459] text-white"  :
                               "bg-slate-200 text-slate-400",
                ].join(" ")}>
                  {i < step ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                </div>
                <span className={`text-[10px] font-medium ${i === step ? "text-[#003459]" : i < step ? "text-emerald-600" : "text-slate-400"}`}>
                  {label}
                </span>
              </div>
              {i < WIZARD_STEPS.length - 1 && (
                <div className={`flex-1 h-px mx-2 ${i < step ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* Step 0: Domain Name */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-800 mb-3">Do you already own a domain?</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: true,  label: "Yes, I own a domain",   Icon: Globe,      desc: "I'll connect my existing domain" },
                    { val: false, label: "No, I need one",         Icon: CreditCard, desc: "Purchase a domain to continue" },
                  ].map(({ val, label, Icon, desc }) => (
                    <button
                      key={String(val)}
                      type="button"
                      onClick={() => setPurchased(val)}
                      className={[
                        "p-4 rounded-xl border-2 text-left transition-all",
                        purchased === val
                          ? "border-[#003459] bg-[#003459]/5"
                          : "border-slate-200 hover:border-slate-300 bg-white",
                      ].join(" ")}
                    >
                      <Icon className={`w-5 h-5 mb-2 ${purchased === val ? "text-[#003459]" : "text-slate-400"}`} />
                      <div className={`text-sm font-semibold ${purchased === val ? "text-[#003459]" : "text-slate-700"}`}>{label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {purchased === false && (
                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                  <div className="flex gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-800">Domain purchase required</p>
                      <p className="text-[11px] text-amber-700 mt-1">
                        Purchase a domain from a registrar like Cloudflare, GoDaddy, or Namecheap, then come back here to connect it.
                      </p>
                      <div className="flex flex-wrap gap-2 mt-2.5">
                        {["Cloudflare.com", "GoDaddy.com", "Namecheap.com"].map(r => (
                          <span key={r} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-amber-200 text-[10px] text-amber-700 font-medium">
                            <ExternalLink className="w-2.5 h-2.5" /> {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {purchased === true && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Your domain name</label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={hostname}
                        onChange={e => setHostname(e.target.value)}
                        placeholder="yourpractice.com"
                        className="w-full pl-9 pr-3 h-9 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003459] focus:border-[#003459] transition-colors"
                      />
                    </div>
                    {hostname && !isValidDomain && (
                      <p className="text-[10px] text-red-500 mt-1">Enter a valid domain (e.g. yourpractice.com)</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">Domain registrar <span className="text-slate-400 font-normal">(optional)</span></label>
                    <div className="flex flex-wrap gap-1.5">
                      {["Cloudflare", "GoDaddy", "Namecheap", "Google Domains", "Other"].map(r => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRegistrar(r)}
                          className={[
                            "px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors",
                            registrar === r
                              ? "bg-[#003459] text-white border-[#003459]"
                              : "bg-white text-slate-600 border-slate-200 hover:border-slate-300",
                          ].join(" ")}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 1: Ownership (TXT record) */}
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Prove you own <span className="font-semibold text-slate-900">{hostname}</span> by adding this TXT record at your registrar.
              </p>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TXT Verification Record</span>
                  <CopyButton value={`_vetcms-verify TXT "vc-verify-${hostname.replace(/\./g, "-")}"`} />
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { label: "Type",  value: "TXT" },
                    { label: "Name",  value: "_vetcms-verify" },
                    { label: "Value", value: `vc-verify-${hostname.replace(/\./g, "-")}` },
                    { label: "TTL",   value: "3600" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <span className="text-[10px] font-semibold text-slate-400 w-10 pt-0.5">{label}</span>
                      <code className="text-xs text-slate-800 font-mono bg-slate-100 px-2 py-0.5 rounded flex-1 break-all">{value}</code>
                      <CopyButton value={value} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700">DNS changes can take up to 48 hours to propagate. Most registrars update within 10–30 minutes.</p>
              </div>
              <button
                type="button"
                onClick={handleVerify}
                disabled={verifying}
                className="w-full h-9 rounded-lg bg-[#003459] text-white text-sm font-semibold hover:bg-[#002845] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {verifying ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Verifying…</>
                ) : verified ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-300" /> Verified!</>
                ) : (
                  <>Verify Ownership</>
                )}
              </button>
            </div>
          )}

          {/* Step 2: DNS Records */}
          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-600">
                Point <span className="font-semibold text-slate-900">{hostname}</span> to our servers by adding these DNS records at your registrar.
              </p>
              <div className="rounded-xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">DNS Records to Add</span>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Type", "Name", "Value", "TTL", ""].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-slate-400 px-3 py-2 uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DNS_RECORDS.map((r, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0">
                        <td className="px-3 py-2.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.type === "A" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                            {r.type}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">{r.name}</td>
                        <td className="px-3 py-2.5 font-mono text-slate-700 max-w-[160px] truncate" title={r.value}>{r.value}</td>
                        <td className="px-3 py-2.5 text-slate-400">{r.ttl}</td>
                        <td className="px-3 py-2.5"><CopyButton value={r.value} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Registrar guides</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Cloudflare", hint: "DNS → Add record" },
                    { name: "GoDaddy",    hint: "Domain → DNS → Add" },
                    { name: "Namecheap",  hint: "Advanced DNS → Add" },
                  ].map(({ name, hint }) => (
                    <div key={name} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50">
                      <div className="text-[11px] font-semibold text-slate-700">{name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{hint}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: SSL & Status */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4">
                  <Check className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-base font-semibold text-slate-900">Domain Added!</h3>
                <p className="text-sm text-slate-500 mt-1">
                  <span className="font-medium text-slate-700">{hostname}</span> has been added and is being verified.
                </p>
              </div>

              <div className="space-y-2">
                {[
                  { label: "Domain registered",  done: true  },
                  { label: "DNS verification",    done: false },
                  { label: "SSL provisioning",    done: false },
                  { label: "Domain is live",      done: false },
                ].map(({ label, done }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${done ? "bg-emerald-500" : "bg-slate-200"}`}>
                      {done
                        ? <Check className="w-3 h-3 text-white" />
                        : <Clock className="w-3 h-3 text-slate-400" />}
                    </div>
                    <span className={`text-xs font-medium ${done ? "text-slate-800" : "text-slate-400"}`}>{label}</span>
                    {!done && <span className="ml-auto text-[10px] text-amber-600 font-medium">Pending</span>}
                  </div>
                ))}
              </div>

              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Zap className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700">
                  SSL certificates are provisioned automatically via Let's Encrypt once DNS propagates. This typically takes 10–30 minutes.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/40">
          <button
            type="button"
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
            className="px-4 py-1.5 text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            {step === 0 ? "Cancel" : "Back"}
          </button>
          <button
            type="button"
            onClick={step < 3 ? () => setStep(s => s + 1) : handleFinish}
            disabled={step === 0 && (purchased !== true || !isValidDomain)}
            className="inline-flex items-center gap-2 px-5 py-1.5 bg-[#003459] text-white text-sm font-semibold rounded-lg hover:bg-[#002845] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {step < 3 ? (
              <>Next <ArrowRight className="w-3.5 h-3.5" /></>
            ) : (
              <>Done <Check className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Domain Row ───────────────────────────────────────────────────────────────

interface DomainRowProps {
  domain: Domain;
  onSetPrimary: () => void;
  onDelete: () => void;
  onRefresh: () => void;
}

function DomainRow({ domain, onSetPrimary, onDelete, onRefresh }: DomainRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${domain.isPrimary ? "border-[#003459]/25 bg-[#003459]/2" : "border-slate-200 bg-white"}`}>
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Icon + domain */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${domain.isPrimary ? "bg-[#003459]" : "bg-slate-100"}`}>
          <Globe className={`w-4 h-4 ${domain.isPrimary ? "text-white" : "text-slate-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-slate-900 truncate">{domain.hostname}</span>
            {domain.isPrimary && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#003459]/10 text-[#003459] text-[10px] font-bold">
                <Star className="w-2.5 h-2.5 fill-current" /> Primary
              </span>
            )}
            <StatusBadge status={domain.status} />
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <SSLBadge status={domain.ssl} />
            <span className="text-[10px] text-slate-300">·</span>
            <DNSBadge status={domain.dns} />
            <span className="text-[10px] text-slate-400">Added {domain.addedAt}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {domain.status === "active" && (
            <a
              href={`https://${domain.hostname}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              title="Open domain"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            title="Refresh status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          {!domain.isPrimary && (
            <button
              type="button"
              onClick={onSetPrimary}
              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-amber-500 transition-colors"
              title="Set as primary"
            >
              <Star className="w-3.5 h-3.5" />
            </button>
          )}
          {!domain.hostname.endsWith(".vetcms.io") && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
              title="Remove domain"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setExpanded(v => !v)}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
            title="Toggle DNS details"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-red-50 border-t border-red-100">
          <span className="text-xs text-red-700 font-medium">Remove <strong>{domain.hostname}</strong>?</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Expanded DNS details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Expected DNS Records</p>
          <table className="w-full text-xs">
            <thead>
              <tr>
                {["Type", "Name", "Value", ""].map(h => (
                  <th key={h} className="text-left text-[10px] font-medium text-slate-400 pb-1.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DNS_RECORDS.filter((_, i) => i < 2).map((r, i) => (
                <tr key={i}>
                  <td className="py-1 pr-3">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${r.type === "A" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {r.type}
                    </span>
                  </td>
                  <td className="py-1 pr-3 font-mono text-slate-600">{r.name}</td>
                  <td className="py-1 pr-1 font-mono text-slate-600 truncate max-w-[180px]" title={r.value}>{r.value}</td>
                  <td className="py-1"><CopyButton value={r.value} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Publish Status Card ──────────────────────────────────────────────────────

function PublishStatusCard({
  publishStatus,
  onPublish,
  onRequestApproval,
}: {
  publishStatus: PublishStatus;
  onPublish: () => void;
  onRequestApproval: () => void;
}) {
  const map: Record<PublishStatus, {
    color: string; bg: string; border: string;
    Icon: React.ElementType; label: string; desc: string;
  }> = {
    draft:            { color: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   Icon: AlertTriangle,  label: "Draft",             desc: "Your website is not visible to the public." },
    pending_approval: { color: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    Icon: Clock,          label: "Pending Approval",  desc: "Your publish request is under review." },
    published:        { color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", Icon: CheckCircle2,   label: "Published",         desc: "Your website is live and visible to the public." },
  };
  const { color, bg, border, Icon, label, desc } = map[publishStatus];

  return (
    <div className={`rounded-xl border p-4 ${bg} ${border}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Icon className={`w-5 h-5 ${color} shrink-0 mt-0.5`} />
          <div>
            <p className={`text-sm font-bold ${color}`}>{label}</p>
            <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
          </div>
        </div>
        <div className="shrink-0">
          {publishStatus === "draft" && (
            <button
              type="button"
              onClick={onRequestApproval}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#003459] rounded-lg hover:bg-[#002845] transition-colors"
            >
              <Zap className="w-3 h-3" /> Request Publish
            </button>
          )}
          {publishStatus === "pending_approval" && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-white border border-blue-200 rounded-lg">
              <Clock className="w-3 h-3" /> Under Review
            </span>
          )}
          {publishStatus === "published" && (
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-white border border-emerald-200 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> View Live Site
            </button>
          )}
        </div>
      </div>

      {publishStatus === "published" && (
        <div className="mt-3 pt-3 border-t border-emerald-200/60 flex items-center gap-4 text-xs text-slate-500">
          <span>Published on <strong className="text-slate-700">Mar 15, 2026</strong></span>
          <span>·</span>
          <span>Server: <strong className="text-slate-700 font-mono">{SERVER_IP}</strong></span>
          <span>·</span>
          <span>CDN: <strong className="text-slate-700">Caddy + CloudFlare</strong></span>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function DomainManagementPage() {
  const [domains, setDomains]               = useState<Domain[]>(INITIAL_DOMAINS);
  const [publishStatus, setPublishStatus]   = useState<PublishStatus>("draft");
  const [addWizardOpen, setAddWizardOpen]   = useState(false);
  const [multiDomainNote, setMultiDomainNote] = useState(true);

  const handleSetPrimary = (id: string) => {
    setDomains(prev => prev.map(d => ({ ...d, isPrimary: d.id === id })));
  };

  const handleDelete = (id: string) => {
    setDomains(prev => {
      const next = prev.filter(d => d.id !== id);
      // if primary was deleted, promote first remaining
      if (!next.some(d => d.isPrimary) && next.length > 0) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleRefresh = (id: string) => {
    // Simulate a status refresh
    setDomains(prev => prev.map(d => d.id === id ? { ...d } : d));
  };

  const handleAddDomain = (domain: Domain) => {
    setDomains(prev => [...prev, domain]);
  };

  const activeDomains = domains.filter(d => d.status === "active");

  return (
    <div className="h-full overflow-y-auto bg-slate-50">
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">Domain & Publishing</h1>
            <p className="text-sm text-slate-500 mt-0.5">Manage custom domains and control your site's publish status.</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${publishStatus === "published" ? "bg-emerald-500 animate-pulse" : publishStatus === "pending_approval" ? "bg-blue-400 animate-pulse" : "bg-amber-400"}`} />
            <span className="text-xs text-slate-500 font-medium capitalize">{publishStatus.replace("_", " ")}</span>
          </div>
        </div>

        {/* ── Publish status card ── */}
        <PublishStatusCard
          publishStatus={publishStatus}
          onPublish={() => setPublishStatus("published")}
          onRequestApproval={() => setPublishStatus("pending_approval")}
        />

        {/* ── Multi-domain canonical notice ── */}
        {activeDomains.length > 1 && multiDomainNote && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-blue-800">Multiple active domains detected</p>
              <p className="text-[11px] text-blue-600 mt-0.5">
                Set one domain as <strong>Primary</strong> — it will be used as the canonical URL for SEO. All other domains will redirect to it automatically.
              </p>
            </div>
            <button type="button" onClick={() => setMultiDomainNote(false)} className="p-0.5 text-blue-400 hover:text-blue-600 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* ── Domains section ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-800">Domains</h2>
              <p className="text-[11px] text-slate-400">{domains.length} domain{domains.length !== 1 ? "s" : ""} connected</p>
            </div>
            <button
              type="button"
              onClick={() => setAddWizardOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#003459] bg-white border border-[#003459]/30 rounded-lg hover:bg-[#003459]/5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Domain
            </button>
          </div>

          <div className="space-y-2">
            {domains.map(domain => (
              <DomainRow
                key={domain.id}
                domain={domain}
                onSetPrimary={() => handleSetPrimary(domain.id)}
                onDelete={() => handleDelete(domain.id)}
                onRefresh={() => handleRefresh(domain.id)}
              />
            ))}
          </div>
        </div>

        {/* ── SSL overview ── */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
            <Shield className="w-4 h-4 text-[#003459]" />
            <h2 className="text-sm font-bold text-slate-800">SSL Certificates</h2>
          </div>
          <div className="p-4 space-y-2">
            {domains.map(d => (
              <div key={d.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-2">
                  <Lock className={`w-3.5 h-3.5 ${d.ssl === "active" ? "text-emerald-500" : d.ssl === "pending" ? "text-amber-400" : "text-red-400"}`} />
                  <span className="text-xs text-slate-700">{d.hostname}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[11px] font-medium ${d.ssl === "active" ? "text-emerald-600" : d.ssl === "pending" ? "text-amber-600" : "text-red-500"}`}>
                    {d.ssl === "active" ? "Let's Encrypt · Expires Jun 2026" : d.ssl === "pending" ? "Provisioning…" : "Certificate Error"}
                  </span>
                  {d.ssl === "active" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {d.ssl === "pending" && <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />}
                  {d.ssl === "error"   && <XCircle   className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/60">
            <p className="text-[11px] text-slate-400">
              SSL certificates are auto-provisioned via <strong className="text-slate-600">Let's Encrypt</strong> and renewed automatically every 90 days.
            </p>
          </div>
        </div>

        {/* ── Server info ── */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
            <Server className="w-4 h-4 text-[#003459]" />
            <h2 className="text-sm font-bold text-slate-800">Server & Routing</h2>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: "Server IP",       value: SERVER_IP,          mono: true  },
              { label: "Web Server",      value: "Caddy 2.7",        mono: false },
              { label: "CDN",             value: "Cloudflare",       mono: false },
              { label: "DNS Propagation", value: "10–48 hours",      mono: false },
              { label: "TLS Version",     value: "TLS 1.3",          mono: true  },
              { label: "HTTP2",           value: "Enabled",          mono: false },
            ].map(({ label, value, mono }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
                <span className={`text-xs text-slate-800 ${mono ? "font-mono" : "font-medium"}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Publish workflow explanation ── */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100">
            <Zap className="w-4 h-4 text-[#003459]" />
            <h2 className="text-sm font-bold text-slate-800">How Publishing Works</h2>
          </div>
          <div className="p-4">
            <div className="space-y-0">
              {[
                { step: 1, title: "Request Publish",   desc: "Submit your site for review. Our team checks for completeness and policy compliance." },
                { step: 2, title: "Approval",          desc: "Your publish request is approved (usually within 24 hours on business days)." },
                { step: 3, title: "Domain Connection", desc: "Connect your custom domain and configure DNS records to point to our servers." },
                { step: 4, title: "SSL & Go Live",     desc: "SSL is provisioned automatically. Your site goes live at your custom domain." },
              ].map(({ step, title, desc }, i, arr) => (
                <div key={step} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#003459]/10 text-[#003459] flex items-center justify-center text-[10px] font-bold shrink-0">{step}</div>
                    {i < arr.length - 1 && <div className="w-px flex-1 bg-slate-200 my-1" />}
                  </div>
                  <div className={`pb-4 ${i === arr.length - 1 ? "" : ""}`}>
                    <p className="text-xs font-semibold text-slate-800">{title}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Add Domain Wizard */}
      {addWizardOpen && (
        <AddDomainWizard
          onClose={() => setAddWizardOpen(false)}
          onAdd={handleAddDomain}
        />
      )}
    </div>
  );
}
