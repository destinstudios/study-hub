const sentences = [
  ["I am learning English.","मैं अंग्रेज़ी सीख रहा/रही हूँ।"],
  ["Practice makes a person better.","अभ्यास व्यक्ति को बेहतर बनाता है।"],
  ["Could you please help me?","क्या आप कृपया मेरी मदद कर सकते हैं?"],
  ["I would like to improve my communication skills.","मैं अपने संवाद कौशल को बेहतर बनाना चाहता/चाहती हूँ।"],
  ["Knowledge gives us confidence.","ज्ञान हमें आत्मविश्वास देता है।"],
  ["Never stop learning.","सीखना कभी बंद मत करो।"],
  ["Please speak a little slowly.","कृपया थोड़ा धीरे बोलिए।"],
  ["I appreciate your support.","मैं आपके सहयोग की सराहना करता/करती हूँ।"],
  ["Let me explain my point.","मुझे अपनी बात समझाने दीजिए।"],
  ["I will try my best.","मैं अपनी पूरी कोशिश करूँगा/करूँगी।"]
];

const words = [
  ["Achieve","प्राप्त करना","She worked hard to achieve her goal."],
  ["Confident","आत्मविश्वासी","Be confident while speaking."],
  ["Develop","विकसित करना","We should develop good habits."],
  ["Effective","प्रभावी","Communication is an effective skill."],
  ["Opportunity","अवसर","This is a great opportunity."],
  ["Respect","सम्मान","We should respect everyone."],
  ["Improve","सुधारना","Practice daily to improve your English."],
  ["Decision","निर्णय","Make a wise decision."]
];

let sentenceIndex = 0;
let wordIndex = 0;

function showSentence() {
  const item = sentences[sentenceIndex % sentences.length];
  document.getElementById("dailyEnglish").textContent = item[0];
  document.getElementById("dailyHindi").textContent = item[1];
  sentenceIndex++;
}

function showWord() {
  const item = words[wordIndex % words.length];

  document.getElementById("englishWord").textContent = item[0];
  document.getElementById("englishMeaning").textContent = item[1];
  document.getElementById("englishExample").textContent =
    "Example: " + item[2];

  wordIndex++;
}

document.getElementById("nextSentence").onclick = showSentence;
document.getElementById("nextEnglishWord").onclick = showWord;

showSentence();
showWord();
