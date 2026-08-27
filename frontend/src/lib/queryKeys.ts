export const queryKeys = {
  readings: {
    all: ["readings"] as const,
    list: (limit: number, offset: number) => ["readings", limit, offset] as const,
    detail: (id: string) => ["reading", id] as const,
  },
  spreads: {
    all: ["spreads"] as const,
  },
} as const;
