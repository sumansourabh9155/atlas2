import { MapPin, Phone, Mail, Globe } from "lucide-react";
import { FormField } from "../ui/FormField";
import type { ClinicContactCtx } from "../../../context/ClinicContext";
import { useReviewMode } from "../../../context/ReviewModeContext";
import { FieldReviewHint } from "../../ui/FieldReviewHint";

import { input as inputTokens, surface } from "../../../lib/styles/tokens";

const INPUT = inputTokens.base;
const CARD  = surface.section;

function SectionCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={CARD}>
      <div className="flex items-start gap-3 pb-4 border-b border-gray-100">
        <span className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-500 shrink-0">
          <Icon className="w-4 h-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="mt-0.5 text-xs text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  );
}

export type ContactData = ClinicContactCtx;

interface Props {
  data: ContactData;
  onChange: (updates: Partial<ContactData>) => void;
}

export function ContactSection({ data, onChange }: Props) {
  const { address } = data;
  const reviewMode  = useReviewMode();

  function setAddress(updates: Partial<typeof address>) {
    onChange({ address: { ...address, ...updates } });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Address ── */}
      <SectionCard
        icon={MapPin}
        title="Physical Address"
        description="Used on your contact page and in structured data for local SEO."
      >
        <FormField label="Street Address" htmlFor="street" required>
          <input
            id="street"
            name="address.street"
            type="text"
            value={address.street}
            onChange={(e) => setAddress({ street: e.target.value })}
            className={`${INPUT} ${reviewMode.getFieldHighlightClass("contact.address.street")}`}
            placeholder="4820 Burnet Road"
            autoComplete="street-address"
          />
          <FieldReviewHint path="contact.address.street" />
        </FormField>

        <FormField label="Suite / Unit" htmlFor="street2" optional>
          <input
            id="street2"
            name="address.street2"
            type="text"
            value={address.street2 ?? ""}
            onChange={(e) => setAddress({ street2: e.target.value })}
            className={INPUT}
            placeholder="Suite 100"
            autoComplete="address-line2"
          />
        </FormField>

        {/* City / State / ZIP — 3-col row */}
        <div className="grid grid-cols-3 gap-3">
          <FormField label="City" htmlFor="city" required className="col-span-1">
            <input
              id="city"
              name="address.city"
              type="text"
              value={address.city}
              onChange={(e) => setAddress({ city: e.target.value })}
              className={INPUT}
              placeholder="Austin"
              autoComplete="address-level2"
            />
          </FormField>

          <FormField label="State" htmlFor="state" required className="col-span-1">
            <input
              id="state"
              name="address.state"
              type="text"
              value={address.state}
              onChange={(e) => setAddress({ state: e.target.value })}
              className={INPUT}
              placeholder="TX"
              autoComplete="address-level1"
              maxLength={2}
            />
          </FormField>

          <FormField label="ZIP Code" htmlFor="zip" required className="col-span-1">
            <input
              id="zip"
              name="address.zip"
              type="text"
              value={address.zip}
              onChange={(e) => setAddress({ zip: e.target.value })}
              className={INPUT}
              placeholder="78756"
              autoComplete="postal-code"
              inputMode="numeric"
              maxLength={10}
            />
          </FormField>
        </div>

        <FormField label="Country" htmlFor="country">
          <input
            id="country"
            name="address.country"
            type="text"
            value={address.country}
            onChange={(e) => setAddress({ country: e.target.value })}
            className={INPUT}
            placeholder="United States"
            autoComplete="country-name"
          />
        </FormField>

        <FormField
          label="Google Maps Embed URL"
          htmlFor="mapEmbedUrl"
          hint="Paste the embed URL from Google Maps → Share → Embed a map. Shown in your contact section."
          optional
        >
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="mapEmbedUrl"
              name="address.mapEmbedUrl"
              type="url"
              value={address.mapEmbedUrl ?? ""}
              onChange={(e) => setAddress({ mapEmbedUrl: e.target.value || undefined })}
              className={`${INPUT} pl-8`}
              placeholder="https://www.google.com/maps/embed?pb=..."
            />
          </div>
        </FormField>
      </SectionCard>

      {/* ── Phone & Email ── */}
      <SectionCard
        icon={Phone}
        title="Phone & Email"
        description="Contact details displayed in your site header, footer, and contact page."
      >
        <FormField
          label="Main Phone"
          htmlFor="phone"
          hint="Include country code (e.g. +1 512 555 0182)"
          required
        >
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="phone"
              name="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({ phone: e.target.value })}
              className={`${INPUT} pl-8 ${reviewMode.getFieldHighlightClass("contact.phone")}`}
              placeholder="+1 (512) 555-0182"
              autoComplete="tel"
            />
          </div>
          <FieldReviewHint path="contact.phone" />
        </FormField>

        <FormField
          label="Emergency / After-Hours Phone"
          htmlFor="emergencyPhone"
          hint="Shown in red in the nav bar if provided."
          optional
        >
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              value={data.emergencyPhone ?? ""}
              onChange={(e) =>
                onChange({ emergencyPhone: e.target.value || undefined })
              }
              className={`${INPUT} pl-8 ${reviewMode.getFieldHighlightClass("contact.emergencyPhone")}`}
              placeholder="+1 (512) 555-0199"
              autoComplete="tel"
            />
          </div>
          <FieldReviewHint path="contact.emergencyPhone" />
        </FormField>

        <FormField label="Email Address" htmlFor="email" required>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="email"
              name="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({ email: e.target.value })}
              className={`${INPUT} pl-8 ${reviewMode.getFieldHighlightClass("contact.email")}`}
              placeholder="care@yourClinic.vet"
              autoComplete="email"
            />
          </div>
          <FieldReviewHint path="contact.email" />
        </FormField>

        <FormField
          label="Website URL"
          htmlFor="website"
          hint="Your existing website, if any. Leave blank if this CMS site is your primary."
          optional
        >
          <div className="relative">
            <Globe
              className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
              aria-hidden="true"
            />
            <input
              id="website"
              name="website"
              type="url"
              value={data.website ?? ""}
              onChange={(e) =>
                onChange({ website: e.target.value || undefined })
              }
              className={`${INPUT} pl-8`}
              placeholder="https://yourClinic.vet"
              autoComplete="url"
            />
          </div>
        </FormField>
      </SectionCard>
    </div>
  );
}
