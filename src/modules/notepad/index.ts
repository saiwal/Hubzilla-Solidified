import { registerModule } from "@utsukta/spa-core/module-registry";
import { useI18n } from "@utsukta/spa-core/i18n";

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
      id: "notepad.header",
      label: () => useI18n().t("widgets.notepad_header"),
      loader: () => import("./widgets/NotepadHeaderWidget"),
      slot: "header",
      defaultModules: ["notepad"],
      contexts: ["notepad"],
      locked: true,
    },
    {
      id: "notepad.content",
      label: () => useI18n().t("widgets.notepad_content"),
      loader: () => import("./widgets/NotepadContentWidget"),
      slot: "contentTop",
      defaultModules: ["notepad"],
      contexts: ["notepad"],
      locked: true,
    },
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
      helpTarget: "widgets.quick_note",
    },
    {
      id: "notepad.archive",
      label: () => useI18n().t("widgets.note_archive"),
      loader: () => import("./widgets/NoteArchiveWidget"),
      slot: "right",
      visitorVisible: false,
      helpTarget: "widgets.archive_tree",
    },
    {
      id: "notepad.drafts",
      label: () => useI18n().t("widgets.note_drafts"),
      loader: () => import("./widgets/NoteDraftsWidget"),
      slot: "right",
      visitorVisible: false,
      helpTarget: "widgets.drafts",
    },
    {
      // Opt-in alternate layout for notepad.archive — picker only, no default placement
      id: "notepad.archive_grid",
      label: () => useI18n().t("widgets.archive_grid"),
      loader: () => import("./widgets/NoteArchiveGridWidget"),
      slot: ["footer", "right"],
      defaultModules: [],
      contexts: ["notepad"],
      visitorVisible: false,
      helpTarget: "widgets.archive_calendar",
    },
    {
      id: "notepad.tags",
      label: () => useI18n().t("widgets.note_tags"),
      loader: () => import("./widgets/NoteTagWidget"),
      slot: "right",
      visitorVisible: false,
      helpTarget: "widgets.tags_cloud",
    },
    {
      // Opt-in alternate layout for notepad.tags — picker only, no default placement
      id: "notepad.tags_list",
      label: () => useI18n().t("widgets.tag_list"),
      loader: () => import("./widgets/NoteTagListWidget"),
      slot: "right",
      defaultModules: [],
      contexts: ["notepad"],
      visitorVisible: false,
      helpTarget: "widgets.tags_list",
    },
  ],
  permissions: [],
});
