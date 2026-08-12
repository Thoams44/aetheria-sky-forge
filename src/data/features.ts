import {
  Cloud,
  Coins,
  Scroll,
  CalendarDays,
  TrendingUp,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: Cloud,
    title: "SkyBlock",
    description:
      "Une île, quelques blocs, et tout un ciel à conquérir. Générateurs, extensions et biomes évolutifs.",
  },
  {
    icon: Coins,
    title: "Économie",
    description:
      "Un marché entre joueurs équilibré, des hôtels de vente et une monnaie qui garde sa valeur.",
  },
  {
    icon: Scroll,
    title: "Quêtes",
    description:
      "Des centaines d'objectifs écrits à la main pour guider ta montée en puissance, sans jamais t'enfermer.",
  },
  {
    icon: CalendarDays,
    title: "Événements",
    description:
      "Chasses au trésor, boss d'îles et saisons thématiques rythment chaque semaine sur le serveur.",
  },
  {
    icon: TrendingUp,
    title: "Progression",
    description:
      "Niveaux d'île, talents et prestige : chaque heure jouée laisse une trace durable dans ton profil.",
  },
  {
    icon: Users,
    title: "Communauté",
    description:
      "Une équipe présente, un Discord actif et des joueurs qui construisent ensemble depuis le premier jour.",
  },
];