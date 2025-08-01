/* api.js */
const API_BASE_URL = "http://127.0.0.1:5000";

export const sendMessageToFlask = async (message, age, level) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, age, level }),
    });

    return await response.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return { response: "Error communicating with server." };
  }
};
