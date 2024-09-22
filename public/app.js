const API_URL = 'http://localhost:5000';
let ws;

document.getElementById('login-btn').addEventListener('click', login);
document.getElementById('register-btn').addEventListener('click', register);
document.getElementById('send-btn').addEventListener('click', sendMessage);



// Register function
async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const response = await axios.post(`${API_URL}/api/register`, {
      name,
      email,
      password
    });

    alert(response.data.message);
  } catch (error) {
    handleError(error);
  }
}

// Handle errors (server-specific or general)
function handleError(error) {
  if (error.response && error.response.data && error.response.data.message) {
    alert(error.response.data.message);  // Specific error message from the server
  } else {
    alert(error.message);  // General error message
  }
}

// Login function
async function login() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  try {
    const response = await axios.post(`${API_URL}/api/login`, {
      email,
      password
    });

    const { user } = response.data;

    // Store the user info (userId, name, etc.) in localStorage or SessionStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    alert('Login successful');
    window.location = "users.html";
  } catch (error) {
    console.error('Error during login:', error);
    alert('Login failed, please try again.');
    handleError(error);
  }
}

// Fetch user details function
async function fetchUserDetails() {
  const token = getCookie('accessToken');

  if (!token) {
    console.log('No token found. User might not be logged in.');
    return;
  }

  try {
    const response = await axios.get(`${API_URL}/user/details`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const user = response.data;
    displayUserDetails(user);
  } catch (error) {
    console.error('Error fetching user details:', error);
    handleError(error);
  }
}

// Function to display user details in the chat UI
function displayUserDetails(user) {
  const userDetailsDiv = document.getElementById('user-details');
  userDetailsDiv.innerHTML = `
    <p>Welcome, ${user.name}!</p>
    <p>Email: ${user.email}</p>
  `;
}

// Display sent message in the chat window
function displaySentMessage(message) {
  const chatBody = document.getElementById('chat-body');
  const newMessage = document.createElement('div');
  newMessage.classList.add('message', 'sent');
  newMessage.innerHTML = `<div class="bubble">${message.text}</div>`;
  chatBody.appendChild(newMessage);
}

// Display received message in the chat window
function displayReceivedMessage(message) {
  const chatBody = document.getElementById('chat-body');
  const newMessage = document.createElement('div');
  newMessage.classList.add('message', 'received');
  newMessage.innerHTML = `<div class="bubble">${message.text}</div>`;
  chatBody.appendChild(newMessage);
}

// Function to send a message
function sendMessage() {
  const messageInput = document.getElementById('message-input');
  const messageText = messageInput.value;
  const receiverId = document.getElementById('receiver-id').value;

  if (!messageText || !receiverId) {
    alert('Please enter a message and select a receiver.');
    return;
  }

  const token = getCookie('accessToken');
  const userId = getUserIdFromURL(); // Get the current user ID

  const message = {
    text: messageText,
    sender: userId,
    receiver: receiverId
  };

  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message)); // Send message via WebSocket
    displaySentMessage(message); // Display sent message in UI
    messageInput.value = ''; // Clear input field
  } else {
    alert('WebSocket connection is not open.');
  }
}

// Function to get cookie value by name
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop().split(';').shift();
}

// Function to get user ID from URL (for WebSocket and message sending)
function getUserIdFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('userId');
}


