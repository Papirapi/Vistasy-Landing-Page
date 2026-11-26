// The Terms of Service, Privacy Policy and Refund Policy, in English and French. Plain text with three
// placeholders filled from constants/legal.ts: {entity}, {address}, {email}. A body entry that is an array
// renders as a bullet list. Facts about data must match the Your data page (messages, DataPage) and the app.
// Not legal advice: have counsel review before relying on these texts.

export type Block = string | string[];
export type LegalDoc = { title: string; lede: string; sections: { h: string; body: Block[] }[] };
export type LegalKey = "terms" | "privacy" | "refund";

const en: Record<LegalKey, LegalDoc> = {
  terms: {
    title: "Terms of Service",
    lede: "The agreement between you and {entity} when you use the VISTASY website, the VISTASY app or a paid plan.",
    sections: [
      {
        h: "1. Who we are",
        body: [
          "VISTASY is operated by {entity}, {address} (\"we\", \"us\"). You can reach us at {email}.",
          "By creating an account, using the app or buying a plan, you accept these terms. If you do not accept them, do not use VISTASY.",
        ],
      },
      {
        h: "2. What VISTASY does",
        body: [
          "VISTASY reads a selfie taken in daylight and gives cosmetic skin readings, a skincare routine chosen by ingredient evidence, and a verdict on products you check. Retailers can offer the same read on their websites, in their stores or through our API.",
          "VISTASY gives cosmetic guidance, not a medical diagnosis. It does not name diseases and does not replace a doctor or a dermatologist. When a reading suggests it, the app tells you to see a dermatologist. Do not use VISTASY to decide on medical treatment.",
          "Results depend on your photo and your answers. We do not promise any particular result from a product or a routine.",
        ],
      },
      {
        h: "3. Who can use it",
        body: [
          "You must be 18 or older. During the preview, VISTASY is available by invitation only.",
          "You are responsible for your account and for keeping your sign-in link or password private. Tell us at {email} if you think someone else has used your account.",
        ],
      },
      {
        h: "4. Your photos and data",
        body: [
          "You keep all rights in the photos and information you give us. You allow us to store and process them only to provide VISTASY to you, as described in our Privacy Policy. You choose how long your photo is kept and can delete it, or your whole account, at any time.",
          "Only upload photos of yourself.",
        ],
      },
      {
        h: "5. Acceptable use",
        body: [
          "You agree not to:",
          [
            "upload photos of another person, or of anyone under 18;",
            "use VISTASY for any unlawful purpose or to harm others;",
            "try to access other people's data, reverse engineer the service, or disrupt it;",
            "scrape the service or use it to build a competing product;",
            "resell access unless you have a retail agreement with us.",
          ],
          "We may suspend or close an account that breaks these rules.",
        ],
      },
      {
        h: "6. Plans, prices and payment",
        body: [
          "The overall result and top three concerns of your first scan, the product check and the basic Perfume Finder are free. Premium and one-off purchases (a full report, Style Lab previews, Perfume Finder Signature sessions) are shown with their prices on our Pricing page. Prices can differ by country.",
          "Our order process is conducted by our online reseller Paddle.com. Paddle.com is the Merchant of Record for all our orders. Paddle provides all customer service inquiries and handles returns. When you buy, Paddle's Buyer Terms also apply, and the price you pay, including any applicable taxes, is shown at checkout.",
          "Premium renews automatically at the end of each billing period, every month, every 12 weeks or every year, until you cancel. The first 12-week period costs more than the ones after it; both prices are shown before you pay. You can cancel at any time; Premium stays active until the end of the period you have paid for. If a price changes, we tell you before your next renewal, and you can cancel before it applies.",
          "One-off purchases are paid once. A report opens the full results of one scan. Style Lab previews and Perfume Finder Signature sessions you buy stay on your account and do not expire while your account exists.",
          "Refunds are covered by our Refund Policy.",
        ],
      },
      {
        h: "7. Retailers and businesses",
        body: [
          "Retail plans, pilots and API access are not sold online. They are agreed after a pilot, in a separate agreement or order form, and invoiced directly by VISTASY. That agreement takes precedence over these terms for that business.",
          "Ranking is never for sale: a retailer's catalogue only marks what is in stock and never changes the order of recommendations.",
        ],
      },
      {
        h: "8. Intellectual property",
        body: [
          "VISTASY, its software, models, content and brand belong to {entity} or its licensors. These terms give you a personal, non-transferable right to use VISTASY; they do not transfer any ownership to you.",
        ],
      },
      {
        h: "9. Availability and changes",
        body: [
          "We work to keep VISTASY available and accurate, but we cannot guarantee it will always be available, uninterrupted or free of errors. We may change or improve features. If we stop a paid feature, we will tell you in advance and refund any period you have paid for and cannot use.",
        ],
      },
      {
        h: "10. Liability",
        body: [
          "VISTASY is provided as it is. To the extent the law allows, we are not liable for indirect or consequential loss, or for decisions you make based on cosmetic guidance. Our total liability to you is limited to the amount you paid us in the 12 months before the claim.",
          "Nothing in these terms limits liability that cannot be limited by law, or your rights as a consumer under the law of the country where you live.",
        ],
      },
      {
        h: "11. Ending your use",
        body: [
          "You can stop using VISTASY and delete your account at any time from the app. We may end your access if you seriously or repeatedly break these terms.",
        ],
      },
      {
        h: "12. Changes to these terms",
        body: [
          "We may update these terms. The date at the top shows the latest version. If a change matters, we tell you by e-mail or in the app before it applies.",
        ],
      },
      {
        h: "13. Law and disputes",
        body: [
          "These terms are governed by the laws of Tunisia. If you are a consumer, you also keep the protection of the mandatory laws of the country where you live, and you may bring a claim in its courts.",
          "Questions or complaints: {email}.",
        ],
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    lede: "What we collect when you use VISTASY, why, who else handles it, how long we keep it and how to delete it.",
    sections: [
      {
        h: "1. Who is responsible",
        body: [
          "{entity}, {address}, is responsible for your personal data (the data controller). Contact us about anything in this policy at {email}.",
        ],
      },
      {
        h: "2. What we collect",
        body: [
          [
            "Account: your e-mail address and, during the preview, a password.",
            "Your photo and its results: the selfie you take, the readings, overlays and routine made from it.",
            "Your answers: skin type, sensitivities and allergies, whether you are pregnant, and what you already use. Some of this can be health information.",
            "Products you check or save, and your messages with Sarah, the in-app AI assistant.",
            "Location, only if you tap \"Use my location\": rounded to about 10 km and used to show the UV index and adapt your routine to your climate.",
            "Your consents: what you agreed to, and when.",
            "On this website: what you send in the invite or pilot forms (e-mail, and for retailers your name, company and message).",
            "Payments: Paddle processes your payment. We receive your name, e-mail, country, plan and payment status, never your card details.",
            "Technical data: server logs such as IP address and browser, kept for security.",
          ],
        ],
      },
      {
        h: "3. Why we use it",
        body: [
          [
            "To provide VISTASY: read your photo, build your routine, check products and track progress (performance of our contract with you).",
            "To analyse your photo and use your health-related answers: only with your explicit consent, given before each scan. You can withdraw it at any time.",
            "Research: only if you opt in, and only as anonymised aggregates for groups of at least 50 people. You can opt out at any time.",
            "To answer your messages, send your sign-in link and manage your subscription.",
            "To keep VISTASY secure and fix problems (our legitimate interest).",
            "To meet legal and tax obligations.",
          ],
          "We do not sell your personal data, we do not use it for advertising, and brands never receive it.",
        ],
      },
      {
        h: "4. Where your photo goes",
        body: [
          "Your photo is stored in Frankfurt, Germany. To read it, we send it to Google's Gemini API and to our own image models in London, where copies are deleted as soon as they have been read. Moving every step into the EU is planned.",
          "You choose how long your photo is kept: 30 days, so your next scan can be compared with it, or deleted right after your results, within 2 days at the latest.",
        ],
      },
      {
        h: "5. Who else handles your data",
        body: [
          "We use service providers who process data on our behalf and under contract:",
          [
            "Amazon Web Services: storage, servers and e-mail delivery (Frankfurt, and London for the image models).",
            "Google: the Gemini API, which reads your photo, your product labels and your messages with Sarah.",
            "Paddle: payments and subscriptions. Paddle is the Merchant of Record and handles payment data under its own privacy policy.",
            "Vercel: hosting of this website.",
          ],
          "In a shop, a retailer's session links your read to you only with your consent. Retailers receive anonymised trends only from people who opted in, for groups of at least 50.",
        ],
      },
      {
        h: "6. Transfers outside the EU",
        body: [
          "Some providers process data outside the European Economic Area, for example in the United Kingdom. Where that happens, we rely on an adequacy decision or on the European Commission's standard contractual clauses.",
        ],
      },
      {
        h: "7. How long we keep it",
        body: [
          [
            "Photos: 30 days, or deleted right after your results if you chose that (within 2 days at the latest).",
            "Scores, routine, products and messages: until you delete them or your account.",
            "Website form messages: as long as we need to answer and follow up, then deleted.",
            "Payment records: as long as tax and accounting law requires.",
          ],
        ],
      },
      {
        h: "8. Your rights",
        body: [
          "You can ask to access, correct, delete or export your data, to restrict or object to its use, and you can withdraw your consent at any time. You can delete a scan or your whole account yourself in the app, or write to {email}. We answer within one month.",
          "You can also complain to a data protection authority: the one in the EU country where you live, or in Tunisia the Instance Nationale de Protection des Données Personnelles (INPDP).",
        ],
      },
      {
        h: "9. Age",
        body: ["VISTASY is for adults. You must confirm you are 18 or older before a scan, and we do not knowingly collect data from children."],
      },
      {
        h: "10. Cookies and browser storage",
        body: [
          "This website uses no advertising or analytics cookies. It stores a few preferences in your browser: your light or dark theme, whether the opening animation has played in this tab, and whether you have already asked for an invite. The app stores your sign-in session on your device.",
          "When you tap a link to a shop, that shop or its affiliate network may set its own cookies on its own website, to know that you came from VISTASY and credit us a commission if you buy. Those cookies are governed by the shop's own privacy policy. We receive no personal data from them, only whether a sale was made.",
        ],
      },
      {
        h: "11. Security",
        body: [
          "Data is encrypted in transit and at rest, access is limited to the people who need it, and the back office never shows photos or chat messages.",
        ],
      },
      {
        h: "12. Changes",
        body: ["The date at the top shows the latest version of this policy. If a change matters, we tell you by e-mail or in the app."],
      },
    ],
  },
  refund: {
    title: "Refund Policy",
    lede: "When you can get your money back, and how.",
    sections: [
      {
        h: "1. 14 days on your first payment",
        body: [
          "If you are not happy with Premium, you can ask for a full refund within 14 days of your first payment for it, monthly, every 12 weeks or yearly, without giving a reason.",
        ],
      },
      {
        h: "2. Renewals",
        body: [
          "Renewals are not refunded. You can cancel at any time to stop the next renewal, and Premium stays active until the end of the period you have paid for.",
        ],
      },
      {
        h: "3. One-off purchases",
        body: [
          "Style Lab previews and Perfume Finder Signature sessions can be refunded within 14 days of purchase while unused. A report opens a scan's full results as soon as it is bought, so it is not refunded once opened. Used previews and sessions are not refunded.",
        ],
      },
      {
        h: "4. Always refunded",
        body: [
          "Duplicate charges, charges made after you cancelled, and billing errors are always refunded in full, whenever you notice them. If we stop a paid feature, we refund the period you have paid for and cannot use.",
        ],
      },
      {
        h: "5. Retail plans",
        body: [
          "Pilots are free, so there is nothing to refund. Retail plans are not sold online: they are invoiced directly under the agreement signed with us, and refunds follow that agreement. Usage charged after the fact, such as scans above your plan's allowance, is refunded only in case of a billing error.",
        ],
      },
      {
        h: "6. How to ask",
        body: [
          "Our order process is conducted by our online reseller Paddle.com, which is the Merchant of Record and handles refunds. Reply to your Paddle receipt, use paddle.net to find your purchase, or write to {email} with the e-mail address you paid with.",
          "Approved refunds go back to your original payment method. They usually appear within 5 to 10 business days, depending on your bank.",
        ],
      },
      {
        h: "7. Your legal rights",
        body: ["This policy does not limit any right you have under consumer law in the country where you live."],
      },
    ],
  },
};

const fr: Record<LegalKey, LegalDoc> = {
  terms: {
    title: "Conditions d'utilisation",
    lede: "Le contrat entre vous et {entity} lorsque vous utilisez le site VISTASY, l'application VISTASY ou une formule payante.",
    sections: [
      {
        h: "1. Qui nous sommes",
        body: [
          "VISTASY est exploité par {entity}, {address} (« nous »). Vous pouvez nous écrire à {email}.",
          "En créant un compte, en utilisant l'application ou en achetant une formule, vous acceptez ces conditions. Si vous ne les acceptez pas, n'utilisez pas VISTASY.",
        ],
      },
      {
        h: "2. Ce que fait VISTASY",
        body: [
          "VISTASY lit un selfie pris à la lumière du jour et donne des lectures cosmétiques de la peau, une routine choisie selon les preuves par ingrédient, et un verdict sur les produits que vous vérifiez. Les enseignes peuvent proposer la même lecture sur leur site, en magasin ou par notre API.",
          "VISTASY donne un conseil cosmétique, pas un diagnostic médical. Il ne nomme pas de maladie et ne remplace ni un médecin ni un dermatologue. Lorsqu'une lecture le justifie, l'application vous conseille de consulter un dermatologue. N'utilisez pas VISTASY pour décider d'un traitement médical.",
          "Les résultats dépendent de votre photo et de vos réponses. Nous ne promettons aucun résultat particulier d'un produit ou d'une routine.",
        ],
      },
      {
        h: "3. Qui peut l'utiliser",
        body: [
          "Vous devez avoir 18 ans ou plus. Pendant l'avant-première, VISTASY est accessible sur invitation uniquement.",
          "Vous êtes responsable de votre compte et de la confidentialité de votre lien de connexion ou de votre mot de passe. Prévenez-nous à {email} si vous pensez que quelqu'un d'autre a utilisé votre compte.",
        ],
      },
      {
        h: "4. Vos photos et vos données",
        body: [
          "Vous conservez tous vos droits sur les photos et informations que vous nous confiez. Vous nous autorisez à les stocker et à les traiter uniquement pour vous fournir VISTASY, comme décrit dans notre Politique de confidentialité. Vous choisissez la durée de conservation de votre photo et pouvez la supprimer, ou supprimer tout votre compte, à tout moment.",
          "N'envoyez que des photos de vous-même.",
        ],
      },
      {
        h: "5. Utilisation acceptable",
        body: [
          "Vous vous engagez à ne pas :",
          [
            "envoyer la photo d'une autre personne, ou de toute personne de moins de 18 ans ;",
            "utiliser VISTASY à des fins illégales ou pour nuire à autrui ;",
            "tenter d'accéder aux données d'autres personnes, de faire de l'ingénierie inverse du service ou de le perturber ;",
            "extraire automatiquement le contenu du service ou l'utiliser pour créer un produit concurrent ;",
            "revendre l'accès sans accord commercial avec nous.",
          ],
          "Nous pouvons suspendre ou fermer un compte qui enfreint ces règles.",
        ],
      },
      {
        h: "6. Formules, prix et paiement",
        body: [
          "Le résultat global et les trois préoccupations principales de votre premier scan, la vérification de produits et le Perfume Finder de base sont gratuits. Premium et les achats à l'unité (un rapport complet, des aperçus Style Lab, des séances Perfume Finder Signature) figurent avec leurs prix sur notre page Tarifs. Les prix peuvent varier selon le pays.",
          "Notre processus de commande est assuré par notre revendeur en ligne Paddle.com. Paddle.com est le Merchant of Record (vendeur officiel) de toutes nos commandes. Paddle traite toutes les demandes du service client et gère les remboursements. Lors d'un achat, les Conditions acheteur de Paddle s'appliquent également, et le prix payé, taxes applicables comprises, est indiqué au moment du paiement.",
          "Premium se renouvelle automatiquement à la fin de chaque période, chaque mois, toutes les 12 semaines ou chaque année, jusqu'à sa résiliation. La première période de 12 semaines coûte plus cher que les suivantes ; les deux prix sont indiqués avant le paiement. Vous pouvez résilier à tout moment ; Premium reste actif jusqu'à la fin de la période payée. Si un prix change, nous vous prévenons avant le prochain renouvellement et vous pouvez résilier avant qu'il ne s'applique.",
          "Les achats à l'unité se paient une fois. Un rapport ouvre les résultats complets d'un scan. Les aperçus Style Lab et les séances Perfume Finder Signature achetés restent sur votre compte et n'expirent pas tant que votre compte existe.",
          "Les remboursements sont régis par notre Politique de remboursement.",
        ],
      },
      {
        h: "7. Enseignes et entreprises",
        body: [
          "Les formules enseignes, les pilotes et l'accès à l'API ne sont pas vendus en ligne. Ils sont convenus après un pilote, dans un contrat ou un bon de commande distinct, et facturés directement par VISTASY. Ce contrat prévaut sur ces conditions pour l'entreprise concernée.",
          "Le classement n'est jamais à vendre : le catalogue d'une enseigne indique seulement ce qui est en stock et ne modifie jamais l'ordre des recommandations.",
        ],
      },
      {
        h: "8. Propriété intellectuelle",
        body: [
          "VISTASY, ses logiciels, modèles, contenus et sa marque appartiennent à {entity} ou à ses concédants. Ces conditions vous accordent un droit personnel et non transférable d'utiliser VISTASY ; elles ne vous transfèrent aucune propriété.",
        ],
      },
      {
        h: "9. Disponibilité et évolutions",
        body: [
          "Nous faisons en sorte que VISTASY soit disponible et exact, mais ne pouvons garantir qu'il sera toujours disponible, ininterrompu ou exempt d'erreurs. Nous pouvons modifier ou améliorer des fonctionnalités. Si nous arrêtons une fonctionnalité payante, nous vous prévenons à l'avance et remboursons toute période payée que vous ne pourrez pas utiliser.",
        ],
      },
      {
        h: "10. Responsabilité",
        body: [
          "VISTASY est fourni en l'état. Dans les limites permises par la loi, nous ne sommes pas responsables des dommages indirects, ni des décisions que vous prenez sur la base d'un conseil cosmétique. Notre responsabilité totale envers vous est limitée au montant que vous nous avez payé au cours des 12 mois précédant la réclamation.",
          "Rien dans ces conditions ne limite une responsabilité que la loi ne permet pas de limiter, ni vos droits de consommateur selon la loi de votre pays de résidence.",
        ],
      },
      {
        h: "11. Fin de l'utilisation",
        body: [
          "Vous pouvez cesser d'utiliser VISTASY et supprimer votre compte à tout moment depuis l'application. Nous pouvons mettre fin à votre accès en cas de manquement grave ou répété à ces conditions.",
        ],
      },
      {
        h: "12. Modifications de ces conditions",
        body: [
          "Nous pouvons mettre à jour ces conditions. La date en haut de page indique la dernière version. Si un changement est important, nous vous prévenons par e-mail ou dans l'application avant qu'il ne s'applique.",
        ],
      },
      {
        h: "13. Droit applicable et litiges",
        body: [
          "Ces conditions sont régies par le droit tunisien. Si vous êtes un consommateur, vous conservez la protection des dispositions impératives du pays où vous résidez et pouvez saisir ses tribunaux.",
          "Questions ou réclamations : {email}.",
        ],
      },
    ],
  },
  privacy: {
    title: "Politique de confidentialité",
    lede: "Ce que nous collectons lorsque vous utilisez VISTASY, pourquoi, qui d'autre le traite, combien de temps nous le gardons et comment le supprimer.",
    sections: [
      {
        h: "1. Responsable du traitement",
        body: [
          "{entity}, {address}, est responsable de vos données personnelles (responsable du traitement). Pour toute question sur cette politique : {email}.",
        ],
      },
      {
        h: "2. Ce que nous collectons",
        body: [
          [
            "Compte : votre adresse e-mail et, pendant l'avant-première, un mot de passe.",
            "Votre photo et ses résultats : le selfie que vous prenez, les lectures, calques et la routine qui en découlent.",
            "Vos réponses : type de peau, sensibilités et allergies, grossesse éventuelle, et produits que vous utilisez déjà. Certaines peuvent être des données de santé.",
            "Les produits que vous vérifiez ou enregistrez, et vos échanges avec Sarah, l'assistante IA de l'application.",
            "Localisation, uniquement si vous appuyez sur « Utiliser ma position » : arrondie à environ 10 km et utilisée pour afficher l'indice UV et adapter votre routine à votre climat.",
            "Vos consentements : ce que vous avez accepté, et quand.",
            "Sur ce site : ce que vous envoyez dans les formulaires d'invitation ou de pilote (e-mail, et pour les enseignes votre nom, entreprise et message).",
            "Paiements : Paddle traite votre paiement. Nous recevons votre nom, e-mail, pays, formule et statut de paiement, jamais vos données de carte.",
            "Données techniques : journaux serveur tels que l'adresse IP et le navigateur, conservés pour la sécurité.",
          ],
        ],
      },
      {
        h: "3. Pourquoi nous les utilisons",
        body: [
          [
            "Pour fournir VISTASY : lire votre photo, construire votre routine, vérifier des produits et suivre vos progrès (exécution de notre contrat avec vous).",
            "Pour analyser votre photo et utiliser vos réponses liées à la santé : uniquement avec votre consentement explicite, donné avant chaque scan. Vous pouvez le retirer à tout moment.",
            "Recherche : uniquement si vous l'acceptez, et seulement sous forme d'agrégats anonymisés pour des groupes d'au moins 50 personnes. Vous pouvez vous désinscrire à tout moment.",
            "Pour répondre à vos messages, envoyer votre lien de connexion et gérer votre abonnement.",
            "Pour sécuriser VISTASY et corriger les problèmes (notre intérêt légitime).",
            "Pour respecter nos obligations légales et fiscales.",
          ],
          "Nous ne vendons pas vos données personnelles, ne les utilisons pas pour la publicité, et les marques ne les reçoivent jamais.",
        ],
      },
      {
        h: "4. Où va votre photo",
        body: [
          "Votre photo est stockée à Francfort, en Allemagne. Pour la lire, nous l'envoyons à l'API Gemini de Google et à nos propres modèles d'image à Londres, où les copies sont supprimées dès qu'elles ont été lues. Le passage de chaque étape dans l'UE est prévu.",
          "Vous choisissez la durée de conservation de votre photo : 30 jours, pour que votre prochain scan puisse y être comparé, ou supprimée juste après vos résultats, sous 2 jours au plus tard.",
        ],
      },
      {
        h: "5. Qui d'autre traite vos données",
        body: [
          "Nous faisons appel à des prestataires qui traitent les données pour notre compte et sous contrat :",
          [
            "Amazon Web Services : stockage, serveurs et envoi d'e-mails (Francfort, et Londres pour les modèles d'image).",
            "Google : l'API Gemini, qui lit votre photo, les étiquettes de vos produits et vos échanges avec Sarah.",
            "Paddle : paiements et abonnements. Paddle est le Merchant of Record et traite les données de paiement selon sa propre politique de confidentialité.",
            "Vercel : hébergement de ce site.",
          ],
          "En magasin, une session de l'enseigne relie votre lecture à vous uniquement avec votre consentement. Les enseignes ne reçoivent que des tendances anonymisées, issues de personnes ayant accepté, pour des groupes d'au moins 50.",
        ],
      },
      {
        h: "6. Transferts hors de l'UE",
        body: [
          "Certains prestataires traitent des données hors de l'Espace économique européen, par exemple au Royaume-Uni. Dans ce cas, nous nous appuyons sur une décision d'adéquation ou sur les clauses contractuelles types de la Commission européenne.",
        ],
      },
      {
        h: "7. Durée de conservation",
        body: [
          [
            "Photos : 30 jours, ou supprimées juste après vos résultats si vous l'avez choisi (sous 2 jours au plus tard).",
            "Scores, routine, produits et messages : jusqu'à ce que vous les supprimiez, ou votre compte.",
            "Messages des formulaires du site : le temps de vous répondre et d'assurer le suivi, puis supprimés.",
            "Données de paiement : aussi longtemps que l'exigent les lois fiscales et comptables.",
          ],
        ],
      },
      {
        h: "8. Vos droits",
        body: [
          "Vous pouvez demander l'accès, la rectification, la suppression ou la portabilité de vos données, en limiter l'utilisation ou vous y opposer, et retirer votre consentement à tout moment. Vous pouvez supprimer un scan ou tout votre compte vous-même dans l'application, ou écrire à {email}. Nous répondons sous un mois.",
          "Vous pouvez aussi saisir une autorité de protection des données : celle du pays de l'UE où vous résidez, ou en Tunisie l'Instance Nationale de Protection des Données Personnelles (INPDP).",
        ],
      },
      {
        h: "9. Âge",
        body: ["VISTASY s'adresse aux adultes. Vous devez confirmer avoir 18 ans ou plus avant un scan, et nous ne collectons pas sciemment de données d'enfants."],
      },
      {
        h: "10. Cookies et stockage du navigateur",
        body: [
          "Ce site n'utilise aucun cookie publicitaire ou de mesure d'audience. Il enregistre quelques préférences dans votre navigateur : votre thème clair ou sombre, si l'animation d'ouverture a déjà été jouée dans cet onglet, et si vous avez déjà demandé une invitation. L'application enregistre votre session de connexion sur votre appareil.",
          "Quand vous touchez un lien vers une boutique, cette boutique ou son réseau d'affiliation peut déposer ses propres cookies sur son propre site, pour savoir que vous venez de VISTASY et nous attribuer une commission si vous achetez. Ces cookies relèvent de la politique de confidentialité de la boutique. Nous n'en recevons aucune donnée personnelle, seulement l'information qu'une vente a eu lieu.",
        ],
      },
      {
        h: "11. Sécurité",
        body: [
          "Les données sont chiffrées en transit et au repos, l'accès est limité aux personnes qui en ont besoin, et l'interface d'administration n'affiche jamais les photos ni les messages.",
        ],
      },
      {
        h: "12. Modifications",
        body: ["La date en haut de page indique la dernière version de cette politique. Si un changement est important, nous vous prévenons par e-mail ou dans l'application."],
      },
    ],
  },
  refund: {
    title: "Politique de remboursement",
    lede: "Quand vous pouvez être remboursé, et comment.",
    sections: [
      {
        h: "1. 14 jours sur votre premier paiement",
        body: [
          "Si Premium ne vous convient pas, vous pouvez demander un remboursement intégral dans les 14 jours suivant votre premier paiement, mensuel, toutes les 12 semaines ou annuel, sans avoir à vous justifier.",
        ],
      },
      {
        h: "2. Renouvellements",
        body: [
          "Les renouvellements ne sont pas remboursés. Vous pouvez résilier à tout moment pour arrêter le prochain renouvellement, et Premium reste actif jusqu'à la fin de la période payée.",
        ],
      },
      {
        h: "3. Achats à l'unité",
        body: [
          "Les aperçus Style Lab et les séances Perfume Finder Signature peuvent être remboursés dans les 14 jours suivant l'achat tant qu'ils ne sont pas utilisés. Un rapport ouvre les résultats complets d'un scan dès son achat ; il n'est donc pas remboursé une fois ouvert. Les aperçus et séances utilisés ne sont pas remboursés.",
        ],
      },
      {
        h: "4. Toujours remboursé",
        body: [
          "Les doubles prélèvements, les prélèvements effectués après votre résiliation et les erreurs de facturation sont toujours remboursés intégralement, quel que soit le moment où vous les constatez. Si nous arrêtons une fonctionnalité payante, nous remboursons la période payée que vous ne pourrez pas utiliser.",
        ],
      },
      {
        h: "5. Formules enseignes",
        body: [
          "Les pilotes sont gratuits, il n'y a donc rien à rembourser. Les formules enseignes ne sont pas vendues en ligne : elles sont facturées directement selon le contrat signé avec nous, et les remboursements suivent ce contrat. L'usage facturé a posteriori, comme les scans au-delà du volume inclus, n'est remboursé qu'en cas d'erreur de facturation.",
        ],
      },
      {
        h: "6. Comment demander",
        body: [
          "Notre processus de commande est assuré par notre revendeur en ligne Paddle.com, qui est le Merchant of Record et gère les remboursements. Répondez à votre reçu Paddle, retrouvez votre achat sur paddle.net, ou écrivez à {email} avec l'adresse e-mail utilisée pour payer.",
          "Les remboursements acceptés sont versés sur votre moyen de paiement d'origine. Ils apparaissent généralement sous 5 à 10 jours ouvrés, selon votre banque.",
        ],
      },
      {
        h: "7. Vos droits légaux",
        body: ["Cette politique ne limite aucun droit dont vous disposez selon le droit de la consommation de votre pays de résidence."],
      },
    ],
  },
};

export const LEGAL_DOCS: Record<string, Record<LegalKey, LegalDoc>> = { en, fr };
