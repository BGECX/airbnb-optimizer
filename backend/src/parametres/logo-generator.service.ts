import {
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { GenerateLogoDto } from "./dto";
import { LogoCreditsService } from "./logo-credits.service";
import { randomUUID } from "crypto";

type OpenAIImageResponse = { data?: Array<{ b64_json?: string }> };

@Injectable()
export class LogoGeneratorService {
  private readonly logger = new Logger(LogoGeneratorService.name);
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
    let reservation: { generationId: string; balance: number } | undefined;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120_000);
    try {
      reservation = await this.credits.reserve(userId, prompt);
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
            // Une prévisualisation légère évite les coupures du proxy pendant
            // le transfert. L'utilisateur peut ensuite retenir la piste.
            quality: "low",
            background: "transparent",
            output_format: "webp",
            output_compression: 65,
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
        const code = payload.error?.code;
        const detail = code === "invalid_api_key"
          ? "La clé OpenAI configurée sur le serveur est invalide."
          : code === "billing_hard_limit_reached" || code === "insufficient_quota"
            ? "Le budget de l’API OpenAI est épuisé ou non activé. L’abonnement ChatGPT ne finance pas automatiquement l’API."
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
      return { model: "gpt-image-2", generationId: reservation.generationId, remainingCredits: reservation.balance, image: `data:image/webp;base64,${image}` };
    } catch (error) {
      const incidentId = randomUUID().slice(0, 8).toUpperCase();
      this.logger.error(
        `Échec génération logo [${incidentId}]`,
        error instanceof Error ? error.stack : String(error),
      );
      if (reservation) {
        try {
          await this.credits.refund(
            userId,
            reservation.generationId,
            error instanceof Error ? error.name : "UNKNOWN",
          );
        } catch (refundError) {
          this.logger.error(
            `Remboursement du crédit logo impossible (${reservation.generationId})`,
            refundError instanceof Error ? refundError.stack : undefined,
          );
        }
      }
      if (error instanceof HttpException)
        throw error;
      const databaseCode =
        typeof error === "object" && error !== null && "code" in error
          ? String(error.code)
          : "";
      if (databaseCode === "P2021" || databaseCode === "P2022") {
        throw new ServiceUnavailableException(
          "La base de données des crédits logo doit être mise à jour. Relancez le déploiement de l’API afin d’appliquer les migrations.",
        );
      }
      if (databaseCode.startsWith("P20")) {
        throw new ServiceUnavailableException(
          `La réservation du crédit logo a échoué (référence ${incidentId}). Aucun crédit n’a été consommé.`,
        );
      }
      if (error instanceof Error && error.name.startsWith("Prisma")) {
        throw new ServiceUnavailableException(
          `La base des crédits logo est temporairement inaccessible (référence ${incidentId}). Aucun crédit n’a été consommé.`,
        );
      }
      if (error instanceof Error && error.name === "AbortError") {
        throw new ServiceUnavailableException(
          "La création a dépassé deux minutes. Vous pouvez réessayer.",
        );
      }
      if (error instanceof TypeError) {
        throw new ServiceUnavailableException(
          `Le serveur KRITIA n’arrive pas à joindre le service d’images OpenAI (référence ${incidentId}). Aucun crédit n’a été consommé.`,
        );
      }
      throw new ServiceUnavailableException(
        `Le service de création de logo est momentanément indisponible (référence ${incidentId}). Aucun crédit n’a été consommé.`,
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
