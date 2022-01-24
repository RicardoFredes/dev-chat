const socket = io();

const loginWrapper = document.getElementById("login");
const loginForm = document.getElementById("login-form");
const loginName = document.getElementById("login-name");
const loginGroupId = document.getElementById("login-group-id");

const chatWrapper = document.getElementById("chat");
const chatTitle = document.getElementById("chat-title");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatMessages = document.getElementById("chat-messages");

let me = "me";
// let groupId = new URLSearchParams(location.search).get("group");
let groupId = location.pathname.split("/")[1];

loginGroupId.value = groupId;
if (groupId) {
  loginGroupId.type = "hidden";
  document.getElementById("group-id").style.display = "none";
}

const clearMessages = () => {
  chatMessages.textContent = "";
};

const addMessage = (username, message, type) => {
  if (!username || !message) return;
  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  if (type) messageElement.classList.add(`message--is-${type}`);
  if (type === "bot") {
    messageElement.innerHTML = `<div class="message__text">${message}</div>`;
  } else {
    messageElement.innerHTML = `<div class="message__username">${username}</div><div class="message__text">${message}</div>`;
  }
  chatMessages.appendChild(messageElement);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

loginForm.onsubmit = (event) => {
  event.preventDefault();
  const username = loginName.value;
  groupId = loginGroupId.value;
  if (username && groupId)
    socket.emit("chat join request", { username, groupId });
};

chatForm.onsubmit = (event) => {
  event.preventDefault();
  const message = chatInput.value;
  if (message) {
    socket.emit("chat message", message);
    chatInput.value = "";
    addMessage(me, message, "me");
  }
};

socket.on("login", () => {
  clearMessages();
  loginWrapper.style.display = "";
  chatWrapper.style.display = "none";
});

socket.on("chat join response", ({ username, numUsers }) => {
  if (!username) return;
  loginWrapper.style.display = "none";
  chatWrapper.style.display = "";
  clearMessages();
  // history.replaceState("", "", `/?group=${groupId}`);
  history.replaceState("", "", `/${groupId}`);
  me = username;
  const message =
    numUsers > 1
      ? `você entrou no grupo ${groupId} totalizando ${numUsers} usuários`
      : `você está sozinho no grupo ${groupId}`;
  addMessage(username, message, "bot");
});

socket.on("chat connect", ({ username = "anônimo" }) => {
  addMessage("bot", `${username} entrou`, "bot");
});

socket.on("chat disconnect", ({ username = "anônimo" }) => {
  addMessage("bot", `${username} saiu`, "bot");
});

socket.on("chat message", ({ username, message }) =>
  addMessage(username, message, "user")
);
