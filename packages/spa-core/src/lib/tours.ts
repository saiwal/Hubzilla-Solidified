import Shepherd from "shepherd.js";

/** A plain translator function — avoids depending on Solid context here, since
 * tours are started from event handlers, outside any reactive owner. */
export type Translate = (key: any, ...args: any[]) => string;

export interface TourStepDef {
  /** CSS selector for the element to spotlight, e.g. `[data-tour="hq.composer"]`. */
  selector: string;
  title: (t: Translate) => string;
  text: (t: Translate) => string;
  on?: "top" | "bottom" | "left" | "right";
}

export interface TourDef {
  id: string;
  label: (t: Translate) => string;
  description?: (t: Translate) => string;
  /** Route to navigate to before starting, if not already there. */
  path?: string;
  steps: TourStepDef[];
}

const tours = new Map<string, TourDef>();

export function registerTour(tour: TourDef) {
  if (tours.has(tour.id)) {
    console.warn(`Tour "${tour.id}" already registered`);
    return;
  }
  tours.set(tour.id, tour);
}

export function getAllTours(): TourDef[] {
  return [...tours.values()];
}

export function getTour(id: string): TourDef | undefined {
  return tours.get(id);
}

export interface TourButtonLabels {
  back: string;
  next: string;
  done: string;
}

/** Builds and starts a Shepherd tour, skipping any steps whose target isn't in the DOM. */
export function startTour(id: string, t: Translate, labels: TourButtonLabels) {
  const def = tours.get(id);
  if (!def) {
    console.warn(`Tour "${id}" not found`);
    return;
  }

  const steps = def.steps.filter((s) => document.querySelector(s.selector));
  if (steps.length === 0) return;

  const tour = new Shepherd.Tour({
    useModalOverlay: true,
    defaultStepOptions: {
      classes: "hz-shepherd",
      scrollTo: { behavior: "smooth", block: "center" },
      cancelIcon: { enabled: true },
    },
  });

  steps.forEach((step, i) => {
    tour.addStep({
      attachTo: { element: step.selector, on: step.on ?? "bottom" },
      title: step.title(t),
      text: step.text(t),
      buttons: [
        ...(i > 0 ? [{ text: labels.back, action: tour.back }] : []),
        {
          text: i === steps.length - 1 ? labels.done : labels.next,
          action: tour.next,
        },
      ],
    });
  });

  tour.start();
}
