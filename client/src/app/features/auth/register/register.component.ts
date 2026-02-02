import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, UiInputComponent, UiButtonComponent],
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  isSubmitting = false;

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  // Custom Validator để check password trùng nhau
  passwordMatchValidator(form: any) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
    } else {
      confirmPassword.setErrors(null);
    }
  }

  getError(controlName: string): string | null {
    const control = this.registerForm.get(controlName);
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.hasError('required')) return 'Trường này bắt buộc';
      if (control.hasError('email')) return 'Email không hợp lệ';
      if (control.hasError('minlength')) return `Tối thiểu ${control.errors?.['minlength'].requiredLength} ký tự`;
      if (control.hasError('mismatch')) return 'Mật khẩu không khớp';
    }
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isSubmitting = true;
      console.log('Register Data:', this.registerForm.value);
      setTimeout(() => {
        this.isSubmitting = false;
        alert('Đăng ký thành công!');
      }, 1500);
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
