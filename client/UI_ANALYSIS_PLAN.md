# Phân Tích & Kế Hoạch Triển Khai: Angular + .NET Real-time Chat

*(Các phần cũ giữ nguyên)*

## 6. Đặc Tả Chi Tiết UI Foundation (Bước 1)
Trước khi dựng màn hình lớn, cần chuẩn hóa các viên gạch nhỏ (bricks) để đảm bảo đồng nhất.

### A. Global Styles & Config
1.  **Fonts**: Sử dụng `Inter` (Google Fonts) - hiện đại, dễ đọc cho chat/text.
2.  **Colors (Tailwind Config)**: Định nghĩa ngữ nghĩa thay vì mã màu cứng.
    - `primary`: Màu chủ đạo (ví dụ: Blue-600 #2563EB) -> Nút gửi, tin nhắn của mình.
    - `surface`: Màu nền các khối (White / Gray-50 / Gray-800).
    - `border-default`: Màu viền nhẹ (Gray-200 / Gray-700).
    - `text-main`: Màu chữ chính (Gray-900 / Gray-100).
    - `text-muted`: Màu chữ phụ (Gray-500) -> Thời gian, tin nhắn cũ.

### B. Atomic Components Specs (Các linh kiện cơ bản)

#### 1. `<app-ui-avatar>` (Hiển thị ảnh đại diện)
*   **Mục đích**: Hiển thị ảnh user kèm trạng thái online/offline đồng nhất.
*   **Inputs**:
    - `src` (string): Đường dẫn ảnh.
    - `alt` (string): Tên user (để hiển thị ký tự đầu "AB" nếu ảnh lỗi/chưa có).
    - `size`: `xs` (24px), `sm` (32px), `md` (40px - chuẩn), `lg` (56px).
    - `status`: `online` (dot xanh), `offline` (dot xám), `none`.

#### 2. `<app-ui-button>` (Nút bấm chuẩn)
*   **Mục đích**: Nút bấm có loading, variant màu sắc, icon.
*   **Inputs**:
    - `variant`: `primary` (xanh), `secondary` (xám nhạt), `ghost` (trong suốt), `danger` (đỏ).
    - `size`: `sm`, `md`, `lg`.
    - `isLoading` (boolean): Hiện icon xoay vòng, disable nút.
    - `icon`: Tên icon Lucide (optional).
    - `block`: Full width hay không.

#### 3. `<app-ui-icon>` (Wrapper cho Lucide Angular)
*   **Mục đích**: Gói gọn thư viện icon, dễ dàng thay đổi size/color mặc định.
*   **Inputs**: `name` (string), `size`, `class`.

#### 4. `<app-ui-input>` (Ô nhập liệu Form)
*   **Mục đích**: Input kèm Label, Error Message, Icon. Hỗ trợ Reactive Forms (`ControlValueAccessor`).
*   **Inputs**:
    - `label` (string): Nhãn field (VD: "Email").
    - `placeholder` (string).
    - `type`: `text`, `password`, `email`.
    - `error` (string): Text lỗi màu đỏ hiển thị dưới input.
    - `icon`: Icon nằm trong input (ví dụ icon mắt cho password).
