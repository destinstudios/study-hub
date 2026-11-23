import { getDownloadLink } from "./storage.js";

async function openResource(id) {
  const user = auth.currentUser;

  if (!user) {
    location.href = "./login.html";
    return;
  }

  try {
    const url = await getDownloadLink(id, user);
    window.open(url, "_blank", "noopener,noreferrer");
  } catch (error) {
    alert(error.message);
  }
}
