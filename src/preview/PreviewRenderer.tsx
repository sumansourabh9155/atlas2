/**
 * PreviewRenderer
 *
 * Accepts a ClinicWebsite object and renders all visible page blocks
 * in order. Acts as the live-preview panel in the CMS editor.
 *
 * Extend this file when you add new block types — just import the new
 * renderer and add a case to the switch statement.
 */

import type { ClinicWebsite, PageBlock } from "../types/clinic";
import { NavigationRenderer } from "./blocks/NavigationRenderer";
import { HeroRenderer } from "./blocks/HeroRenderer";
import { ServicesRenderer } from "./blocks/ServicesRenderer";
import { TeamsRenderer } from "./blocks/TeamsRenderer";
import { FooterRenderer } from "./blocks/FooterRenderer";

interface Props {
  website: ClinicWebsite;
}

/** Renders a single block by delegating to the correct block component */
function BlockSwitch({
  block,
  website,
}: {
  block: PageBlock;
  website: ClinicWebsite;
}) {
  const { general, contact, services, veterinarians } = website;

  switch (block.type) {
    case "navigation":
      return (
        <NavigationRenderer block={block} general={general} contact={contact} />
      );
    case "hero":
      return <HeroRenderer block={block} general={general} />;
    case "services":
      return (
        <ServicesRenderer block={block} general={general} services={services} />
      );
    case "teams":
      return (
        <TeamsRenderer
          block={block}
          general={general}
          veterinarians={veterinarians}
        />
      );
    case "footer":
      return (
        <FooterRenderer block={block} general={general} contact={contact} />
      );
    case "testimonials":
    case "contact":
      /* Stubs — will be implemented in later sprints */
      return (
        <section className="py-16 px-6 bg-gray-50 text-center text-gray-400 text-sm border-y border-dashed border-gray-200">
          <span className="uppercase tracking-widest text-xs font-semibold">
            [{block.type} block — coming soon]
          </span>
        </section>
      );
    default: {
      // Exhaustiveness guard — new block types added to PageBlock union will cause a
      // compile-time error here, prompting the developer to add a renderer.
      const _exhaustive: never = block;
      console.warn("[PreviewRenderer] Unhandled block type:", (_exhaustive as PageBlock).type);
      return null;
    }
  }
}

export function PreviewRenderer({ website }: Props) {
  const visibleBlocks = [...website.blocks]
    .filter((b) => b.isVisible)
    .sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen font-sans antialiased" id="preview-root">
      {visibleBlocks.map((block) => (
        <BlockSwitch key={block.blockId} block={block} website={website} />
      ))}
    </div>
  );
}
