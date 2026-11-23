import {
  auth, db, collection, query, orderBy,
  onSnapshot, addDoc, doc, updateDoc,
  deleteDoc, serverTimestamp
} from "./firebase.js";

import { watchAuth, isAdmin, logout } from "./auth.js";
import { uploadFile, deleteStoredFile } from "./storage.js";

const $ = id => document.getElementById(id);

$("adminLogout").onclick = logout;

let adminUser = null;
let resources = [];

watchAuth(user => {
  if (!user) {
    location.href = "./login.html";
    return;
  }

  if (!isAdmin(user)) {
    alert("Admin permission required.");
    location.href = "./dashboard.html";
    return;
  }

  adminUser = user;
  loadResources();
  loadNotices();
});

function loadResources() {
  const q = query(
    collection(db, "resources"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    resources = snapshot.docs.map(d => ({
      id: d.id,
      ...d.data()
    }));

    $("totalResources").textContent = resources.length;
    renderResources();
  }, error => {
    console.error(error);
    $("adminResources").textContent = "Unable to load resources.";
  });
}

function renderResources() {
  const area = $("adminResources");

  if (!resources.length) {
    area.textContent = "No resources added yet.";
    return;
  }

  area.innerHTML = resources.map(r => `
    <div class="admin-resource">
      <div>
        <h3>${escapeHTML(r.title)}</h3>
        <small>
          ${escapeHTML(r.subject || "")} ·
          ${r.published ? "Published" : "Unpublished"}
        </small>
      </div>

      <div class="admin-actions">
        <button data-toggle="${r.id}">
          ${r.published ? "Unpublish" : "Publish"}
        </button>
        <button class="danger" data-delete="${r.id}">Delete</button>
      </div>
    </div>
  `).join("");

  area.querySelectorAll("[data-toggle]").forEach(button => {
    button.onclick = () => togglePublish(button.dataset.toggle);
  });

  area.querySelectorAll("[data-delete]").forEach(button => {
    button.onclick = () => removeResource(button.dataset.delete);
  });
}

async function togglePublish(id) {
  const item = resources.find(r => r.id === id);
  if (!item) return;

  try {
    await updateDoc(doc(db, "resources", id), {
      published: !item.published,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    alert(error.message);
  }
}

async function removeResource(id) {
  const item = resources.find(r => r.id === id);
  if (!item) return;

  if (!confirm(`Delete "${item.title}" permanently?`)) return;

  try {
    await deleteStoredFile(id, adminUser);
    await deleteDoc(doc(db, "resources", id));
    alert("Resource deleted.");
  } catch (error) {
    console.error(error);
    alert("Deletion failed: " + error.message);
  }
}

$("uploadForm").addEventListener("submit", async event => {
  event.preventDefault();

  if (!adminUser) return;

  const form = event.currentTarget;
  const data = new FormData(form);
  const file = data.get("file");

  const status = $("uploadStatus");
  const progress = $("uploadProgress");
  const button = form.querySelector("button[type=submit]");

  try {
    button.disabled = true;
    status.textContent = "Preparing secure upload...";

    const uploaded = await uploadFile(
      file,
      adminUser,
      percent => {
        progress.value = percent;
        status.textContent = `Uploading: ${percent}%`;
      }
    );

    await addDoc(collection(db, "resources"), {
      title: String(data.get("title")).trim(),
      description: String(data.get("description") || "").trim(),
      subject: data.get("subject"),
      semester: data.get("semester"),
      published: data.get("published") === "on",
      filePath: uploaded.path,
      fileName: uploaded.originalName,
      fileType: uploaded.mimeType,
      fileSize: uploaded.size,
      createdBy: adminUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    status.textContent = "Material uploaded successfully!";
    form.reset();
    progress.value = 0;

  } catch (error) {
    console.error(error);
    status.textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

function loadNotices() {
  const q = query(
    collection(db, "notices"),
    orderBy("createdAt", "desc")
  );

  onSnapshot(q, snapshot => {
    $("totalNotices").textContent = snapshot.size;

    $("adminNotices").innerHTML = snapshot.docs.map(d => {
      const n = d.data();

      return `
        <div class="admin-resource">
          <div>
            <h3>${escapeHTML(n.title)}</h3>
            <small>${n.published ? "Published" : "Draft"}</small>
          </div>
          <button class="danger" data-notice-delete="${d.id}">
            Delete
          </button>
        </div>
      `;
    }).join("");

    $("adminNotices")
      .querySelectorAll("[data-notice-delete]")
      .forEach(button => {
        button.onclick = async () => {
          if (!confirm("Delete this announcement?")) return;

          try {
            await deleteDoc(
              doc(db, "notices", button.dataset.noticeDelete)
            );
          } catch (error) {
            alert(error.message);
          }
        };
      });
  });
}

$("noticeForm").addEventListener("submit", async event => {
  event.preventDefault();

  const data = new FormData(event.currentTarget);

  try {
    await addDoc(collection(db, "notices"), {
      title: String(data.get("title")).trim(),
      body: String(data.get("body")).trim(),
      published: data.get("published") === "on",
      pinned: false,
      createdBy: adminUser.uid,
      createdAt: serverTimestamp()
    });

    event.currentTarget.reset();
    alert("Announcement added.");
  } catch (error) {
    alert(error.message);
  }
});

function escapeHTML(s) {
  return String(s || "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  })[c]);
}
