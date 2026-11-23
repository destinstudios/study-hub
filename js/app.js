import {
  db,
  auth,
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from "./firebase.js";

import {
  watchAuth,
  logout
} from "./auth.js";

const $ = id => document.getElementById(id);

$("currentYear").textContent = new Date().getFullYear();

const themeToggle = $("themeToggle");

const savedTheme = localStorage.getItem("dq-theme");

if (savedTheme === "light") {
  document.body.classList.add("light");
  themeToggle.textContent = "☀";
}

themeToggle?.addEventListener("click", () => {
  document.body.classList.toggle("light");

  const light = document.body.classList.contains("light");

  localStorage.setItem("dq-theme", light ? "light" : "dark");
  themeToggle.textContent = light ? "☀" : "☾";
});

$("menuToggle")?.addEventListener("click", () => {
  $("mainNav").classList.toggle("open");
});

watchAuth(user => {
  if (user) {
    $("loginBtn")?.classList.add("hidden");
    $("profileBtn")?.classList.remove("hidden");
  } else {
    $("loginBtn")?.classList.remove("hidden");
    $("profileBtn")?.classList.add("hidden");
  }
});

const resourceQuery = query(
  collection(db, "resources"),
  where("published", "==", true),
  orderBy("createdAt", "desc"),
  limit(6)
);

onSnapshot(resourceQuery, snapshot => {
  $("resourceCount").textContent = snapshot.size;

  const container = $("latestResources");

  if (!container) return;

  if (snapshot.empty) {
    container.innerHTML =
      '<div class="loading-card glass">No study materials published yet.</div>';
    return;
  }

  container.innerHTML = snapshot.docs.map(item => {
    const r = item.data();

    return `
      <article class="resource-card glass">
        <span>📘 ${escapeHTML(r.subject || "Study Resource")}</span>
        <h3>${escapeHTML(r.title || "Untitled")}</h3>
        <p>${escapeHTML(r.description || "Study material available.")}</p>
        <div class="resource-meta">
          ${escapeHTML(r.semester || "")}
        </div>
        <a class="btn btn-primary"
           href="./study.html?id=${encodeURIComponent(item.id)}">
           View Material →
        </a>
      </article>
    `;
  }).join("");
});

const noticeQuery = query(
  collection(db, "notices"),
  where("published", "==", true),
  orderBy("createdAt", "desc"),
  limit(5)
);

onSnapshot(noticeQuery, snapshot => {
  $("noticeCount").textContent = snapshot.size;

  const container = $("latestNotices");
  if (!container) return;

  if (snapshot.empty) {
    container.innerHTML =
      '<div class="loading-card glass">No new announcements.</div>';
    return;
  }

  container.innerHTML = snapshot.docs.map(item => {
    const n = item.data();

    return `
      <article class="notice-card glass">
        <h3>${escapeHTML(n.title || "Announcement")}</h3>
        <p>${escapeHTML(n.body || "")}</p>
      </article>
    `;
  }).join("");
});

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}
