---
layout: post
title: Flocker Social Media Site 
search_exclude: true
description: Login and explore our social media hub for everything DNHS 
hide: true
menu: nav/home.html
---

<!DOCTYPE html>
<html>
<head><title>WebSocket Chat</title></head>
<body>
  <input id="msgInput" placeholder="Type a message...">
  <button onclick="sendMessage()">Send</button>
  <ul id="messages"></ul>

  <script src="https://cdn.socket.io/4.0.1/socket.io.min.js"></script>
  <script>
    const socket = io();  // Connect to the server

    socket.on('message', function(msg) {
      const li = document.createElement("li");
      li.textContent = msg;
      document.getElementById("messages").appendChild(li);
    });

    function sendMessage() {
      const msg = document.getElementById("msgInput").value;
      socket.send(msg);
      document.getElementById("msgInput").value = "";
    }
  </script>
</body>
</html>
