import { ServiceUnavailableException } from "@nestjs/common";
import { LogoGeneratorService } from "./logo-generator.service";

describe("LogoGeneratorService", () => {
  const originalKey = process.env.OPENAI_API_KEY;
  afterEach(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    else delete process.env.OPENAI_API_KEY;
    jest.restoreAllMocks();
  });

  it("reports an unavailable generator without a server key", () => {
    delete process.env.OPENAI_API_KEY;
    expect(new LogoGeneratorService().status()).toEqual({
      configured: false,
      model: "gpt-image-2",
    });
  });

  it("does not call the provider without a server key", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(
      new LogoGeneratorService().generate({
        raisonSociale: "KRITIA",
        activite: "BTP",
        style: "moderne",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("returns a PNG data URL from the provider response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ b64_json: "aW1hZ2U=" }] }),
    } as Response);
    const result = await new LogoGeneratorService().generate({
      raisonSociale: "KRITIA",
      activite: "Rénovation",
      style: "patrimoine",
    });
    expect(result.image).toBe("data:image/png;base64,aW1hZ2U=");
  });
});
