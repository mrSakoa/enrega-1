let trolley = JSON.parse(localStorage.getItem("trolley")) || [];
let products = [];

function saveTrolley() {
  localStorage.setItem("trolley", JSON.stringify(trolley));
}

// ------------------------------ fetch Fake Store API products
async function loadProducts() {
  try {
    const res = await fetch("https://fakestoreapi.com/products?limit=8");
    if (!res.ok) throw new Error("Failed to load products");

    products = await res.json();
    showProducts();

    // hide loader, show content
    const loading = document.getElementById("loading");
    const content = document.getElementById("content");
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  } catch (err) {
    console.error(err);
    const productsEl = document.getElementById("products");
    if (productsEl) productsEl.textContent = "Products could not be loaded.";

    // still reveal the page so the user isn't stuck on the loader
    const loading = document.getElementById("loading");
    const content = document.getElementById("content");
    if (loading) loading.style.display = "none";
    if (content) content.style.display = "block";
  }
}

// --------------------- cards template
function showProducts() {
  const container = document.getElementById("products");
  if (!container) return;

  container.innerHTML = "";

  products.forEach((p) => {
    const card = document.createElement("div");
    card.className = "card";

    const img = document.createElement("img");
    img.src = p.image;
    img.alt = p.title;

    const title = document.createElement("h3");
    title.textContent = p.title;

    const price = document.createElement("p");
    price.textContent = formatPrice(p.price);

    const btn = document.createElement("button");
    btn.textContent = "Add to Trolley";
    btn.onclick = () => addToTrolley(p.id);

    card.append(img, title, price, btn);
    container.appendChild(card);
  });
}

// --------------------------------- Add product to trolley
function addToTrolley(id) {
  
  const product = products.find((p) => p.id === id);
  if (!product) {
    alert("Product not found.");
    return;
  }
  trolley.push(product);

  saveTrolley();

  updateTrolley();
}

// -------------------------------- update trolley
function updateTrolley() {

  const trolleyList = document.getElementById("trolleyList");

  const totalText = document.getElementById("total");

  if (!trolleyList || !totalText) return; 

  trolleyList.innerHTML = "";

  let total = 0;

  trolley.forEach((item, index) => {

    total += item.price;

    const li = document.createElement("li");

    li.textContent = `${item.title} - ${formatPrice(item.price)}`;

    const btnRemove = document.createElement("button");

    btnRemove.textContent = "X";

    btnRemove.onclick = () => removeFromTrolley(index);

    li.appendChild(btnRemove);

    trolleyList.appendChild(li);
  });

  totalText.textContent = `Total: ${formatPrice(total)}`;
}

// ------------------------------------- Remove single product
function removeFromTrolley(index) {
  trolley.splice(index, 1);
  saveTrolley();
  updateTrolley();
}

// --------------------------------- Clear the trolley
function clearTrolley() {
  trolley = [];
  saveTrolley();
  updateTrolley();
}

// ------------------------------- Buttons (guard listeners)
const viewBtn = document.getElementById("viewTrolley");
if (viewBtn) {
  viewBtn.addEventListener("click", () => {
    const t = document.getElementById("trolley");
    if (t) t.classList.toggle("show");
  });
}

const clearBtn = document.getElementById("clearTrolley");
if (clearBtn) {
  clearBtn.addEventListener("click", clearTrolley);
}

function formatPrice(n) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

updateTrolley();
loadProducts();
