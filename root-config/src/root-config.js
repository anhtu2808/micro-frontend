import { registerApplication, start } from "single-spa";

// ---------------------------------------------------------------------------
// M2: Đăng ký MFE Navbar thật (React), load qua import-map.
//   - app: () => import("@mishop/navbar")  -> import-map tra ra URL :9001/navbar.js
//     Module đó export bootstrap/mount/unmount -> single-spa dùng làm lifecycle.
//   - activeWhen: () => true -> navbar hiện ở MỌI route.
// (M3 sẽ thêm products/cart với activeWhen theo route.)
// ---------------------------------------------------------------------------
registerApplication({
  name: "@mishop/navbar",
  app: () => import("@mishop/navbar"),
  activeWhen: () => true,
});

start();

console.log("[root-config] single-spa started ✅");
