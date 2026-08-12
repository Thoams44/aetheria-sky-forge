/**
 * Central AetheriaSky configuration.
 * Everything that will later be swapped for real values lives here.
 */
export const siteConfig = {
  name: "AetheriaSky",
  mark: "✦",
  tagline: "Une expérience SkyBlock unique.",
  serverIp: "play.aetheriasky.fr",
  // TODO: remplacer par le vrai lien Discord
  discordUrl: "https://discord.gg/aetheriasky",
  domain: "https://aetheriasky.fr",
} as const;

export const mainNav = [
  { label: "Accueil", to: "/" },
  { label: "Boutique", to: "/boutique" },
  { label: "Vote", to: "/vote" },
  { label: "Classements", to: "/classements" },
  { label: "Règlement", to: "/reglement" },
] as const;

export const legalNav = [
  { label: "Mentions légales", to: "/reglement" },
  { label: "CGV", to: "/reglement" },
  { label: "Politique de confidentialité", to: "/reglement" },
  { label: "Cookies", to: "/reglement" },
  { label: "Contact", to: "/reglement" },
] as const;