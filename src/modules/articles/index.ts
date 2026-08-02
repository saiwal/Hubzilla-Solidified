import { registerModule } from "@/shared/lib/module-registry";
import { useI18n } from "@/i18n";
import { usePageNick } from "@/shared/store/site-config";

registerModule({
  id: "articles",
  routes: [
    { path: "/articles", component: () => import("./views/ArticlesView") },
    {
      path: "/articles/:nick",
      component: () => import("./views/ArticlesView"),
    },
    // Series routes register before the :uuid catch-all so the literal
    // "series" segment isn't swallowed by it.
    {
      path: "/articles/:nick/series",
      component: () => import("./views/SeriesIndexView"),
    },
    {
      path: "/articles/:nick/series/:name",
      component: () => import("./views/SeriesView"),
    },
    {
      path: "/articles/:nick/:uuid",
      component: () => import("./views/ArticleView"),
    },
  ],
  navItem: {
    label: () => useI18n().t("nav.articles"),
    icon: "article",
    path: "/articles",
    href: () => `/articles/${usePageNick()()}`,
    context: "all",
    hidden: false,
  },
  widgets: [
    {
      id: "articles.header",
      label: () => useI18n().t("widgets.articles_header"),
      loader: () => import("./widgets/ArticlesHeaderWidget"),
      slot: "header",
      defaultModules: ["articles"],
      contexts: ["articles"],
      locked: true,
    },
    {
      id: "articles.content",
      label: () => useI18n().t("widgets.articles_content"),
      loader: () => import("./widgets/ArticlesContentWidget"),
      slot: "contentTop",
      defaultModules: ["articles"],
      contexts: ["articles"],
      locked: true,
    },
    {
      id: "articles.drafts",
      label: () => useI18n().t("widgets.article_drafts"),
      loader: () => import("./widgets/ArticleDraftsWidget"),
      slot: "right",
      visitorVisible: false,
      helpTarget: "articles.drafts_widget",
    },
    {
      id: "articles.popular",
      label: () => useI18n().t("widgets.popular_articles"),
      loader: () => import("./widgets/ArticlePopularWidget"),
      slot: "right",
      defaultModules: [],
      contexts: ["channel", "profile", "articles"],
      helpTarget: "articles.popular_articles_widget",
    },
    {
      id: "articles.categories",
      label: () => useI18n().t("widgets.article_categories"),
      loader: () => import("./widgets/ArticleCategoryWidget"),
      slot: "right",
      helpTarget: "articles.categories_widget",
    },
    {
      // Opt-in alternate layout for articles.categories — picker only, no default placement
      id: "articles.categories_cloud",
      label: () => useI18n().t("widgets.category_cloud"),
      loader: () => import("./widgets/ArticleCategoryCloudWidget"),
      slot: ["right", "footer"],
      defaultModules: [],
      contexts: ["articles"],
      helpTarget: "articles.categories_cloud_widget",
    },
    {
      // Opt-in archive calendar — picker only, no default placement
      id: "articles.archive_grid",
      label: () => useI18n().t("widgets.archive_grid"),
      loader: () => import("./widgets/ArticleArchiveGridWidget"),
      slot: ["right", "footer"],
      defaultModules: [],
      contexts: ["articles"],
      helpTarget: "articles.archive_grid_widget",
    },
    {
      id: "articles.tags",
      label: () => useI18n().t("widgets.article_tags"),
      loader: () => import("./widgets/ArticleTagWidget"),
      slot: "right",
      helpTarget: "articles.tags_widget",
    },
    {
      // Opt-in alternate layout for articles.tags — picker only, no default placement
      id: "articles.tags_list",
      label: () => useI18n().t("widgets.tag_list"),
      loader: () => import("./widgets/ArticleTagListWidget"),
      slot: ["right", "footer"],
      defaultModules: [],
      contexts: ["articles"],
      helpTarget: "articles.tags_list_widget",
    },
    {
      // Opt-in article showcase; place several, each configured with an article
      id: "articles.teaser",
      label: () => useI18n().t("widgets.article_teaser"),
      loader: () => import("./widgets/ArticleTeaserWidget"),
      slot: "right",
      defaultModules: [],
      contexts: ["channel", "profile", "articles"],
      multiInstance: true,
      configComponent: () => import("./widgets/ArticleTeaserConfig"),
      helpTarget: "articles.teaser_widget",
    },
    {
      // Opt-in series index — picker only, no default placement
      id: "articles.series",
      label: () => useI18n().t("widgets.article_series"),
      loader: () => import("./widgets/ArticleSeriesWidget"),
      slot: "right",
      defaultModules: [],
      contexts: ["articles"],
      helpTarget: "articles.series_widget",
    },
  ],
  permissions: [],
  appName: "Articles",
});
