/**
 * ExcalidrawCanvas.tsx
 * Solid component that mounts the React-based @excalidraw/excalidraw canvas
 * into a plain div. This is the one place React is mounted for this feature —
 * everything above it (the tools subsection, the editor modal) is Solid.
 */
import { onCleanup, onMount, type Component } from "solid-js";
import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
import "@excalidraw/excalidraw/index.css";

export interface ExcalidrawExport {
  toPngFile(filename?: string): Promise<File>;
}

interface Props {
  onReady?: (api: ExcalidrawExport) => void;
}

const ExcalidrawCanvas: Component<Props> = (props) => {
  let containerRef: HTMLDivElement | undefined;
  let root: Root | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- excalidrawAPI's
  // type lives under the package's internal types entry point; `any` avoids
  // pinning to that unstable path.
  let api: any;

  onMount(() => {
    if (!containerRef) return;
    root = createRoot(containerRef);
    root.render(
      createElement(Excalidraw, {
        excalidrawAPI: (a: any) => {
          api = a;
          props.onReady?.({
            async toPngFile(filename = "drawing.png") {
              if (!api) throw new Error("Excalidraw is not ready yet");
              const blob = await exportToBlob({
                elements: api.getSceneElements(),
                appState: api.getAppState(),
                files: api.getFiles(),
                mimeType: "image/png",
              });
              return new File([blob], filename, { type: "image/png" });
            },
          });
        },
      }),
    );
  });

  onCleanup(() => root?.unmount());

  return <div ref={containerRef} class="w-full h-full min-h-[400px]" />;
};

export default ExcalidrawCanvas;
