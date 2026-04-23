const body = document.body;
const btn = document.getElementById("themeBtn");

// 🔥 Carrega tema salvo
const savedTheme = localStorage.getItem("theme");

if (savedTheme === "dark") {
  body.classList.add("dark");
  btn.textContent = "☀️";
}

// 🔥 Clique no botão
btn.addEventListener("click", () => {
  body.classList.toggle("dark");

  if (body.classList.contains("dark")) {
    localStorage.setItem("theme", "dark");
    btn.textContent = "☀️";
  } else {
    localStorage.setItem("theme", "light");
    btn.textContent = "🌙";
  }
});