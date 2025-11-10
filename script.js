// First, we need to import the GoogleGenerativeAI class
// This is possible because we used <script type="module"> in the HTML
import { GoogleGenerativeAI } from "https://cdn.jsdelivr.net/npm/@google/generative-ai/+esm";

// Get references to all the HTML elements we'll need
const apiKeyInput = document.getElementById("api-key");
const startChatButton = document.getElementById("start-chat-btn");
const apiKeySection = document.getElementById("api-key-section");
const chatSection = document.getElementById("chat-section");
const chatHistory = document.getElementById("chat-history");
const userPromptInput = document.getElementById("user-prompt");
const sendButton = document.getElementById("send-btn");
const loadingIndicator = document.getElementById("loading-indicator");

let genAI;
let chat;

// This function is called when the "Start Chat" button is clicked
startChatButton.addEventListener("click", () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        alert("Please enter your API key.");
        return;
    }

    // Initialize the Generative AI model with the provided key
    try {
        genAI = new GoogleGenerativeAI(apiKey);
        // We'll use the "gemini-pro" model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        // Start a new chat session
        chat = model.startChat();
        
        // Hide the API key section and show the chat section
        apiKeySection.classList.add("hidden");
        chatSection.classList.remove("hidden");
    } catch (error) {
        alert("Failed to initialize model. Check your API key and console for errors.");
        console.error(error);
    }
});

// This function is called when the "Send" button is clicked
sendButton.addEventListener("click", async () => {
    const prompt = userPromptInput.value.trim();
    if (!prompt) {
        return; // Don't send an empty message
    }

    // Disable input while we wait for the response
    setLoading(true);

    // Add the user's message to the chat history
    addMessageToHistory("user", prompt);

    try {
        // Send the prompt to the Gemini API
        const result = await chat.sendMessage(prompt);
        const response = await result.response;
        const text = response.text();

        // Add the bot's response to the chat history
        addMessageToHistory("bot", text);
    } catch (error) {
        addMessageToHistory("bot", "Sorry, I ran into an error. Please try again.");
        console.error(error);
    } finally {
        // Re-enable the input
        setLoading(false);
    }
});

// Add a helper to allow sending by pressing "Enter"
userPromptInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        sendButton.click();
    }
});

// Helper function to show/hide the loading state
function setLoading(isLoading) {
    if (isLoading) {
        loadingIndicator.classList.remove("hidden");
        sendButton.disabled = true;
        userPromptInput.disabled = true;
    } else {
        loadingIndicator.classList.add("hidden");
        sendButton.disabled = false;
        userPromptInput.disabled = false;
        userPromptInput.value = ""; // Clear the input field
        userPromptInput.focus();
    }
}

// Helper function to add a message to the chat display
function addMessageToHistory(role, text) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("chat-message", role);
    messageElement.innerHTML = `<p>${text}</p>`; // We use innerHTML to render basic formatting if any
    chatHistory.appendChild(messageElement);

    // Scroll to the bottom of the chat history
    chatHistory.scrollTop = chatHistory.scrollHeight;
}