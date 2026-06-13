// MFE Products — danh sách sản phẩm (M3: data mock; M6: gọi API MongoDB).
import React from "react";
import { createRoot } from "react-dom/client";
import { addItem } from "@mishop/shared";

// Data mock tạm. M6 sẽ fetch từ http://localhost:4000/api/products
const MOCK_PRODUCTS = [
  { _id: "p1", name: "Áo thun", price: 150000 },
  { _id: "p2", name: "Quần jeans", price: 350000 },
  { _id: "p3", name: "Giày sneaker", price: 800000 },
];

const vnd = (n) => n.toLocaleString("vi-VN") + "₫";

function Products() {
  const addToCart = (product) => {
    // Đẩy vào shared store -> store phát event "mishop:cart-changed" cho cart & navbar.
    addItem(product);
  };

  return React.createElement(
    "div",
    { style: { padding: 20, fontFamily: "system-ui, sans-serif" } },
    React.createElement("h2", null, "Sản phẩm"),
    React.createElement(
      "ul",
      { style: { listStyle: "none", padding: 0, display: "grid", gap: 12 } },
      MOCK_PRODUCTS.map((p) =>
        React.createElement(
          "li",
          {
            key: p._id,
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "12px 16px",
              maxWidth: 420,
            },
          },
          React.createElement("span", null, `${p.name} — ${vnd(p.price)}`),
          React.createElement(
            "button",
            {
              onClick: () => addToCart(p),
              style: {
                background: "#2563eb",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 12px",
                cursor: "pointer",
              },
            },
            "Thêm vào giỏ"
          )
        )
      )
    )
  );
}

// --- Lifecycle: mỗi MFE tự tạo container riêng trong #app-content ---
let root, container;

export async function bootstrap() {}

export async function mount() {
  console.log("[products] mount");
  container = document.createElement("div");
  container.id = "products-root";
  document.getElementById("app-content").appendChild(container);
  root = createRoot(container);
  root.render(React.createElement(Products));
}

export async function unmount() {
  console.log("[products] unmount");
  root.unmount();
  container.remove();
  root = container = undefined;
}
