// ─── Section Registry ─────────────────────────────────────────────────────────
// Central export for all addable section types, state factories, renderers,
// editors, and thumbnails.

// ── Existing sections ─────────────────────────────────────────────────────────

export type { StatsState, StatItem }                         from "./StatsSection";
export { createDefaultStats, StatsSectionRenderer, StatsEditor, StatsThumbnail } from "./StatsSection";

export type { CtaBandState }                                 from "./CtaBandSection";
export { createDefaultCtaBand, CtaBandSectionRenderer, CtaBandEditor, CtaBandThumbnail } from "./CtaBandSection";

export type { GalleryState, GalleryPhoto }                   from "./GallerySection";
export { createDefaultGallery, GallerySectionRenderer, GalleryEditor, GalleryThumbnail } from "./GallerySection";

export type { ContactInfoState }                             from "./ContactInfoSection";
export { createDefaultContactInfo, ContactInfoSectionRenderer, ContactInfoEditor, ContactInfoThumbnail } from "./ContactInfoSection";

export type { TeamSpotlightState }                           from "./TeamSpotlightSection";
export { createDefaultTeamSpotlight, TeamSpotlightSectionRenderer, TeamSpotlightEditor, TeamSpotlightThumbnail } from "./TeamSpotlightSection";

// ── Typography sections ───────────────────────────────────────────────────────

export type { HeadingState, ParagraphState, TextBlockState, BlockQuoteState, RichTextState } from "./TypographySections";
export { createDefaultHeading, HeadingSectionRenderer, HeadingEditor, HeadingThumbnail } from "./TypographySections";
export { createDefaultParagraph, ParagraphSectionRenderer, ParagraphEditor, ParagraphThumbnail } from "./TypographySections";
export { createDefaultTextBlock, TextBlockSectionRenderer, TextBlockEditor, TextBlockThumbnail } from "./TypographySections";
export { createDefaultBlockQuote, BlockQuoteSectionRenderer, BlockQuoteEditor, BlockQuoteThumbnail } from "./TypographySections";
export { createDefaultRichText, RichTextSectionRenderer, RichTextEditor, RichTextThumbnail } from "./TypographySections";

// ── Layout sections ───────────────────────────────────────────────────────────

export type { EmptyState, TwoColState, TwoColColumn, ThreeColState, ThreeColItem } from "./LayoutSections";
export { createDefaultEmpty, EmptySectionRenderer, EmptyEditor, EmptyThumbnail } from "./LayoutSections";
export { createDefaultTwoCol, TwoColSectionRenderer, TwoColEditor, TwoColThumbnail } from "./LayoutSections";
export { createDefaultThreeCol, ThreeColSectionRenderer, ThreeColEditor, ThreeColThumbnail } from "./LayoutSections";

// ── Card sections ─────────────────────────────────────────────────────────────

export type { CardGridState, CardItem, TeamCardsState, TeamMemberCard } from "./CardSections";
export { createDefaultCardGrid2, createDefaultCardGrid3, CardGridSectionRenderer, CardGridEditor, CardGrid2Thumbnail, CardGrid3Thumbnail } from "./CardSections";
export { createDefaultTeamCards, TeamCardsSectionRenderer, TeamCardsEditor, TeamCardsThumbnail } from "./CardSections";

// ── Hero sections ─────────────────────────────────────────────────────────────

export type { HeroCenteredState, HeroSplitState } from "./HeroSections";
export { createDefaultHeroCentered, HeroCenteredSectionRenderer, HeroCenteredEditor, HeroCenteredThumbnail } from "./HeroSections";
export { createDefaultHeroSplit, HeroSplitSectionRenderer, HeroSplitEditor, HeroSplitThumbnail } from "./HeroSections";

// ── Contact sections ──────────────────────────────────────────────────────────

export type { ContactSplitState, ContactFormField } from "./ContactSplitSection";
export { createDefaultContactSplit, ContactSplitSectionRenderer, ContactSplitEditor, ContactSplitThumbnail } from "./ContactSplitSection";

// ─── Imports for registry ─────────────────────────────────────────────────────

import { StatsThumbnail }          from "./StatsSection";
import { CtaBandThumbnail }        from "./CtaBandSection";
import { GalleryThumbnail }        from "./GallerySection";
import { ContactInfoThumbnail }    from "./ContactInfoSection";
import { TeamSpotlightThumbnail }  from "./TeamSpotlightSection";
import { HeadingThumbnail }        from "./TypographySections";
import { ParagraphThumbnail }      from "./TypographySections";
import { TextBlockThumbnail }      from "./TypographySections";
import { BlockQuoteThumbnail }     from "./TypographySections";
import { RichTextThumbnail }       from "./TypographySections";
import { EmptyThumbnail }          from "./LayoutSections";
import { TwoColThumbnail }         from "./LayoutSections";
import { ThreeColThumbnail }       from "./LayoutSections";
import { CardGrid2Thumbnail }      from "./CardSections";
import { CardGrid3Thumbnail }      from "./CardSections";
import { TeamCardsThumbnail }      from "./CardSections";
import { HeroCenteredThumbnail }   from "./HeroSections";
import { HeroSplitThumbnail }      from "./HeroSections";
import { ContactSplitThumbnail }   from "./ContactSplitSection";

import type { StatsState }         from "./StatsSection";
import type { CtaBandState }       from "./CtaBandSection";
import type { GalleryState }       from "./GallerySection";
import type { ContactInfoState }   from "./ContactInfoSection";
import type { TeamSpotlightState } from "./TeamSpotlightSection";
import type { HeadingState, ParagraphState, TextBlockState, BlockQuoteState, RichTextState } from "./TypographySections";
import type { EmptyState, TwoColState, ThreeColState } from "./LayoutSections";
import type { CardGridState, TeamCardsState } from "./CardSections";
import type { HeroCenteredState, HeroSplitState } from "./HeroSections";
import type { ContactSplitState }  from "./ContactSplitSection";

import { createDefaultStats }         from "./StatsSection";
import { createDefaultCtaBand }       from "./CtaBandSection";
import { createDefaultGallery }       from "./GallerySection";
import { createDefaultContactInfo }   from "./ContactInfoSection";
import { createDefaultTeamSpotlight } from "./TeamSpotlightSection";
import { createDefaultHeading, createDefaultParagraph, createDefaultTextBlock, createDefaultBlockQuote, createDefaultRichText } from "./TypographySections";
import { createDefaultEmpty, createDefaultTwoCol, createDefaultThreeCol } from "./LayoutSections";
import { createDefaultCardGrid2, createDefaultCardGrid3, createDefaultTeamCards } from "./CardSections";
import { createDefaultHeroCentered, createDefaultHeroSplit } from "./HeroSections";
import { createDefaultContactSplit }  from "./ContactSplitSection";

// ─── Addable Section Types ────────────────────────────────────────────────────

export type AddableSectionType =
  | "stats" | "ctaband" | "gallery" | "contactinfo" | "teamspotlight"
  | "heading" | "paragraph" | "textblock" | "blockquote" | "richtext"
  | "empty" | "twocol" | "threecol"
  | "cardgrid2" | "cardgrid3" | "teamcards"
  | "herocentered" | "herosplit"
  | "contactsplit";

// ─── Discriminated Union State ────────────────────────────────────────────────

export type DynamicSectionState =
  | { type: "stats";         state: StatsState         }
  | { type: "ctaband";       state: CtaBandState        }
  | { type: "gallery";       state: GalleryState        }
  | { type: "contactinfo";   state: ContactInfoState    }
  | { type: "teamspotlight"; state: TeamSpotlightState  }
  | { type: "heading";       state: HeadingState        }
  | { type: "paragraph";     state: ParagraphState      }
  | { type: "textblock";     state: TextBlockState      }
  | { type: "blockquote";    state: BlockQuoteState     }
  | { type: "richtext";      state: RichTextState       }
  | { type: "empty";         state: EmptyState          }
  | { type: "twocol";        state: TwoColState         }
  | { type: "threecol";      state: ThreeColState       }
  | { type: "cardgrid2";     state: CardGridState       }
  | { type: "cardgrid3";     state: CardGridState       }
  | { type: "teamcards";     state: TeamCardsState      }
  | { type: "herocentered";  state: HeroCenteredState   }
  | { type: "herosplit";     state: HeroSplitState      }
  | { type: "contactsplit";  state: ContactSplitState   };

export type DynamicSectionRegistry = Record<string, DynamicSectionState>;

// ─── Factory ──────────────────────────────────────────────────────────────────

export function createDefaultSection(type: AddableSectionType): DynamicSectionState {
  switch (type) {
    case "stats":         return { type, state: createDefaultStats()          };
    case "ctaband":       return { type, state: createDefaultCtaBand()        };
    case "gallery":       return { type, state: createDefaultGallery()        };
    case "contactinfo":   return { type, state: createDefaultContactInfo()    };
    case "teamspotlight": return { type, state: createDefaultTeamSpotlight()  };
    case "heading":       return { type, state: createDefaultHeading()        };
    case "paragraph":     return { type, state: createDefaultParagraph()      };
    case "textblock":     return { type, state: createDefaultTextBlock()      };
    case "blockquote":    return { type, state: createDefaultBlockQuote()     };
    case "richtext":      return { type, state: createDefaultRichText()       };
    case "empty":         return { type, state: createDefaultEmpty()          };
    case "twocol":        return { type, state: createDefaultTwoCol()         };
    case "threecol":      return { type, state: createDefaultThreeCol()       };
    case "cardgrid2":     return { type, state: createDefaultCardGrid2()      };
    case "cardgrid3":     return { type, state: createDefaultCardGrid3()      };
    case "teamcards":     return { type, state: createDefaultTeamCards()      };
    case "herocentered":  return { type, state: createDefaultHeroCentered()   };
    case "herosplit":     return { type, state: createDefaultHeroSplit()      };
    case "contactsplit":  return { type, state: createDefaultContactSplit()   };
  }
}

// ─── Utilities ────────────────────────────────────────────────────────────────

const ALL_TYPES: AddableSectionType[] = [
  "stats","ctaband","gallery","contactinfo","teamspotlight",
  "heading","paragraph","textblock","blockquote","richtext",
  "empty","twocol","threecol",
  "cardgrid2","cardgrid3","teamcards",
  "herocentered","herosplit",
  "contactsplit",
];

/** Returns true when an id is a dynamic section instance (e.g. "stats-0"). */
export function isDynamicSection(id: string): boolean {
  return /^[a-z][a-z0-9]*-\d+$/.test(id);
}

/** Extracts the AddableSectionType from an instance ID. Returns null if not a dynamic ID. */
export function getTypeFromInstanceId(instanceId: string): AddableSectionType | null {
  const m = instanceId.match(/^([a-z][a-z0-9]*)-\d+$/);
  if (!m) return null;
  return ALL_TYPES.includes(m[1] as AddableSectionType) ? (m[1] as AddableSectionType) : null;
}

// ─── Meta (labels, emojis, categories) ───────────────────────────────────────

export const DYNAMIC_SECTION_META: Record<AddableSectionType, { label: string; emoji: string; category: string }> = {
  stats:         { label: "Stats",          emoji: "📊", category: "Sections"   },
  ctaband:       { label: "CTA Band",       emoji: "📣", category: "Sections"   },
  gallery:       { label: "Gallery",        emoji: "🖼️",  category: "Sections"   },
  contactinfo:   { label: "Contact Info",   emoji: "📍", category: "Sections"   },
  teamspotlight: { label: "Team Spotlight", emoji: "🧑‍⚕️", category: "Sections"   },
  heading:       { label: "Heading",        emoji: "H",  category: "Typography" },
  paragraph:     { label: "Paragraph",      emoji: "¶",  category: "Typography" },
  textblock:     { label: "Text + Image",   emoji: "🖊",  category: "Typography" },
  blockquote:    { label: "Block Quote",    emoji: "❝",  category: "Typography" },
  richtext:      { label: "Rich Text",      emoji: "📝", category: "Typography" },
  empty:         { label: "Empty",          emoji: "□",  category: "Layout"     },
  twocol:        { label: "2 Column",       emoji: "▥",  category: "Layout"     },
  threecol:      { label: "3 Column",       emoji: "⊞",  category: "Layout"     },
  cardgrid2:     { label: "2-Col Cards",    emoji: "🗂",  category: "Cards"      },
  cardgrid3:     { label: "3-Col Cards",    emoji: "🗃",  category: "Cards"      },
  teamcards:     { label: "Team Cards",     emoji: "👥", category: "Cards"      },
  herocentered:  { label: "Hero Centered",  emoji: "✦",  category: "Hero"       },
  herosplit:     { label: "Hero Split",     emoji: "⬓",  category: "Hero"       },
  contactsplit:  { label: "Contact + Form", emoji: "✉",  category: "Contact"    },
};

// ─── LeftPanel Section Definitions ───────────────────────────────────────────

export interface AddableSectionDef {
  type: AddableSectionType;
  label: string;
  thumb: React.ReactNode;
  category: string;
}

export const ADDABLE_SECTION_DEFS: AddableSectionDef[] = [
  // Sections (pre-built composed blocks)
  { type: "stats",         label: "Stats",          thumb: <StatsThumbnail />,         category: "Sections"   },
  { type: "ctaband",       label: "CTA Band",        thumb: <CtaBandThumbnail />,       category: "Sections"   },
  { type: "gallery",       label: "Gallery",         thumb: <GalleryThumbnail />,       category: "Sections"   },
  { type: "contactinfo",   label: "Contact Info",    thumb: <ContactInfoThumbnail />,   category: "Sections"   },
  { type: "teamspotlight", label: "Team Spotlight",  thumb: <TeamSpotlightThumbnail />, category: "Sections"   },
  // Typography
  { type: "heading",       label: "Heading",         thumb: <HeadingThumbnail />,       category: "Typography" },
  { type: "paragraph",     label: "Paragraph",       thumb: <ParagraphThumbnail />,     category: "Typography" },
  { type: "textblock",     label: "Text + Image",    thumb: <TextBlockThumbnail />,     category: "Typography" },
  { type: "blockquote",    label: "Block Quote",     thumb: <BlockQuoteThumbnail />,    category: "Typography" },
  { type: "richtext",      label: "Rich Text",       thumb: <RichTextThumbnail />,      category: "Typography" },
  // Layout
  { type: "empty",         label: "Empty",           thumb: <EmptyThumbnail />,         category: "Layout"     },
  { type: "twocol",        label: "2 Column",        thumb: <TwoColThumbnail />,        category: "Layout"     },
  { type: "threecol",      label: "3 Column",        thumb: <ThreeColThumbnail />,      category: "Layout"     },
  // Cards
  { type: "cardgrid2",     label: "2-Col Cards",     thumb: <CardGrid2Thumbnail />,     category: "Cards"      },
  { type: "cardgrid3",     label: "3-Col Cards",     thumb: <CardGrid3Thumbnail />,     category: "Cards"      },
  { type: "teamcards",     label: "Team Cards",      thumb: <TeamCardsThumbnail />,     category: "Cards"      },
  // Hero Sections
  { type: "herocentered",  label: "Hero Centered",   thumb: <HeroCenteredThumbnail />,  category: "Hero"       },
  { type: "herosplit",     label: "Hero Split",      thumb: <HeroSplitThumbnail />,     category: "Hero"       },
  // Contact
  { type: "contactsplit",  label: "Contact + Form",  thumb: <ContactSplitThumbnail />,  category: "Contact"    },
];
