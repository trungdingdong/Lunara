export const ROUTES = {
  HOME: "/",
  READING: "/reading",
  HISTORY: "/history",
  AUTH: "/auth",
  READING_DETAIL: "/readings/:id",
} as const;

export interface NavEntry {
  path: string;
  label: string;
  requiresAuth?: boolean;
}

export const NAV_ENTRIES: NavEntry[] = [
  { path: ROUTES.HOME, label: "Home" },
  { path: ROUTES.READING, label: "New reading" },
  { path: ROUTES.HISTORY, label: "History", requiresAuth: true },
];
