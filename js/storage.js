import { createClient } from
"https://esm.sh/@supabase/supabase-js@2";

import {
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_BUCKET,
  STORAGE_FUNCTION_URL
} from "./supabase-config.js";

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

async function request(path, user, body = {}) {
  if (!user) throw new Error("Login required.");

  const token = await user.getIdToken();

  const response = await fetch(
    `${STORAGE_FUNCTION_URL}/${path}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        "apikey": SUPABASE_ANON_KEY
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed.");
  }

  return data;
}

export async function uploadFile(file, user, onProgress = () => {}) {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowed.includes(file.type)) {
    throw new Error("Unsupported file format.");
  }

  if (file.size <= 0 || file.size > 20 * 1024 * 1024) {
    throw new Error("File must be between 1 byte and 20 MB.");
  }

  const ticket = await request("upload-ticket", user, {
    filename: file.name,
    contentType: file.type,
    size: file.size
  });

  onProgress(10);

  const { data, error } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .uploadToSignedUrl(
      ticket.path,
      ticket.token,
      file,
      { contentType: file.type }
    );

  if (error) throw error;

  onProgress(100);

  return {
    path: data.path,
    originalName: file.name,
    mimeType: file.type,
    size: file.size
  };
}

export async function getDownloadLink(resourceId, user) {
  const result = await request(
    "download-link",
    user,
    { resourceId }
  );

  return result.signedUrl;
}

export async function deleteStoredFile(resourceId, user) {
  return request(
    "delete-file",
    user,
    { resourceId }
  );
}
