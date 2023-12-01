import { reveal, revealMarkdown, revealHighlight, revealMath, revealSearch, revealNotes, revealZoom } from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-plugin-md-enhance@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-plugin-md-enhance/lib/client/index.js";

export const useReveal = () => [reveal(), revealMarkdown(), revealHighlight(), revealMath(), revealSearch(), revealNotes(), revealZoom()];
