import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";

registerModule({
  id: "notepad",
  routes: [
    { path: "/notepad", component: () => import("./views/NotepadView") },
  ],
  requiresAuth: true,
  navItem: {
    label: () => useI18n().t("notepad.title"),
    icon: "notepad",
    path: "/notepad",
    href: "/notepad",
		hidden: false,
    context: "local",
  },
  slots: {},
  widgets: [
    {
      // Opt-in placement on any page's sidebar — jot a note without leaving
      // where you are. Not shown by default anywhere, including notepad
      // itself (which already has a full composer inline).
      id: "notepad.quick",
      label: () => useI18n().t("widgets.note_quick"),
      loader: () => import("./widgets/QuickNoteWidget"),
      slot: "right",
      defaultModules: [],
      contexts: "any",
      visitorVisible: false,
    },
    {
      id: "notepad.archive",
      label: () => useI18n().t("widgets.note_archive"),
      loader: () => import("./widgets/NoteArchiveWidget"),
      slot: "right",
      visitorVisible: false,
    },
    {
      id: "notepad.tags",
      label: () => useI18n().t("widgets.note_tags"),
      loader: () => import("./widgets/NoteTagWidget"),
      slot: "right",
      visitorVisible: false,
    },
  ],
  permissions: [],
});
