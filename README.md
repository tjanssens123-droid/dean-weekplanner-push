# Dean Weekplanner Push

Gratis PWA-basis voor pushmeldingen tussen Dean en Stefan.

De app gebruikt Web Push en vraagt gebruikers om meldingen toe te staan. Iedere gebruiker kan een eigen push-abonnement maken en de ander een testmelding sturen.

Voor productie moet in Vercel één environment variable bestaan:

- VAPID_PRIVATE_KEY

De publieke VAPID-sleutel staat bewust in de frontend; de private sleutel hoort alleen in Vercel te staan en niet in GitHub.
