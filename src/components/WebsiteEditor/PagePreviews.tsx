/**
 * PagePreviews.tsx
 *
 * Rich inner-page previews for all non-Home pages.
 * Uses the same design language as ClinicHomepageTemplate:
 *   - TemplateColorsCtx / useColors for brand colors
 *   - isDark derived from theme === "2"
 *   - Same card, typography, and section patterns
 */

import { useState } from "react";
import {
  Phone, Mail, MapPin, Clock, Star, Calendar, CheckCircle,
  ArrowRight, Users, Heart, Shield, Award, Zap, BookOpen,
  MessageCircle, ChevronDown, ChevronRight, CreditCard,
  Briefcase, Target, Globe, Stethoscope, AlertCircle,
  FileText, DollarSign, TrendingUp, Search, Filter, Tag,
  ThumbsUp, Eye, Share2, Building2,
} from "lucide-react";
import type { ClinicWebsite, NavigationBlock } from "../../types/clinic";
import type { PreviewTheme } from "./LivePreviewPane";
import {
  hexToRgba, TemplateColorsCtx, useColors,
  TopBanner, Navbar, Footer,
} from "./ClinicHomepageTemplate";

// ─── Shared page props ────────────────────────────────────────────────────────

interface PageProps {
  clinic: ClinicWebsite;
  compact: boolean;
  theme: PreviewTheme;
}

// ─── PageWrapper: Provides color context + nav + footer ───────────────────────

function PageWrapper({ clinic, theme, children }: PageProps & { children: React.ReactNode }) {
  const primary   = clinic.general.primaryColor   ?? "#0F766E";
  const secondary = clinic.general.secondaryColor ?? "#F59E0B";
  const isDark    = theme === "2";

  const navBlock = clinic.blocks?.find(
    (b): b is NavigationBlock => b.type === "navigation"
  );

  return (
    <TemplateColorsCtx.Provider value={{ primary, secondary }}>
      <div style={{ background: isDark ? "#020617" : "#f8f9fb" }}>
        <TopBanner />
        <Navbar clinic={clinic} isDark={isDark} navBlock={navBlock} />
        {children}
        <Footer clinic={clinic} isDark={isDark} />
      </div>
    </TemplateColorsCtx.Provider>
  );
}

// ─── PageHero: Standard inner-page hero banner ────────────────────────────────

function PageHero({
  title, subtitle, breadcrumb, isDark, badge,
}: {
  title: string;
  subtitle?: string;
  breadcrumb?: string;
  isDark: boolean;
  badge?: string;
}) {
  const { primary, secondary } = useColors();
  return (
    <section
      className="px-6 py-14"
      style={{ background: isDark ? "#060e1e" : primary }}
    >
      <div className="max-w-4xl mx-auto">
        {breadcrumb && (
          <p className="text-xs mb-3 flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
            Home <ChevronRight className="w-3 h-3" aria-hidden /> {breadcrumb}
          </p>
        )}
        {badge && (
          <span
            className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
            style={{ background: hexToRgba(secondary, 0.25), color: secondary }}
          >
            {badge}
          </span>
        )}
        <h1 className="font-extrabold text-white mb-3" style={{ fontSize: "28px" }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.65)" }}>
            {subtitle}
          </p>
        )}
      </div>
    </section>
  );
}

// ─── SectionHeader: Reusable title + subtitle row ────────────────────────────

function SectionHeader({
  title, subtitle, cta, isDark, center,
}: {
  title: string;
  subtitle?: string;
  cta?: string;
  isDark: boolean;
  center?: boolean;
}) {
  const { primary } = useColors();
  return (
    <div className={`mb-8 ${center ? "text-center" : "flex items-start justify-between"}`}>
      <div className={center ? "" : "flex-1 pr-6"}>
        <h2
          className="font-extrabold text-2xl mb-2"
          style={{ color: isDark ? "#f1f5f9" : "#111827" }}
        >
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
            {subtitle}
          </p>
        )}
      </div>
      {cta && !center && (
        <button
          className="shrink-0 px-4 py-2 rounded-lg text-xs font-bold text-white shadow-sm"
          style={{ background: primary }}
        >
          {cta}
        </button>
      )}
    </div>
  );
}

// ─── StatsBadge ──────────────────────────────────────────────────────────────

function StatsBadge({ value, label, isDark }: { value: string; label: string; isDark: boolean }) {
  const { secondary } = useColors();
  return (
    <div className="text-center">
      <p className="font-black text-3xl mb-1" style={{ color: secondary }}>{value}</p>
      <p className="text-xs font-medium" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{label}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ABOUT US PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function AboutMissionSection({ clinic, isDark, compact }: PageProps & { isDark: boolean }) {
  const { primary, secondary } = useColors();
  const name = clinic.general.name;
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="flex gap-10"
          style={{ flexDirection: compact ? "column" : "row" }}
        >
          <div className="flex-1">
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-5"
              style={{ background: hexToRgba(secondary, 0.15), color: secondary }}
            >
              Our Story
            </span>
            <h2
              className="font-extrabold text-2xl mb-4 leading-snug"
              style={{ color: isDark ? "#f1f5f9" : "#111827" }}
            >
              Caring for pets &amp; families since 2003
            </h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: isDark ? "#64748b" : "#4b5563" }}>
              {name} was founded with a single mission: to provide compassionate, cutting-edge veterinary care that treats every patient like family. Over two decades later, we've grown into one of the region's most trusted animal hospitals, but our commitment to personalised, fear-free care has never wavered.
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: isDark ? "#64748b" : "#4b5563" }}>
              Our team of board-certified specialists, surgeons, and emergency veterinarians work side-by-side to give your pet the best possible outcome — from routine wellness visits to complex multi-specialty cases.
            </p>
            <button
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ background: primary }}
            >
              Meet Our Team <ArrowRight className="w-4 h-4" aria-hidden />
            </button>
          </div>
          {!compact && (
            <div
              className="w-80 shrink-0 rounded-2xl overflow-hidden"
              style={{ minHeight: "300px", background: isDark ? "#1e293b" : "#dbeafe" }}
            >
              <img
                src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=700&auto=format&fit=crop&q=80"
                alt="Veterinary team at work"
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function AboutStatsSection({ isDark }: { isDark: boolean }) {
  const { secondary } = useColors();
  const stats = [
    { value: "20+", label: "Years of Excellence" },
    { value: "50k+", label: "Pets Treated" },
    { value: "28", label: "Specialists on Staff" },
    { value: "4.9★", label: "Average Rating" },
  ];
  return (
    <section
      className="px-6 py-10"
      style={{
        background: isDark ? "#1e293b" : hexToRgba(secondary, 0.08),
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(s => <StatsBadge key={s.label} isDark={isDark} {...s} />)}
      </div>
    </section>
  );
}

function AboutValuesSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary, secondary } = useColors();
  const values = [
    { Icon: Heart,   title: "Compassionate Care",    desc: "We treat every patient with the same love and attention we'd give our own pets." },
    { Icon: Shield,  title: "Clinical Excellence",   desc: "Board-certified specialists using the latest evidence-based treatments." },
    { Icon: Users,   title: "Family-Centered",       desc: "We keep you informed and involved at every step of your pet's care journey." },
    { Icon: Zap,     title: "Rapid Response",        desc: "24/7 emergency team ready to respond when every minute matters." },
    { Icon: Award,   title: "AAHA Accredited",       desc: "Meeting the highest voluntary standards in veterinary medicine." },
    { Icon: Target,  title: "Fear-Free Certified",   desc: "Purpose-built spaces and techniques that reduce anxiety for every patient." },
  ];
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Our Core Values"
          subtitle="The principles that guide every decision, every treatment, every interaction."
          isDark={isDark}
          center
        />
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)" }}
        >
          {values.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                style={{ background: hexToRgba(primary, 0.12) }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: primary }} aria-hidden />
              </div>
              <p className="text-sm font-bold mb-1.5" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AboutAwardsSection({ isDark }: { isDark: boolean }) {
  const { secondary } = useColors();
  const awards = [
    "AAHA Accredited",
    "Fear Free Certified",
    "AVMA Member",
    "Best Vet 2024",
    "ISO 9001 Certified",
    "5-Star Google Rating",
  ];
  return (
    <section
      className="px-6 py-10"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <p className="text-xs font-bold tracking-widest uppercase mb-6" style={{ color: isDark ? "#475569" : "#9ca3af" }}>
          Accreditations &amp; Awards
        </p>
        <div className="flex flex-wrap gap-3">
          {awards.map(a => (
            <div
              key={a}
              className="flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-semibold"
              style={{
                borderColor: secondary,
                color: isDark ? secondary : "#111827",
                background: isDark ? hexToRgba(secondary, 0.08) : hexToRgba(secondary, 0.06),
              }}
            >
              <Award className="w-3.5 h-3.5" style={{ color: secondary }} aria-hidden /> {a}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutUsPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="About Our Clinic"
        subtitle={`Learn about the story, mission, and team behind ${clinic.general.name}.`}
        breadcrumb="About Us"
        isDark={isDark}
        badge="Est. 2003"
      />
      <AboutMissionSection clinic={clinic} compact={compact} theme={theme} isDark={isDark} />
      <AboutStatsSection isDark={isDark} />
      <AboutValuesSection isDark={isDark} compact={compact} />
      <AboutAwardsSection isDark={isDark} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// OUR TEAM PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function TeamGridSection({ clinic, isDark, compact }: PageProps & { isDark: boolean }) {
  const { primary, secondary } = useColors();
  const primaryColor = primary;
  const vets = clinic.veterinarians.filter(v => v.isVisible).sort((a, b) => a.order - b.order);
  const displayed = vets.length < 8
    ? [...vets, ...vets, ...vets, ...vets].slice(0, 8)
    : vets.slice(0, 8);

  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Meet the Team"
          subtitle="Our board-certified veterinarians and specialists are passionate about providing the highest level of care."
          isDark={isDark}
        />

        <div
          className="grid gap-x-5 gap-y-8"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(4, 1fr)" }}
        >
          {displayed.map((vet, idx) => {
            const initials = vet.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <div key={`${vet.id}-${idx}`}>
                <div
                  className="w-full rounded-xl overflow-hidden mb-3 relative"
                  style={{ height: "200px", background: isDark ? "#111827" : "#e5e7eb" }}
                >
                  {vet.photoUrl ? (
                    <img src={vet.photoUrl} alt={vet.name} className="w-full h-full object-cover object-top" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl font-extrabold text-white" style={{ background: primaryColor }}>
                      {initials}
                    </div>
                  )}
                  {vet.credentials && (
                    <span
                      className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: secondary, color: "#fff" }}
                    >
                      {vet.credentials}
                    </span>
                  )}
                </div>
                <p className="text-sm font-bold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{vet.name}</p>
                {vet.title && <p className="text-xs mt-0.5 mb-2" style={{ color: secondary }}>{vet.title}</p>}
                {vet.bio && (
                  <p
                    className="text-xs leading-relaxed"
                    style={{
                      color: isDark ? "#475569" : "#6b7280",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    {vet.bio}
                  </p>
                )}
                <button
                  className="mt-2 text-xs font-semibold flex items-center gap-1"
                  style={{ color: primary }}
                >
                  View Profile <ChevronRight className="w-3 h-3" aria-hidden />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function TeamDepartmentsSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary } = useColors();
  const depts = [
    { name: "General Practice",  count: 8,  icon: Stethoscope },
    { name: "Surgery",           count: 4,  icon: Shield },
    { name: "Emergency & Critical", count: 6, icon: AlertCircle },
    { name: "Cardiology",        count: 2,  icon: Heart },
    { name: "Dermatology",       count: 2,  icon: Users },
    { name: "Rehabilitation",    count: 3,  icon: Zap },
  ];
  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Departments"
          subtitle="Explore our specialised teams by department."
          isDark={isDark}
        />
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)" }}
        >
          {depts.map(({ name, count, icon: Icon }) => (
            <div
              key={name}
              className="flex items-center gap-3 p-4 rounded-xl border cursor-pointer hover:shadow-md transition-shadow"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: hexToRgba(primary, 0.1) }}
              >
                <Icon className="w-4 h-4" style={{ color: primary }} aria-hidden />
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{name}</p>
                <p className="text-xs" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>{count} specialists</p>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto" style={{ color: isDark ? "#475569" : "#d1d5db" }} aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OurTeamPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Meet Our Veterinary Team"
        subtitle="Compassionate experts dedicated to the health and happiness of your pets."
        breadcrumb="About Us / Our Team"
        isDark={isDark}
      />
      <TeamGridSection clinic={clinic} compact={compact} theme={theme} isDark={isDark} />
      <TeamDepartmentsSection isDark={isDark} compact={compact} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAREERS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function CareersWhyJoinSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary } = useColors();
  const benefits = [
    { Icon: DollarSign, title: "Competitive Pay",        desc: "Market-leading salaries reviewed annually." },
    { Icon: Shield,     title: "Full Health Benefits",    desc: "Medical, dental, vision for you and your family." },
    { Icon: BookOpen,   title: "CE Allowance",            desc: "$2,500/yr continuing education budget." },
    { Icon: Heart,      title: "Pet Care Discounts",      desc: "Free wellness exams for your own pets." },
    { Icon: TrendingUp, title: "Growth Opportunities",    desc: "Mentorship, leadership tracks, and specialist paths." },
    { Icon: Users,      title: "Great Culture",           desc: "Collaborative team that genuinely loves animals." },
  ];
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="Why Work With Us"
          subtitle="We invest in our people as much as our patients. Here's what you can expect."
          isDark={isDark}
        />
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)" }}
        >
          {benefits.map(({ Icon, title, desc }) => (
            <div
              key={title}
              className="p-5 rounded-xl border"
              style={{
                background: isDark ? "#1e293b" : "#f8f9fb",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                style={{ background: hexToRgba(primary, 0.12) }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: primary }} aria-hidden />
              </div>
              <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{title}</p>
              <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CareersOpeningsSection({ isDark }: { isDark: boolean }) {
  const { primary, secondary } = useColors();
  const jobs = [
    { title: "Emergency Veterinarian",     dept: "Emergency & Critical Care", type: "Full-Time", loc: "Main Campus" },
    { title: "Veterinary Technician",       dept: "General Practice",          type: "Full-Time", loc: "Main Campus" },
    { title: "Practice Manager",            dept: "Administration",             type: "Full-Time", loc: "Main Campus" },
    { title: "Veterinary Receptionist",     dept: "Client Services",            type: "Part-Time", loc: "Satellite Clinic" },
    { title: "Surgical Technician",         dept: "Surgery",                    type: "Full-Time", loc: "Main Campus" },
  ];
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Open Positions" isDark={isDark} cta="View All Jobs" />
        <div className="flex flex-col gap-3">
          {jobs.map(job => (
            <div
              key={job.title}
              className="flex items-center gap-4 px-5 py-4 rounded-xl border"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: hexToRgba(primary, 0.1) }}
              >
                <Briefcase className="w-4.5 h-4.5" style={{ color: primary }} aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{job.title}</p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
                  {job.dept} · {job.loc}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    background: job.type === "Full-Time" ? hexToRgba(primary, 0.12) : hexToRgba(secondary, 0.12),
                    color: job.type === "Full-Time" ? primary : secondary,
                  }}
                >
                  {job.type}
                </span>
                <button
                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white"
                  style={{ background: primary }}
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CareersPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Join Our Team"
        subtitle="We're always looking for passionate people who love animals and want to make a difference."
        breadcrumb="About Us / Careers"
        isDark={isDark}
        badge="We're Hiring"
      />
      <CareersWhyJoinSection isDark={isDark} compact={compact} />
      <CareersOpeningsSection isDark={isDark} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICES PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function ServicesGridSection({ clinic, isDark, compact }: PageProps & { isDark: boolean }) {
  const { primary, secondary } = useColors();
  const services = clinic.services.filter(s => s.isVisible).sort((a, b) => a.order - b.order);
  const displayed = services.length < 8
    ? [...services, ...services, ...services].slice(0, 8)
    : services.slice(0, 8);

  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="All Veterinary Services"
          subtitle="Comprehensive care for every stage of your pet's life — from puppy wellness to senior support."
          isDark={isDark}
        />
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)" }}
        >
          {displayed.map((svc, idx) => (
            <div
              key={`${svc.id}-${idx}`}
              className="flex flex-col rounded-xl border overflow-hidden"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              {svc.imageUrl && (
                <div
                  className="w-full overflow-hidden"
                  style={{ height: "120px", background: isDark ? "#0f172a" : "#f3f4f6" }}
                >
                  <img src={svc.imageUrl} alt={svc.name} className="w-full h-full object-cover" loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                </div>
              )}
              <div className="p-4 flex-1 flex flex-col">
                <p className="text-sm font-bold mb-1.5" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{svc.name}</p>
                {svc.description && (
                  <p
                    className="text-xs leading-relaxed flex-1 mb-3"
                    style={{
                      color: isDark ? "#64748b" : "#6b7280",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    } as React.CSSProperties}
                  >
                    {svc.description}
                  </p>
                )}
                <div className="flex items-center justify-between mt-auto">
                  {svc.priceDisplay && (
                    <span className="text-xs font-semibold" style={{ color: secondary }}>{svc.priceDisplay}</span>
                  )}
                  <button
                    className="ml-auto text-xs font-semibold flex items-center gap-1"
                    style={{ color: primary }}
                  >
                    Learn more <ArrowRight className="w-3 h-3" aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ServicesEmergencyBand({ isDark }: { isDark: boolean }) {
  const { secondary } = useColors();
  return (
    <section
      className="px-6 py-8"
      style={{
        background: isDark ? hexToRgba(secondary, 0.12) : hexToRgba(secondary, 0.1),
        borderTop: `1px solid ${isDark ? hexToRgba(secondary, 0.2) : hexToRgba(secondary, 0.15)}`,
      }}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-6 flex-wrap">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 shrink-0" style={{ color: secondary }} aria-hidden />
          <div>
            <p className="text-sm font-bold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              24/7 Emergency Services Available
            </p>
            <p className="text-xs" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
              Walk-ins accepted · No appointment needed for emergencies
            </p>
          </div>
        </div>
        <button
          className="px-5 py-2.5 rounded-lg text-sm font-bold"
          style={{ background: secondary, color: "#fff" }}
        >
          Call Emergency Line
        </button>
      </div>
    </section>
  );
}

export function ServicesPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Our Veterinary Services"
        subtitle="From routine wellness to complex emergency care — everything your pet needs, under one roof."
        breadcrumb="Services"
        isDark={isDark}
      />
      <ServicesEmergencyBand isDark={isDark} />
      <ServicesGridSection clinic={clinic} compact={compact} theme={theme} isDark={isDark} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOOK APPOINTMENT PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function BookingOptionsSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary } = useColors();
  const options = [
    { Icon: Globe,    title: "Book Online",     desc: "Use our 24/7 online booking to pick your service, vet, and time slot.", cta: "Book Now" },
    { Icon: Phone,    title: "Call Us",          desc: "Speak directly with our reception team Mon–Fri 8am–8pm.", cta: "Call Now" },
    { Icon: Building2, title: "Walk-In",         desc: "Urgent cases are always welcome. No appointment needed for emergencies.", cta: "Get Directions" },
  ];
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader
          title="How Would You Like to Book?"
          subtitle="Choose the booking method that works best for you."
          isDark={isDark}
          center
        />
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: compact ? "1fr" : "repeat(3, 1fr)" }}
        >
          {options.map(({ Icon, title, desc, cta }) => (
            <div
              key={title}
              className="p-6 rounded-xl border text-center flex flex-col items-center"
              style={{
                background: isDark ? "#1e293b" : "#f8f9fb",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                style={{ background: hexToRgba(primary, 0.12) }}
              >
                <Icon className="w-5.5 h-5.5" style={{ color: primary }} aria-hidden />
              </div>
              <p className="text-sm font-bold mb-2" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{title}</p>
              <p className="text-xs leading-relaxed mb-4" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{desc}</p>
              <button
                className="px-5 py-2 rounded-lg text-xs font-bold text-white mt-auto"
                style={{ background: primary }}
              >
                {cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BookingFormSection({ clinic, isDark, compact }: PageProps & { isDark: boolean }) {
  const { primary, secondary } = useColors();
  const timeSlots = ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM"];
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div
          className="flex gap-10"
          style={{ flexDirection: compact ? "column" : "row" }}
        >
          {/* Left: form */}
          <div className="flex-1">
            <h2 className="font-extrabold text-xl mb-6" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Schedule Your Visit
            </h2>
            <div className="flex flex-col gap-3">
              {[
                { label: "Your Name",    placeholder: "Jane Smith" },
                { label: "Pet's Name",   placeholder: "Buddy" },
                { label: "Pet Species",  placeholder: "Dog, Cat, Rabbit…" },
              ].map(f => (
                <div key={f.label}>
                  <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
                    {f.label}
                  </label>
                  <input
                    readOnly
                    placeholder={f.placeholder}
                    className="w-full h-9 px-3 rounded-lg border text-xs"
                    style={{
                      background: isDark ? "#1e293b" : "#ffffff",
                      borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d1d5db",
                      color: isDark ? "#94a3b8" : "#374151",
                    }}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold mb-1.5" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
                  Preferred Date
                </label>
                <input
                  readOnly
                  type="date"
                  className="w-full h-9 px-3 rounded-lg border text-xs"
                  style={{
                    background: isDark ? "#1e293b" : "#ffffff",
                    borderColor: isDark ? "rgba(255,255,255,0.1)" : "#d1d5db",
                    color: isDark ? "#94a3b8" : "#374151",
                  }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: isDark ? "#94a3b8" : "#374151" }}>
                  Available Times
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((t, i) => (
                    <button
                      key={t}
                      className="py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                      style={{
                        background: i === 2 ? primary : (isDark ? "#1e293b" : "#ffffff"),
                        borderColor: i === 2 ? primary : (isDark ? "rgba(255,255,255,0.1)" : "#d1d5db"),
                        color: i === 2 ? "#fff" : (isDark ? "#94a3b8" : "#374151"),
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="w-full py-2.5 rounded-lg text-sm font-bold text-white mt-1"
                style={{ background: primary }}
              >
                Confirm Appointment
              </button>
            </div>
          </div>

          {/* Right: contact info + hours */}
          {!compact && (
            <div className="w-60 shrink-0">
              <div
                className="p-5 rounded-xl border mb-4"
                style={{
                  background: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>Contact Us</p>
                {[
                  { Icon: Phone, text: clinic.contact?.phone ?? "812-283-4910" },
                  { Icon: Mail,  text: clinic.contact?.email ?? "hello@clinic.com" },
                  { Icon: MapPin, text: clinic.contact?.address?.city ?? "Main Campus" },
                ].map(({ Icon, text }) => (
                  <div key={text} className="flex items-center gap-2 mb-2">
                    <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: secondary }} aria-hidden />
                    <span className="text-xs" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{text}</span>
                  </div>
                ))}
              </div>
              <div
                className="p-5 rounded-xl border"
                style={{
                  background: isDark ? "#1e293b" : "#ffffff",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>Hours</p>
                {[
                  { day: "Mon–Fri",  hrs: "7:00 AM – 8:00 PM" },
                  { day: "Saturday", hrs: "8:00 AM – 5:00 PM" },
                  { day: "Sunday",   hrs: "10:00 AM – 4:00 PM" },
                  { day: "Emergency", hrs: "24/7 Always Open" },
                ].map(({ day, hrs }) => (
                  <div key={day} className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium" style={{ color: secondary }}>{day}</span>
                    <span className="text-xs" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{hrs}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function BookAppointmentPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Book an Appointment"
        subtitle="Quick, easy scheduling — online, by phone, or walk-in. We're ready when you need us."
        breadcrumb="Book Appointment"
        isDark={isDark}
      />
      <BookingOptionsSection isDark={isDark} compact={compact} />
      <BookingFormSection clinic={clinic} compact={compact} theme={theme} isDark={isDark} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BLOG PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const BLOG_POSTS = [
  { title: "5 Signs Your Dog Needs an Emergency Vet Visit",    category: "Emergency",   date: "Mar 12, 2026", readTime: "4 min",  img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80" },
  { title: "The Best Foods for Senior Cats",                   category: "Nutrition",   date: "Mar 8, 2026",  readTime: "6 min",  img: "https://images.unsplash.com/photo-1472491235688-bdc81a63246e?w=600&auto=format&fit=crop&q=80" },
  { title: "How to Reduce Vet Anxiety in Your Pet",            category: "Wellness",    date: "Mar 3, 2026",  readTime: "5 min",  img: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&auto=format&fit=crop&q=80" },
  { title: "Dental Health: Why It Matters More Than You Think", category: "Dental",     date: "Feb 28, 2026", readTime: "3 min",  img: "https://images.unsplash.com/photo-1601758174493-f71e2cfdb618?w=600&auto=format&fit=crop&q=80" },
  { title: "Puppy Vaccination Schedule Explained",             category: "Preventive",  date: "Feb 24, 2026", readTime: "7 min",  img: "https://images.unsplash.com/photo-1591160690555-5d7e4c5e5d90?w=600&auto=format&fit=crop&q=80" },
  { title: "Managing Arthritis in Older Dogs",                 category: "Orthopedics", date: "Feb 19, 2026", readTime: "5 min",  img: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=600&auto=format&fit=crop&q=80" },
];

const BLOG_CATEGORIES = ["All", "Emergency", "Nutrition", "Wellness", "Dental", "Preventive", "Orthopedics"];

function BlogGridSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary, secondary } = useColors();
  const [activeCategory] = useState("All");

  const filtered = activeCategory === "All" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Featured post */}
        <div
          className="rounded-2xl overflow-hidden mb-10 flex"
          style={{
            flexDirection: compact ? "column" : "row",
            minHeight: compact ? "auto" : "220px",
            background: isDark ? "#1e293b" : "#f8f9fb",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`,
          }}
        >
          {!compact && (
            <div className="w-72 shrink-0 overflow-hidden" style={{ background: isDark ? "#0f172a" : "#e5e7eb" }}>
              <img
                src={BLOG_POSTS[0].img}
                alt={BLOG_POSTS[0].title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
          )}
          <div className="flex flex-col justify-center p-7 flex-1">
            <span
              className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold mb-3 w-fit"
              style={{ background: hexToRgba(secondary, 0.15), color: secondary }}
            >
              Featured · {BLOG_POSTS[0].category}
            </span>
            <h2 className="font-extrabold text-xl mb-3" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              {BLOG_POSTS[0].title}
            </h2>
            <p className="text-xs mb-4" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>
              {BLOG_POSTS[0].date} · {BLOG_POSTS[0].readTime} read
            </p>
            <button
              className="inline-flex items-center gap-2 text-xs font-bold"
              style={{ color: primary }}
            >
              Read Article <ArrowRight className="w-3.5 h-3.5" aria-hidden />
            </button>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {BLOG_CATEGORIES.map(cat => (
            <button
              key={cat}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-colors"
              style={{
                background: cat === activeCategory ? primary : (isDark ? "#1e293b" : "#ffffff"),
                borderColor: cat === activeCategory ? primary : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"),
                color: cat === activeCategory ? "#fff" : (isDark ? "#94a3b8" : "#374151"),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Article grid */}
        <div
          className="grid gap-5"
          style={{ gridTemplateColumns: compact ? "1fr 1fr" : "repeat(3, 1fr)" }}
        >
          {filtered.map(post => (
            <div
              key={post.title}
              className="rounded-xl border overflow-hidden flex flex-col"
              style={{
                background: isDark ? "#1e293b" : "#f8f9fb",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div style={{ height: "120px", background: isDark ? "#0f172a" : "#e5e7eb", overflow: "hidden" }}>
                <img
                  src={post.img} alt={post.title} className="w-full h-full object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-bold mb-1.5" style={{ color: secondary }}>{post.category}</span>
                <p
                  className="text-xs font-bold leading-snug mb-2 flex-1"
                  style={{ color: isDark ? "#f1f5f9" : "#111827" }}
                >
                  {post.title}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px]" style={{ color: isDark ? "#475569" : "#9ca3af" }}>
                    {post.date} · {post.readTime}
                  </span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-3 h-3" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
                    <Share2 className="w-3 h-3" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function BlogPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Pet Health Blog"
        subtitle="Expert advice, tips, and news from our veterinary team to help you give your pet the best life."
        breadcrumb="Blog"
        isDark={isDark}
      />
      <BlogGridSection isDark={isDark} compact={compact} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FAQs PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const ALL_FAQS = [
  { cat: "Appointments", q: "How do I book an appointment?",                   a: "You can book online 24/7 through our website, call our reception team, or simply walk in. For emergencies, our team is always available — no appointment needed." },
  { cat: "Appointments", q: "Can I cancel or reschedule my appointment?",      a: "Yes. Please give us at least 24 hours notice. You can reschedule via our website, the app, or by calling reception." },
  { cat: "Appointments", q: "What should I bring to my first visit?",           a: "Please bring any previous veterinary records, a list of current medications, and your pet on a leash or in a carrier." },
  { cat: "Services",     q: "Do you treat exotic animals?",                     a: "Yes — we have exotic animal specialists on staff. We treat rabbits, birds, reptiles, ferrets, and select small mammals." },
  { cat: "Services",     q: "Do you offer dental cleaning under anaesthesia?", a: "Yes, we offer full dental procedures including scaling, polishing, extractions, and digital dental X-rays." },
  { cat: "Services",     q: "What emergency services do you offer?",            a: "Our emergency team operates 24/7. We handle trauma, toxin ingestion, respiratory distress, severe wounds, and all critical care needs." },
  { cat: "Insurance",    q: "Which pet insurance plans do you accept?",         a: "We work with all major insurers including Trupanion, Nationwide, Embrace, Healthy Paws, ASPCA, and PetFirst. We'll file claims on your behalf." },
  { cat: "Insurance",    q: "Can you help me choose a pet insurance plan?",    a: "Our team can provide a general overview of coverage types, but we recommend consulting your insurer directly for plan comparisons." },
  { cat: "Pricing",      q: "How much does a wellness exam cost?",              a: "Standard wellness exams start at $65. Prices vary based on species, age, and additional services. We're happy to provide a written estimate." },
  { cat: "Pricing",      q: "Do you offer payment plans?",                     a: "Yes. We offer CareCredit and Scratchpay financing with 0% interest options for approved applicants. Ask at reception for details." },
];

const FAQ_CATEGORIES = ["All", "Appointments", "Services", "Insurance", "Pricing"];

function FAQsSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary, secondary } = useColors();
  const [open, setOpen] = useState<number | null>(0);
  const [activeCategory] = useState("All");

  const filtered = activeCategory === "All" ? ALL_FAQS : ALL_FAQS.filter(f => f.cat === activeCategory);

  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8">
          {FAQ_CATEGORIES.map(cat => (
            <button
              key={cat}
              className="px-4 py-1.5 rounded-full text-xs font-semibold border"
              style={{
                background: cat === activeCategory ? primary : (isDark ? "#1e293b" : "#ffffff"),
                borderColor: cat === activeCategory ? primary : (isDark ? "rgba(255,255,255,0.1)" : "#e5e7eb"),
                color: cat === activeCategory ? "#fff" : (isDark ? "#94a3b8" : "#374151"),
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <div className="flex flex-col gap-2">
          {filtered.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border overflow-hidden"
              style={{ borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                style={{ background: isDark ? "#1e293b" : "#f8f9fb" }}
                onClick={() => setOpen(open === i ? null : i)}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{ background: hexToRgba(secondary, 0.15), color: secondary }}
                  >
                    {faq.cat}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                    {faq.q}
                  </span>
                </div>
                {open === i
                  ? <ChevronDown className="w-4 h-4 shrink-0" style={{ color: primary }} aria-hidden />
                  : <ChevronRight className="w-4 h-4 shrink-0" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
                }
              </button>
              {open === i && (
                <div className="px-5 pb-4 pt-3" style={{ background: isDark ? "#111827" : "#ffffff" }}>
                  <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#4b5563" }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still have questions CTA */}
        <div
          className="mt-10 p-6 rounded-2xl flex items-center justify-between gap-6 flex-wrap"
          style={{
            background: isDark ? "#1e293b" : hexToRgba(primary, 0.06),
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : hexToRgba(primary, 0.15)}`,
          }}
        >
          <div>
            <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Still have questions?
            </p>
            <p className="text-xs" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
              Our team is happy to help via phone, email, or live chat.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-lg text-xs font-bold border"
              style={{
                borderColor: primary,
                color: isDark ? "#f1f5f9" : primary,
                background: "transparent",
              }}
            >
              Live Chat
            </button>
            <button
              className="px-4 py-2 rounded-lg text-xs font-bold text-white"
              style={{ background: primary }}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQsPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Frequently Asked Questions"
        subtitle="Everything you need to know about appointments, services, insurance, and more."
        breadcrumb="FAQs"
        isDark={isDark}
      />
      <FAQsSection isDark={isDark} compact={compact} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAYMENT & INSURANCE PAGE
// ═══════════════════════════════════════════════════════════════════════════════

function InsuranceSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary, secondary } = useColors();
  const insurers = [
    "Trupanion", "Nationwide", "Embrace", "Healthy Paws",
    "ASPCA", "PetFirst", "Figo", "PetPlan",
  ];
  const paymentMethods = [
    { label: "Visa",       color: "#1A1F71" },
    { label: "Mastercard", color: "#EB001B" },
    { label: "Amex",       color: "#2E77BC" },
    { label: "Discover",   color: "#E65C1A" },
    { label: "CareCredit", color: primary   },
    { label: "Scratchpay", color: "#00C8A0" },
    { label: "Cash",       color: "#16a34a" },
    { label: "Check",      color: "#6b7280" },
  ];

  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Accepted insurers */}
        <div className="mb-12">
          <SectionHeader
            title="Accepted Insurance Plans"
            subtitle="We work with all major pet insurance providers and file claims on your behalf."
            isDark={isDark}
          />
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: compact ? "repeat(2, 1fr)" : "repeat(4, 1fr)" }}
          >
            {insurers.map(name => (
              <div
                key={name}
                className="flex items-center justify-center px-4 py-4 rounded-xl border"
                style={{
                  background: isDark ? "#1e293b" : "#f8f9fb",
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mr-2"
                  style={{ background: hexToRgba(secondary, 0.15) }}
                >
                  <Shield className="w-4 h-4" style={{ color: secondary }} aria-hidden />
                </div>
                <span className="text-xs font-semibold" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{name}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: isDark ? "#475569" : "#9ca3af" }}>
            Don't see your insurer? Contact us — we accept most plans.
          </p>
        </div>

        {/* Payment methods */}
        <div className="mb-12">
          <SectionHeader
            title="Payment Methods"
            subtitle="We accept all major credit cards, cash, and veterinary financing options."
            isDark={isDark}
          />
          <div className="flex flex-wrap gap-3">
            {paymentMethods.map(({ label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border"
                style={{
                  borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
                  background: isDark ? "#1e293b" : "#ffffff",
                }}
              >
                <div className="w-4 h-4 rounded-sm shrink-0" style={{ background: color }} />
                <span className="text-xs font-medium" style={{ color: isDark ? "#94a3b8" : "#374151" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financing CTA */}
        <div
          className="p-6 rounded-2xl flex items-center gap-6 flex-wrap"
          style={{
            background: isDark ? "#1e293b" : hexToRgba(primary, 0.06),
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : hexToRgba(primary, 0.2)}`,
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
            style={{ background: hexToRgba(primary, 0.15) }}
          >
            <CreditCard className="w-5.5 h-5.5" style={{ color: primary }} aria-hidden />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
              Flexible Financing Available
            </p>
            <p className="text-xs leading-relaxed" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
              Apply for CareCredit or Scratchpay at the front desk — get a decision in minutes. 0% APR options available for qualified applicants.
            </p>
          </div>
          <button className="px-5 py-2.5 rounded-lg text-xs font-bold text-white shrink-0" style={{ background: primary }}>
            Apply Now
          </button>
        </div>
      </div>
    </section>
  );
}

export function PaymentInsurancePage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Payment & Insurance"
        subtitle="We accept all major insurance plans and offer flexible payment options to make quality care accessible."
        breadcrumb="Payment & Insurance"
        isDark={isDark}
      />
      <InsuranceSection isDark={isDark} compact={compact} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FORUMS PAGE
// ═══════════════════════════════════════════════════════════════════════════════

const FORUM_CATEGORIES = [
  { name: "General Discussion", icon: MessageCircle, posts: 1284, topics: 312,  desc: "All things pet-related. Chat, share photos, ask anything." },
  { name: "Health & Wellness",  icon: Heart,         posts: 832,  topics: 198,  desc: "Advice, questions, and discussions about pet health." },
  { name: "Nutrition & Diet",   icon: FileText,      posts: 547,  topics: 124,  desc: "What to feed your pet and dietary tips from experts." },
  { name: "Training & Behavior",icon: Target,        posts: 614,  topics: 156,  desc: "Positive reinforcement, behaviour issues, and training tips." },
  { name: "Emergency Stories",  icon: AlertCircle,   posts: 293,  topics: 78,   desc: "Share and learn from emergency experiences." },
  { name: "Introduce Your Pet", icon: Users,         posts: 2100, topics: 920,  desc: "Show off your furry, feathered, or scaly friends!" },
];

const RECENT_THREADS = [
  { title: "My cat has been drinking more water than usual — should I be worried?",                  category: "Health & Wellness", replies: 14, views: 420, date: "2h ago",    hot: true },
  { title: "Best grain-free kibble for a Labrador with sensitive stomach",                           category: "Nutrition & Diet",  replies: 9,  views: 210, date: "5h ago",    hot: false },
  { title: "Tips for getting my rescue dog to stop barking at strangers",                            category: "Training & Behavior", replies: 22, views: 580, date: "1d ago",  hot: true },
  { title: "CareCredit experience at the vet — worth it?",                                           category: "General Discussion", replies: 7,  views: 175, date: "1d ago",   hot: false },
  { title: "Our 14-year-old lab just got her senior wellness bloodwork — results look great!",       category: "Introduce Your Pet", replies: 31, views: 890, date: "2d ago",   hot: false },
];

function ForumCategoriesSection({ isDark, compact }: { isDark: boolean; compact: boolean }) {
  const { primary, secondary } = useColors();
  return (
    <section
      className="px-6 py-14"
      style={{
        background: isDark ? "#0f172a" : "#ffffff",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Browse Topics" isDark={isDark} />
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: compact ? "1fr" : "repeat(2, 1fr)" }}
        >
          {FORUM_CATEGORIES.map(({ name, icon: Icon, posts, topics, desc }) => (
            <div
              key={name}
              className="flex gap-4 p-5 rounded-xl border cursor-pointer"
              style={{
                background: isDark ? "#1e293b" : "#f8f9fb",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: hexToRgba(primary, 0.12) }}
              >
                <Icon className="w-4.5 h-4.5" style={{ color: primary }} aria-hidden />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold mb-1" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>{name}</p>
                <p className="text-xs mb-2" style={{ color: isDark ? "#64748b" : "#6b7280" }}>{desc}</p>
                <div className="flex items-center gap-4">
                  <span className="text-[11px]" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{topics} Topics</span>
                  <span className="text-[11px]" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{posts} Posts</span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 shrink-0 self-center" style={{ color: isDark ? "#475569" : "#d1d5db" }} aria-hidden />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ForumThreadsSection({ isDark }: { isDark: boolean }) {
  const { primary, secondary } = useColors();
  return (
    <section
      className="px-6 py-12"
      style={{
        background: isDark ? "#0d1117" : "#f8f9fb",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#f0f0f2"}`,
      }}
    >
      <div className="max-w-4xl mx-auto">
        <SectionHeader title="Recent Discussions" isDark={isDark} cta="View All" />

        {/* Search bar */}
        <div
          className="flex items-center gap-2 px-3 h-9 rounded-xl border mb-6"
          style={{
            background: isDark ? "#1e293b" : "#ffffff",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
          }}
        >
          <Search className="w-3.5 h-3.5 shrink-0" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
          <span className="text-xs" style={{ color: isDark ? "#475569" : "#9ca3af" }}>Search discussions…</span>
        </div>

        <div className="flex flex-col gap-2">
          {RECENT_THREADS.map((thread, i) => (
            <div
              key={i}
              className="flex items-center gap-4 px-4 py-3.5 rounded-xl border"
              style={{
                background: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb",
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {thread.hot && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ background: hexToRgba(secondary, 0.2), color: secondary }}
                    >
                      HOT
                    </span>
                  )}
                  <p className="text-xs font-semibold truncate" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
                    {thread.title}
                  </p>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: hexToRgba(primary, 0.1), color: primary }}
                >
                  {thread.category}
                </span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1" title="Replies">
                  <MessageCircle className="w-3 h-3" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
                  <span className="text-[10px]" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{thread.replies}</span>
                </div>
                <div className="flex items-center gap-1" title="Views">
                  <Eye className="w-3 h-3" style={{ color: isDark ? "#475569" : "#9ca3af" }} aria-hidden />
                  <span className="text-[10px]" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{thread.views}</span>
                </div>
                <span className="text-[10px] hidden md:block" style={{ color: isDark ? "#475569" : "#9ca3af" }}>{thread.date}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Join CTA */}
        <div
          className="mt-8 p-6 rounded-2xl text-center"
          style={{
            background: isDark ? "#1e293b" : hexToRgba(primary, 0.06),
            border: `1px solid ${isDark ? "rgba(255,255,255,0.06)" : hexToRgba(primary, 0.15)}`,
          }}
        >
          <p className="text-sm font-bold mb-2" style={{ color: isDark ? "#f1f5f9" : "#111827" }}>
            Join Our Community
          </p>
          <p className="text-xs mb-4" style={{ color: isDark ? "#64748b" : "#6b7280" }}>
            Share your experiences, ask questions, and connect with other pet parents.
          </p>
          <button className="px-6 py-2.5 rounded-lg text-xs font-bold text-white" style={{ background: primary }}>
            Create Free Account
          </button>
        </div>
      </div>
    </section>
  );
}

export function ForumsPage({ clinic, compact, theme }: PageProps) {
  const isDark = theme === "2";
  return (
    <PageWrapper clinic={clinic} compact={compact} theme={theme}>
      <PageHero
        title="Pet Community Forums"
        subtitle="Ask questions, share stories, and connect with thousands of pet owners and our vet team."
        breadcrumb="Forums"
        isDark={isDark}
        badge="Community"
      />
      <ForumCategoriesSection isDark={isDark} compact={compact} />
      <ForumThreadsSection isDark={isDark} />
    </PageWrapper>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE PREVIEW ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

export function PagePreviewRouter({
  selectedPage,
  clinic,
  compact,
  theme,
}: {
  selectedPage: string;
  clinic: ClinicWebsite;
  compact: boolean;
  theme: PreviewTheme;
}) {
  const props: PageProps = { clinic, compact, theme };
  switch (selectedPage) {
    case "about-us":          return <AboutUsPage {...props} />;
    case "our-team":          return <OurTeamPage {...props} />;
    case "careers":           return <CareersPage {...props} />;
    case "services":          return <ServicesPage {...props} />;
    case "book-appointment":  return <BookAppointmentPage {...props} />;
    case "blog":              return <BlogPage {...props} />;
    case "faqs":              return <FAQsPage {...props} />;
    case "payment-insurance": return <PaymentInsurancePage {...props} />;
    case "forums":            return <ForumsPage {...props} />;
    default:                  return <AboutUsPage {...props} />;
  }
}
