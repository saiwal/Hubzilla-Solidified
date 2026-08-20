import { registerTour } from "@utsukta/spa-core/lib/tours";

registerTour({
  id: "hq-demo",
  label: (t) => t("tour.hq_demo_label"),
  description: (t) => t("tour.hq_demo_desc"),
  path: "/hq",
  steps: [
    {
      selector: '[data-tour="hq.composer"]',
      title: (t) => t("tour.hq_composer_title"),
      text: (t) => t("tour.hq_composer_text"),
    },
    {
      selector: '[data-tour="hq.drafts"]',
      title: (t) => t("tour.hq_drafts_title"),
      text: (t) => t("tour.hq_drafts_text"),
    },
    {
      selector: '[data-tour="hq.messages"]',
      title: (t) => t("tour.hq_messages_title"),
      text: (t) => t("tour.hq_messages_text"),
    },
    {
      selector: '[data-tour="hq.events"]',
      title: (t) => t("tour.hq_events_title"),
      text: (t) => t("tour.hq_events_text"),
    },
    {
      selector: '[data-tour="hq.quotas"]',
      title: (t) => t("tour.hq_quotas_title"),
      text: (t) => t("tour.hq_quotas_text"),
    },
  ],
});
