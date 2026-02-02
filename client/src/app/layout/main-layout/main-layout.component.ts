import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../features/auth/../chat/sidebar/sidebar.component';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet],
  standalone: true,
  template: `
    <!-- container chinh: flex row (ngang) -->
                      <!-- h-screen: cao bang man hinh -->
                       <!-- overflow-hidden: ko cuon trang -->
    <div class="flex h-screen overflow-hidden bg-gray-50">
      
    <!-- COT Trai Sidebar -->
    <!-- w-80 (320ox): do rong co dinh  -->
    <!-- border-r: duong ke gioi han ben phai -->
    <!-- hidden md: flex: an tren mobile, hien tren desktop - tu man hinh md tro len -->
      <aside class="w-80 hidden md:flex flex-col border-r border-gray-200 bg-white z-20 shadow-sm relative">
        <!-- hien tai de tam text - sau se thay the bang <app-sidebar> -->
        <div class="p-4 text-center">
          <h2 class="font-bold text-gray-700">Sidebar Area</h2>
          <p class="text-sm text-gray-500">Chat Sidebar</p>
        </div>
      </aside>

      <!-- COT Phai Main Content  -->
    <!-- flex-1: tu dong chiem het khong gian con lai -->
    <!-- flex-col: chuyen thanh ngang thanh doc -->
    <!-- relative: cac thanh phan con can chinh tuyet doi theo no -->
    <main class="flex-1 flex flex-col relative bg-white">
      <router-outlet></router-outlet>
    </main>
</div>

   
  `,
  styles: ``
})
export class MainLayoutComponent {

}
