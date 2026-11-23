import {
  auth, db, doc, getDoc, collection, getDocs,
  query, where
} from "./firebase.js";

import {
  watchAuth, isAdmin, logout
} from "./auth.js";

document.getElementById("logoutBtn").onclick = logout;

watchAuth(async user => {
  if (!user) {
    location.href = "./login.html";
    return;
  }

  document.getElementById("welcome").textContent =
    `Welcome, ${user.displayName || "Student"}!`;

  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userUid").textContent = "User ID: " + user.uid;

  if (user.photoURL) {
    document.getElementById("userPhoto").src = user.photoURL;
  }

  if (isAdmin(user)) {
    document.getElementById("adminLink").classList.remove("hidden");
  }

  await loadFavorites(user.uid);
});

async function loadFavorites(uid) {
  const area = document.getElementById("myFavorites");

  try {
    const q = query(
      collection(db, "favorites"),
      where("uid", "==", uid)
    );

    const result = await getDocs(q);

    if (result.empty) {
      area.textContent = "You haven't saved any materials yet.";
      return;
    }

    const html = [];

    for (const favorite of result.docs) {
      const resourceId = favorite.data().resourceId;
      const ref = doc(db, "resources", resourceId);
      const resource = await getDoc(ref);

      if (!resource.exists() || !resource.data().published) continue;

      const item = resource.data();

      html.push(`
        <article class="resource-card glass">
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.subject || "")}</p>
          <a href="./study.html?id=${encodeURIComponent(resourceId)}"
            class="btn btn-primary">Open</a>
        </article>
      `);
    }

    area.innerHTML = html.join("") || "No published favourites found.";
  } catch (error) {
    console.error(error);
    area.textContent = "Unable to load favourites.";
  }
}

function escapeHTML(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
