## Backend API

https://shop.kien.cloud

### Tổng quan

Xây dựng RESTful API cho hệ thống thương mại điện tử, cung cấp các chức năng xác thực người dùng, quản lý sản phẩm, giỏ hàng, đơn hàng, thanh toán và quản trị hệ thống.

## Tính năng & Công nghệ

- **Authentication & Authorization:**
  - Xây dựng hệ thống đăng ký, đăng nhập bằng JWT.
  - Sử dụng Access Token và Refresh Token để quản lý phiên đăng nhập.
  - Áp dụng Role-Based Access Control (RBAC) để phân quyền Admin và User.

- **User Management:**
  - Quản lý thông tin người dùng.
  - Cập nhật hồ sơ cá nhân.
  - Quản lý quyền truy cập theo vai trò.

- **Product Management:**
  - Cung cấp API CRUD sản phẩm.
  - Hỗ trợ tìm kiếm, lọc sản phẩm.
  - Quản lý danh mục, hình ảnh và tồn kho.

- **Shopping Cart:**
  - Xây dựng API quản lý giỏ hàng.
  - Thêm, cập nhật, xóa sản phẩm trong giỏ hàng.

- **Order Management:**
  - Xử lý quy trình đặt hàng.
  - Quản lý trạng thái đơn hàng.
  - Thông báo real-time khi cập nhật đơn hàng
- **Payment Integration:**
  - Tích hợp VNPay Sandbox cho quy trình thanh toán trực tuyến.
  - Xử lý callback và xác nhận giao dịch.

- **Security:**
  - Hash mật khẩu bằng bcrypt.
  - Validate dữ liệu đầu vào.

- **Database & Storage:**
  - Thiết kế database với MongoDB.
  - Sử dụng Mongoose để quản lý schema và truy vấn dữ liệu.
  - Tích hợp Cloudinary để lưu trữ hình ảnh.

## Công nghệ sử dụng

- Backend: Node.js, Express.js
- Real-time: Socket.io
- Database: MongoDB, Mongoose
- Authentication: JWT, bcrypt, OAuth2,
- Payment: VNPay
- Storage: Cloudinary
- Deployment: Docker
