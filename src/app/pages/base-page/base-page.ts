import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-base-page',
  standalone: true,
  templateUrl: './base-page.html',
  styleUrl: './base-page.scss'
})
export class BasePageComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() icon: string = 'fa-solid fa-cube';
}
