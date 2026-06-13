import { registerApplication, start, navigateToUrl } from "single-spa";

// ---------------------------------------------------------------------------
// M3: 3 MFE.
//   - navbar:   activeWhen () => true            -> mọi route
//   - products: activeWhen /products (và "/")    -> chỉ route sản phẩm
//   - cart:     activeWhen /cart                 -> chỉ route giỏ hàng
// Khi đổi route, single-spa tự mount cái vừa active & unmount cái vừa rời.
// ---------------------------------------------------------------------------
registerApplication({
  name: "@mishop/navbar",
  app: () => import("@mishop/navbar"),
  activeWhen: () => true,
});

registerApplication({
  name: "@mishop/products",
  app: () => import("@mishop/products"),
  activeWhen: (location) =>
    location.pathname === "/" || location.pathname.startsWith("/products"),
});

registerApplication({
  name: "@mishop/cart",
  app: () => import("@mishop/cart"),
  activeWhen: (location) => location.pathname.startsWith("/cart"),
});

start();

// Vào "/" thì hiển thị products mặc định (cho gọn URL).
if (window.location.pathname === "/") {
  navigateToUrl("/products");
}

console.log("[root-config] single-spa started ✅");
