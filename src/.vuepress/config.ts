import { defineUserConfig } from "vuepress";
import theme from "./theme.js";

export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "en-US",
      title: "J.F.Gaufrid",
      description: "",
    },
    "/zh/": {
      lang: "zh-CN",
      title: "J.F.Gaufrid",
      description: "小贾写字的地方",
    },
  },

  theme,

  // Enable it with pwa
  // shouldPrefetch: false,
});
