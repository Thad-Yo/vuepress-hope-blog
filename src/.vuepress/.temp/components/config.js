import { defineClientConfig } from "@vuepress/client";
import { hasGlobalComponent } from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-shared@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-shared/lib/client/index.js";
import { h } from "vue";

import { useStyleTag } from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/@vueuse+core@10.2.1_vue@3.3.4/node_modules/@vueuse/core/index.mjs";
import Badge from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-plugin-components@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-plugin-components/lib/client/components/Badge.js";
import FontIcon from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-plugin-components@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-plugin-components/lib/client/components/FontIcon.js";
import BackToTop from "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-plugin-components@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-plugin-components/lib/client/components/BackToTop.js";

import "E:/vuepress-hope/vuepress-hope-blog/node_modules/.pnpm/vuepress-plugin-components@2.0.0-beta.231_vuepress@2.0.0-beta.64/node_modules/vuepress-plugin-components/lib/client/styles/sr-only.scss";

export default defineClientConfig({
  enhance: ({ app }) => {
    if(!hasGlobalComponent("Badge")) app.component("Badge", Badge);
    if(!hasGlobalComponent("FontIcon")) app.component("FontIcon", FontIcon);
    
  },
  setup: () => {
    useStyleTag(`\
@import url("//at.alicdn.com/t/c/font_4359564_a6o8l278nm.css");
`);
  },
  rootComponents: [
    () => h(BackToTop, {}),
  ],
});
