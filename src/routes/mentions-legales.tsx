import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, TO_COMPLETE } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

const title = "Mentions légales — AetheriaSky";
const description =
  "Mentions légales du site officiel du serveur Minecraft SkyBlock AetheriaSky : éditeur, hébergeur et propriété intellectuelle.";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Mentions légales"
      description="Informations relatives à l'éditeur et à l'hébergement du site AetheriaSky."
      blocks={[
        {
          title: "Éditeur du site",
          items: [
            `Nom légal / raison sociale : ${TO_COMPLETE}`,
            `Statut juridique : ${TO_COMPLETE}`,
            `Adresse : ${TO_COMPLETE}`,
            `E-mail légal : ${TO_COMPLETE}`,
            `Numéro d'identification (SIRET / RCS / TVA) : ${TO_COMPLETE}`,
            `Directeur de la publication : ${TO_COMPLETE}`,
          ],
        },
        {
          title: "Hébergeur du site",
          items: [
            `Nom de l'hébergeur : ${TO_COMPLETE}`,
            `Adresse de l'hébergeur : ${TO_COMPLETE}`,
            `Contact de l'hébergeur : ${TO_COMPLETE}`,
          ],
        },
        {
          title: "Objet du site",
          paragraphs: [
            `Ce site présente le serveur Minecraft SkyBlock ${siteConfig.name} (${siteConfig.serverIp}) : présentation du serveur, boutique de contenus virtuels, système de vote, classements et espace joueur.`,
          ],
        },
        {
          title: "Propriété intellectuelle",
          paragraphs: [
            "L'identité visuelle, les textes, les visuels et le nom AetheriaSky sont la propriété de l'éditeur. Toute reproduction sans autorisation est interdite.",
            "Minecraft est une marque de Mojang Studios / Microsoft. AetheriaSky n'est ni affilié, ni approuvé, ni sponsorisé par Mojang Studios ou Microsoft.",
          ],
        },
        {
          title: "Responsabilité",
          paragraphs: [
            "L'éditeur ne saurait être tenu responsable des dommages liés à l'utilisation du site ou à une indisponibilité temporaire du serveur de jeu.",
            "Les liens externes présents sur le site (plateformes de vote, Discord) n'engagent que leurs éditeurs respectifs.",
          ],
        },
        {
          title: "Contact",
          paragraphs: [
            `Toute demande peut être adressée via le Discord officiel (${siteConfig.discordUrl}) ou à l'adresse e-mail légale : ${TO_COMPLETE}.`,
          ],
        },
      ]}
      footNote={`Les mentions marquées ${TO_COMPLETE} doivent être complétées avant la mise en production publique du site.`}
    />
  );
}
