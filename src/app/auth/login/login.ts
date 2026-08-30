import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class LoginComponent {
  identifier = signal('');
  password = signal('');
  showPassword = signal(false);
  rememberMe = signal(false);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit(): void {
    this.errorMessage.set('');
    if (!this.identifier() || !this.password()) {
      this.errorMessage.set('Veuillez remplir tous les champs.');
      return;
    }
    this.isLoading.set(true);
    setTimeout(() => {
      const result = this.authService.login(this.identifier(), this.password());
      this.isLoading.set(false);
      if (result.success) {
        const user = this.authService.getUser();
        if (user?.role === 'SUPERADMIN') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else if (result.pending) {
        // Compte en attente de validation admin : accès bloqué
        this.router.navigate(['/pending']);
      } else {
        this.errorMessage.set('Identifiants incorrects.');
      }
    }, 500);
  }
}
