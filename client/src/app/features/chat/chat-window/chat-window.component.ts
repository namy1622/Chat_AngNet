import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
// import { map } from 'rxjs';
import { UiButtonComponent } from "../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../shared/components/ui-icon/ui-icon.component";
import { map } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarService } from "../../../core/services/sidebar.service";

@Component({
  selector: 'app-chat-window',
  imports: [UiButtonComponent, UiIconComponent],
  templateUrl: './chat-window.component.html',
  styleUrl: './chat-window.component.scss',
  host: {
    class: 'flex flex-col h-full'
  }
})
export class ChatWindowComponent {
  // inject ActivateRoute de doc tham so URL (ex: /c/conv-1 -> id = 'conv-1')
  private route = inject(ActivatedRoute);
  private router = inject(Router) // inject router de chuyen huong
  sidebarService = inject(SidebarService);

  // signal de theo doi conversation Id tu URL
  conversationId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('id'))
    )
  );

  // lay tham chieu den khung chat (de cuon) va textarea (de resize)
  // dùng viewChild signal thay vi @ViewChild decorator
  // nó trả về Signal<ElementRef | underfined>
  private scrollContainer = viewChild<ElementRef>('scrollContainer');
  private chatInput = viewChild<ElementRef>('chatInput');

  constructor() {
    // theo doi su thay doi cua tham so 'id' tren URL
    // this.route.paramMap.subscribe(params => {
    //   const conversationId = params.get('id');
    //   console.log(' -- Conversation ID: ', params.get('id'));

    //   // TODO: goi API lay tin nhan cua cuoc hoi thoai nay
    // });

    //effect tu chay khi scrollContainer co gia tri (view da render)
    // hoac khi conversationId thay doi
    effect(() => {
      const container = this.scrollContainer()?.nativeElement;
      const id = this.conversationId(); // phu thuoc id thay doi

      if (container && id) {
        // set timeOut(0) de dam bao render d.s tin nhan song moi cuon
        setTimeout(() => {
          container.scrollTop = container.scrollHeight;
        }, 0);
      }
    });
  }

  // ham resize textarea khi  go phim
  adjustTextAreaHeight() {
    const textarea = this.chatInput()?.nativeElement;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  }

  // ham back (quay lai man d.s cuoc hoi thoai)
  goBack() {
    this.sidebarService.open();
    // this.router.navigate(['/']) // quay ve trang goc (bo chon conversation)
  }


}

/*
========= Ly Thuyet =========

1. inject() vs constructor:
    - inject(Service): cach moi (Angular 17+) lay dependency injection gon hom
    - tuong duong: constructor(private route: ActivatedRoute)

2. ActivatedRoute:
    - la service cua Angular: cho phep doc thong tin route hien tai
    - paramMap: Observable chua cac tham so dong (ex: /c/:id)

3. group & group-hover:
    - Tailwind trick: danh dau the cha la 'group', the con dung 'group-hover' de style khi hover vao the cha
    => khi hover vao Cha thi con thay doi style 

4. focus-within:
    - Khi bat ky phan tu con nao duoc focus (ex: texterea), thi the cha ap dung style 
    - dung de tao hieu ung o input sang len khi user click vao

*/