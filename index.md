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
    <title>Real-Time Chat</title>
    <script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .chat-container {
            max-width: 700px;
            margin: 40px auto;
            background: #fff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            overflow: hidden;
        }

        .chat-header {
            padding: 20px;
            background: #007bff;
            color: white;
            font-size: 1.4rem;
            text-align: center;
        }

        .chat-messages {
            height: 300px;
            overflow-y: auto;
            padding: 20px;
            border-bottom: 1px solid #ccc;
        }

        .chat-users {
            padding: 10px 20px;
            border-bottom: 1px solid #ccc;
            background: #f9f9f9;
            font-size: 0.9rem;
        }

        .chat-input {
            display: flex;
            padding: 20px;
        }

        #msgInput {
            flex: 1;
            padding: 10px;
            font-size: 1rem;
        }

        button {
            padding: 10px 20px;
            font-size: 1rem;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            margin-left: 10px;
        }

        #login-form {
            text-align: center;
            padding: 40px;
        }

        #login-form input {
            padding: 10px;
            margin: 10px;
            font-size: 1rem;
        }
    </style>
</head>
<body>

<div id="login-form">
    <h2>Join Chat Room</h2>
    <input id="username" placeholder="Your name">
    <input id="room" placeholder="Room name">
    <button onclick="joinRoom()">Join</button>
</div>

<div class="chat-container" id="chat-box" style="display:none;">
    <div class="chat-header" id="room-name">Chat Room</div>
    <div class="chat-users" id="users-list"></div>
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

    function joinRoom() {
        username = document.getElementById("username").value.trim();
        room = document.getElementById("room").value.trim();

        if (!username || !room) {
            alert("Please enter both username and room.");
            return;
        }

        document.getElementById("login-form").style.display = "none";
        document.getElementById("chat-box").style.display = "block";
        document.getElementById("room-name").textContent = `Room: ${room}`;

        // Connect to Flask backend on port 8887
        socket = io("http://localhost:8887");

        socket.on("connect", () => {
            socket.emit("join", { username, room });
        });

        socket.on("message", (msg) => {
            const div = document.createElement("div");
            div.textContent = msg;
            document.getElementById("messages").appendChild(div);
            document.getElementById("messages").scrollTop = messages.scrollHeight;
        });

        socket.on("user_list", (users) => {
            document.getElementById("users-list").textContent = "Users: " + users.join(", ");
        });
    }

    function sendMessage() {
        const input = document.getElementById("msgInput");
        const message = input.value.trim();

        if (message) {
            const fullMessage = `${username}: ${message}`;
            socket.emit("message", { room, msg: fullMessage });
            input.value = "";
        }
    }
</script>
</body>
</html>
