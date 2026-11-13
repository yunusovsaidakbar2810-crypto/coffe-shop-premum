const API = "http://localhost:3002/products";
const $ = (s) => document.querySelector(s);

const form = $("#productForm");
const box = $("#products");
const fields = ["name", "price", "category", "image", "description"];

let products = [];
let editId = null;

// HTML uchun xavfsiz matn
const safe = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

// Server bilan ishlash
async function request(path = "", method = "GET", body) {
  const res = await fetch(API + path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Server xatosi");
  return res;
}

// Mahsulotni olish
async function getProducts() {
  try {
    products = await (await request()).json();
    showProducts(products);
    showStats();
  } catch {
    box.innerHTML =
      '<p class="empty">Server ishlamayapti. JSON Serverni tekshiring.</p>';
  }
}

// Statistika
function showStats() {
  const count = (cat) => products.filter((p) => p.category === cat).length;
  $("#totalProducts").textContent = products.length;
  $("#totalCoffee").textContent = count("Coffee");
  $("#totalDessert").textContent = count("Dessert");
}

function showProducts(data) {
  box.innerHTML = data.length
    ? data
        .map(
          (p) => `
    <div class="product-card">
      <img src="${safe(p.image)}" alt="${safe(p.name)}"
        onerror="this.src='https://placehold.co/400x300?text=No+Image'">
      <div class="product-info">
        <h3>${safe(p.name)}</h3>
        <p>${safe(p.category)}</p>
        <p><b>Tami:</b> ${safe(p.description)}</p>
        <div class="price">${safe(p.price)} so'm</div>
        <div class="product-actions">
          <button class="edit-btn" data-edit="${safe(p.id)}">Edit</button>
          <button class="delete-btn" data-delete="${safe(p.id)}">Delete</button>
        </div>
      </div>
    </div>`,
        )
        .join("")
    : '<p class="empty">Mahsulot topilmadi!</p>';
}

function resetEdit() {
  editId = null;
  form.reset();
  $("#formTitle").textContent = "Mahsulot qo'shish";
  $("#submitBtn").textContent = "Mahsulot qo'shish";
  $("#cancelEdit").style.display = "none";
}

// Qo'shmachilik
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const product = Object.fromEntries(
    fields.map((f) => [f, $("#" + f).value.trim()]),
  );
  product.price = product.price;

  try {
    await request(
      editId === null ? "" : `/${editId}`,
      editId === null ? "POST" : "PUT",
      product,
    );
    resetEdit();
    await getProducts();
  } catch {
    alert("Xatolik! Serverni tekshiring.");
  }
});

// ozgartirish va qoshish
box.addEventListener("click", async (e) => {
  const editBtn = e.target.closest("[data-edit]");
  const delBtn = e.target.closest("[data-delete]");

  if (editBtn) {
    const product = products.find((p) => String(p.id) === editBtn.dataset.edit);
    if (!product) return;

    editId = product.id;
    fields.forEach(
      (f) =>
        ($("#" + f).value = product[f] || (f === "category" ? "Coffee" : "")),
    );

    $("#formTitle").textContent = "Mahsulotni tahrirlash";
    $("#submitBtn").textContent = "Saqlash";
    $("#cancelEdit").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (delBtn && confirm("Bu mahsulotni o'chirmoqchimisiz?")) {
    try {
      await request(`/${delBtn.dataset.delete}`, "DELETE");
      await getProducts();
    } catch {
      alert("Mahsulotni o'chirib bo'lmadi!");
    }
  }
});

$("#cancelEdit").addEventListener("click", resetEdit);

// qidruv
$("#search").addEventListener("input", (e) => {
  const value = e.target.value.toLowerCase();
  showProducts(
    products.filter((p) => (p.name || "").toLowerCase().includes(value)),
  );
});

getProducts();
