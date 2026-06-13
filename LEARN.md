# LEARN.md — Ghi chú học Micro-Frontend + single-spa + MongoDB

> Tài liệu này build dần theo từng milestone. Mỗi phần: **bản chất** + **câu hỏi phỏng vấn (PV)** + **trả lời mẫu ngắn**.

---

## M0 — Nền tảng Micro-Frontend

### Micro-frontend (MFE) là gì?
Áp dụng tư tưởng **microservice cho frontend**: thay vì 1 app React khổng lồ (monolith), ta tách UI thành nhiều app nhỏ **độc lập**, mỗi app:
- Có repo/codebase riêng, build & **deploy độc lập**.
- Có thể do team khác nhau làm, thậm chí **framework khác nhau** (React + Vue...).
- Ghép lại thành 1 trang web duy nhất ở runtime.

### Khi nào NÊN dùng
- App lớn, **nhiều team** làm song song, đụng độ merge/deploy liên tục.
- Muốn deploy từng phần độc lập (sửa giỏ hàng không cần build lại cả site).
- Cần migrate dần (legacy Angular → React từng phần).

### Khi nào KHÔNG nên
- App nhỏ, 1 team → MFE chỉ thêm phức tạp (overhead, tooling, độ trễ).
- Team chưa vững DevOps/CI-CD.
- Yêu cầu performance cực cao, bundle nhỏ gọn (MFE dễ tải trùng dependency).

### 3 kiểu tích hợp MFE
| Kiểu | Khi nào ghép | Ví dụ |
|------|--------------|-------|
| **Build-time** | Lúc build, import như npm package | npm package nội bộ |
| **Run-time (client)** | Trên browser lúc chạy | **single-spa**, Module Federation, iframe |
| **Server-side** | Server ghép HTML trước khi trả về | SSR composition, Edge Side Includes |

→ Khoá học này dùng **run-time, client-side, single-spa**.

### So sánh nhanh các giải pháp run-time
| | single-spa | Module Federation | iframe |
|---|---|---|---|
| Ý tưởng | Orchestrator điều phối lifecycle các app theo route | Webpack chia sẻ module giữa các build | Nhúng app trong khung cách ly |
| Đa framework | ✅ Rất tốt | ✅ Được | ✅ Được |
| Chia sẻ dependency | Qua import-map (thủ công) | ✅ Tự động, mạnh nhất | ❌ Không |
| Cách ly (CSS/JS) | ❌ Tự lo | ❌ Tự lo | ✅ Cách ly hoàn toàn |
| Routing chung | ✅ Lõi của nó | Tự làm | Khó |
| Độ phổ biến hiện nay | Phổ biến, ra đời sớm | Đang là xu hướng | Cũ, hạn chế |

### ⭐ Câu hỏi phỏng vấn M0
**Q: Vì sao dùng MFE thay vì monolith frontend?**
> Để nhiều team deploy độc lập, scale tổ chức, migrate dần công nghệ. Đổi lại có overhead về tooling và nguy cơ tải trùng dependency.

**Q: Nhược điểm của MFE?**
> Phức tạp hơn (build/CI-CD/routing), dễ trùng bundle (mỗi MFE tải lại React), khó chia sẻ state, cần chuẩn hoá giao tiếp giữa các MFE, debug khó hơn.

**Q: single-spa khác Module Federation chỗ nào?**
> single-spa là **orchestrator** — quản lý vòng đời (mount/unmount) app theo route. Module Federation là **cơ chế chia sẻ module lúc runtime** của Webpack. Thực tế hay **kết hợp**: single-spa điều phối + Module Federation chia sẻ dependency.

**Q: Khi nào KHÔNG nên dùng MFE?**
> App nhỏ, 1 team, hoặc team chưa vững CI-CD — lúc đó overhead lớn hơn lợi ích.

---
## M1 — Root-config single-spa

### Root-config là gì?
Là app "nhạc trưởng" (orchestrator). Nó **không chứa UI nghiệp vụ**, chỉ làm:
1. Khai báo **import-map** (tên module → URL).
2. **Đăng ký** các MFE (`registerApplication`).
3. Quyết định MFE nào active ở route nào (`activeWhen`).
4. Gọi `start()` để bật single-spa.

### import-map (`index.html`)
Bảng ánh xạ `"single-spa" → URL CDN`. Browser native hỗ trợ. Khi code `import ... from "single-spa"`, browser tra bảng này. Sau này thêm dòng cho mỗi MFE → đổi version MFE chỉ cần sửa URL, **không build lại root**.

### Lifecycle của một single-spa application
Một app = object có 3 hàm trả Promise:
- **`bootstrap`** — chạy **1 lần** đầu tiên (khởi tạo, setup).
- **`mount`** — mỗi lần app trở nên **active** → vẽ UI vào DOM.
- **`unmount`** — mỗi lần app **rời active** → gỡ UI, dọn dẹp.

`registerApplication({ name, app, activeWhen })`:
- `app`: hàm async trả về object lifecycle (M2: trả về `System.import(url)`).
- `activeWhen`: hàm `(location) => boolean` quyết định route nào app sống. `() => true` = mọi route.

`start()`: trước khi gọi, app chỉ được `bootstrap`; sau khi gọi mới được `mount`. Tách 2 pha để có thể preload sớm mà chưa hiện UI.

### Chạy thử
```bash
cd root-config && npm start   # serve port 9000
# mở http://localhost:9000 → thấy "Mini Shop", Console log: bootstrap → mount
```

### ⭐ Câu hỏi phỏng vấn M1
**Q: single-spa điều phối các MFE thế nào?**
> Root-config đăng ký mỗi MFE kèm `activeWhen`. Khi URL đổi, single-spa nghe sự kiện điều hướng, so route, rồi `mount` MFE nào vừa active và `unmount` MFE vừa rời active.

**Q: import-map để làm gì?**
> Ánh xạ tên module → URL runtime. Cho phép load/đổi MFE độc lập mà không build lại root — nền tảng của tích hợp run-time.

**Q: 3 lifecycle của single-spa app? Khác gì React render?**
> `bootstrap` (1 lần) / `mount` / `unmount`. Đây là cấp độ **toàn app** (mount = gắn cả MFE vào DOM); còn React render là cấp độ component bên trong MFE. `mount` của single-spa thường gọi `ReactDOM.render(...)` bên trong.

**Q: Vì sao tách `start()` khỏi `registerApplication()`?**
> Để preload/bootstrap sớm (tải code) nhưng hoãn `mount` (hiện UI) tới khi gọi `start()` — kiểm soát thời điểm render.

---
## M2 — MFE React đầu tiên (navbar)

### MFE = một ES module export lifecycle
File `mfe-navbar/navbar.js` export 3 hàm `bootstrap/mount/unmount`. Root-config đăng ký:
```js
registerApplication({
  name: "@mishop/navbar",
  app: () => import("@mishop/navbar"),  // import-map -> http://localhost:9001/navbar.js
  activeWhen: () => true,               // hiện mọi route
});
```

### single-spa-react thực chất làm gì?
Trong dự án thật bạn viết:
```js
import singleSpaReact from "single-spa-react";
const lifecycles = singleSpaReact({ React, ReactDOM, rootComponent: App });
export const { bootstrap, mount, unmount } = lifecycles;
```
Ta **tự viết tay** đoạn tương đương để thấy bản chất:
```js
let root;
export async function mount()   { root = createRoot(el); root.render(<App/>); }
export async function unmount() { root.unmount(); }
```
→ `single-spa-react` chỉ là wrapper gọi `ReactDOM.createRoot().render()` khi mount và `root.unmount()` khi unmount. **Không có phép màu.**

### import-map là của DOCUMENT
Dù `navbar.js` được serve từ origin khác (`:9001`), khi nó `import "single-spa"` / `import "react"`, browser vẫn tra **import-map của trang chủ** (`:9000`). Nhờ vậy **mọi MFE dùng chung 1 instance** single-spa & React → `navigateToUrl` hoạt động xuyên MFE.

### Vì sao cần CORS?
MFE load **cross-origin** (`:9000` nạp module từ `:9001`). ES module cross-origin bắt buộc server nguồn trả header `Access-Control-Allow-Origin`. Thiếu → browser chặn. (Đã bật bằng `serve --cors`.)

### Chạy thử (cần 2 terminal)
```bash
# Terminal 1
cd root-config && npm start      # :9000
# Terminal 2
cd mfe-navbar && npm start        # :9001 (có --cors)
# mở http://localhost:9000 -> thấy thanh navbar React
```

### ⭐ Câu hỏi phỏng vấn M2
**Q: Làm sao một MFE React tích hợp vào single-spa?**
> Đóng gói React component thành module export `bootstrap/mount/unmount` (thường qua `single-spa-react`); `mount` gọi `ReactDOM.createRoot().render()`, `unmount` gọi `root.unmount()`. Root-config đăng ký module đó.

**Q: `mount`/`unmount` của single-spa khác `useEffect`/render của React thế nào?**
> Cấp độ khác nhau: single-spa quản lý vòng đời **cả MFE** (gắn/gỡ khỏi DOM theo route); React quản lý vòng đời **component** bên trong MFE. `mount` thường *bao* lệnh render của React.

**Q: Nhiều MFE cùng dùng React — làm sao không xung đột?**
> Chia sẻ 1 instance React qua import-map (cùng URL → cùng module). Nếu mỗi MFE bundle React riêng dễ lỗi 2 bản React (Invalid hook call). Chi tiết ở M5.

**Q: MFE load từ domain khác cần gì?**
> CORS (`Access-Control-Allow-Origin`) ở server MFE, vì ES module cross-origin bị chính sách same-origin chặn nếu thiếu.

---
## M3 — MFE load theo route

### activeWhen quyết định mount/unmount
```js
activeWhen: (location) => location.pathname.startsWith("/products")
```
Mỗi lần URL đổi, single-spa gọi lại tất cả `activeWhen`. App nào chuyển `false → true` được **mount**, `true → false` được **unmount**. Mở Console khi đổi route sẽ thấy:
```
/products : [products] mount
→ /cart   : [products] unmount → [cart] mount
```
→ Chỉ MFE đang active mới nằm trong DOM. Đây là cách 2 MFE **không tải/hiện cùng lúc**.

### Mỗi MFE tự quản container của mình
products mount tạo `#products-root` trong `#app-content`, unmount thì `remove()`. Tránh 2 MFE giẫm chân nhau khi dùng chung vùng mount.

### SPA fallback (`serve -s`)
Điều hướng bằng `navigateToUrl` dùng `history.pushState` → không gọi server, không reload. Nhưng nếu **reload** ở `/cart`, browser request `GET /cart` → server phải trả `index.html` (không phải 404) để single-spa tự xử route. `serve -s` làm việc này (production: cấu hình nginx/CDN tương tự).

### Lazy load
`app: () => import("@mishop/cart")` — code của cart **chỉ tải khi route /cart active** lần đầu (dynamic import). Vào thẳng /products sẽ không tải bundle cart → tiết kiệm.

### ⭐ Câu hỏi phỏng vấn M3
**Q: Làm sao 2 MFE không cùng tải/hiện một lúc?**
> `activeWhen` theo route + dynamic import. single-spa chỉ mount MFE active và lazy-load code của nó lần đầu; MFE rời route bị unmount khỏi DOM.

**Q: Reload giữa chừng ở /cart bị trắng trang/404 — vì sao và sửa thế nào?**
> Server không có file `/cart` nên trả 404. Cần cấu hình SPA fallback: mọi route không khớp file → trả `index.html` (nginx `try_files`, `serve -s`, CDN rewrite).

**Q: single-spa biết khi nào đổi app bằng cách nào?**
> Nó "vá" `history.pushState/replaceState` và nghe `popstate`/`hashchange`; mỗi lần điều hướng nó chạy lại reroute → so `activeWhen` → mount/unmount tương ứng.

---
## M4 — Giao tiếp giữa các MFE

### Vấn đề gốc
MFE bị **unmount thì mất React state**. Giỏ hàng phải sống xuyên suốt → state dùng chung **không thể** nằm trong `useState` của 1 MFE. Phải đặt ở nơi mọi MFE truy cập được.

### Giải pháp dùng ở đây: shared module + event bus
- `@mishop/shared` (`store.js`) giữ mảng `items` ở **module scope**. Import-map trỏ về **1 URL** → browser load **1 lần** → 1 mảng duy nhất cho mọi MFE.
- Thay đổi → phát `window` CustomEvent `mishop:cart-changed`.
- MFE nghe event để cập nhật UI; khi mount lại thì gọi `getItems()` đọc trạng thái hiện tại (không mất dữ liệu).

```
products.addItem(p)
   └─> store.items.push(p)
   └─> window.dispatchEvent("mishop:cart-changed")
            ├─> navbar  (luôn mounted) -> badge +1 ngay
            └─> cart    (nếu đang /cart) -> render lại danh sách
```

### Các cách giao tiếp MFE (so sánh — hay hỏi)
| Cách | Ưu | Nhược |
|------|----|-------|
| **Custom event / event bus** (`window`) | Đơn giản, loose-coupling, đa framework | Khó trace, dễ "rối event", không type-safe |
| **Shared state lib** (Redux/Zustand qua shared module) | State tập trung, mạnh | Coupling vào 1 lib/version, nặng hơn |
| **Props / parcels** (single-spa parcel) | Rõ ràng, có cấu trúc cha-con | Chỉ hợp quan hệ cha-con, không hợp anh-em |
| **URL / query params** | Bookmark được, đơn giản | Chỉ hợp state nhỏ |

→ Thực tế hay **kết hợp**: shared module giữ state + event bus thông báo.

### Vì sao `?external=react`?
react-dom build mặc định của esm.sh **nhúng kèm 1 bản react riêng**. Để react-dom dùng **đúng react của ta** (qua import-map) → thêm `?external=react`; khi đó react-dom `import "react"` (bare) → resolve về cùng instance. Thiếu bước này dễ lỗi **Invalid hook call** (2 bản React). (Chi tiết shared deps ở M5.)

### Chạy thử (giờ 5 server: 9000–9004)
Bấm "Thêm vào giỏ" ở /products → **badge navbar tăng ngay**; qua /cart thấy danh sách + tổng tiền vẫn còn.

### ⭐ Câu hỏi phỏng vấn M4
**Q: Các MFE giao tiếp với nhau bằng cách nào?**
> Custom event/event bus (loose-coupling), shared state qua shared module, props/parcel (cha-con), hoặc URL. Tránh để MFE gọi thẳng nội bộ của nhau.

**Q: Vì sao không để state giỏ hàng trong useState của 1 MFE?**
> Vì MFE bị unmount khi rời route → mất state. State dùng chung phải nằm ngoài React (shared module / store) để tồn tại độc lập với vòng đời MFE.

**Q: Nhược điểm của event bus?**
> Khó debug/trace luồng, dễ rò rỉ listener nếu quên cleanup, không type-safe, dễ thành "spaghetti event" khi nhiều MFE.

**Q: Làm sao 1 shared module chỉ có 1 instance?**
> import-map trỏ tất cả về cùng 1 URL → browser cache module theo URL → load 1 lần → mọi MFE chia sẻ cùng biến module scope.

---
<!-- Các milestone sau sẽ được thêm vào đây khi học tới -->
