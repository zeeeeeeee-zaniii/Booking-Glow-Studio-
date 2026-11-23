export interface ServiceInput {
  name: string;
  price_rs: number;
  duration_min: number;
  is_active: boolean;
}

/** Validate and normalise a service payload from the admin panel. */
export function parseServiceInput(body: Record<string, unknown>): ServiceInput | null {
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const price = Number(body.price_rs);
  const duration = Number(body.duration_min);
  if (!name || !Number.isFinite(price) || price < 0 || !Number.isFinite(duration) || duration <= 0) {
    return null;
  }
  return {
    name,
    price_rs: Math.round(price),
    duration_min: Math.round(duration),
    is_active: body.is_active !== false,
  };
}
