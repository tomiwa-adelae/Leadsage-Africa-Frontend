/**
 * Custom TipTap TextStyle extension that adds font-size and font-family
 * support without requiring any TipTap Pro extensions.
 *
 * Font families use a short key ("serif", "monospace", "sans-serif") as the
 * stored mark attribute. The browser normalises element.style.fontFamily
 * (e.g. 'Courier New' → Courier New), so storing the raw CSS string would
 * break the Select indicator after a round-trip through parseHTML. Short keys
 * are immune to this normalisation.
 */
import { TextStyle } from "@tiptap/extension-text-style";

// ── Font family definitions ──────────────────────────────────────────────────

export const FONT_FAMILIES: {
  label: string;
  /** Short key stored in the TipTap mark. */
  value: string;
  /** Full CSS font-family stack, used only for rendering. */
  css: string;
}[] = [
  { label: "Default",    value: "default",    css: "inherit" },
  { label: "Serif",      value: "serif",      css: "Georgia, 'Times New Roman', serif" },
  { label: "Monospace",  value: "monospace",  css: "'Courier New', Courier, monospace" },
  { label: "Sans-Serif", value: "sans-serif", css: "Arial, Helvetica, sans-serif" },
];

/** key → css (used in renderHTML) */
const KEY_TO_CSS: Record<string, string> = Object.fromEntries(
  FONT_FAMILIES.filter((f) => f.value !== "default").map((f) => [f.value, f.css])
);

/**
 * When parseHTML reads a browser-normalised fontFamily string (e.g.
 * "Georgia, \"Times New Roman\", serif"), we scan for the first recognised
 * font name and map it back to the short key.
 */
const CSS_FRAGMENTS_TO_KEY: Array<{ fragment: string; key: string }> = [
  { fragment: "Georgia",       key: "serif" },
  { fragment: "Times New Roman", key: "serif" },
  { fragment: "Courier New",   key: "monospace" },
  { fragment: "Courier",       key: "monospace" },
  { fragment: "Arial",         key: "sans-serif" },
  { fragment: "Helvetica",     key: "sans-serif" },
];

function cssToKey(css: string): string | null {
  const lower = css.toLowerCase();
  for (const { fragment, key } of CSS_FRAGMENTS_TO_KEY) {
    if (lower.includes(fragment.toLowerCase())) return key;
  }
  return null;
}

// ── Font size definitions ────────────────────────────────────────────────────

export const FONT_SIZES: { label: string; value: string }[] = [
  { label: "Small",   value: "13px" },
  { label: "Normal",  value: "16px" },
  { label: "Large",   value: "20px" },
  { label: "X-Large", value: "24px" },
  { label: "Huge",    value: "32px" },
];

// ── Colour palettes ──────────────────────────────────────────────────────────

export const TEXT_COLORS = [
  { label: "Default",   value: "inherit"  },
  { label: "Black",     value: "#000000"  },
  { label: "Dark Gray", value: "#374151"  },
  { label: "Gray",      value: "#6b7280"  },
  { label: "Red",       value: "#ef4444"  },
  { label: "Orange",    value: "#f97316"  },
  { label: "Amber",     value: "#f59e0b"  },
  { label: "Green",     value: "#22c55e"  },
  { label: "Teal",      value: "#14b8a6"  },
  { label: "Blue",      value: "#3b82f6"  },
  { label: "Indigo",    value: "#6366f1"  },
  { label: "Purple",    value: "#a855f7"  },
  { label: "Pink",      value: "#ec4899"  },
  { label: "White",     value: "#ffffff"  },
];

export const HIGHLIGHT_COLORS = [
  { label: "None",   value: "transparent" },
  { label: "Yellow", value: "#fef08a"     },
  { label: "Green",  value: "#bbf7d0"     },
  { label: "Blue",   value: "#bfdbfe"     },
  { label: "Pink",   value: "#fbcfe8"     },
  { label: "Orange", value: "#fed7aa"     },
  { label: "Purple", value: "#e9d5ff"     },
  { label: "Red",    value: "#fecaca"     },
];

// ── CustomTextStyle extension ────────────────────────────────────────────────

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    customTextStyle: {
      setFontSize:    (size:   string) => ReturnType;
      unsetFontSize:  ()               => ReturnType;
      setFontFamily:  (family: string) => ReturnType;
      unsetFontFamily:()               => ReturnType;
    };
  }
}

export const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),

      fontSize: {
        default: null,
        parseHTML: (element) => element.style.fontSize || null,
        renderHTML: (attributes) => {
          if (!attributes.fontSize) return {};
          return { style: `font-size: ${attributes.fontSize}` };
        },
      },

      fontFamily: {
        default: null,
        /** Read the browser-normalised CSS string and convert to a short key. */
        parseHTML: (element) => {
          const raw = element.style.fontFamily;
          if (!raw) return null;
          return cssToKey(raw) ?? null;
        },
        /** Render the short key as a proper CSS font-family stack. */
        renderHTML: (attributes) => {
          const key = attributes.fontFamily;
          if (!key) return {};
          const css = KEY_TO_CSS[key] ?? key;
          return { style: `font-family: ${css}` };
        },
      },
    };
  },

  addCommands() {
    return {
      ...this.parent?.(),
      setFontSize:
        (size) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: size }).run(),
      unsetFontSize:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontSize: null }).removeEmptyTextStyle().run(),
      setFontFamily:
        (family) =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontFamily: family }).run(),
      unsetFontFamily:
        () =>
        ({ chain }) =>
          chain().setMark("textStyle", { fontFamily: null }).removeEmptyTextStyle().run(),
    };
  },
});
