import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, TO_COMPLETE } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

const title = "Politique de confidentialité — AetheriaSky";
const description =
  "Comment AetheriaSky collecte, utilise et protège les données personnelles des joueurs du serveur Minecraft SkyBlock.";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: ConfidentialitePage,
});

function ConfidentialitePage() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Politique de confidentialité"
      description="AetheriaSky ne collecte que les données nécessaires au fonctionnement du serveur, de la boutique et de l'espace joueur."
      blocks={[
        {
          title: "Responsable du traitement",
          paragraphs: [
            `Responsable du traitement : ${TO_COMPLETE}. Adresse : ${TO_COMPLETE}. Contact pour toute demande relative aux données : ${TO_COMPLETE}.`,
          ],
        },
        {
          title: "Données collectées",
          items: [
            "Adresse e-mail utilisée pour créer un compte sur le site.",
            "Pseudo Minecraft (et identifiant de compte associé) déclaré par le joueur.",
            "Données de jeu : votes, monnaies virtuelles, grades, livraisons.",
            "Historique des commandes passées sur la boutique.",
            "Journaux techniques nécessaires à la sécurité du service.",
          ],
        },
        {
          title: "Finalités",
          items: [
            "Créer et gérer l'espace joueur.",
            "Livrer les contenus achetés ou obtenus via le vote.",
            "Prévenir la fraude et les abus.",
            "Assurer le support et le suivi des réclamations.",
          ],
        },
        {
          title: "Paiements",
          paragraphs: [
            "Les paiements sont traités par Stripe. Les données bancaires sont saisies directement auprès de ce prestataire et ne transitent jamais par nos serveurs.",
          ],
        },
        {
          title: "Conservation",
          paragraphs: [
            `Les données de compte sont conservées tant que le compte existe. Les données de facturation sont conservées pour la durée légale applicable (${TO_COMPLETE}).`,
          ],
        },
        {
          title: "Vos droits",
          paragraphs: [
            "Conformément au RGPD, vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation et d'opposition sur vos données.",
            `Pour exercer ces droits, écrivez à ${TO_COMPLETE} ou passez par le Discord officiel (${siteConfig.discordUrl}).`,
          ],
        },
        {
          title: "Sous-traitants",
          items: [
            "Hébergement du site et de la base de données : " + TO_COMPLETE,
            "Paiement : Stripe.",
            "Communication communautaire : Discord.",
          ],
        },
        {
          title: "Sécurité",
          paragraphs: [
            "Les accès aux données sont restreints par des règles de sécurité côté serveur. Seules les personnes habilitées de l'équipe AetheriaSky peuvent consulter les données nécessaires à leur rôle.",
          ],
        },
      ]}
      footNote={`Dernière mise à jour : ${TO_COMPLETE}.`}
    />
  );
}
