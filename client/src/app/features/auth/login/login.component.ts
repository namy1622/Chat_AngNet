import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

// inport cac conponent da tu lam
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule, // bat buoc de dung form
    RouterLink, // de dung routerLink= "/auth/register"
    UiInputComponent,
    UiButtonComponent
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  // inject(): cach moi thay vi constructor(private fb: FormBuilder)
  private fb = inject(FormBuilder);

  private authService = inject(AuthService);
  private router = inject(Router);

  isSubmitting = false;

  // khoi tao Form
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  // ham lay loi (de hien thi ra UI)
  getError(controlName: string): string | null {
    const control = this.loginForm.get(controlName);

    // chi hien loi khi user da touched hoac dirty(đã gõ)
    if (control?.invalid && (control.touched || control.dirty)) {
      if (control.hasError('required')) return 'Trường này không được để trống';
      if (control.hasError('email')) return 'Email không hợp lệ';
      if (control.hasError('minlength')) return 'Mật khẩu phải có ít nhất 6 ký tự';
      return 'Định dạng không hợp lệ';
    }
    return null;
  }

  // xử lý submit
  onSubmit() {
    if (this.loginForm.valid) {
      this.isSubmitting = true;

      console.log('-- Form data: ', this.loginForm.value);

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          console.log('-- login success --', response);

          // chuyen huong ve trang chat chinh
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting = false;
          console.log('-- login failed --', err);

          // hien thi loi (don gian - cai tien sau)
          alert('Đăng nhập thất bại! Kiểm tra lại Email/Password.');
        }
      })
    }
    else {
      // neu form loi + user van bam submit -> danh dau all la da touched de hien loi do
      this.loginForm.markAllAsTouched();
    }
  }
}

/**
 * -- ly thuyet --
 * 
 * 
 * 1. [formGroup]: vỏ bọc toàn bộ form.
 * 2.formControlName: là cầu nối mapping từng input UI vào logic code.
 * 3. Validatỏ: bộ kiểm tra lỗi có sẵn (requried, email, minlength, maxlength, patternm,...)
 * 4. markAllAsTouched(): dùng để ép hiện lỗi đỏ lên tất cả ô Input khi cố tình submit form không nhập giá trị  
 */