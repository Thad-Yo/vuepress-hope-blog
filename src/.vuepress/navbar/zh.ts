import { navbar } from "vuepress-theme-hope";

export const zhNavbar = navbar([
  "/zh/",
  // "/zh/demo/",
  {
    text: "代码笔记",
    icon: "blogbiji",
    prefix: "/zh/posts/code/",
    children: [
      {
        text: "Linux",
        icon: "bloglinux",
        prefix: "Linux/",
        children: [
          { 
            text: "Linux文件系统", 
            icon: "bloglinux", 
            link: "Linux文件系统" 
          },
        ],
      },
      {
        text: "产品设计",
        icon: "pen-to-square",
        prefix: "Design/",
        children: [
          { 
            text: "UI设计", 
            icon: "pen-to-square", 
            link: "README" 
          },
        ],
      },
      {
        text: "SRE",
        icon: "pen-to-square",
        prefix: "SRE/",
        children: [
          {
            text: "香蕉 1",
            icon: "pen-to-square",
            link: "1",
          },
          {
            text: "香蕉 2",
            icon: "pen-to-square",
            link: "2",
          },
          "3",
          "4",
        ],
      },
    ],
  },
  {
    text: "软件教程",
    icon: "blogruanjiankaifabao",
    link: "https://theme-hope.vuejs.press/zh/",
  },
]);
