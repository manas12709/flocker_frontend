---
layout: post
title: Flocker Social Media Site 
search_exclude: true
description: Login and explore our social media hub for everything DNHS 
hide: true
menu: nav/home.html
---

<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Flocker Chat – DNHS CSP</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <style>
    :root {
      --primary-color: #007bff;
      --primary-hover: #0056b3;
      --background-light: #e9eff4;
      --background-white: #fff;
      --input-border: #ccc;
      --input-focus-placeholder: transparent;
      --system-msg-bg: #e1f5fe;
      --system-msg-border: #0288d1;
      --text-gray: #888;
      --button-disabled-bg: #9ec5fe;
    }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: var(--background-light);
      margin: 0;
      padding: 0;
    }
    .centered {
      text-align: center;
      padding: 40px;
    }
    .hidden {
      display: none;
    }
    .chat-container {
      max-width: 800px;
      margin: 40px auto;
      background: var(--background-white);
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .chat-header {
      background: linear-gradient(90deg, var(--primary-color), #00c6ff);
      color: white;
      padding: 20px;
      font-size: 1.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }
    .chat-users {
      padding: 10px 20px;
      font-size: 0.9rem;
      background: #f8f9fa;
      border-bottom: 1px solid #ddd;
    }
    .chat-messages {
      height: 360px;
      overflow-y: auto;
      padding: 20px;
      background: #fdfdfd;
      border-bottom: 1px solid #ddd;
    }
    .chat-input {
      display: flex;
      padding: 20px;
      background: #f1f1f1;
    }
    #msgInput {
      flex: 1;
      padding: 10px;
      font-size: 1rem;
      border: 1px solid var(--input-border);
      border-radius: 8px;
    }
    input:focus::placeholder {
      color: var(--input-focus-placeholder);
    }
    button {
      padding: 10px 20px;
      font-size: 1rem;
      background: var(--primary-color);
      color: white;
      border: none;
      cursor: pointer;
      margin-left: 10px;
      border-radius: 8px;
      transition: background 0.3s;
    }
    button:hover:not(:disabled) {
      background: var(--primary-hover);
    }
    button:disabled {
      background: var(--button-disabled-bg);
      cursor: not-allowed;
    }
    .room-buttons button {
      display: block;
      width: 80%;
      margin: 10px auto;
      font-size: 1.1rem;
    }
    .message {
      margin-bottom: 15px;
      padding: 10px;
      border-radius: 8px;
      background: #f1f1f1;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .message.system {
      background: var(--system-msg-bg);
      border-left: 4px solid var(--system-msg-border);
    }
    .timestamp {
      font-size: 0.8em;
      color: var(--text-gray);
      float: right;
    }
    @media (max-width: 600px) {
      .chat-container {
        margin: 10px;
      }
      .chat-header {
        flex-direction: column;
        align-items: flex-start;
      }
      button {
        width: 100%;
        margin: 10px 0 0 0;
      }
    }
  </style>
</head>
<body>
  <!-- Step 1: Ask for username -->
  <div id="username-form" class="centered">
    <h2>Welcome to Flocker Chat!</h2>
    <p>What’s your username?</p>
    <input
      id="usernameInput"
      placeholder="Enter your name"
      autocomplete="off"
      autocorrect="off"
      autocapitalize="none"
      spellcheck="false"
    />
    <p id="preview-name" style="font-size: 0.9rem; color: gray;"></p>
    <br /><br />
    <button id="continueBtn" disabled>Continue</button>
  </div>

  <!-- Step 2: Room selection -->
  <div id="room-selection" class="centered hidden">
    <h3>Choose a Chat Room</h3>
    <div class="room-buttons">
      <button onclick="joinRoom('coding')">Coding Channel</button>
      <button onclick="joinRoom('grading')">Grading Channel</button>
      <button onclick="joinRoom('announcements')">Announcements</button>
      <button onclick="joinRoom('resources')">Resources & Notes</button>
      <button onclick="joinRoom('qna')">Q&A Forum</button>
      <button onclick="joinRoom('debugging')">Debugging Zone</button>
      <button onclick="joinRoom('projects')">Project Collaboration</button>
    </div>
  </div>

  <!-- Step 3: Chat interface -->
  <div class="chat-container hidden" id="chat-box">
    <div class="chat-header">
      <span id="room-name">Chat Room</span>
      <span id="user-label"></span>
    </div>
    <div class="chat-users" id="users-list">Users: </div>
    <div class="chat-messages" id="messages"></div>
    <div class="chat-input">
      <input id="msgInput" placeholder="Type a message..." autocomplete="off" />
      <button id="sendBtn">Send</button>
    </div>
  </div>

  <script>
    let socket;
    let username = "";
    let room = "";
    let msgInput, sendBtn;

    const usernameInput = document.getElementById("usernameInput");
    const continueBtn = document.getElementById("continueBtn");
    const previewName = document.getElementById("preview-name");

    /**
     * Sanitize message text to prevent HTML injection.
     * Escapes &, <, >, ", '
     */
    function sanitizeText(text) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    /**
     * Format timestamp to readable time string.
     * @param {string|number|Date} timestamp
     * @returns {string} formatted time e.g. "3:45 PM"
     */
    function formatTimestamp(timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Validate username input for allowed characters and length.
     * For example: allow alphanumerics and underscores, length 2-20.
     * @param {string} name
     * @returns {boolean}
     */
    function isValidUsername(name) {
      const re = /^[\w]{2,20}$/;
      return re.test(name);
    }

    /**
     * Render the user list string to the user list container.
     * @param {Array<string>} users
     */
    function renderUserList(users) {
      const usersList = document.getElementById("users-list");
      usersList.textContent = "Users: " + (users.length ? users.join(", ") : "No users");
    }

    /**
     * Append message to chat messages container.
     * @param {string} sender
     * @param {string} text
     * @param {string|number|Date} timestamp
     * @param {boolean} systemMessage
     */
    function appendMessage(sender, text, timestamp, systemMessage = false) {
      const messagesContainer = document.getElementById("messages");
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      if (systemMessage) msgDiv.classList.add("system");

      const safeText = sanitizeText(text);
      const safeSender = sanitizeText(sender);
      const timeStr = formatTimestamp(timestamp);

      msgDiv.innerHTML = `
        <strong>${safeSender}</strong>
        <span class="timestamp">${timeStr}</span><br>
        ${safeText}
      `;

      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    /**
     * Clear chat messages container.
     */
    function clearMessages() {
      const messagesContainer = document.getElementById("messages");
      messagesContainer.innerHTML = "";
    }

    // Enable Continue button only when valid username is typed
    usernameInput.addEventListener("input", () => {
      const name = usernameInput.value.trim();
      previewName.textContent = name ? `Preview: ${name}` : "";
      continueBtn.disabled = !isValidUsername(name);
    });

    continueBtn.addEventListener("click", () => {
      const name = usernameInput.value.trim();
      if (!isValidUsername(name)) {
        alert(
          "Username invalid! Use 2-20 characters: letters, numbers, and underscores only."
        );
        return;
      }
      username = name;
      document.getElementById("username-form").classList.add("hidden");
      document.getElementById("room-selection").classList.remove("hidden");
    });

    /**
     * Remove old event listeners on message input and send button.
     */
    function removeChatListeners() {
      if (msgInput && sendBtn) {
        msgInput.replaceWith(msgInput.cloneNode(true));
        sendBtn.replaceWith(sendBtn.cloneNode(true));
      }
    }

    function joinRoom(roomName) {
      room = roomName;

      document.getElementById("room-selection").classList.add("hidden");
      document.getElementById("chat-box").classList.remove("hidden");
      document.getElementById("room-name").textContent = "Room: " + room;
      document.getElementById("user-label").textContent = "You: " + username;

      clearMessages();

      // Clean up previous listeners if any
      removeChatListeners();

      socket = io("http://localhost:8887");

      socket.on("connect", () => {
        socket.emit("join", { username, room });
        appendMessage("System", `You joined ${room} as ${username}.`, Date.now(), true);
        console.log(`Connected to server, joined room: ${room} as ${username}`);
      });

      socket.on("disconnect", () => {
        appendMessage("System", "You have been disconnected.", Date.now(), true);
        console.log("Disconnected from server");
      });

      socket.on("message", (data) => {
        const { username: sender, text, timestamp } = data;
        appendMessage(sender, text, timestamp, sender === "System");
      });

      socket.on("user_list", (users) => {
        renderUserList(users);
      });

      // Cache input and button for adding listeners
      msgInput = document.getElementById("msgInput");
      sendBtn = document.getElementById("sendBtn");

      // Disable send button initially
      sendBtn.disabled = true;

      // Enable send button only if input is not empty
      msgInput.addEventListener("input", () => {
        sendBtn.disabled = msgInput.value.trim() === "";
      });

      // Send message on button click
      sendBtn.addEventListener("click", sendMessage);

      // Send message on Enter keypress (without shift)
      msgInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
          event.preventDefault();
          if (!sendBtn.disabled) {
            sendMessage();
          }
        }
      });
    }

    function sendMessage() {
      const message = msgInput.value.trim();
      if (message === "") return;

      const timestamp = Date.now();

      // Emit message event to server
      socket.emit("message", { text: message, timestamp });

      // Append own message immediately for better UX
      appendMessage(username, message, timestamp);

      msgInput.value = "";
      sendBtn.disabled = true;
      msgInput.focus();
    }
  </script>
</body>
</html>
