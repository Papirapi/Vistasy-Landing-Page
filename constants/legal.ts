// The facts every legal page repeats, in one place. Before Paddle verification, replace ENTITY with the
// registered legal name exactly as it appears on the business registration (Paddle checks it against the
// account), and bump UPDATED whenever a policy's text changes.
import { CONTACT_EMAIL } from "@/constants/navbar-items-list";

export const LEGAL = {
  /** registered legal name of the company that sells VISTASY (TODO: replace with the registered name) */
  entity: "VISTASY",
  address: "012 Street of Canada, Building B, 4th Floor, E1 Tunis, Tunisia 1002",
  email: CONTACT_EMAIL,
  /** last change to any of the three policies, ISO date */
  updated: "2026-11-25",
} as const;
