export const seo = ({
  title,
  description = "Transform and clean any SVG file into a React component!",
  keywords = [
    "svg",
    "react",
    "typescript",
    "clean svgs",
    "svg to react component",
  ],
}: {
  title: string;
  description?: string;
  keywords?: string[];
}) => {
  return [
    { title },
    { name: "description", content: description },
    { name: "keywords", content: keywords.join(", ") },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:creator", content: "@herbievine" },
    { name: "twitter:site", content: "@herbievine" },
    { name: "og:type", content: "website" },
    { name: "og:title", content: title },
    { name: "og:description", content: description },
    // ...(image
    //   ? [
    //       { name: "twitter:image", content: image },
    //       { name: "twitter:card", content: "summary_large_image" },
    //       { name: "og:image", content: image },
    //     ]
    //   : []),
  ] as const;
};
