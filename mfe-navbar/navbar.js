// MFE Navbar — viết bằng React, KHÔNG build (dùng React ESM từ CDN + import-map).
// Cố ý tự viết lifecycle bằng ReactDOM để thấy rõ "single-spa-react" làm gì bên trong.
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { navigateToUrl } from "single-spa";
import { getItems, onCartChanged } from "@mishop/shared";

// --- Component React bình thường (không JSX để khỏi cần babel) ---
function Navbar() {
  // navbar luôn mounted -> badge cập nhật live ngay cả khi đang ở trang products.
  const [count, setCount] = useState(getItems().length);
  useEffect(() => onCartChanged((items) => setCount(items.length)), []);

  const link = (href, label) =>
    React.createElement(
      "a",
      {
        href,
        onClick: navigateToUrl, // helper của single-spa: điều hướng SPA, không reload
        style: { marginRight: 16, color: "#fff", textDecoration: "none" },
      },
      label
    );

  return React.createElement(
    "nav",
    {
      style: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "12px 20px",
        background: "#1f2937",
        color: "#fff",
        fontFamily: "system-ui, sans-serif",
      },
    },
    React.createElement("strong", { style: { marginRight: 24 } }, "🛒 Mini Shop"),
    link("/products", "Sản phẩm"),
    link("/cart", `Giỏ hàng (${count})`)
  );
}

// --- Lifecycle single-spa: 3 hàm trả Promise ---
// Đây CHÍNH LÀ thứ single-spa-react sinh ra giúp bạn. Tự viết để hiểu bản chất.
let root;

export async function bootstrap() {
  // chạy 1 lần — chỗ để preload/cấu hình nếu cần
}

export async function mount() {
  const el = document.getElementById("navbar");
  root = createRoot(el);
  root.render(React.createElement(Navbar));
}

export async function unmount() {
  root.unmount(); // gỡ React khỏi DOM, tránh memory leak
  root = undefined;
}
