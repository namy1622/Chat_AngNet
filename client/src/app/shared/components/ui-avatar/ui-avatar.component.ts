import { CommonModule } from '@angular/common';
import { Component, computed, input } from '@angular/core';

// auto hienthi chu cai dau neu ko co avatar
@Component({
  selector: 'app-ui-avatar',
  imports: [CommonModule],
  standalone: true,
  // template: `
  //   <div class="relative inline-flex items-center justify-center rounded-full bg-gray-200 object-cover shrink-0 font-medium text-gray-600 select-none"
  //     [ngClass]="sizeClasses()">
  //     <!-- case1: co img that -->
  //      @if (src()){
  //       <img [src]="src()" [alt]="alt()" class="w-full h-full object-cover">
  //      }
  //     <!-- case2: khong co img -->
  //      @else {
  //       <span> {{ initials() }}</span>
  //      }
  //     <!-- status dot (online/offline) -->
  //      @if(status() !== 'none'){
  //       <span class="absolute bottom-0 right-0 block rounded-full ring-2 ring-white" 
  //       [ngClass]="statusClasses()"></span>
  //      }

  //   </div>
  // `,

  template: `
    <div class="relative inline-block" [class]="sizeClasses()">
      <!-- Anh avatar hoac fallback chu cai -->
      @if(src() && !imageError){
        <img 
          [src]="src()"
          [alt]="alt()"
          (error)="onImageError()"
          class="w-full h-full rounded-full onject-cover"
          [class]="borderClass()"/>
          
      }
      @else {
        <!-- fallback: hien thi chu cai dau -->
         <div class="w-full h-full rounded-full flex itemms-center justify-center font-semibold text-white"
            [class]="fallbackClasses()"
            [style.background-color]="fallbackColor()">
            {{ initials() }}
         </div>
      }

      <!-- cham trang thai online/offline -->
      @if(status() !== 'none'){
        <span class="absolute bottom-0 right-0 rounded-full border-2 border-white" 
          [class]="statusClasses()">
        </span>
      }
    </div>
  `,
  styles: ``
})
export class UiAvatarComponent {
  // signal input (angular 17+)
  src = input<string | null>();  // url ảnh
  alt = input<string>('');     // tên hiển thị
  size = input<'xs' | 'sm' | 'md' | 'lg'>('md');  // kích thước
  status = input<'online' | 'offline' | 'none'>('none'); // trạng thái

  // === state ===
  imageError = false;

  //---------------------------------
  // Mau nen fallback dua tren ten (de moi nguoi co mau sac khac nhau)
  fallbackColor = computed(() => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
    ];

    const name = this.alt();
    let hash = 0;

    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  });

  //---------------------------------
  // tinh toan class size
  sizeClasses = computed(() => {
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
    }
    return sizes[this.size()];
  });

  //---------------------------------
  // tinh toan class status
  statusClasses = computed(() => {
    const common = 'rounded-full ring-2 ring-white';

    const sizes = {
      xs: 'w-1.5 h-1.5',
      sm: 'w-2 h-2',
      md: 'w-2.5 h-2.5',
      lg: 'w-3.5 h-3.5'
    }
    // const colors ={
    //   online: 'bg-status-online',
    //   offline: 'bg-status-offline',
    //   none: 'hidden'
    // }
    const statusColors = {
      online: 'bg-green-500',
      offline: 'bg-gray-400',
      none: 'hidden'
    };

    return `${sizes[this.size()]} ${statusColors[this.status()]}`
  });

  //---------------------------------
  // lay 2 chu cai dau tien: Doan Tuan -> DT
  initials = computed(() => {
    const name = this.alt() || 'User';

    if (!name) return '?';
    const parts = name.split(' ').filter(p => p);

    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();

    // return name
    //   .split('') // chia thanh cac ky tu: Doan Tuan -> [D, o, a, n, T, u, a, n]
    //   .map(chars => chars[0]) // lay ky tu dau tien -> [D, T]
    //   .slice(0, 2) // lay 2 ky tu dau tien -> [D, T]
    //   .join('') // ket hop thanh chuoi -> DT
    //   .toUpperCase(); // chuyen thanh hoa -> DT
  });

  borderClass = () => 'border border-gray-200';
  fallbackClasses = () => 'border border-white/20';

  // xu ly anh load loi
  onImageError() {
    this.imageError = true;
  }
}

/*
  === Ly Thuyet ===

  1. input<T>(): singal input - angular 17+
    - cach moi khai bao @Input(), tra ve signal
    - co the dat gia tri mac dinh: input<string>('default')
    - dung trong template: {{ src() }}

  2. computed(): 
    - tao singal moi tu cac signal khac
    - tu dong cap nhat khi dependency thay doi
      ex: intials(): tu tinh lai alt() thay doi
  
  3. fallback pattern:
    - neu anh loi hoac khong co src, hien chu cai dau
    - hash ten de tao mau "ngau nhien nhung nhat quan"
      (cung ten => cung mau moi lan render)

  4. status indicator:
    - cham nho goc phai duoi de hien online/offline
    - dung absolute positioning so voi avatar container
*/