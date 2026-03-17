import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import type {
  FooterBlock,
  ClinicGeneralDetails,
  ClinicContact,
} from "../../types/clinic";

const SOCIAL_ICONS: Record<string, React.ElementType> = {
  facebook: Facebook,
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube,
};

interface Props {
  block: FooterBlock;
  general: ClinicGeneralDetails;
  contact: ClinicContact;
}

export function FooterRenderer({ block, general, contact }: Props) {
  const isDark = block.colorScheme === "dark";
  const isBrand = block.colorScheme === "brand";

  const bg = isBrand
    ? general.primaryColor
    : isDark
    ? "#111827"
    : "#ffffff";

  const textColor = isDark || isBrand ? "#e5e7eb" : "#374151";
  const mutedColor = isDark || isBrand ? "#9ca3af" : "#6b7280";
  const borderColor = isDark || isBrand ? "#1f2937" : "#e5e7eb";

  return (
    <footer
      style={{ backgroundColor: bg, color: textColor }}
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand column */}
          <div className="lg:col-span-2">
            {block.showLogo && general.logoUrl && (
              <img
                src={general.logoUrl}
                alt={`${general.name} logo`}
                className="h-10 w-auto object-contain mb-4 brightness-0 invert"
              />
            )}
            {(!general.logoUrl || !block.showLogo) && (
              <span className="text-lg font-bold block mb-4">{general.name}</span>
            )}
            {general.tagline && (
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: mutedColor }}>
                {general.tagline}
              </p>
            )}
            {/* Social links */}
            {block.showSocialLinks && block.socialLinks.length > 0 && (
              <div className="mt-5 flex items-center gap-4" aria-label="Social media links">
                {block.socialLinks.map(({ platform, url }) => {
                  const Icon = SOCIAL_ICONS[platform];
                  if (!Icon) return null;
                  return (
                    <a
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Visit us on ${platform}`}
                      className="w-8 h-8 rounded-full flex items-center justify-center border transition-opacity hover:opacity-70"
                      style={{ borderColor: mutedColor, color: mutedColor }}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: mutedColor }}>
              Contact
            </h3>
            <address className="not-italic text-sm space-y-2" style={{ color: textColor }}>
              <p>{contact.address.street}</p>
              <p>{contact.address.city}, {contact.address.state} {contact.address.zip}</p>
              <a
                href={`tel:${contact.phone}`}
                className="block hover:opacity-70 transition-opacity"
              >
                {contact.phone}
              </a>
              {contact.emergencyPhone && (
                <a
                  href={`tel:${contact.emergencyPhone}`}
                  className="block text-red-400 hover:opacity-70 transition-opacity font-medium"
                >
                  Emergency: {contact.emergencyPhone}
                </a>
              )}
              <a
                href={`mailto:${contact.email}`}
                className="block hover:opacity-70 transition-opacity"
              >
                {contact.email}
              </a>
            </address>
          </div>

          {/* Links column */}
          {block.footerLinks.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: mutedColor }}>
                Legal
              </h3>
              <ul className="space-y-2 text-sm" role="list">
                {block.footerLinks.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={link.openInNewTab ? "_blank" : undefined}
                      rel={link.openInNewTab ? "noopener noreferrer" : undefined}
                      className="hover:opacity-70 transition-opacity"
                      style={{ color: mutedColor }}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
          style={{ borderTop: `1px solid ${borderColor}`, color: mutedColor }}
        >
          <p>{block.copyrightText ?? `© ${new Date().getFullYear()} ${general.name}`}</p>
          <p className="hidden sm:block">Built with Vet CMS</p>
        </div>
      </div>
    </footer>
  );
}
