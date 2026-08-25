import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  identifier = '';
  structure = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage = '';
    const fullName = `${this.firstName} ${this.lastName}`.trim();
    if (!this.firstName || !this.lastName || !this.identifier || !this.structure || !this.password) {
      this.errorMessage = 'Veuillez remplir tous les champs.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.password.length < 8) {
      this.errorMessage = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }
    this.isLoading = true;
    setTimeout(() => {
      const success = this.authService.register(fullName, this.identifier, this.password);
      this.isLoading = false;
      if (success) {
        // Aucune session ouverte : redirection vers la page d'attente de validation
        this.router.navigate(['/pending']);
      } else {
        this.errorMessage = 'Cet identifiant est déjà utilisé.';
      }
    }, 500);
  }
}