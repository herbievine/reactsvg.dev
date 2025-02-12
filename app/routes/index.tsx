import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "../components/button";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const [svgInput, setSvgInput] = useState("");

  function handleConvert() {
    const base64Svg = btoa(svgInput);

    navigate({
      to: "/code",
      search: {
        d: base64Svg,
      },
    });
  }

  return (
    <div className="fixed h-full w-full flex items-center justify-center">
      <div className="w-full max-w-4xl px-4 flex flex-col space-y-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center">
          Transform and clean any SVG file into a React component!
        </h1>
        <div className="group flex flex-col shadow-sm rounded-2xl overflow-hidden">
          <textarea
            placeholder="Paste your SVG code here..."
            value={svgInput}
            onChange={(e) => {
              console.log(e);
              setSvgInput(e.target.value);
            }}
            className="h-64 w-full rounded-2xl border border-neutral-200 px-4 py-3 text-base md:text-sm focus-visible:outline-none resize-none font-mono overflow-x-visible"
          />
        </div>
        <div className="flex justify-center">
          <Button onClick={handleConvert}>Convert</Button>
        </div>
      </div>
    </div>
  );
}
