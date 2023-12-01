export const typeMap = {"article":{"/":{"path":"/article/","keys":["v-df8b6e0c","v-6e19edb7","v-f0ec4556","v-24b7c48d","v-2bc6566a","v-7f25ca3a","v-7d70f19b","v-7bbc18fc","v-7a07405d","v-6cd750ef","v-6b227850","v-696d9fb1","v-67b8c712","v-184f4da6","v-2e3eac9e","v-4e65ec78","v-c151bf32","v-438ffe52","v-1473bf53"]},"/zh/":{"path":"/zh/article/","keys":["v-56a32aab","v-62ced1a6","v-fbdb96d6","v-52dc8246","v-5127a9a7","v-4f72d108","v-4dbdf869","v-f19e831c","v-f508345a","v-f871e598","v-858cfdd6","v-269ae70f","v-c1942916","v-65c00218","v-36295574","v-2b64e284"]}},"star":{"/":{"path":"/star/","keys":["v-7bbc18fc","v-df8b6e0c","v-696d9fb1","v-6e19edb7"]},"/zh/":{"path":"/zh/star/","keys":["v-4f72d108","v-56a32aab","v-f871e598","v-62ced1a6"]}},"timeline":{"/":{"path":"/timeline/","keys":["v-df8b6e0c","v-f0ec4556","v-24b7c48d","v-2bc6566a","v-7f25ca3a","v-7d70f19b","v-7bbc18fc","v-7a07405d","v-6cd750ef","v-6b227850","v-696d9fb1","v-67b8c712","v-6e19edb7"]},"/zh/":{"path":"/zh/timeline/","keys":["v-fbdb96d6","v-56a32aab","v-52dc8246","v-5127a9a7","v-4f72d108","v-4dbdf869","v-f19e831c","v-f508345a","v-f871e598","v-62ced1a6"]}}};

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
  if (__VUE_HMR_RUNTIME__.updateBlogType)
    __VUE_HMR_RUNTIME__.updateBlogType(typeMap);
}

if (import.meta.hot)
  import.meta.hot.accept(({ typeMap }) => {
    __VUE_HMR_RUNTIME__.updateBlogType(typeMap);
  });

