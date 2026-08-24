import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
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
      const success = this.authService.login(this.identifier(), this.password());
      this.isLoading.set(false);
      if (success) {
        const user = this.authService.getUser();
        if (user?.role === 'SUPERADMIN') {
          this.router.navigate(['/superadmin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMessage.set('Identifiants incorrects.');
      }
    }, 500);
  }
}
