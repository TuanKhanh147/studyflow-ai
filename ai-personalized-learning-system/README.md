# StudyFlow AI — Hệ thống hỗ trợ học tập cá nhân hóa

MVP khởi đầu bằng Next.js, TypeScript và giao diện tiếng Việt. Có dashboard, nhiệm vụ học tập, lộ trình cơ bản, chatbot AI (API Anthropic tùy chọn), câu hỏi trắc nghiệm mẫu, thư viện danh sách tài liệu, tiến độ và hồ sơ.

> **Quan trọng:** đây là bộ source code MVP để phát triển tiếp, chưa phải hệ thống production hoàn chỉnh. Dữ liệu hồ sơ, nhiệm vụ, lịch sử chatbot và danh sách tài liệu hiện được lưu trong `localStorage` của trình duyệt; không có đăng nhập, database cloud, upload file, hệ thống quản trị hoặc chấm điểm AI hoàn chỉnh. Các chỉ số/biểu đồ có nhãn minh họa không phải dữ liệu thật. Không sử dụng dữ liệu cá nhân nhạy cảm trong bản demo.

## Yêu cầu

- Node.js 20.9+ (khuyến nghị phiên bản LTS)
- npm
- API key Anthropic nếu muốn bật AI thật

## Chạy local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Mở http://localhost:3000.

Không có `ANTHROPIC_API_KEY`, endpoint AI trả về thông báo chế độ demo. Khi có key, thêm vào `.env.local`:

```env
ANTHROPIC_API_KEY=your_server_side_key
ANTHROPIC_MODEL=claude-3-5-haiku-latest
```

Khởi động lại dev server. Không đặt API key với tiền tố `NEXT_PUBLIC_`, không commit `.env.local` lên GitHub. Kiểm tra tên model đang được tài khoản Anthropic hỗ trợ và cập nhật `ANTHROPIC_MODEL` khi cần.

## Build production

```bash
npm run build
npm start
```

Chạy `npm run lint` để kiểm tra lint. Hãy kiểm thử thủ công các luồng chính trước khi phát hành.

## Triển khai Vercel

1. Tạo repository GitHub mới và đẩy toàn bộ source code lên.
2. Đăng nhập Vercel, chọn Add New → Project và import repository.
3. Dùng cấu hình build mặc định của Next.js.
4. Trong Settings → Environment Variables, thêm `ANTHROPIC_API_KEY` và `ANTHROPIC_MODEL` nếu cần AI thật.
5. Deploy. Vercel sẽ cung cấp URL dạng `https://<ten-du-an>.vercel.app`.
6. Mở URL và kiểm tra các trang, sau đó kiểm tra log nếu endpoint AI báo lỗi.
7. Không đưa `.env.local` hoặc secret vào repository.

URL chỉ được tạo sau khi bạn thực sự deploy bằng tài khoản của mình. Chưa có URL production trong source code này.

## Supabase và bước tiếp theo

Các biến Supabase có trong `.env.example` để chuẩn bị tích hợp. Bản hiện tại chưa sử dụng Supabase làm persistence và chưa có xác thực. Trước khi dùng thực tế, cần triển khai tối thiểu:

- Supabase Auth, callback URLs và khôi phục mật khẩu.
- PostgreSQL migrations cho profiles, subjects, tasks, learning paths, quiz attempts, conversations/messages, resources.
- Row Level Security cho dữ liệu theo `auth.uid()`.
- Server-side validation và authorization cho từng API.
- Rate limiting, hạn mức AI, kiểm soát chi phí, log an toàn.
- Upload file qua storage riêng tư, giới hạn MIME/size và xử lý PDF an toàn.
- Unit/integration/E2E tests.
- Chính sách quyền riêng tư, xuất/xóa dữ liệu và backup.

Không nên coi dữ liệu localStorage là dữ liệu được bảo vệ hoặc đồng bộ. Không dùng bản này để quản lý dữ liệu nhạy cảm.

## Cấu trúc chính

```text
src/
  app/
    api/ai/route.ts
    globals.css
    layout.tsx
    page.tsx
  components/
    study-app.tsx
  lib/
    ai.ts
    demo-data.ts
    supabase.ts
    types.ts
```

## Tính năng MVP

- Dashboard và biểu đồ mẫu.
- Thêm/đánh dấu hoàn thành nhiệm vụ học.
- Hồ sơ học tập lưu trên trình duyệt.
- Chatbot có chế độ demo và tùy chọn gọi Anthropic API.
- Câu hỏi trắc nghiệm mẫu.
- Danh sách tài liệu (chưa upload file).
- Trang tiến độ và lộ trình cơ bản.

## Giới hạn đã biết

- Chưa có tài khoản người dùng hoặc phân quyền.
- Chưa lưu dữ liệu lên database.
- Dữ liệu chỉ nằm trên trình duyệt hiện tại.
- Một số số liệu dashboard là minh họa và được gắn nhãn.
- Chưa có bài kiểm tra được sinh động từ AI hoặc lưu điểm vào database.
- Chưa có upload/trích xuất tài liệu.
- Chưa có trang quản trị.
- Chưa có kiểm thử tự động đầy đủ.

Các phần này cần hoàn thiện trước khi công bố là sản phẩm dùng thực tế.
