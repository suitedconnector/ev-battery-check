/**
 * Curated static vehicle dataset for common U.S. EVs and hybrids.
 *
 * `originalRangeMi` is an APPROXIMATE representative EPA range when new — it
 * varies by model year, trim, and battery size, so the UI presents it as a
 * pre-fill the user can override, never as a fixed spec. Conventional hybrids
 * have no meaningful all-electric range and omit the field.
 *
 * This is intentionally a hand-maintained list, not an API. Add rows here to
 * support more vehicles. Keep it alphabetical-ish by make for editability.
 */

export type Powertrain = "full-ev" | "hybrid";

export interface VehicleModel {
  make: string;
  model: string;
  powertrain: Powertrain;
  /** Approx. EPA range when new, miles. Omitted for conventional hybrids. */
  originalRangeMi?: number;
}

export const VEHICLES: VehicleModel[] = [
  // Tesla
  { make: "Tesla", model: "Model 3", powertrain: "full-ev", originalRangeMi: 272 },
  { make: "Tesla", model: "Model Y", powertrain: "full-ev", originalRangeMi: 300 },
  { make: "Tesla", model: "Model S", powertrain: "full-ev", originalRangeMi: 370 },
  { make: "Tesla", model: "Model X", powertrain: "full-ev", originalRangeMi: 330 },
  // Nissan
  { make: "Nissan", model: "Leaf", powertrain: "full-ev", originalRangeMi: 150 },
  { make: "Nissan", model: "Ariya", powertrain: "full-ev", originalRangeMi: 250 },
  // Chevrolet
  { make: "Chevrolet", model: "Bolt EV", powertrain: "full-ev", originalRangeMi: 259 },
  { make: "Chevrolet", model: "Bolt EUV", powertrain: "full-ev", originalRangeMi: 247 },
  { make: "Chevrolet", model: "Volt", powertrain: "hybrid", originalRangeMi: 53 },
  // Ford
  { make: "Ford", model: "Mustang Mach-E", powertrain: "full-ev", originalRangeMi: 270 },
  { make: "Ford", model: "F-150 Lightning", powertrain: "full-ev", originalRangeMi: 300 },
  { make: "Ford", model: "Escape Hybrid", powertrain: "hybrid" },
  // Hyundai
  { make: "Hyundai", model: "Kona Electric", powertrain: "full-ev", originalRangeMi: 258 },
  { make: "Hyundai", model: "Ioniq 5", powertrain: "full-ev", originalRangeMi: 280 },
  { make: "Hyundai", model: "Ioniq 6", powertrain: "full-ev", originalRangeMi: 300 },
  // Kia
  { make: "Kia", model: "Niro EV", powertrain: "full-ev", originalRangeMi: 253 },
  { make: "Kia", model: "EV6", powertrain: "full-ev", originalRangeMi: 280 },
  { make: "Kia", model: "Soul EV", powertrain: "full-ev", originalRangeMi: 243 },
  // Volkswagen
  { make: "Volkswagen", model: "ID.4", powertrain: "full-ev", originalRangeMi: 260 },
  // BMW
  { make: "BMW", model: "i3", powertrain: "full-ev", originalRangeMi: 153 },
  { make: "BMW", model: "i4", powertrain: "full-ev", originalRangeMi: 300 },
  { make: "BMW", model: "iX", powertrain: "full-ev", originalRangeMi: 305 },
  // Audi
  { make: "Audi", model: "e-tron", powertrain: "full-ev", originalRangeMi: 222 },
  { make: "Audi", model: "Q4 e-tron", powertrain: "full-ev", originalRangeMi: 236 },
  // Rivian
  { make: "Rivian", model: "R1T", powertrain: "full-ev", originalRangeMi: 314 },
  { make: "Rivian", model: "R1S", powertrain: "full-ev", originalRangeMi: 316 },
  // Others
  { make: "Polestar", model: "2", powertrain: "full-ev", originalRangeMi: 270 },
  { make: "Volvo", model: "XC40 Recharge", powertrain: "full-ev", originalRangeMi: 223 },
  { make: "Toyota", model: "bZ4X", powertrain: "full-ev", originalRangeMi: 250 },
  { make: "Toyota", model: "Prius Prime", powertrain: "hybrid", originalRangeMi: 33 },
  { make: "Toyota", model: "Prius", powertrain: "hybrid" },
  { make: "Toyota", model: "RAV4 Hybrid", powertrain: "hybrid" },
  { make: "Honda", model: "Accord Hybrid", powertrain: "hybrid" },
  { make: "Mercedes-Benz", model: "EQS", powertrain: "full-ev", originalRangeMi: 350 },
  { make: "Jaguar", model: "I-Pace", powertrain: "full-ev", originalRangeMi: 234 },
  { make: "Porsche", model: "Taycan", powertrain: "full-ev", originalRangeMi: 225 },
  { make: "MINI", model: "Cooper SE", powertrain: "full-ev", originalRangeMi: 114 },
  { make: "Fiat", model: "500e", powertrain: "full-ev", originalRangeMi: 149 },
  { make: "Mazda", model: "MX-30", powertrain: "full-ev", originalRangeMi: 100 },
];

/** Sorted unique makes. */
export const MAKES: string[] = Array.from(
  new Set(VEHICLES.map((v) => v.make))
).sort((a, b) => a.localeCompare(b));

export function modelsForMake(make: string): VehicleModel[] {
  return VEHICLES.filter((v) => v.make === make).sort((a, b) =>
    a.model.localeCompare(b.model)
  );
}

export function findVehicle(
  make: string,
  model: string
): VehicleModel | undefined {
  return VEHICLES.find((v) => v.make === make && v.model === model);
}

/** Approximate original range for a make/model, or undefined if unknown. */
export function lookupOriginalRange(
  make: string,
  model: string
): number | undefined {
  return findVehicle(make, model)?.originalRangeMi;
}
