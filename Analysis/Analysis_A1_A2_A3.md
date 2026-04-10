Phân tích tổng thể: Nên làm theo thứ tự nào?
A3 (Typing Indicator) → A2 (Reply Message) → A1 (Message Reactions)

Lý do:

A3 đơn giản nhất: chỉ cần SignalR, không cần DB, không cần Command/Query
A2 vừa phải: cần sửa CreateMessageCommand + sửa FE DTO + UI, nhưng field ReplyToId đã có trong Message entity
A1 phức tạp nhất trong 3 cái: cần CQRS đầy đủ (Command + Query), API endpoint mới, FE component mới, SignalR event mới
A3: TYPING INDICATOR — "User X is typing..."
Flow hoạt động:
User A gõ phím trong chat-input
  → FE gửi SignalR event "UserTyping" (conversationId, userId, userName)
  → Server nhận, broadcast cho các member khác trong conversation
  → FE nhận event "UserTyping" → hiện "X is typing..." dưới messages
  → Sau 3 giây không gõ → ẩn indicator
Files cần sửa:
#	File	Thao tác	Mô tả
1	ChatHub.cs	SỬA	Thêm method SendTyping() để nhận + broadcast typing event
2	signalr.service.ts	SỬA	Thêm method sendTyping() + addTypingListener()
3	chat-input.component.ts	SỬA	Gọi sendTyping() khi user gõ phím (có debounce)
4	chat-window.component.ts	SỬA	Lắng nghe typing event, quản lý signal hiển thị
5	chat-window.component.html	SỬA	Hiện "X is typing..." phía trên input
Không cần tạo file mới, không cần DB, không cần Migration
Kiến thức mới sẽ học:
Debounce: Chỉ gửi event sau khi user ngừng gõ 500ms (tránh spam)
setTimeout / clearTimeout: Tự ẩn indicator sau 3 giây
SignalR invoke: Client → Server (khác với on là Server → Client)
A2: REPLY MESSAGE — Trả lời tin nhắn
Flow hoạt động:
User bấm vào tin nhắn → hiện reply preview (tên + nội dung gốc)
  → Gõ nội dung reply → bấm Send
  → FE gửi API: { conversationId, content, replyToId }
  → Backend lưu message với ReplyToId
  → SignalR broadcast kèm thông tin reply
  → FE hiện tin nhắn mới kèm "quoted message" phía trên
Files cần sửa:
Backend:

#	File	Thao tác	Mô tả
1	CreateMessageCommand.cs	SỬA	Thêm field ReplyToId (nullable Guid)
2	CreateMessageCommandHandler.cs	SỬA	Set ReplyToId khi tạo Message
3	GetMessages QueryHandler	SỬA	Include ReplyTo khi query, map thêm vào DTO
4	CreateMessageRequest.cs (DTO)	SỬA	Thêm field ReplyToId
5	ChatController.cs (SendMessage)	SỬA	Truyền ReplyToId vào Command + kèm trong SignalR payload
Frontend:

#	File	Thao tác	Mô tả
6	message.dto.ts	SỬA	Thêm replyToId?, replyToContent?, replyToSenderName?
7	chat.service.ts	SỬA	Thêm replyToId vào method sendMessage()
8	chat-window.component.ts	SỬA	Thêm signal replyingTo để lưu tin nhắn đang reply
9	chat-window.component.html	SỬA	Hiện reply preview trên input + quoted message trong bubble
10	chat-input.component.ts	SỬA	Nhận input replyingTo + hiện preview + emit kèm replyToId
Kiến thức mới sẽ học:
Self-referencing FK: Entity tham chiếu chính nó (ReplyTo → Message)
Include nested: EF Core load relationship phụ
UI state management: Quản lý trạng thái "đang reply"
A1: MESSAGE REACTIONS — Thả emoji lên tin nhắn
Flow hoạt động:
User hover tin nhắn → hiện nút emoji 😀
  → Bấm chọn emoji (👍❤️😂😮😢😡)
  → FE gửi API: POST /api/chat/messages/{messageId}/react  { type: "Like" }
  → Backend lưu vào MessageReaction + SignalR broadcast
  → FE hiện emoji count dưới tin nhắn: 👍2 ❤️1
  → Bấm lại emoji đã chọn → toggle off (xóa reaction)
Files cần tạo MỚI:
Backend:

#	File	Thao tác	Mô tả
1	ToggleReactionCommand.cs	MỚI	Command: messageId, userId, reactionType
2	ToggleReactionCommandHandler.cs	MỚI	Check đã react chưa → thêm/xóa
3	GetReactionsQuery.cs	MỚI	Query lấy reactions theo messageId
4	GetReactionsQueryHandler.cs	MỚI	Return list reactions grouped by type
5	ReactMessageDto.cs	MỚI	DTO cho API request
6	ChatController.cs	SỬA	Thêm 2 endpoints (react + get reactions)
Frontend:

#	File	Thao tác	Mô tả
7	reaction.dto.ts	MỚI	Interface cho reaction data
8	chat.service.ts	SỬA	Thêm methods toggleReaction, getReactions
9	signalr.service.ts	SỬA	Thêm listener cho reaction event
10	message.dto.ts	SỬA	Thêm reactions field
11	chat-window.component.html	SỬA	Hiện emoji count dưới bubble + hover menu
12	chat-window.component.ts	SỬA	Logic toggle reaction + SignalR listener
Kiến thức mới sẽ học:
Toggle pattern: Bấm 1 lần = thêm, bấm lần 2 = xóa (cùng reaction type)
Group by: Gom reactions theo type để hiện count
Hover popup: Emoji picker khi hover tin nhắn
Bảng so sánh 3 tính năng
A3: Typing	A2: Reply	A1: Reactions
File mới	0	0	~6 files
File sửa	5	~10	~6 files
Cần DB?	❌ Không	❌ Không (field đã có)	❌ Không (entity đã có)
Cần Migration?	❌	❌	❌
Cần CQRS mới?	❌	❌ (sửa command cũ)	✅ 2 command/query mới
Cần API mới?	❌ (chỉ SignalR)	❌ (sửa API cũ)	✅ 2 endpoint mới
Cần SignalR mới?	✅ 1 event	❌ (sửa event cũ)	✅ 1 event
Độ khó	⭐	⭐⭐	⭐⭐⭐
Thời gian	~30 phút	~1.5 giờ	~2-3 giờ
