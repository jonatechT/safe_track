import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, User } from '../auth.service';
import { StructureService } from '../../superadmin/services/structure.service';
import { Structure } from '../../superadmin/models/structure.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  nom = signal('');
  prenom = signal('');
  email = signal('');
  telephone = signal('');
  motDePasse = signal('');
  structureId = signal('');
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private structureService: StructureService,
    private router: Router
  ) {}

  /** Structures actives disponibles pour l'inscription */
  get structures(): Structure[] {
    return this.structureService.getAllStructures().filter(s => s.statut === 'ACTIVE');
  }

  /** Nom de la structure sélectionnée */
  get selectedStructureName(): string {
    const s = this.structureService.getStructure(this.structureId());
    return s?.nom || '';
  }

  onSubmit(): void {
    this.errorMessage.set('');
    const fullName = `${this.prenom().trim()} ${this.nom().trim()}`.trim();

    if (!this.nom().trim() || !this.prenom().trim() || !this.email().trim() || !this.motDePasse().trim() || !this.structureId()) {
      this.errorMessage.set('Veuillez remplir tous les champs obligatoires (*).');
      return;
    }
    if (this.motDePasse().length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!this.isValidEmail(this.email())) {
      this.errorMessage.set('Veuillez saisir une adresse email valide.');
      return;
    }

    this.isLoading.set(true);
    setTimeout(() => {
      // Créer le compte avec le statut PENDING et la structure choisie.
      // La demande de validation sera visible par l'admin de la structure
      // dans sa page « Gestion des techniciens ».
      const newUser: User = {
        id: Date.now(),
        name: fullName,
        email: this.email().trim().toLowerCase(),
        role: 'USER',
        structureId: this.structureId(),
        statut: 'PENDING',
        telephone: this.telephone().trim() || undefined,
        dateCreation: new Date().toISOString(),
        motDePasse: this.motDePasse()
      };
      this.authService.registerUser(newUser);
      this.isLoading.set(false);
      this.router.navigate(['/pending']);
    }, 500);
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}