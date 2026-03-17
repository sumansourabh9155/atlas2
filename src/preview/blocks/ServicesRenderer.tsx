import {
  Scan, HeartPulse, Scissors, Activity, Ambulance, Ribbon,
  Stethoscope, Pill, FlaskConical, ChevronRight,
} from "lucide-react";
import type {
  ServicesBlock,
  ClinicGeneralDetails,
  Service,
} from "../../types/clinic";

/** Map Lucide icon name strings → components */
const ICON_MAP: Record<string, React.ElementType> = {
  Scan,
  HeartPulse,
  Scissors,
  Activity,
  Ambulance,
  Ribbon,
  Stethoscope,
  Pill,
  FlaskConical,
};

function ServiceIcon({
  name,
  color,
}: {
  name?: string;
  color: string;
}) {
  const Icon = (name && ICON_MAP[name]) ? ICON_MAP[name] : Stethoscope;
  return (
    <div
      className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ backgroundColor: `${color}18` }}
      aria-hidden="true"
    >
      <Icon className="w-6 h-6" style={{ color }} />
    </div>
  );
}

interface Props {
  block: ServicesBlock;
  general: ClinicGeneralDetails;
  services: Service[];
}

export function ServicesRenderer({ block, general, services }: Props) {
  /* Resolve which services to show */
  const pool =
    block.featuredServiceIds.length > 0
      ? services.filter((s) => block.featuredServiceIds.includes(s.id))
      : services;

  const visible = pool
    .filter((s) => s.isVisible)
    .sort((a, b) => a.order - b.order)
    .slice(0, block.maxItemsToShow);

  const colClass =
    block.gridColumns === 2
      ? "sm:grid-cols-2"
      : block.gridColumns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="services"
      className="py-20 px-6 bg-gray-50"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 max-w-2xl">
          {block.sectionTitle && (
            <h2
              id="services-heading"
              className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight"
            >
              {block.sectionTitle}
            </h2>
          )}
          {block.sectionSubtitle && (
            <p className="mt-3 text-lg text-gray-500 leading-relaxed">
              {block.sectionSubtitle}
            </p>
          )}
          {/* Color accent bar */}
          <div
            className="mt-5 h-1 w-16 rounded-full"
            style={{ backgroundColor: general.primaryColor }}
            aria-hidden="true"
          />
        </div>

        {/* Grid */}
        <ul className={`grid grid-cols-1 ${colClass} gap-6`} role="list">
          {visible.map((service) => (
            <li key={service.id}>
              <article
                className={`h-full flex flex-col bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow ${
                  service.isHighlighted
                    ? "border-transparent ring-2"
                    : "border-gray-100"
                }`}
                style={
                  service.isHighlighted
                    ? { "--tw-ring-color": `${general.primaryColor}40` } as React.CSSProperties
                    : undefined
                }
                aria-label={service.name}
              >
                <ServiceIcon
                  name={service.icon}
                  color={general.primaryColor}
                />

                <h3 className="mt-4 font-semibold text-gray-900 text-lg leading-snug">
                  {service.name}
                  {service.isHighlighted && (
                    <span
                      className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white align-middle"
                      style={{ backgroundColor: general.primaryColor }}
                      aria-label="Featured service"
                    >
                      Featured
                    </span>
                  )}
                </h3>

                {service.description && (
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed flex-1">
                    {service.description}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between flex-wrap gap-2">
                  {/* Meta row */}
                  <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                    {block.showPricing && service.priceDisplay && (
                      <span className="font-medium text-gray-600">
                        {service.priceDisplay}
                      </span>
                    )}
                    {service.duration && (
                      <span>{service.duration}</span>
                    )}
                  </div>

                  {/* CTA */}
                  {block.showCta && (
                    <a
                      href={service.slug ? `#service-${service.slug}` : "#services"}
                      className="inline-flex items-center gap-1 text-sm font-semibold hover:gap-2 transition-all"
                      style={{ color: general.primaryColor }}
                      aria-label={`${block.ctaLabel} about ${service.name}`}
                    >
                      {block.ctaLabel}
                      <ChevronRight className="w-4 h-4" aria-hidden="true" />
                    </a>
                  )}
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
