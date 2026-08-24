import { createFileRoute } from "@tanstack/react-router";
import { LegalPage, TO_COMPLETE } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

const title = "Conditions Générales de Vente — AetheriaSky";
const description =
  "Les conditions générales de vente applicables aux grades et packs d'Aether Coins de la boutique AetheriaSky.";

export const Route = createFileRoute("/cgv")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CgvPage,
});

function CgvPage() {
  return (
    <LegalPage
      eyebrow="Informations"
      title="Conditions Générales de Vente"
      description="Ces conditions encadrent toute commande passée sur la boutique AetheriaSky. Elles sont acceptées au moment de la validation du paiement."
      blocks={[
        {
          title: "Éditeur de la boutique",
          paragraphs: [
            `Boutique du serveur Minecraft ${siteConfig.name} (${siteConfig.serverIp}).`,
            `Nom légal du vendeur : ${TO_COMPLETE}. Statut / forme juridique : ${TO_COMPLETE}. Adresse : ${TO_COMPLETE}. E-mail de contact : ${TO_COMPLETE}.`,
          ],
        },
        {
          title: "Produits proposés",
          paragraphs: [
            "La boutique propose exclusivement des contenus virtuels utilisables sur le serveur AetheriaSky : grades (VIP, MVP, ELITE, ULTIME) et packs d'Aether Coins.",
            "Ces contenus n'ont aucune valeur monétaire en dehors du serveur et ne peuvent être revendus ou échangés contre de l'argent réel.",
          ],
        },
        {
          title: "Prix et paiement",
          paragraphs: [
            "Les prix sont affichés en euros, toutes taxes comprises le cas échéant. Le montant final est recalculé côté serveur avant tout paiement.",
            "Le paiement est traité par notre prestataire de paiement Stripe. AetheriaSky ne stocke aucune donnée bancaire.",
          ],
        },
        {
          title: "Livraison des contenus",
          paragraphs: [
            "La livraison est automatique et intervient en jeu après confirmation du paiement, généralement en quelques minutes.",
            "Le pseudo Minecraft renseigné lors de la commande doit être exact : une erreur de pseudo peut retarder ou empêcher la livraison.",
          ],
        },
        {
          title: "Droit de rétractation",
          paragraphs: [
            "Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux contenus numériques fournis immédiatement, dont l'acheteur accepte expressément la livraison lors de la commande.",
          ],
        },
        {
          title: "Sanctions et remboursements",
          paragraphs: [
            "Aucun remboursement n'est dû en cas de sanction résultant d'un non-respect du règlement du serveur.",
            "En cas de problème de livraison, une réclamation peut être adressée via le Discord officiel ou à l'adresse e-mail indiquée ci-dessus.",
          ],
        },
        {
          title: "Disponibilité du service",
          paragraphs: [
            "AetheriaSky met tout en œuvre pour assurer la continuité du serveur, sans pouvoir garantir une disponibilité permanente (maintenances, incidents techniques, mises à jour).",
            "En cas d'arrêt définitif du serveur, aucun remboursement des contenus déjà livrés ne pourra être exigé.",
          ],
        },
        {
          title: "Droit applicable et litiges",
          paragraphs: [
            "Les présentes conditions sont soumises au droit français.",
            `Toute réclamation doit d'abord être adressée à ${TO_COMPLETE} (e-mail légal) avant toute action contentieuse.`,
          ],
        },
      ]}
      footNote={`Dernière mise à jour : ${TO_COMPLETE}. Les mentions marquées ${TO_COMPLETE} seront renseignées dès la finalisation des informations légales.`}
    />
  );
}
