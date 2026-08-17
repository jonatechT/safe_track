export type StructureStatus = 'ACTIVE' | 'INACTIVE';

export interface Structure {
  id: string;
  nom: string;
  code: string;
  description: string;
  email: string;
  telephone: string;
  adresse: string;
  ville: string;
  pays: string;
  statut: StructureStatus;
  dateCreation: string;
  dateModification: string;
  adminNom?: string;
  adminEmail?: string;
  adminTelephone?: string;
  adminMotDePasse?: string;
}

export interface StructureStats {
  total: number;
  actives: number;
  inactives: number;
  totalUtilisateurs: number;
  utilisateursActifs: number;
}