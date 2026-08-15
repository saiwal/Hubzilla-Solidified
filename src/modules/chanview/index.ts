import { registerModule } from "@utsukta/spa-core/module-registry";

registerModule({
  id: "chanview",
  routes: [
    { path: "/chanview", component: () => import("./views/ChanView") },
  ],
  permissions: [],
});
