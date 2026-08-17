import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Structure } from '../../models/structure.model';
import { StructureService } from '../../services/structure.service';

@Component({
  selector: 'app-structures-list',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './structures-list.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class StructuresListComponent implements OnInit {
  protected searchTerm = signal('');
  protected statusFilter = signal('');
  protected isLoading = signal(true);
  protected message = signal('');
  protected messageType = signal<'success' | 'error'>('success');
  protected showConfirmModal = signal(false);
  protected selectedStructure = signal<Structure | null>(null);

  protected filteredStructures = computed(() => {
    const all = this.structureService.getAllStructures();
    const term = this.searchTerm().toLowerCase().trim();
    const status = this.statusFilter();
    return all.filter(s => {
      const matchesTerm = !term ||
        s.nom.toLowerCase().includes(term) ||
        s.code.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.ville.toLowerCase().includes(term);
      const matchesStatus = !status || s.statut === status;
      return matchesTerm && matchesStatus;
    });
  });

  constructor(
    private structureService: StructureService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Simulate a small load time for UX
    setTimeout(() => this.isLoading.set(false), 300);
  }

  protected confirmToggleStatus(structure: Structure): void {
    this.selectedStructure.set(structure);
    this.showConfirmModal.set(true);
  }

  protected cancelModal(): void {
    this.showConfirmModal.set(false);
    this.selectedStructure.set(null);
  }

  protected confirmToggle(): void {
    const s = this.selectedStructure();
    if (!s) return;
    const updated = this.structureService.toggleStatus(s.id);
    if (updated) {
      const action = updated.statut === 'ACTIVE' ? 'activée' : 'désactivée';
      this.message.set(`La structure « ${updated.nom} » a été ${action} avec succès.`);
      this.messageType.set('success');
      setTimeout(() => this.message.set(''), 4000);
    }
    this.cancelModal();
  }
}