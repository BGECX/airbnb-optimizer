import type { Metadata } from "next";
import KritiaApp from "./KritiaApp";

export const metadata: Metadata = {
  title: "KRITIA btp — Pilotage BTP",
  description: "Le cockpit de gestion pour les entreprises de rénovation.",
};

export default function Home() {
  return <KritiaApp />;
}
