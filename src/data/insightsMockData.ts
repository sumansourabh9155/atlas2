/**
 * insightsMockData.ts — Atlas Insights mock data
 * Covers: site health overview, A/B tests, conversion funnels.
 * Replace with real API calls in production.
 */

/* ─── Types ─────────────────────────────────────────────────────────────── */

export type CWVStatus = "good" | "warn" | "poor";

export interface InsightSite {
  id: string;
  name: string;
  industry: string;
  emoji: string;
  url: string;
  healthScore: number;      // 0–100 composite
  performanceScore: number; // PageSpeed Performance tab
  seoScore: number;
  engagementScore: number;  // internal metric
  sparkline: number[];      // 7-day relative traffic values
  hasAnomaly: boolean;
  anomalyMsg?: string;
}

export interface ABTest {
  id: string;
  name: string;
  hypothesis: string;
  site: string;
  page: string;
  element: string;
  controlLabel: string;
  variantLabel: string;
  controlConvPct: number;
  variantConvPct: number;
  split: number;         // 50 = 50/50
  daysRunning: number;
  sampleSize: number;
  confidence: number;    // 0–100
  status: "active" | "completed" | "paused";
  winner?: "control" | "variant";
  lift?: number;         // % lift
  sitesApplied?: number;
}

export interface FunnelStep {
  label: string;
  count: number;
  dropPct: number;     // % of previous step that dropped (0 for first)
  avgTimeSec: number;  // avg seconds spent before moving/dropping
}

export interface Funnel {
  id: string;
  name: string;
  site: string;
  endConversionPct: number;
  industryBenchmarkPct: number;
  steps: FunnelStep[];
  mobilePcts: number[];  // % of funnel[0] users reaching each step on mobile
  desktopPcts: number[]; // same for desktop
  trafficSplit: { organic: number; paid: number; direct: number; referral: number };
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

export function scoreStatus(v: number): CWVStatus {
  return v >= 90 ? "good" : v >= 50 ? "warn" : "poor";
}

/* ─── Sites ──────────────────────────────────────────────────────────────── */

export const MOCK_SITES: InsightSite[] = [
  {
    id: "bellwood",
    name: "Bellwood Bistro & Bar",
    industry: "Restaurant & Café",
    emoji: "🍽️",
    url: "bellwoodbistro.com",
    healthScore: 92, performanceScore: 94, seoScore: 91, engagementScore: 90,
    sparkline: [420, 380, 510, 490, 520, 480, 540],
    hasAnomaly: false,
  },
  {
    id: "luminary",
    name: "Luminary Salon & Spa",
    industry: "Hair & Beauty",
    emoji: "💅",
    url: "luminarysalon.com",
    healthScore: 78, performanceScore: 74, seoScore: 88, engagementScore: 76,
    sparkline: [280, 310, 295, 320, 290, 340, 360],
    hasAnomaly: false,
  },
  {
    id: "summit",
    name: "Summit Realty Partners",
    industry: "Real Estate",
    emoji: "🏠",
    url: "summitrealty.co",
    healthScore: 85, performanceScore: 88, seoScore: 92, engagementScore: 82,
    sparkline: [650, 590, 710, 680, 720, 690, 740],
    hasAnomaly: false,
  },
  {
    id: "harbor",
    name: "Harbor City Auto Care",
    industry: "Automotive",
    emoji: "🚗",
    url: "harborcityauto.com",
    healthScore: 63, performanceScore: 52, seoScore: 70, engagementScore: 58,
    sparkline: [180, 175, 160, 170, 145, 155, 150],
    hasAnomaly: false,
  },
  {
    id: "midtown",
    name: "Midtown Family Health",
    industry: "Healthcare Clinic",
    emoji: "🏥",
    url: "midtownhealth.org",
    healthScore: 71, performanceScore: 68, seoScore: 82, engagementScore: 72,
    sparkline: [520, 490, 505, 480, 510, 525, 500],
    hasAnomaly: false,
  },
  {
    id: "pawsome",
    name: "Pawsome Pet Boarding",
    industry: "Pet Services",
    emoji: "🐾",
    url: "pawsomepets.com",
    healthScore: 88, performanceScore: 90, seoScore: 86, engagementScore: 87,
    sparkline: [310, 340, 325, 360, 380, 370, 395],
    hasAnomaly: false,
  },
  {
    id: "blueridge",
    name: "Blue Ridge Outdoor",
    industry: "Retail Store",
    emoji: "🏔️",
    url: "blueridgeoutdoor.com",
    healthScore: 55, performanceScore: 48, seoScore: 62, engagementScore: 44,
    sparkline: [420, 380, 290, 240, 180, 120, 90],
    hasAnomaly: true,
    anomalyMsg: "Traffic dropped 78% in 5 days — possible indexing issue",
  },
  {
    id: "apex",
    name: "Apex Consulting Group",
    industry: "Professional Services",
    emoji: "💼",
    url: "apexconsulting.com",
    healthScore: 94, performanceScore: 96, seoScore: 95, engagementScore: 93,
    sparkline: [890, 920, 910, 940, 960, 950, 980],
    hasAnomaly: false,
  },
  {
    id: "brightminds",
    name: "Bright Minds Academy",
    industry: "Education",
    emoji: "📚",
    url: "brightmindsacademy.edu",
    healthScore: 81, performanceScore: 83, seoScore: 85, engagementScore: 80,
    sparkline: [340, 360, 380, 350, 390, 410, 420],
    hasAnomaly: false,
  },
  {
    id: "pacific",
    name: "Pacific Freight & Fulfillment",
    industry: "Logistics",
    emoji: "🚢",
    url: "pacificfreight.com",
    healthScore: 68, performanceScore: 65, seoScore: 72, engagementScore: 65,
    sparkline: [280, 300, 285, 310, 295, 280, 270],
    hasAnomaly: false,
  },
  {
    id: "sunrise",
    name: "Sunrise Yoga & Wellness",
    industry: "Fitness & Wellness",
    emoji: "🧘",
    url: "sunriseyoga.studio",
    healthScore: 90, performanceScore: 91, seoScore: 89, engagementScore: 91,
    sparkline: [240, 260, 255, 280, 290, 285, 310],
    hasAnomaly: false,
  },
  {
    id: "greenvalley",
    name: "Green Valley Gardens",
    industry: "Landscaping",
    emoji: "🌿",
    url: "greenvalleygardens.co",
    healthScore: 76, performanceScore: 79, seoScore: 80, engagementScore: 74,
    sparkline: [190, 210, 195, 215, 205, 220, 225],
    hasAnomaly: false,
  },
];

/* ─── A/B Tests ──────────────────────────────────────────────────────────── */

export const MOCK_AB_TESTS: ABTest[] = [
  // Active tests
  {
    id: "ab1",
    name: "Hero CTA — 'Book Now' vs 'Schedule Free Consultation'",
    hypothesis: "A longer, benefit-focused CTA will increase appointment requests by 20%",
    site: "Luminary Salon & Spa",
    page: "Homepage",
    element: "Hero CTA button text",
    controlLabel: "Book Now",
    variantLabel: "Schedule Free Consultation",
    controlConvPct: 3.2, variantConvPct: 4.1,
    split: 50, daysRunning: 14, sampleSize: 2840, confidence: 91,
    status: "active",
  },
  {
    id: "ab2",
    name: "Homepage Hero — Image vs Video Background",
    hypothesis: "A looping video hero will increase scroll depth and service card clicks",
    site: "Bellwood Bistro & Bar",
    page: "Homepage",
    element: "Hero background media type",
    controlLabel: "Static hero image",
    variantLabel: "Looping 15s video",
    controlConvPct: 2.8, variantConvPct: 2.6,
    split: 50, daysRunning: 7, sampleSize: 1240, confidence: 44,
    status: "active",
  },
  {
    id: "ab3",
    name: "Contact Form — 3-field vs 5-field",
    hypothesis: "Shorter form (name, email, message) will reduce abandonment vs 5-field",
    site: "Midtown Family Health",
    page: "Contact page",
    element: "Contact form field count",
    controlLabel: "5-field form (name, email, phone, service, message)",
    variantLabel: "3-field form (name, email, message)",
    controlConvPct: 4.1, variantConvPct: 5.8,
    split: 50, daysRunning: 21, sampleSize: 4180, confidence: 97,
    status: "active",
  },
  // Completed tests
  {
    id: "ab4",
    name: "Service Card Layout — Grid vs Carousel",
    hypothesis: "A scrollable carousel will increase service engagement",
    site: "Pawsome Pet Boarding",
    page: "Homepage",
    element: "Services section layout",
    controlLabel: "3-column grid",
    variantLabel: "Horizontal carousel",
    controlConvPct: 5.2, variantConvPct: 3.8,
    split: 50, daysRunning: 30, sampleSize: 8640, confidence: 99,
    status: "completed", winner: "control", lift: -27, sitesApplied: 0,
  },
  {
    id: "ab5",
    name: "Nav CTA — 'Call Us' vs Phone Number Visible",
    hypothesis: "Showing the phone number directly removes friction",
    site: "Summit Realty Partners",
    page: "All pages (nav)",
    element: "Navigation right-side CTA",
    controlLabel: "Call Us button",
    variantLabel: "Phone number displayed",
    controlConvPct: 1.8, variantConvPct: 2.9,
    split: 50, daysRunning: 28, sampleSize: 11200, confidence: 99,
    status: "completed", winner: "variant", lift: 61, sitesApplied: 8,
  },
  {
    id: "ab6",
    name: "Team Section — Show Credentials vs Specializations",
    hypothesis: "Specializations are more actionable than credentials for clients",
    site: "Midtown Family Health",
    page: "Homepage",
    element: "Vet card subtitle text",
    controlLabel: "DVM, DACVIM (credentials)",
    variantLabel: "Cardiology & Internal Medicine (specialization)",
    controlConvPct: 3.4, variantConvPct: 4.2,
    split: 50, daysRunning: 21, sampleSize: 6300, confidence: 96,
    status: "completed", winner: "variant", lift: 24, sitesApplied: 12,
  },
  {
    id: "ab7",
    name: "Hero Headline — Question vs Statement",
    hypothesis: "A question headline creates curiosity and improves engagement",
    site: "Apex Consulting Group",
    page: "Homepage",
    element: "Hero H1 text",
    controlLabel: "Strategic consulting for modern businesses",
    variantLabel: "Is your business growing as fast as it could?",
    controlConvPct: 2.1, variantConvPct: 2.3,
    split: 50, daysRunning: 30, sampleSize: 9800, confidence: 68,
    status: "completed", winner: undefined, lift: 10, sitesApplied: 0,
  },
  {
    id: "ab8",
    name: "Testimonials — Star Rating vs Quote-only",
    hypothesis: "Star ratings add social proof and improve trust",
    site: "Bellwood Bistro & Bar",
    page: "Homepage",
    element: "Testimonial card format",
    controlLabel: "Quote + author only",
    variantLabel: "Quote + author + 5-star rating",
    controlConvPct: 3.6, variantConvPct: 4.4,
    split: 50, daysRunning: 18, sampleSize: 5400, confidence: 98,
    status: "completed", winner: "variant", lift: 22, sitesApplied: 15,
  },
  {
    id: "ab9",
    name: "Hero Image — Clinic exterior vs Staff team photo",
    hypothesis: "A friendly team photo builds trust faster than a building",
    site: "Harbor City Auto Care",
    page: "Homepage",
    element: "Hero background image",
    controlLabel: "Clinic exterior photo",
    variantLabel: "Staff team smiling photo",
    controlConvPct: 1.9, variantConvPct: 2.8,
    split: 50, daysRunning: 25, sampleSize: 3800, confidence: 97,
    status: "completed", winner: "variant", lift: 47, sitesApplied: 6,
  },
  {
    id: "ab10",
    name: "Sticky Nav — Always visible vs Hide-on-scroll-down",
    hypothesis: "Hiding nav on scroll gives more content focus",
    site: "Bright Minds Academy",
    page: "All pages",
    element: "Navigation scroll behavior",
    controlLabel: "Always-sticky nav",
    variantLabel: "Hide on scroll down, show on scroll up",
    controlConvPct: 4.0, variantConvPct: 3.7,
    split: 50, daysRunning: 30, sampleSize: 12600, confidence: 82,
    status: "completed", winner: "control", lift: -8, sitesApplied: 0,
  },
  {
    id: "ab11",
    name: "Footer CTA — Newsletter vs Direct Booking",
    hypothesis: "A newsletter offer captures more warm leads at the bottom of the funnel",
    site: "Sunrise Yoga & Wellness",
    page: "All pages (footer)",
    element: "Footer call-to-action",
    controlLabel: "Direct booking button",
    variantLabel: "Newsletter signup with 10% off offer",
    controlConvPct: 1.2, variantConvPct: 3.1,
    split: 50, daysRunning: 30, sampleSize: 7800, confidence: 99,
    status: "completed", winner: "variant", lift: 158, sitesApplied: 9,
  },
];

/* ─── Conversion Funnels ─────────────────────────────────────────────────── */

export const MOCK_FUNNELS: Funnel[] = [
  {
    id: "f1",
    name: "Appointment Booking",
    site: "Midtown Family Health",
    endConversionPct: 13.8,
    industryBenchmarkPct: 18.2,
    steps: [
      { label: "Landing Page",       count: 1000, dropPct: 0,  avgTimeSec: 12  },
      { label: "Services Browsed",   count: 650,  dropPct: 35, avgTimeSec: 48  },
      { label: "Vet Profile Viewed", count: 380,  dropPct: 42, avgTimeSec: 72  },
      { label: "Form Started",       count: 210,  dropPct: 45, avgTimeSec: 95  },
      { label: "Form Submitted",     count: 142,  dropPct: 32, avgTimeSec: 180 },
      { label: "Confirmation",       count: 138,  dropPct: 3,  avgTimeSec: 8   },
    ],
    mobilePcts:  [100, 60, 32, 16, 10, 9],
    desktopPcts: [100, 68, 44, 26, 20, 19],
    trafficSplit: { organic: 52, paid: 28, direct: 14, referral: 6 },
  },
  {
    id: "f2",
    name: "Contact Enquiry",
    site: "Apex Consulting Group",
    endConversionPct: 8.4,
    industryBenchmarkPct: 6.5,
    steps: [
      { label: "Homepage",       count: 1000, dropPct: 0,  avgTimeSec: 15  },
      { label: "Services Page",  count: 720,  dropPct: 28, avgTimeSec: 55  },
      { label: "Contact Page",   count: 410,  dropPct: 43, avgTimeSec: 30  },
      { label: "Form Started",   count: 290,  dropPct: 29, avgTimeSec: 120 },
      { label: "Form Submitted", count: 84,   dropPct: 71, avgTimeSec: 210 },
    ],
    mobilePcts:  [100, 68, 34, 22, 6],
    desktopPcts: [100, 74, 46, 34, 11],
    trafficSplit: { organic: 65, paid: 18, direct: 12, referral: 5 },
  },
  {
    id: "f3",
    name: "Service Exploration",
    site: "Luminary Salon & Spa",
    endConversionPct: 22.1,
    industryBenchmarkPct: 19.8,
    steps: [
      { label: "Homepage",          count: 1000, dropPct: 0,  avgTimeSec: 18  },
      { label: "Services Section",  count: 820,  dropPct: 18, avgTimeSec: 65  },
      { label: "Service Detail",    count: 580,  dropPct: 29, avgTimeSec: 90  },
      { label: "Booking Intent",    count: 320,  dropPct: 45, avgTimeSec: 40  },
      { label: "Booking Complete",  count: 221,  dropPct: 31, avgTimeSec: 150 },
    ],
    mobilePcts:  [100, 80, 54, 28, 18],
    desktopPcts: [100, 84, 62, 36, 26],
    trafficSplit: { organic: 44, paid: 35, direct: 12, referral: 9 },
  },
  {
    id: "f4",
    name: "Team Engagement",
    site: "Pawsome Pet Boarding",
    endConversionPct: 31.5,
    industryBenchmarkPct: 24.0,
    steps: [
      { label: "Homepage",        count: 1000, dropPct: 0,  avgTimeSec: 14  },
      { label: "Meet the Team",   count: 780,  dropPct: 22, avgTimeSec: 80  },
      { label: "Staff Profile",   count: 560,  dropPct: 28, avgTimeSec: 110 },
      { label: "Book with Vet",   count: 315,  dropPct: 44, avgTimeSec: 55  },
    ],
    mobilePcts:  [100, 74, 50, 26],
    desktopPcts: [100, 82, 60, 38],
    trafficSplit: { organic: 58, paid: 15, direct: 20, referral: 7 },
  },
];
