import type { Metadata } from "next";
import KritiaApp from "./KritiaApp";

export const metadata: Metadata = {
  title: "KRITIA Neural UX — L’écosystème des professionnels",
  description: "Un seul écosystème pour piloter les métiers du BTP, de l’immobilier et des services professionnels.",
};

export default function Home() {
  return <KritiaApp />;
}
