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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #e9eff4;
            margin: 0;
            padding: 0;
        }
        .chat-container {
            max-width: 750px;
            margin: 50px auto;
            background: #ffffff;
            border-radius: 10px;
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .chat-header {
            padding: 20px;
            background: #007bff;
            color: white;
            font-size: 1.5rem;
            text-align: center;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
        }
        .chat-messages {
            height: 300px;
            overflow-y: auto;
            padding: 20px;
            border-bottom: 1px solid #ddd;
            background: #fdfdfd;
        }
        .chat-users {
            padding: 10px 20px;
            border-bottom: 1px solid #eee;
            background: #f1f1f1;
            font-size: 0.95rem;
            color: #333;
        }
        .chat-input {
            display: flex;
            padding: 20px;
            background: #f9f9f9;
        }
        #msgInput {
            flex: 1;
            padding: 10px 15px;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            outline: none;
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
            transition: background 0.3s ease;
        }
        button:hover {
            background: #0056b3;
        }
        #login-form {
            max-width: 400px;
            margin: 100px auto;
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 6px 15px rgba(0,0,0,0.1);
        }
        #login-form h2 {
            margin-bottom: 20px;
            color: #333;
        }
        #login-form input {
            width: 80%;
            padding: 12px;
            margin: 10px 0;
            font-size: 1rem;
            border: 1px solid #ccc;
            border-radius: 8px;
            outline: none;
        }
    </style>
</head>
<body>

<div id="login-form">
    <h2>Join a Chat Room</h2>
    <input id="username" placeholder="Enter your name">
    <input id="room" placeholder="Enter room name">
    <button onclick="joinRoom()">Join Chat</button>
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

        socket = io("http://localhost:8887");

        socket.on("connect", () => {
            socket.emit("join", { username, room });
        });

        socket.on("message", (msg) => {
            const msgDiv = document.createElement("div");
            msgDiv.textContent = msg;
            msgDiv.style.marginBottom = "10px";
            msgDiv.style.padding = "8px";
            msgDiv.style.borderRadius = "6px";
            msgDiv.style.background = "#f1f1f1";
            document.getElementById("messages").appendChild(msgDiv);
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
