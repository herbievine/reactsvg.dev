import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/start";
import { z } from "zod";
import { optimize } from "svgo";
import prettier from "prettier";
import parserTypescript from "prettier/parser-typescript";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../components/button";
import { useCopyToClipboard } from "@uidotdev/usehooks";

const searchSchema = z.object({
  d: z.string(),
});

const convert = createServerFn({
  method: "GET",
})
  .validator(searchSchema)
  .handler(async ({ data: { d } }) => {
    const decoded = decodeURI(d);
    const svg = atob(decoded);

    const result = optimize(svg, {
      plugins: [
        {
          name: "removeAttrs",
          params: { attrs: "(class)" },
        },
        {
          name: "removeComments",
          params: {
            preservePatterns: false,
          },
        },
      ],
    });

    const name = "REACTSVG_COMP_NAME";

    let jsx = result.data
      .replace(/stroke-width=/g, "strokeWidth=")
      .replace(/stroke-linecap=/g, "strokeLinecap=")
      .replace(/stroke-linejoin=/g, "strokeLinejoin=");

    jsx = jsx.replace(/<svg/, `<svg aria-label="${name} icon"`);

    if (!/<title>/.test(jsx)) {
      jsx = jsx.replace(/(<svg[^>]*>)/, `$1<title>${name} icon</title>`);
    }

    jsx = jsx.replace(/<svg([^>]*)>/, `<svg$1 {...props}>`);

    return prettier.format(
      'import type { SVGProps } from "react";' +
        "\n\n" +
        `export function ${name}Icon(props: SVGProps<SVGSVGElement>) {` +
        `return (${jsx.trim()});` +
        "}",
      {
        parser: "typescript",
        plugins: [parserTypescript],
        semi: true,
        singleQuote: false,
        trailingComma: "all",
        printWidth: 80,
        tabWidth: 2,
      },
    );
  });

export const Route = createFileRoute("/code")({
  loaderDeps: ({ search }) => ({ search }),
  loader: ({ deps: { search } }) => convert({ data: search }),
  component: RouteComponent,
  validateSearch: searchSchema,
});

function RouteComponent() {
  const [name, setName] = useState("DownArrow");
  const component = Route.useLoaderData();
  const [isCopied, setIsCopied] = useState(false);
  const [_, copyToClipboard] = useCopyToClipboard();
  const url = Route.useSearch({
    select: ({ d }) => `https://reactsvg.dev/code?d=${d}`,
  });

  const componentWithName = useMemo(() => {
    return component.replace(/REACTSVG_COMP_NAME/g, name);
  }, [name, component]);

  const navigatorData = useMemo(
    () => ({
      title: "reactsvg.dev",
      url: url,
    }),
    [url],
  );

  const canShare = "canShare" in navigator && navigator.canShare(navigatorData);

  const timeout = useRef<Timer | null>(null);

  function copy() {
    if (timeout.current) {
      return;
    }

    setIsCopied(true);
    copyToClipboard(componentWithName.trim());

    timeout.current = setTimeout(() => {
      setIsCopied(false);

      timeout.current = null;
    }, 1500);
  }

  useEffect(() => {
    return () => clearTimeout(timeout.current as NodeJS.Timeout);
  }, []);

  return (
    <div className="fixed h-full w-full flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 flex flex-col space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Edit the name, and copy it into your codebase!
        </h1>
        <div className="group flex flex-col shadow-sm rounded-2xl overflow-hidden">
          <input
            placeholder="DownArrow"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 px-4 text-base md:text-sm border border-neutral-200 rounded-t-2xl focus-visible:outline-none resize-none font-mono"
          />
          <textarea
            readOnly
            placeholder="Paste your SVG code here..."
            value={componentWithName.trim()}
            wrap="off"
            className="field-sizing-content max-h-[500px] w-full rounded-b-2xl border border-neutral-200 border-t-0 px-4 py-3 text-base md:text-sm focus-visible:outline-none resize-none font-mono overflow-x-visible"
          />
        </div>
        <div className="flex justify-center space-x-6">
          <Button onClick={copy}>{isCopied ? "Copied!" : "Copy"}</Button>
          {canShare ? (
            <Button onClick={() => navigator.share(navigatorData)}>
              Share
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
