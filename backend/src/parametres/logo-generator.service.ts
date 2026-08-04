import {
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from "@nestjs/common";
import { GenerateLogoDto } from "./dto";
import { LogoCreditsService } from "./logo-credits.service";

type OpenAIImageResponse = { data?: Array<{ b64_json?: string }> };

@Injectable()
export class LogoGeneratorService {
  private lastGenerationAt = 0;
  constructor(private credits: LogoCreditsService) {}

  status() {
    return {
      configured: Boolean(process.env.OPENAI_API_KEY),
      model: "gpt-image-2",
    };
  }

  async generate(userId: string, data: GenerateLogoDto) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        "Le générateur IA n’est pas encore configuré. Ajoutez OPENAI_API_KEY dans l’environnement du serveur.",
      );
    }
    const now = Date.now();
    if (now - this.lastGenerationAt < 15_000) {
      throw new HttpException(
        "Patientez quelques secondes avant de relancer une création.",
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    this.lastGenerationAt = now;

    const prompt = this.buildPrompt(data);
    const reservation = await this.credits.reserve(userId, prompt);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    try {
      const response = await fetch(
        "https://api.openai.com/v1/images/generations",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: "gpt-image-2",
            prompt,
            size: "1024x1024",
            quality: "medium",
            background: "transparent",
            output_format: "png",
            n: 1,
          }),
        },
      );
      const payload = (await response
        .json()
        .catch(() => ({}))) as OpenAIImageResponse & {
        error?: { message?: string; code?: string };
      };
      if (!response.ok) {
        const detail =
          payload.error?.code === "invalid_api_key"
            ? "La clé OpenAI configurée sur le serveur est invalide."
            : payload.error?.message ||
              "Le service de création d’images a refusé la demande.";
        throw new ServiceUnavailableException(detail);
      }
      const image = payload.data?.[0]?.b64_json;
      if (!image)
        throw new ServiceUnavailableException(
          "Le service IA n’a retourné aucune image exploitable.",
        );
      await this.credits.complete(userId, reservation.generationId);
      return { model: "gpt-image-2", generationId: reservation.generationId, remainingCredits: reservation.balance, image: `data:image/png;base64,${image}` };
    } catch (error) {
      await this.credits.refund(userId, reservation.generationId, error instanceof Error ? error.name : "UNKNOWN");
      if (error instanceof HttpException)
        throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceUnavailableException(
          "La création a dépassé deux minutes. Vous pouvez réessayer.",
        );
      }
      throw new ServiceUnavailableException(
        "Le service de création de logo est momentanément indisponible.",
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  buildPrompt(data: GenerateLogoDto) {
    const slogan = data.slogan?.trim()
      ? `Slogan à intégrer lisiblement : « ${data.slogan.trim()} ».`
      : "Ne pas ajouter de slogan.";
    const symbols =
      data.symboles?.trim() ||
      "un symbole abstrait lié au bâtiment, sans outil de chantier cliché";
    return [
      "Crée un logo d’entreprise original, professionnel et directement exploitable, sur fond transparent.",
      `Nom exact à écrire, sans faute et une seule fois : « ${data.raisonSociale.trim()} ».`,
      `Activité : ${data.activite.trim()}. Style : ${data.style}.`,
      `Palette dominante : ${data.couleurPrincipale || "#2563EB"} et ${data.couleurSecondaire || "#F59E0B"}.`,
      `Pistes symboliques souhaitées : ${symbols}. ${slogan}`,
      "Composition simple et mémorisable, lisible en petit format, formes nettes de type vectoriel, sans photographie, sans maquette, sans carte de visite, sans filigrane.",
      "Ne copie aucune marque existante. Évite les détails fragiles et garde une zone de respiration autour du logo.",
    ].join(" ");
  }
}
