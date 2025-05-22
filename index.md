---
layout: post
title: Flocker Social Media Site 
search_exclude: true
description: Login and explore our social media hub for everything DNHS 
hide: true
menu: nav/home.html
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Flocker Chat – DNHS CSP</title>
  <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background: #e9eff4;
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
      background: #fff;
      border-radius: 10px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }
    .chat-header {
      background: #007bff;
      color: white;
      padding: 20px;
      font-size: 1.4rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
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
      border: 1px solid #ccc;
      border-radius: 8px;
    }
    button {
      padding: 10px 20px;
      font-size: 1rem;
      background: #007bff;
      color: white;
      border: none;
      cursor: pointer;
      margin-left: 10px;
      border-radius: 8px;
    }
    button:hover {
      background: #0056b3;
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
    }
    .message.system {
      background: #e1f5fe;
      border-left: 4px solid #0288d1;
    }
    .timestamp {
      font-size: 0.8em;
      color: #888;
      float: right;
    }
  </style>
</head>
<body>

<!-- Step 1: Ask for username -->
<div id="username-form" class="centered">
  <h2>Welcome to Flocker Chat!</h2>
  <p>What’s your username?</p>
  <input id="usernameInput" placeholder="Enter your name">
  <br><br>
  <button onclick="goToRoomSelection()">Continue</button>
</div>

<!-- Step 2: Room selection -->
<div id="room-selection" class="centered hidden">
  <h3>Choose a Chat Room</h3>
  <div class="room-buttons">
    <button onclick="joinRoom('coding')"> Coding Channel</button>
    <button onclick="joinRoom('grading')"> Grading Channel</button>
    <button onclick="joinRoom('announcements')"> Announcements</button>
    <button onclick="joinRoom('resources')"> Resources & Notes</button>
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
    <input id="msgInput" placeholder="Type a message...">
    <button onclick="sendMessage()">Send</button>
  </div>
</div>

<script>
  let socket;
  let username;
  let room;

  function goToRoomSelection() {
    const name = document.getElementById("usernameInput").value.trim();
    if (!name) {
      alert("Please enter your name.");
      return;
    }

    username = name;
    document.getElementById("username-form").classList.add("hidden");
    document.getElementById("room-selection").classList.remove("hidden");
  }

  function joinRoom(roomName) {
    room = roomName;
    document.getElementById("room-selection").classList.add("hidden");
    document.getElementById("chat-box").classList.remove("hidden");
    document.getElementById("room-name").textContent = "Room: " + room;
    document.getElementById("user-label").textContent = "You: " + username;

    socket = io("http://localhost:8887");

    socket.on("connect", () => {
      socket.emit("join", { username, room });
    });

    socket.on("message", (data) => {
      const { username: sender, text, timestamp } = data;
      const msgDiv = document.createElement("div");
      msgDiv.classList.add("message");
      if (sender === "System") msgDiv.classList.add("system");

      const time = new Date(timestamp).toLocaleTimeString();
      msgDiv.innerHTML = `
        <strong>${sender}</strong>
        <span class="timestamp">${time}</span><br>
        ${text}
      `;

      const container = document.getElementById("messages");
      container.appendChild(msgDiv);
      container.scrollTop = container.scrollHeight;
    });

    socket.on("user_list", (users) => {
      document.getElementById("users-list").textContent = "Users: " + users.join(", ");
    });
  }

  function sendMessage() {
    const input = document.getElementById("msgInput");
    const text = input.value.trim();
    if (text) {
      socket.emit("message", {
        username: username,
        room: room,
        text: text
      });
      input.value = "";
    }
  }
</script>

</body>
</html>
