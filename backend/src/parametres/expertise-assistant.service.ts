import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { AnalyseExpertisePhotoDto, ExpertiseAerialViewDto } from "./dto";

type OpenAIResponse = { output?: Array<{ content?: Array<{ type?: string; text?: string }> }>; error?: { message?: string } };

@Injectable()
export class ExpertiseAssistantService {
  async analysePhoto(data: AnalyseExpertisePhotoDto) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) throw new ServiceUnavailableException("L’analyse visuelle IA n’est pas configurée sur le serveur.");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);
    try {
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: process.env.OPENAI_VISION_MODEL?.trim() || "gpt-5-mini",
          store: false,
          max_output_tokens: 900,
          input: [{ role: "user", content: [
            { type: "input_text", text: [
              "Tu assistes un professionnel du bâtiment. Analyse uniquement ce qui est visuellement observable sur la photo.",
              "N'affirme aucune cause certaine, conformité réglementaire ou responsabilité. Distingue faits visibles, hypothèses à vérifier, mesures complémentaires et limites de la photo.",
              `Zone: ${data.zone || "non précisée"}. Emplacement: ${data.location || "non précisé"}.`,
              `Contexte fourni par l'expert: ${data.context}`,
              "Réponds en français avec quatre rubriques courtes: Éléments visibles; Points d'attention; Vérifications suggérées; Limites."
            ].join("\n") },
            { type: "input_image", image_url: data.imageDataUrl, detail: "high" }
          ] }]
        }),
      });
      const payload = await response.json() as OpenAIResponse;
      if (!response.ok) throw new ServiceUnavailableException(payload.error?.message || "Le service d’analyse visuelle a refusé la demande.");
      const analysis = payload.output?.flatMap((item) => item.content ?? []).find((item) => item.type === "output_text")?.text;
      if (!analysis) throw new ServiceUnavailableException("L’IA n’a retourné aucune analyse exploitable.");
      return { analysis, disclaimer: "Piste d’aide non validée : seul l’expert peut la retenir, la modifier ou l’écarter." };
    } catch (error) {
      if (error instanceof ServiceUnavailableException) throw error;
      throw new ServiceUnavailableException("L’analyse visuelle est momentanément indisponible.");
    } finally { clearTimeout(timeout); }
  }

  async aerialView(data: ExpertiseAerialViewDto) {
    const key = process.env.GOOGLE_MAPS_API_KEY?.trim();
    if (!key) return { configured: false, message: "Ajoutez GOOGLE_MAPS_API_KEY sur le serveur pour afficher la vue aérienne Google." };
    const url = new URL("https://maps.googleapis.com/maps/api/staticmap");
    url.searchParams.set("center", `${data.latitude},${data.longitude}`);
    // Maps Static accepts a maximum logical size of 640 × 640 for the
    // standard API. `scale=2` keeps a sharp 1280 × 840 image without using
    // the restricted large-image entitlement.
    url.searchParams.set("zoom", "19"); url.searchParams.set("size", "640x420"); url.searchParams.set("scale", "2");
    url.searchParams.set("maptype", "satellite"); url.searchParams.set("markers", `color:red|${data.latitude},${data.longitude}`); url.searchParams.set("key", key);
    const response = await fetch(url);
    if (!response.ok) throw new ServiceUnavailableException("Google Maps n’a pas pu produire la vue aérienne.");
    const type = response.headers.get("content-type") || "image/png";
    const image = Buffer.from(await response.arrayBuffer()).toString("base64");
    return { configured: true, image: `data:${type};base64,${image}`, provider: "Google Maps Platform" };
  }
}
