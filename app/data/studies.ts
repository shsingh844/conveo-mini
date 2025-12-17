export type Study = {
  id: string;
  title: string;
  description: string;
  persona: string;
};

export const studies: Study[] = [
  {
    id: "1",
    title: "E‑commerce checkout experience",
    description:
      "Understand friction points in the checkout flow for repeat customers.",
    persona: "Frequent online shoppers",
  },
  {
    id: "2",
    title: "B2B SaaS onboarding",
    description:
      "Discover how team admins experience onboarding in our B2B product.",
    persona: "Mid‑market IT admins",
  },
];
