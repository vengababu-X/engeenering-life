/* 
  Chat.js - Smart Vision AI (by Vengababu)
  Handles chat UI, voice input, file upload, TTS, and chat actions.
*/

// DOM elements
const chatBody = document.getElementById("chat-body");
const messageInput = document.getElementById("message-input");
const sendMessageBtn = document.getElementById("send-message");
const clipButton = document.getElementById("clip-button");
const clipDropdown = document.querySelector(".clip-dropdown");
const fileInput = document.getElementById("file-input");
const clearFileBtn = document.getElementById("clear-file");
const cameraBtn = document.getElementById("camera-button");
const voiceBtn = document.getElementById("voice-input");
const ttsToggleBtn = document.getElementById("toggle-tts");
const langSelector = document.getElementById("language-selector");

const saveChatBtn = document.getElementById("save-chat");
const clearChatBtn = document.getElementById("clear-chat");
const resetChatBtn = document.getElementById("reset-chat");

let ttsEnabled = false;
let recognition;
let attachedFile = null;

/* -------------------- Utility Functions -------------------- */
function scrollToBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function addMessage(text, sender = "user") {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add("message", sender);
  msgDiv.textContent = text;
  chatBody.appendChild(msgDiv);
  scrollToBottom();

  if (sender === "bot" && ttsEnabled) {
    speakText(text);
  }
}

function botReply(userMessage) {
  const response = `🤖 Vengababu Bot: I received your message - "${userMessage}"`;
  setTimeout(() => addMessage(response, "bot"), 600);
}

/* -------------------- Message Sending -------------------- */
function sendMessage() {
  const text = messageInput.value.trim();
  if (text === "" && !attachedFile) return;

  if (text) {
    addMessage(text, "user");
    botReply(text);
  }

  if (attachedFile) {
    addMessage(`📎 File attached: ${attachedFile.name}`, "user");
    attachedFile = null;
    fileInput.value = "";
  }

  messageInput.value = "";
}

sendMessageBtn.addEventListener("click", sendMessage);
messageInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendMessage();
});

/* -------------------- Clip Menu -------------------- */
clipButton.addEventListener("click", () => {
  clipDropdown.classList.toggle("active");
});

document.getElementById("file-upload").addEventListener("click", () => {
  fileInput.click();
});

fileInput.addEventListener("change", (e) => {
  if (e.target.files.length > 0) {
    attachedFile = e.target.files[0];
    addMessage(`📂 Selected file: ${attachedFile.name}`, "user");
  }
});

clearFileBtn.addEventListener("click", () => {
  attachedFile = null;
  fileInput.value = "";
  addMessage("❌ File selection cleared", "user");
});

cameraBtn.addEventListener("click", () => {
  addMessage("📸 Camera feature not yet implemented", "bot");
});

/* -------------------- Voice Recognition -------------------- */
if ("webkitSpeechRecognition" in window) {
  recognition = new webkitSpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = false;
  recognition.interimResults = false;

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    messageInput.value = transcript;
    addMessage(`🎤 You said: ${transcript}`, "user");
    botReply(transcript);
  };

  recognition.onerror = (err) => {
    addMessage("⚠️ Voice input error: " + err.error, "bot");
  };
}

voiceBtn.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
    addMessage("🎙️ Listening...", "bot");
  } else {
    addMessage("⚠️ Voice recognition not supported", "bot");
  }
});

/* -------------------- Text-to-Speech -------------------- */
function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langSelector.value;
  speechSynthesis.speak(utterance);
}

ttsToggleBtn.addEventListener("click", () => {
  ttsEnabled = !ttsEnabled;
  addMessage(`🔊 TTS ${ttsEnabled ? "enabled" : "disabled"}`, "bot");
});

/* -------------------- Chat Actions -------------------- */
saveChatBtn.addEventListener("click", () => {
  const chatText = chatBody.innerText;
  const blob = new Blob([chatText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "chat-history.txt";
  link.click();
});

clearChatBtn.addEventListener("click", () => {
  chatBody.innerHTML = "";
});

resetChatBtn.addEventListener("click", () => {
  chatBody.innerHTML = "";
  addMessage("🔄 Chat has been reset. Start fresh!", "bot");
});

/* -------------------- Initial Bot Greeting -------------------- */
addMessage("👋 Hello! I’m Smart Vision AI (by Vengababu). How can I help you today?", "bot");
