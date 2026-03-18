import { Component, input, output } from '@angular/core';
import { GroupMemberDto } from '../../models/group-member.dto';
import { UiIconComponent } from "../../../../shared/components/ui-icon/ui-icon.component";

@Component({
  selector: 'app-group-members-panel',
  imports: [UiIconComponent],
  templateUrl: './group-members-panel.component.html',
  styleUrl: './group-members-panel.component.scss'
})
export class GroupMembersPanelComponent {
  // input: nhan du lieu tu component cha
  members = input.required<GroupMemberDto[]>();

  // 
  close = output<void>();
  addMemberClick = output<void>();

  //
  onClose() {
    this.close.emit();
  }

  onAddMember() {
    this.addMemberClick.emit();
  }
}
