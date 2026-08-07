import { ServiceUnavailableException } from "@nestjs/common";
import { ExpertiseAssistantService } from "./expertise-assistant.service";

describe("ExpertiseAssistantService", () => {
  const originalOpenAI = process.env.OPENAI_API_KEY;
  const originalMaps = process.env.GOOGLE_MAPS_API_KEY;
  afterEach(() => {
    if (originalOpenAI) process.env.OPENAI_API_KEY = originalOpenAI; else delete process.env.OPENAI_API_KEY;
    if (originalMaps) process.env.GOOGLE_MAPS_API_KEY = originalMaps; else delete process.env.GOOGLE_MAPS_API_KEY;
    jest.restoreAllMocks();
  });

  it("annonce honnêtement une vue aérienne non configurée", async () => {
    delete process.env.GOOGLE_MAPS_API_KEY;
    await expect(new ExpertiseAssistantService().aerialView({ latitude: 48.8, longitude: 2.3 })).resolves.toMatchObject({ configured: false });
  });

  it("refuse l'analyse visuelle sans clé serveur", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(new ExpertiseAssistantService().analysePhoto({ imageDataUrl: "data:image/jpeg;base64,AAAA", context: "Fissure observée en façade" })).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("ne présente jamais l'analyse IA comme une conclusion validée", async () => {
    process.env.OPENAI_API_KEY = "sk-test";
    jest.spyOn(global, "fetch").mockResolvedValue({ ok: true, json: async () => ({ output: [{ content: [{ type: "output_text", text: "Éléments visibles : fissure." }] }] }) } as Response);
    await expect(new ExpertiseAssistantService().analysePhoto({ imageDataUrl: "data:image/jpeg;base64,AAAA", context: "Façade ancienne" })).resolves.toMatchObject({ analysis: "Éléments visibles : fissure.", disclaimer: expect.stringContaining("non validée") });
  });
});
