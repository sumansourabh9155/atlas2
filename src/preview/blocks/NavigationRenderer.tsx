import { Phone, Menu } from "lucide-react";
import type { NavigationBlock, ClinicGeneralDetails, ClinicContact } from "../../types/clinic";

interface Props {
  block: NavigationBlock;
  general: ClinicGeneralDetails;
  contact: ClinicContact;
}

export function NavigationRenderer({ block, general, contact }: Props) {
  const bgClass =
    block.colorScheme === "dark"
      ? "bg-gray-900 text-white"
      : block.colorScheme === "brand"
      ? "text-white"
      : "bg-white text-gray-900 border-b border-gray-100";

  const brandBg =
    block.colorScheme === "brand" ? general.primaryColor : undefined;

  return (
    <nav
      className={`w-full z-50 ${block.isSticky ? "sticky top-0" : ""} shadow-sm ${bgClass}`}
      style={brandBg ? { backgroundColor: brandBg } : undefined}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 shrink-0">
          {block.logoOverrideUrl || general.logoUrl ? (
            <img
              src={block.logoOverrideUrl ?? general.logoUrl}
              alt={`${general.name} logo`}
              className="h-9 w-auto object-contain"
            />
          ) : (
            <span
              className="text-xl font-bold tracking-tight"
              style={{ color: general.primaryColor }}
            >
              {general.name}
            </span>
          )}
          {block.showClinicName && (block.logoOverrideUrl || general.logoUrl) && (
            <span className="hidden sm:block font-semibold text-sm">
              {general.name}
            </span>
          )}
        </div>

        {/* Nav links — desktop */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {block.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target={link.openInNewTab ? "_blank" : undefined}
                rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                className="text-sm font-medium hover:opacity-70 transition-opacity"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Emergency phone — always visible */}
          <a
            href={`tel:${contact.emergencyPhone ?? contact.phone}`}
            className="hidden lg:flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
            aria-label={`Emergency line: ${contact.emergencyPhone ?? contact.phone}`}
          >
            <Phone className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{contact.emergencyPhone ?? contact.phone}</span>
          </a>

          {/* CTA button */}
          {block.ctaButton && (
            <a
              href={block.ctaButton.href}
              className="hidden md:inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white shadow-sm hover:opacity-90 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ backgroundColor: general.primaryColor }}
            >
              {block.ctaButton.label}
            </a>
          )}

          {/* Mobile hamburger (visual only in preview) */}
          <button
            className="md:hidden p-2 rounded-md"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <Menu className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </nav>
  );
}
