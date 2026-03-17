import { BadgeCheck } from "lucide-react";
import type {
  TeamsBlock,
  ClinicGeneralDetails,
  Veterinarian,
} from "../../types/clinic";

interface Props {
  block: TeamsBlock;
  general: ClinicGeneralDetails;
  veterinarians: Veterinarian[];
}

/** Renders a single specialization pill */
function SpecPill({
  label,
  color,
}: {
  label: string;
  color: string;
}) {
  return (
    <span
      className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ backgroundColor: `${color}15`, color }}
    >
      {label}
    </span>
  );
}

export function TeamsRenderer({ block, general, veterinarians }: Props) {
  const pool =
    block.featuredVetIds.length > 0
      ? veterinarians.filter((v) => block.featuredVetIds.includes(v.id))
      : veterinarians;

  const visible = pool
    .filter((v) => v.isVisible)
    .sort((a, b) => a.order - b.order);

  const colClass =
    block.gridColumns === 2
      ? "sm:grid-cols-2"
      : block.gridColumns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <section
      id="team"
      className="py-20 px-6 bg-white"
      aria-labelledby="team-heading"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-12 max-w-2xl">
          {block.sectionTitle && (
            <h2
              id="team-heading"
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
          <div
            className="mt-5 h-1 w-16 rounded-full"
            style={{ backgroundColor: general.primaryColor }}
            aria-hidden="true"
          />
        </div>

        {/* Vet cards */}
        <ul className={`grid grid-cols-1 ${colClass} gap-8`} role="list">
          {visible.map((vet) => (
            <li key={vet.id}>
              <article
                className="h-full flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                aria-label={`${vet.name}${vet.credentials ? `, ${vet.credentials}` : ""}`}
              >
                {/* Photo */}
                <div className="relative bg-gray-100 aspect-[4/3] overflow-hidden">
                  {vet.photoUrl ? (
                    <img
                      src={vet.photoUrl}
                      alt={`Portrait of ${vet.name}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    /* Fallback avatar */
                    <div
                      className="w-full h-full flex items-center justify-center text-5xl font-bold text-white"
                      style={{ backgroundColor: general.primaryColor }}
                      aria-hidden="true"
                    >
                      {vet.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}

                  {/* Credentials badge overlay */}
                  {block.showCredentials && vet.credentials && (
                    <div
                      className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: general.primaryColor }}
                    >
                      <BadgeCheck className="w-3 h-3" aria-hidden="true" />
                      {vet.credentials}
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 gap-3">
                  {/* Name & title */}
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">
                      {vet.name}
                    </h3>
                    {vet.title && (
                      <p
                        className="text-sm font-medium mt-0.5"
                        style={{ color: general.primaryColor }}
                      >
                        {vet.title}
                      </p>
                    )}
                  </div>

                  {/* Specializations */}
                  {block.showSpecializations &&
                    vet.specializations.length > 0 && (
                      <div
                        className="flex flex-wrap gap-1.5"
                        aria-label="Specializations"
                      >
                        {vet.specializations.map((spec) => (
                          <SpecPill
                            key={spec}
                            label={spec}
                            color={general.primaryColor}
                          />
                        ))}
                      </div>
                    )}

                  {/* Bio */}
                  {block.showBio && vet.bio && (
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-4 flex-1">
                      {vet.bio}
                    </p>
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
