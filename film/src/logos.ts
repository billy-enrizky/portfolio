// The real marks this film shows, for the kit (src/kit/logos.tsx): written by scripts/logos.mjs from
// public/logos/logos.json, which keeps each mark's source, licence and trademark owner. Do not edit by hand:
// node scripts/logos.mjs get <name> adds a mark; node scripts/logos.mjs list --write rewrites this file.
import type { LogoEntry } from './kit/logos';

export const LOGOS: Record<string, LogoEntry> = {
  "docker": { name: "Docker", tone: "colour", tile: "none", files: { mark: { src: "logos/docker.svg", aspect: 1.384 }, wordmark: { src: "logos/docker.wordmark.svg", aspect: 3.934 }, mono: { src: "logos/docker.mono.svg", aspect: 1.394 }, white: { src: "logos/docker.white.svg", aspect: 1.394 }, black: { src: "logos/docker.black.svg", aspect: 1.394 } } },
  "google-cloud": { name: "Google Cloud", tone: "colour", tile: "none", files: { mark: { src: "logos/google-cloud.svg", aspect: 1.243 }, mono: { src: "logos/google-cloud.mono.svg", aspect: 1.246 }, white: { src: "logos/google-cloud.white.svg", aspect: 1.246 }, black: { src: "logos/google-cloud.black.svg", aspect: 1.246 } } },
  "microsoft-azure": { name: "Microsoft Azure", tone: "colour", tile: "none", files: { mark: { src: "logos/microsoft-azure.svg", aspect: 1.058 }, white: { src: "logos/microsoft-azure.white.svg", aspect: 1.058 }, black: { src: "logos/microsoft-azure.black.svg", aspect: 1.058 } } },
  "python": { name: "Python", tone: "colour", tile: "none", files: { mark: { src: "logos/python.svg", aspect: 1.005 }, mono: { src: "logos/python.mono.svg", aspect: 0.989 }, white: { src: "logos/python.white.svg", aspect: 0.989 }, black: { src: "logos/python.black.svg", aspect: 0.989 } } },
  "terraform": { name: "Terraform", tone: "colour", tile: "none", files: { mark: { src: "logos/terraform.svg", aspect: 0.88 }, wordmark: { src: "logos/terraform.wordmark.svg", aspect: 4.163 }, wordmarkDark: { src: "logos/terraform.wordmark.dark.svg", aspect: 4.163 }, mono: { src: "logos/terraform.mono.svg", aspect: 0.88 }, white: { src: "logos/terraform.white.svg", aspect: 0.88 }, black: { src: "logos/terraform.black.svg", aspect: 0.88 } } },
};
