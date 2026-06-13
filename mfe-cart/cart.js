// MFE Cart — giỏ hàng. Đọc shared store khi mount + nghe thay đổi live.
import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { getItems, onCartChanged } from "@mishop/shared";

const vnd = (n) => n.toLocaleString("vi-VN") + "₫";

function Cart() {
  // getItems() đọc lại trạng thái HIỆN TẠI từ shared store khi mount lại
  // -> không mất dữ liệu dù trước đó cart đã bị unmount.
  const [items, setItems] = useState(getItems());

  useEffect(() => {
    // Lắng nghe thay đổi -> cập nhật UI. Trả hàm hủy để cleanup khi unmount.
    return onCartChanged((next) => setItems([...next]));
  }, []);

  const total = items.reduce((sum, p) => sum + p.price, 0);

  if (items.length === 0) {
    return React.createElement(
      "div",
      { style: { padding: 20, fontFamily: "system-ui, sans-serif" } },
      React.createElement("h2", null, "Giỏ hàng"),
      React.createElement(
        "p",
        { style: { color: "#6b7280" } },
        'Giỏ trống. Qua trang "Sản phẩm" bấm "Thêm vào giỏ".'
      )
    );
  }

  return React.createElement(
    "div",
    { style: { padding: 20, fontFamily: "system-ui, sans-serif" } },
    React.createElement("h2", null, `Giỏ hàng (${items.length})`),
    React.createElement(
      "ul",
      { style: { listStyle: "none", padding: 0, display: "grid", gap: 8, maxWidth: 420 } },
      items.map((p, i) =>
        React.createElement(
          "li",
          {
            key: i,
            style: {
              display: "flex",
              justifyContent: "space-between",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "10px 14px",
            },
          },
          React.createElement("span", null, p.name),
          React.createElement("span", null, vnd(p.price))
        )
      )
    ),
    React.createElement(
      "p",
      { style: { fontWeight: "bold", marginTop: 12 } },
      `Tổng: ${vnd(total)}`
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
