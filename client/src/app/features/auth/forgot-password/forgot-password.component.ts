import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { UiButtonComponent } from '../../../shared/components/ui-button/ui-button.component';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink, UiInputComponent, UiButtonComponent],
    templateUrl: './forgot-password.component.html',
})
export class ForgotPasswordComponent {
    private fb = inject(FormBuilder);
    isSubmitting = false;
    isSent = false;

    forgotForm = this.fb.group({
        email: ['', [Validators.required, Validators.email]]
    });

    getError(controlName: string): string | null {
        const control = this.forgotForm.get(controlName);
        if (control?.invalid && (control.touched || control.dirty)) {
            if (control.hasError('required')) return 'Trường này bắt buộc';
            if (control.hasError('email')) return 'Email không hợp lệ';
        }
        return null;
    }

    onSubmit() {
        if (this.forgotForm.valid) {
            this.isSubmitting = true;
            setTimeout(() => {
                this.isSubmitting = false;
                this.isSent = true;
            }, 1500);
        } else {
            this.forgotForm.markAllAsTouched();
        }
    }
}
