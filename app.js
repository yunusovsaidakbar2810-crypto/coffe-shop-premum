const API = "http://localhost:3002/products";

// Bitta bo'limni (Coffee yoki Dessert) chiqarish
function setupSection(items, boxId, btnId) {
  const box = document.querySelector(boxId);
  const btn = document.querySelector(btnId);
  let showAll = false;

  const render = () => {
    box.innerHTML = (showAll ? items : items.slice(0, 3))
      .map(
        (item) => `
      <div class="card">
        <div class="card-img">
          <img src="${item.image}" alt="${item.name}">
          <i class="fa-regular fa-heart like-btn"></i>
          <span class="rating">⭐ ${item.rating}</span>
        </div>
        <div class="card-body">
          <h2>${item.name}</h2>
          <p><b>Ta'mi:</b> ${item.description}</p>
        </div>
        <div class="card-bottom">
          <h3>${item.price.toLocaleString()} so'm</h3>
          <button>Buyurtma berish</button>
        </div>
      </div>`,
      )
      .join("");
  };

  btn.addEventListener("click", () => {
    showAll = !showAll;
    btn.textContent = showAll ? "Kamroq ko‘rish" : "Hammasini ko‘rish";
    render();
  });

  render();
}

fetch(API)
  .then((res) => res.json())
  .then((data) => {
    const by = (cat) => data.filter((item) => item.category === cat);

    setupSection(by("Coffee"), "#coffee", "#coffeeSeeAll");
    setupSection(by("Dessert"), "#dessert", "#dessertSeeAll");

    // Like tugmasi (event delegation: yangi kartalarda ham ishlaydi)
    document.addEventListener("click", (e) => {
      const like = e.target.closest(".like-btn");
      if (!like) return;
      like.classList.toggle("active");
      like.classList.toggle("fa-solid");
      like.classList.toggle("fa-regular");
    });
  })
  .catch((error) => console.log("Xatolik:", error));

// Admin
function openAdmin() {
  const password = prompt("Admin kodini kiriting:");
  if (password === null) return;

  if (password === "4644") window.location.href = "admin.html";
  else alert("Kod noto'g'ri!");
}
