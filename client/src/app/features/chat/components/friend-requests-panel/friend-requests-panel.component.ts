import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { UiAvatarComponent } from '../../../../shared/components/ui-avatar/ui-avatar.component';
import { UiIconComponent } from '../../../../shared/components/ui-icon/ui-icon.component';
import { FriendshipService } from '../../../../core/services/friendship.service';
import { FriendRequestDto } from '../../models/friendship.dto';

// component hien thi d.s loi moi ket ban dang cho (pending)
// user co the Accept/Reject tung loi moi
@Component({
  selector: 'app-friend-requests-panel',
  standalone: true,
  imports: [CommonModule, UiAvatarComponent, UiIconComponent],
  templateUrl: './friend-requests-panel.component.html',
  styleUrl: './friend-requests-panel.component.scss'
})
export class FriendRequestsPanelComponent {
  private friendshipService = inject(FriendshipService);

  // signal luu d.s loi moi dang cho
  // khi value change -> template tu dong update
  pendingRequests = signal<FriendRequestDto[]>([])

  isLoading = signal<boolean>(false);

  // -- input: reloadTrigger --
  // khi cha(sidebar) change value -> reload 
  // input thay doi -> effect() se bat va chay callback
  reloadTrigger = input(0);

  // -- output --
  // bao ra ngoai khi user Accept -> bao friends-list-panel reload
  friendAccepted = output<void>();

  // 
  requestCountChanged = output<number>();

  constructor() {
    // load d.s loi moi khi component khoi tao
    this.loadPendingRequests();

    // -- ly thuyet effect cuoi file --
    effect(() => {
      // doc value reloadTrigger -> effect se theo doi signal nay
      const trigger = this.reloadTrigger();
      // chi reload khi trigger > 0 (lan dau trigger = 0 -> bo qua - ko reload)
      if (trigger > 0) {
        console.log('-- [FriendRequestsPanel] reload triggered', trigger);
        this.loadPendingRequests();
      }
    })
  }

  // goi pi lay d.s loi moi ket ban dang Pending
  loadPendingRequests() {
    this.isLoading.set(true);
    this.friendshipService.getPendingRequests().subscribe({
      next: (requests) => {
        this.pendingRequests.set(requests);
        // báo ra ngoai Count de update badge (emit)
        this.requestCountChanged.emit(requests.length);
        this.isLoading.set(false);
      }
    });
  }

  // xu ly khi user Accept
  onAccept(request: FriendRequestDto) {
    // goi api: Put /api/friendship/{id}/respond || body: {isAccepted: true}
    this.friendshipService.responseFriendRequest(
      request.friendshipId,
      true // accept
    ).subscribe({
      next: () => {
        this.pendingRequests.update(list =>
          list.filter(r => r.friendshipId !== request.friendshipId))

        this.requestCountChanged.emit(this.pendingRequests().length);

        // -- bao sidebar biet da accept -> sidebar listener -> bao friends-list-panel reload
        this.friendAccepted.emit();
      },
      error: (err) => {
        console.error('Failed to accept request:', err)
      }
    });
  }

  // xu ly khi user Reject
  onReject(request: FriendRequestDto) {
    // goi api: put /api/friendship/{id}/respond || body ...
    this.friendshipService.responseFriendRequest(
      request.friendshipId,
      false // reject
    ).subscribe({
      next: () => {
        // xoa khoi list pending
        this.pendingRequests.update(list =>
          list.filter(r => r.friendshipId !== request.friendshipId)
        );
        this.requestCountChanged.emit(this.pendingRequests().length);
      },
      error: (err) => console.error('Failed to reject request:', err)
    });
  }
}

/*
=== 2 Cach de Cha bao Con Reload ===

C1: ViewChild (sidebar goi truc tiep method con)
  - cha dung @ViewChild de lay reference con
  - goi this.friendRequestsPanel.loadPendingRequests()
    - Uu: truc tiep, de hieu
    - Nhuoc: cha phu thuoc implementation con (tight coupling)

C2: Input signal trigger (dang dung)
  - Cha truyen 1 signal(number) vao con qua input
  - Moi khi can reload -> cha tang value signal len 1
  - Con dung effect() theo doi signal -> khi thay doi -> reload
    - Uu: loosely coupled, con tu quyet dinh lam gi khi trigger thay doi
    - Nhuoc: phuc tap hon 1 chut

==> khuyen dung C2 : Vi no theo nguyen tac "unidirectional data flow"
    du lieu chay 1 chieu: cha -> con qua input
                          con -> cha qua output
*/

/**
 == EFFECT (Angular 17+) ==

  - tu dong chay lai moi khi bat ki Signal nao ben trong no thay doi
  - o day: khi reloadTrigger() thay doi -> goi loadPendingRequests()

  * Ly Thuyet

  - effect()
    + No Theo Doi cac signal duoc doc ben trong no
    + Khi Signal do thay doi -> callback auto chay lai
    + Khac voi computed(): effect() dung cho Side Effects(goi API, log,...)
    còn computed() dung cho Tinh Toan gia tri moi
 */

//  subscribe({ next, error }):
//    - Dang ky lang nghe Observable (ket qua API)
//    - next: callback khi thanh cong
//    - error: callback khi co loi