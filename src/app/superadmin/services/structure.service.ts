import { Injectable, signal } from '@angular/core';
import { Structure, StructureStats } from '../models/structure.model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private readonly STORAGE_KEY = 'safe_track_structures';
  private readonly STORAGE_VERSION_KEY = 'safe_track_structures_version';
  private readonly CURRENT_VERSION = '3';

  structures = signal<Structure[]>(this.loadStructures());

  constructor() {
    const version = typeof window !== 'undefined' ? localStorage.getItem(this.STORAGE_VERSION_KEY) : null;
    if (version !== this.CURRENT_VERSION) {
      this.seedStructures();
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_VERSION_KEY, this.CURRENT_VERSION);
      }
    }
  }

  private loadStructures(): Structure[] {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    }
    return [];
  }

  private saveStructures(structures: Structure[]): void {
    this.structures.set(structures);
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(structures));
    }
  }

  private seedStructures(): void {
    const now = new Date().toISOString();
    const seed: Structure[] = [
      {
        id: 'STR-001',
        nom: 'Alioth system',
        code: 'ALIOTH-SYSTEM',
        description: 'Solutions technologiques et systèmes embarqués.',
        email: 'contact@alioth-system.com',
        telephone: '+226 25 41 56 78',
        adresse: 'Rue de la technologie',
        ville: 'Bobo-Dioulasso',
        pays: 'Burkina Faso',
        statut: 'ACTIVE',
        dateCreation: '2024-03-20T10:00:00.000Z',
        dateModification: now,
        adminNom: 'Admin Alioth',
        adminEmail: 'admin@alioth-system.com',
        adminTelephone: '+226 70 98 76 54'
      },
      {
        id: 'STR-002',
        nom: 'Orange energie',
        code: 'ORANGE-ENERGIE',
        description: 'Fournisseur d\'énergie solaire.',
        email: 'contact@orange-energie.com',
        telephone: '+226 25 40 12 34',
        adresse: 'Zone industrielle',
        ville: 'Ouagadougou',
        pays: 'Burkina Faso',
        statut: 'ACTIVE',
        dateCreation: '2024-01-15T10:00:00.000Z',
        dateModification: now,
        adminNom: 'Admin Orange',
        adminEmail: 'admin@orange-energie.com',
        adminTelephone: '+226 70 12 34 56'
      },
      {
        id: 'STR-003',
        nom: 'Bissa gold',
        code: 'BISSA-GOLD',
        description: 'Exploitation minière aurifère.',
        email: 'contact@bissa-gold.com',
        telephone: '+226 25 42 33 44',
        adresse: 'Site minier de Bissa',
        ville: 'Boudry',
        pays: 'Burkina Faso',
        statut: 'ACTIVE',
        dateCreation: '2023-11-05T10:00:00.000Z',
        dateModification: now,
        adminNom: 'Admin Bissa',
        adminEmail: 'admin@bissa-gold.com',
        adminTelephone: '+226 70 11 22 33'
      }
    ];
    this.saveStructures(seed);
  }

  getAllStructures(): Structure[] {
    return this.structures();
  }

  countUsers(): { total: number; actifs: number } {
    if (typeof window !== 'undefined') {
      const userKey = 'safe_track_users';
      const raw = localStorage.getItem(userKey);
      const users = raw ? JSON.parse(raw) : [];
      const actifs = users.filter((u: any) => u.role === 'ADMIN_STRUCTURE' || u.role === 'USER').length;
      return { total: users.length, actifs };
    }
    return { total: 0, actifs: 0 };
  }

  getStats(): StructureStats {
    const structures = this.structures();
    const actives = structures.filter(s => s.statut === 'ACTIVE').length;
    const users = this.countUsers();
    return {
      total: structures.length,
      actives,
      inactives: structures.length - actives,
      totalUtilisateurs: users.total,
      utilisateursActifs: users.actifs
    };
  }

  getStructure(id: string): Structure | undefined {
    return this.structures().find(s => s.id === id);
  }

  createStructure(structure: Omit<Structure, 'id' | 'dateCreation' | 'dateModification'>): Structure {
    const now = new Date().toISOString();
    const newStructure: Structure = {
      ...structure,
      id: this.generateId(),
      dateCreation: now,
      dateModification: now
    };
    this.saveStructures([...this.structures(), newStructure]);
    return newStructure;
  }

  updateStructure(id: string, changes: Partial<Structure>): Structure | undefined {
    const structures = this.structures();
    const index = structures.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    const updated: Structure = {
      ...structures[index],
      ...changes,
      id,
      dateModification: new Date().toISOString()
    };
    const newList = [...structures];
    newList[index] = updated;
    this.saveStructures(newList);
    return updated;
  }

  toggleStatus(id: string): Structure | undefined {
    const structure = this.getStructure(id);
    if (!structure) return undefined;
    const newStatus = structure.statut === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    return this.updateStructure(id, { statut: newStatus });
  }

  private generateId(): string {
    const random = Math.floor(1000 + Math.random() * 9000);
    return `STR-${random}`;
  }
}