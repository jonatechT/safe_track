import { Injectable, signal } from '@angular/core';
import { Structure, StructureStats } from '../models/structure.model';

@Injectable({
  providedIn: 'root'
})
export class StructureService {
  private readonly STORAGE_KEY = 'safe_track_structures';
  private readonly STORAGE_VERSION_KEY = 'safe_track_structures_version';
  private readonly CURRENT_VERSION = '4';

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
    // Aucune structure par défaut : le superadmin les crée lui-même
    this.saveStructures([]);
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