const $ = id => document.getElementById(id);

function calculateExpression(expression) {
  if (!/^[0-9+\-*/().%\s]+$/.test(expression)) {
    throw new Error("Only numbers and arithmetic operators are allowed.");
  }

  const result = Function('"use strict"; return (' + expression + ')')();

  if (!Number.isFinite(result)) throw new Error("Invalid calculation.");

  return result;
}

$("calcBtn").onclick = () => {
  try {
    $("calcResult").textContent =
      calculateExpression($("calcInput").value);
  } catch (e) {
    $("calcResult").textContent = e.message;
  }
};

$("sciBtn").onclick = () => {
  try {
    const value = $("sciInput").value.trim();

    const allowed = {
      sin: Math.sin,
      cos: Math.cos,
      tan: Math.tan,
      sqrt: Math.sqrt,
      log: Math.log10,
      ln: Math.log,
      abs: Math.abs
    };

    const expression = value
      .replace(/sin|cos|tan|sqrt|log|ln|abs/g, x => `Math.${allowed[x].name}`)
      .replace(/Math\.sin\(([-\d.]+)\)/g, (_, n) => `Math.sin(${n}*Math.PI/180)`)
      .replace(/Math\.cos\(([-\d.]+)\)/g, (_, n) => `Math.cos(${n}*Math.PI/180)`)
      .replace(/Math\.tan\(([-\d.]+)\)/g, (_, n) => `Math.tan(${n}*Math.PI/180)`);

    if (!/^[0-9+\-*/().\sMathPI]+$/.test(expression)) {
      throw new Error("Invalid expression.");
    }

    const result = Function(`"use strict";return (${expression})`)();

    if (!Number.isFinite(result)) throw new Error("Invalid result.");

    $("sciResult").textContent = result;
  } catch (e) {
    $("sciResult").textContent = e.message;
  }
};

$("countText").oninput = () => {
  const text = $("countText").value;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  $("countResult").textContent =
    `Words: ${words} | Characters: ${text.length} | Without spaces: ${text.replace(/\s/g,"").length}`;
};

document.querySelectorAll("[data-case]").forEach(button => {
  button.onclick = () => {
    const text = $("caseText").value;
    const type = button.dataset.case;

    const result = type === "upper"
      ? text.toUpperCase()
      : type === "lower"
      ? text.toLowerCase()
      : text.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());

    $("caseResult").textContent = result;
  };
});

$("passwordInput").oninput = () => {
  const p = $("passwordInput").value;

  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p)) score++;
  if (/[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p)) score++;

  $("passwordResult").textContent =
    ["Very weak","Weak","Fair","Good","Strong","Very strong"][score];
};

$("qrBtn").onclick = () => {
  const value = $("qrText").value.trim();
  if (!value) return alert("Enter some text.");

  const img = document.createElement("img");
  img.alt = "Generated QR code";
  img.width = 200;
  img.height = 200;

  img.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=" +
    encodeURIComponent(value);

  $("qrResult").replaceChildren(img);
};

$("unitBtn").onclick = () => {
  const n = Number($("unitValue").value);
  const formulas = {
    "km-mi": n => n * 0.621371,
    "mi-km": n => n / 0.621371,
    "kg-lb": n => n * 2.20462,
    "lb-kg": n => n / 2.20462,
    "c-f": n => n * 9 / 5 + 32,
    "f-c": n => (n - 32) * 5 / 9
  };

  if (!Number.isFinite(n)) return;

  $("unitResult").textContent =
    formulas[$("unitType").value](n).toFixed(4);
};

$("percentBtn").onclick = () => {
  const a = Number($("percentA").value);
  const b = Number($("percentB").value);

  $("percentResult").textContent =
    Number.isFinite(a * b) ? `${a}% of ${b} = ${a * b / 100}` : "Invalid values";
};

$("ageBtn").onclick = () => {
  const birth = new Date($("birthDate").value);
  const now = new Date();

  if (isNaN(birth.getTime()) || birth > now) {
    $("ageResult").textContent = "Enter a valid birth date.";
    return;
  }

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  $("ageResult").textContent = `${years} years and ${months} months`;
};

$("quickNotes").value = localStorage.getItem("dq-quick-notes") || "";

$("saveNotes").onclick = () => {
  localStorage.setItem("dq-quick-notes", $("quickNotes").value);
  $("notesStatus").textContent = "Notes saved on this device.";
};

const vocabulary = [
  ["Abundant","Plentiful or available in large quantities"],
  ["Brave","Ready to face danger or difficulty"],
  ["Curious","Eager to learn or know something"],
  ["Diligent","Showing careful and persistent effort"],
  ["Essential","Absolutely necessary"],
  ["Grateful","Feeling or showing appreciation"],
  ["Honest","Truthful and sincere"],
  ["Improve","To make something better"],
  ["Knowledge","Facts, information and skills"],
  ["Reliable","Able to be trusted"]
];

let wordIndex = 0;

function nextWord() {
  const word = vocabulary[wordIndex % vocabulary.length];
  $("vocabWord").textContent = word[0];
  $("vocabMeaning").textContent = word[1];
  wordIndex++;
}

$("nextVocab").onclick = nextWord;
nextWord();
