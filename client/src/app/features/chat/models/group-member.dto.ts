// interface: mo ta 1 thanh vien trong nhom chat
// dung khi hien thi list member trong panel ben phai
export interface GroupMemberDto {
    userId: string;
    userName: string;
    displayName: string;
    avatarUrl: string;
    role: string; // owner/ admin/member
    joinedAt: string; // ISO date string (2026-03-02T07:39:47.123Z)
}