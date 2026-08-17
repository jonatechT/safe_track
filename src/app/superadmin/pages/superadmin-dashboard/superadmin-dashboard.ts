import { Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StructureService } from '../../services/structure.service';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './superadmin-dashboard.html',
  styleUrl: '../../superadmin-styles.scss'
})
export class SuperAdminDashboardComponent {
  protected stats = computed(() => this.structureService.getStats());
  protected recentStructures = computed(() =>
    this.structureService.getAllStructures().slice(0, 5)
  );

  constructor(private structureService: StructureService) {}
}