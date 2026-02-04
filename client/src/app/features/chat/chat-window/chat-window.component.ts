import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UiButtonComponent } from "../../../shared/components/ui-button/ui-button.component";
import { UiIconComponent } from "../../../shared/components/ui-icon/ui-icon.component";

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

  constructor() {
    // theo doi su thay doi cua tham so 'id' tren URL
    this.route.paramMap.subscribe(params => {
      const conversationId = params.get('id');
      console.log(' -- Conversation ID: ', conversationId);

      // TODO: goi API lay tin nhan cua cuoc hoi thoai nay
    });
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