import { reveal, revealMarkdown, revealHighlight, revealMath, revealSearch, revealNotes, revealZoom } from "/Users/thadyo/Code/my-blog/node_modules/.pnpm/vuepress-plugin-md-enhance@2.0.0-beta.226_vuepress@2.0.0-beta.63/node_modules/vuepress-plugin-md-enhance/lib/client/index.js";

export const useReveal = () => [reveal(), revealMarkdown(), revealHighlight(), revealMath(), revealSearch(), revealNotes(), revealZoom()];
