import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { StructureService } from '../../services/structure.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './superadmin-dashboard.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class SuperAdminDashboardComponent {
  protected stats = computed(() => this.structureService.getStats());
  protected recentStructures = computed(() =>
    this.structureService.getAllStructures().slice(0, 5)
  );
  protected feedbackMessage = signal('');

  constructor(
    private structureService: StructureService
  ) {}
}
