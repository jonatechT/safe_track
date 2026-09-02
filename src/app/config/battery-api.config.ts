/**
 * Configuration du module « Diagnostic batterie ».
 *
 * Le frontend ne contient AUCUNE logique de prédiction IA : il consomme
 * uniquement les endpoints fournis par le backend :
 *   GET /api/batterie/{device_id}/actuel
 *   GET /api/batterie/{device_id}/historique
 *
 * ── Mode MOCK (développement uniquement) ─────────────────────────────────────
 * Si `useMock` vaut `true`, les méthodes de `EquipmentService` utilisent des
 * données simulées, isolées dans `services/batterie-mock-data.ts`.
 * Remettre `useMock: false` (par défaut) pour consommer le vrai backend.
 */
export const BATTERY_API_CONFIG = {
  /** Base URL des endpoints batterie du backend. */
  baseUrl: '/api/batterie',
  /** true = mock dev isolé ; false = backend réel (défaut, prêt pour la prod). */
  useMock: false
} as const;