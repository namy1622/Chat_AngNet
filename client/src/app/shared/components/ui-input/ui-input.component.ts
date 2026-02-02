import { CommonModule } from '@angular/common';
import { Component, forwardRef, input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

@Component({
  selector: 'app-ui-input',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  // dòng này đki component này là 1 FormControl hợp lệ, có thể sử dụng ngModel
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true
    }
  ],
  standalone: true,
  template: `
    <div class="w-full space-y-1">
      <!-- label(neu co) -->
       @if(label()){
        <label class="block text-sm font-medium text-text-main">
          {{label()}}

          @if(required()){
            <span class="text-status-danger">*</span>
          }
        </label>

        <!-- input container -->
         <div class="relative">
          <!-- input chinh -->
           <input 
            [type]="type()"
            [placeholder]="placeholder()"
            [disabled]="isDisabled"
            [value]="value"
            (input)="onInput($event)"
            (blur)="onTouched()"
            class="flex h-10 w-full rounded-md border border-gray-300 bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all"
            [ngClass]="{'boder-status-danger focus:ring-status-danger': error()}"
           />

           <!-- slot cho icon (đặt icon bên phải) -->
            <div class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <ng-content select="[suffix]"></ng-content>>
            </div>
         </div>

         @if(error()){
          <p class="text-xs text-status-danger animate-pulse">
            {{error()}}
          </p>
         }
       }
    </div>
  `,
  styles: ``
})
export class UiInputComponent implements ControlValueAccessor {

  // signal input
  label = input<string>('');
  placeholder = input<string>('');
  type = input<'text' | 'email' | 'password' | 'number'>('text');
  error = input<string | null>(null);
  required = input<boolean>(false);

  // bien luu value noi bo
  value: string = '';
  isDisabled = false;

  // ham callback gia 
  onChange = (val: string) => { };
  onTouched = () => { };

  // ---------------------
  // implement interface  của ControlValueAccessor

  // gọi khi muốn ghi value từ Form vào Input này (ngModel)
  // ex: form.get('email').setValue('nam@gmail.com')
  writeValue(val: string): void {
    this.value = val || '';
  }

  // gọi khi user gõ phím 
  // báo ngược lại cho Form biết value thay đổi
  registerOnChange(fn: any): void {
    this.onChange = fn
  }

  // gọi khi user blur(rời chuột) khỏi input
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  // xử lý disabled 
  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  //---------------------------

  onInput(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    this.value = val;
    this.onChange(val); // báo Form biết value thay đổi
  }
}

/**
 * ====== Lý thuyết ======
 * 
 * 1. ControlValueAccessor (CVA):
 * - interface cung cấp các phương thức để giao tiếp giữa Form và Input
 * - Giúp component hành xử như thẻ <input> thật
 *   * nếu ko có nó -> ko thể dùng [formControl]="aâ" hoặc ngModel
 * 
 * 2. forwardRef():
 *  - giúp angular refer đến class UiInputComponent ngay cả khi chưa được định nghĩa xong
 * 
 * 3. ng-content select="[suffix]":
 *  -- kỹ thuật "Content projection". cho phép nhét icon vào input từ bên ngoài
 *    ex: <app-ui-input> <span suffix>👁️</span> </app-ui-input>
 * 
 */
