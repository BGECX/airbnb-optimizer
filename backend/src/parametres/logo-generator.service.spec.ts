import { ServiceUnavailableException } from "@nestjs/common";
import { LogoGeneratorService } from "./logo-generator.service";

describe("LogoGeneratorService", () => {
  const credits = {
    reserve: jest.fn().mockResolvedValue({ generationId: "generation-1", balance: 2 }),
    complete: jest.fn().mockResolvedValue(undefined),
    refund: jest.fn().mockResolvedValue(undefined),
  } as any;
  const service = () => new LogoGeneratorService(credits);
  const originalKey = process.env.OPENAI_API_KEY;
  afterEach(() => {
    if (originalKey) process.env.OPENAI_API_KEY = originalKey;
    else delete process.env.OPENAI_API_KEY;
    jest.restoreAllMocks();
  });

  it("reports an unavailable generator without a server key", () => {
    delete process.env.OPENAI_API_KEY;
    expect(service().status()).toEqual({
      configured: false,
      model: "gpt-image-2",
    });
  });

  it("does not call the provider without a server key", async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(
      service().generate("user-1", {
        raisonSociale: "KRITIA",
        activite: "BTP",
        style: "moderne",
      }),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it("returns a compact WebP data URL from the provider response", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ b64_json: "aW1hZ2U=" }] }),
    } as Response);
    const result = await service().generate("user-1", {
      raisonSociale: "KRITIA",
      activite: "Rénovation",
      style: "patrimoine",
    });
    expect(result.image).toBe("data:image/webp;base64,aW1hZ2U=");
    expect(JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body)).toMatchObject({
      quality: "low",
      output_format: "webp",
      output_compression: 65,
    });
    expect(credits.complete).toHaveBeenCalledWith("user-1", "generation-1");
  });

  it("uses the image edit endpoint when a vector preview is supplied", async () => {
    process.env.OPENAI_API_KEY = "test-key";
    jest.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ b64_json: "ZWRpdGVk" }] }),
    } as Response);

    await service().generate("user-1", {
      raisonSociale: "KRITIA",
      activite: "Rénovation",
      style: "moderne",
      referenceImageDataUrl: "data:image/webp;base64,aW1hZ2U=",
    });

    const [url, options] = (global.fetch as jest.Mock).mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/images/edits");
    expect(options.body).toBeInstanceOf(FormData);
    expect((options.body as FormData).get("image")).toBeInstanceOf(Blob);
    expect((options.body as FormData).get("model")).toBe("gpt-image-2");
  });
});
