import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Structure } from '../../models/structure.model';
import { StructureService } from '../../services/structure.service';

@Component({
  selector: 'app-structure-detail',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './structure-detail.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class StructureDetailComponent implements OnInit {
  protected structureId = '';
  protected structure = signal<Structure | null>(null);
  protected message = signal('');
  protected messageType = signal<'success' | 'error'>('success');
  protected showConfirmModal = signal(false);

  constructor(
    private structureService: StructureService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.structureId = this.route.snapshot.paramMap.get('id') || '';
    this.loadStructure();
  }

  private loadStructure(): void {
    const s = this.structureService.getStructure(this.structureId);
    this.structure.set(s || null);
  }

  protected confirmToggleStatus(): void {
    this.showConfirmModal.set(true);
  }

  protected cancelModal(): void {
    this.showConfirmModal.set(false);
  }

  protected confirmToggle(): void {
    const s = this.structure();
    if (!s) return;
    const updated = this.structureService.toggleStatus(s.id);
    if (updated) {
      const action = updated.statut === 'ACTIVE' ? 'activée' : 'désactivée';
      this.structure.set(updated);
      this.message.set(`La structure « ${updated.nom} » a été ${action} avec succès.`);
      this.messageType.set('success');
      setTimeout(() => this.message.set(''), 4000);
    }
    this.cancelModal();
  }
}