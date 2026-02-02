import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <!-- Layout nền xám, căn giữa -->
    <div class="min-h-screen bg-surface-muted flex items-center justify-center p-4">
      
      <!-- Nơi hiển thị Login/Register -->
      <router-outlet></router-outlet>
      
    </div>
  `,
  styles: ``
})
export class AuthLayoutComponent { }
