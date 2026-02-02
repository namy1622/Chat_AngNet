import { Component, EventEmitter, Output, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ui-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || isLoading()"
      (click)="onClick.emit($event)"
      class="inline-flex items-center mt-3 justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      [ngClass]="[variantClasses(), sizeClasses(), block() ? 'w-full' : '']"
    >
      <!-- Loading Spinner -->
      @if (isLoading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
      }

      <!-- Icon & Content -->
      <ng-content></ng-content>
    </button>
  `
})
export class UiButtonComponent {
  type = input<'button' | 'submit' | 'reset'>('button');
  variant = input<'primary' | 'secondary' | 'ghost' | 'danger'>('primary');
  size = input<'sm' | 'md' | 'lg'>('md');
  block = input<boolean>(false);
  disabled = input<boolean>(false);
  isLoading = input<boolean>(false);

  @Output() onClick = new EventEmitter<Event>();

  variantClasses() {
    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
      secondary: 'bg-surface-muted text-text-main hover:bg-gray-200 focus:ring-gray-400',
      ghost: 'bg-transparent text-text-main hover:bg-gray-100 focus:ring-gray-400',
      danger: 'bg-status-danger text-white hover:bg-red-600 focus:ring-red-500'
    };
    return variants[this.variant()];
  }

  sizeClasses() {
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base'
    };
    return sizes[this.size()];
  }
}
