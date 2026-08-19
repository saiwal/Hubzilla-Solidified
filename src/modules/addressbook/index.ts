import { registerModule } from "@utsukta/spa-core/module-registry";
import { useI18n } from "@utsukta/spa-core/i18n";

registerModule({
  id: "addressbook",
  routes: [
    // The bare path is the app url from carddav.apd, so the nav entry the server
    // hands us resolves back to this module (and to its i18n label). The
    // wildcard carries the selected address book id.
    { path: "/cdav/addressbook", component: () => import("./views/AddressbookShellView") },
    { path: "/cdav/addressbook/*", component: () => import("./views/AddressbookShellView") },
  ],
  navItem: {
    label: () => useI18n().t("nav.addressbook"),
    icon: "person",
    path: "/cdav/addressbook",
    href: "/cdav/addressbook",
    context: ["local", "owner"], // carddav.apd: requires local_channel
  },
  permissions: [],
  appUrlSlug: "/cdav/addressbook",
});
