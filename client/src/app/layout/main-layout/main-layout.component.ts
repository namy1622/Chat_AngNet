import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../features/auth/../chat/sidebar/sidebar.component';
import { CommonModule } from '@angular/common';
import { SidebarService } from '../../core/services/sidebar.service';
import { SignalrService } from '../../core/services/signalr.service';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, SidebarComponent, CommonModule],
  standalone: true,
  providers: [SidebarService],
  template: `
    <!-- container chinh: flex row (ngang) -->
    <!-- h-screen: cao bang man hinh -->
    <!-- overflow-hidden: ko cuon trang -->
    <div class="flex h-screen w-full overflow-hidden bg-gray-50">

    <!-- mobile: overlay khi sidebar open -->
    <!-- Chỉ hiện khi Sidebar MỞ (!isSidebarCollapsed) và trên màn hình nhỏ (md:hidden) -->
    <!-- @if(!isSidebarCollapsed()) {
      <div class="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity" 
            (click)="toggleSidebar()">
      </div>
    } -->

    <!-- khi sidebar mo -> hien overlay, khi click vao overlay (ngoai sidebar) thi dong sidebar -->
    @if(sidebarService.isCollapsed()) {
      <div class="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity" 
            (click)="sidebarService.close()"> 
      </div>
    } 
      
    <!-- COT Trai Sidebar -->
    <!-- w-80 (320ox): do rong co dinh  -->
    <!-- border-r: duong ke gioi han ben phai -->
    <!-- hidden md: flex: an tren mobile, hien tren desktop - tu man hinh md tro len -->
      <!-- <aside class="w-80 hidden md:flex flex-col border-r border-gray-200 bg-white z-20 shadow-sm relative md: shadow-sm transform transition-transforn duration-300 ease-in-out" -->
      <aside class="fixed md:relative z-20 h-full flex flex-col border-r border-gray-200 bg-white shadow-sm transition-all duration-300"
        [class.w-80]="sidebarService.isCollapsed()"
        [class.w-20]="!sidebarService.isCollapsed()"
        [class.-translate-x-full]="!sidebarService.isCollapsed()" 
        [class.md:translate-x-0]="true"
        >
        <!-- [class.md:translate-x-0]="true"> -->
        <!-- hien tai de tam text - sau se thay the bang <app-sidebar> -->
        <!-- <div class="p-4 text-center">
          <h2 class="font-bold text-gray-700">Sidebar Area</h2>
          <p class="text-sm text-gray-500">Chat Sidebar</p>
        </div> -->

        <app-sidebar 
          [isCollapsed]="!sidebarService.isCollapsed()"
          (toggleSidebar)="sidebarService.toggle()"
          (conersationSelected)="onMobileCloseSidebar()">
        </app-sidebar>
      </aside>

      <!-- COT Phai Main Content  -->
      <!-- flex-1: tu dong chiem het khong gian con lai -->
      <!-- flex-col: chuyen thanh ngang thanh doc -->
      <!-- relative: cac thanh phan con can chinh tuyet doi theo no -->
      <main class="flex-1 flex flex-col relative bg-white min-w-0">

        <!-- mobile: nut mo sidebar -->
        <!-- <app-ui-button
          variant="ghost"
          size="sm"
          class="md:hidden fixed top-4 left-4 z-20 !p-2 !bg-white shadow-md border border-gray-200 !rounded-lg"
          (onClick)="toggleSidebar()">
          <app-ui-icon name="menu" [size]="0"></app-ui-icon>
        </app-ui-button> -->
<!-- 
        <button 
          class="md:hidden fixed top-4 left-4 z-20 p-2 bg-white rounded-lg shadow-md border border-gray-200"
          (click)="toggleSidebar()">
          <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button> -->

        <router-outlet></router-outlet>
      </main>
  </div>

   
  `,
  styles: ``
})
export class MainLayoutComponent {
  // singal de dieu khien trang thai sidebar tren mobile
  // isSidebarOpen = signal<boolean>(false);

  isSidebarCollapsed = signal<boolean>(false);

  // inject service
  sidebarService = inject(SidebarService);
  signalrService = inject(SignalrService);

  constructor() {
    // khoi dong ket noi signalr ngay khi vao layout chinh
    this.signalrService.startConnection();
    console.log('Signalr connected');
  }

  // onMobileCloseSidebar: 
  onMobileCloseSidebar() {
    if (window.innerWidth < 768) {
      // this.sidebarService.close();
    }
  }


  toggleSidebar() {
    this.isSidebarCollapsed.update(v => !v);
  }

  // closeSidebar() {
  //   this.isSidebarOpen.set(false);
  // }
}
