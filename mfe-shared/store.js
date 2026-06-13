// Shared store + event bus dùng chung cho mọi MFE.
// Vì import-map trỏ "@mishop/shared" -> 1 URL, browser load file này ĐÚNG 1 LẦN
// => mảng `items` là DUY NHẤT, mọi MFE thấy cùng dữ liệu (kể cả sau mount/unmount).
const items = [];

export function getItems() {
  return items;
}

export function addItem(product) {
  items.push(product);
  // Phát event để MFE đang lắng nghe (cart, navbar) cập nhật UI.
  window.dispatchEvent(
    new CustomEvent("mishop:cart-changed", { detail: { items: [...items] } })
  );
}

// Đăng ký lắng nghe thay đổi giỏ. Trả về hàm hủy đăng ký (dùng trong useEffect cleanup).
export function onCartChanged(callback) {
  const handler = (e) => callback(e.detail.items);
  window.addEventListener("mishop:cart-changed", handler);
  return () => window.removeEventListener("mishop:cart-changed", handler);
}
