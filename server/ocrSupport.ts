export function localOcrCapability(platform: NodeJS.Platform = process.platform) {
  return platform === "darwin"
    ? { supported: true, provider: "Apple Vision on-device", reason: null }
    : { supported: false, provider: "NVIDIA vision", reason: `Local OCR is unavailable on ${platform}; Apple Vision tools will not be invoked.` };
}

export function unsupportedImageReason(mimeType: string, platform: NodeJS.Platform = process.platform): string | null {
  const needsAppleConversion = /heic|heif/i.test(mimeType);
  return needsAppleConversion && platform !== "darwin"
    ? "HEIC conversion is unavailable on this Linux host. The original remains saved; upload a PNG or JPG copy for analysis."
    : null;
}
