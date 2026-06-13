// MFE Cart — giỏ hàng (M3: tĩnh; M4: nghe event từ products; M6: lưu MongoDB).
import React from "react";
import { createRoot } from "react-dom/client";

function Cart() {
  return React.createElement(
    "div",
    { style: { padding: 20, fontFamily: "system-ui, sans-serif" } },
    React.createElement("h2", null, "Giỏ hàng"),
    React.createElement(
      "p",
      { style: { color: "#6b7280" } },
      "Giỏ hàng trống. (M4 sẽ cập nhật khi bấm \"Thêm vào giỏ\" ở trang Sản phẩm.)"
    )
  );
}

let root, container;

export async function bootstrap() {}

export async function mount() {
  console.log("[cart] mount");
  container = document.createElement("div");
  container.id = "cart-root";
  document.getElementById("app-content").appendChild(container);
  root = createRoot(container);
  root.render(React.createElement(Cart));
}

export async function unmount() {
  console.log("[cart] unmount");
  root.unmount();
  container.remove();
  root = container = undefined;
}
