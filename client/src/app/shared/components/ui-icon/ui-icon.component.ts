import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { LucideAngularModule, icons } from 'lucide-angular';
// cần cài lucide-angular: npm install lucide-angular

@Component({
  selector: 'app-ui-icon',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- lucide-angular c.cap component <lucide-icon> -->
    <!-- bọc nó để dễ kiểm soát size, class chung -->
     <lucide-icon 
      [name]="name()" 
      [class]="class()" 
      [size]="size()" 
      [strokeWidth]="strokeWidth()">
    
    </lucide-icon>
  `,
  styles: ``
})
export class UiIconComponent {
  // ten icon muon hien thi
  name = input.required<string>();

  size = input<number>(24);
  class = input<string>('');
  strokeWidth = input<number>(2);

}

/**
 * - input.requried<T>(); : bắt buộc phải truyền giá trị
 *       giúp an toàn hơn so với @Input() không có giá trị
 * 
 * - wrapper component:
 *    why ko dùng thẳng <lucide-icon>?
 *    -> sau nếu muốn đổi bộ icon khác -> chỉ cần sửa file này
 *                                        ko cần sửa đổi 100 chỗ khác trong project
 */