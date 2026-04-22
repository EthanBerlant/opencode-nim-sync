import { describe, it, expect } from "vitest";
import { validateOpenCodeConfig } from "../types/schema.js";

describe("validateOpenCodeConfig", () => {
  it("validates correct config structure", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          options: { baseURL: "https://api.nvidia.com" },
          models: {
            "model-1": { name: "Model 1", options: {} },
          },
        },
      },
      model: "model-1",
      small_model: "model-2",
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it("reports missing npm field", () => {
    const config = {
      provider: {
        nim: {
          name: "NVIDIA NIM",
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("provider.nim.npm must be a string");
  });

  it("reports missing name field", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("provider.nim.name must be a string");
  });

  it("reports invalid model structure", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          models: {
            "model-1": { options: {} }, // missing name
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.models.model-1.name must be a string",
    );
  });

  it("accepts config without provider", () => {
    const config = {
      model: "model-1",
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(true);
  });

  it("accepts config without nim provider", () => {
    const config = {
      provider: {
        other: { some: "value" },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(true);
  });

  it("reports invalid model field type", () => {
    const config = {
      model: 123, // should be string
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("model must be a string if provided");
  });

  it("reports invalid small_model field type", () => {
    const config = {
      small_model: ["model-1"], // should be string
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("small_model must be a string if provided");
  });

  it("rejects non-object config", () => {
    expect(validateOpenCodeConfig(null).valid).toBe(false);
    expect(validateOpenCodeConfig("string").valid).toBe(false);
    expect(validateOpenCodeConfig(123).valid).toBe(false);
  });

  it("reports error for non-string baseURL", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          options: {
            baseURL: 123,
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.options.baseURL must be a string",
    );
  });

  it("reports error for malformed baseURL", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          options: {
            baseURL: "not-a-valid-url",
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.options.baseURL must be a valid URL",
    );
  });

  it("reports error for non-http baseURL protocol", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          options: {
            baseURL: "ftp://malicious.example.com",
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.options.baseURL must use http: or https: protocol",
    );
  });

  it("accepts valid https baseURL", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          options: {
            baseURL: "https://integrate.api.nvidia.com/v1",
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(true);
  });

  it("reports error when model is null", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          models: {
            "model-1": null, // model is null instead of object
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.models.model-1 must be an object",
    );
  });

  it("reports error when model is a primitive value", () => {
    const config = {
      provider: {
        nim: {
          npm: "@ai-sdk/openai-compatible",
          name: "NVIDIA NIM",
          models: {
            "model-1": "just-a-string", // should be an object
          },
        },
      },
    };

    const result = validateOpenCodeConfig(config);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      "provider.nim.models.model-1 must be an object",
    );
  });
});
