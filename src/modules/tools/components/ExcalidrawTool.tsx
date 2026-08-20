import { createSignal } from "solid-js";
import { useI18n } from "@utsukta/spa-core/i18n";
import ExcalidrawCanvas, { type ExcalidrawExport } from "@/modules/excalidraw/ExcalidrawCanvas";

export function ExcalidrawTool() {
  const { t } = useI18n();
  const [exportApi, setExportApi] = createSignal<ExcalidrawExport>();

  const download = async () => {
    const file = await exportApi()?.toPngFile("drawing.png");
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div class="flex flex-col gap-3 h-[75vh]">
      <div class="flex-1 min-h-0 rounded-xl border border-rim overflow-hidden">
        <ExcalidrawCanvas onReady={setExportApi} />
      </div>
      <button
        onClick={() => void download()}
        class="self-end border border-rim text-muted hover:bg-elevated hover:text-txt rounded-xl px-5 py-2 text-sm transition-colors"
      >
        {t("tools.excalidraw_download")}
      </button>
    </div>
  );
}
