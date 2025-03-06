// Typing Effect for "Black British Music (!)"
const text = 'Black British Music (!)';
const typingSpeed = 75;
let a = 0;

function type() {
    console.log("Typing effect started.");
    if (a < text.length) {
        document.getElementById('centered').innerHTML = text.substring(0, a + 1);
        console.log(`Typing progress: ${text.substring(0, a + 1)}`);
        a++;
        setTimeout(type, typingSpeed);
    } else {
        console.log("Typing effect completed.");
    }
}

// Start the typing effect on window load
window.onload = () => {
    console.log("Window loaded. Starting typing effect...");
    type();
};

// Cloudflare Worker API Endpoint
const CLOUDLARE_WORKER_URL = "https://speech-generate.blackbritishmusic.workers.dev/";

document.addEventListener("DOMContentLoaded", () => {
    const generateBtn = document.getElementById("generateBtn");
    const audioPlayer = document.getElementById("audioPlayer");
    const audioContainer = document.getElementById("audio-container");

    let audioReady = false; // Tracks whether audio has been generated and is waiting to play

    generateBtn.addEventListener("click", async () => {
        // Detect if the user is on an iPhone
        const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

        // If on iPhone and audio is already generated, play it and reset state.
        if (isIphone && audioReady) {
            audioPlayer.play();
            generateBtn.innerText = "Generate Speech";
            audioReady = false;
            return;
        }

        // If not in the "play" state, generate new audio
        const textInput = document.getElementById("textInput").value.trim();
        if (!textInput) {
            alert("Please enter some text.");
            return;
        }

        console.log("Sending text to Cloudflare Worker:", textInput);

        try {
            const response = await fetch(CLOUDLARE_WORKER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text: textInput })
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            console.log("Audio file received from Worker.");
            // Convert response into a Blob URL
            const audioBlob = await response.blob();
            const audioURL = URL.createObjectURL(audioBlob);

            // Stop any previous audio before setting a new one
            audioPlayer.pause();
            audioPlayer.currentTime = 0;

            // Assign the generated audio to the player
            audioPlayer.src = audioURL;
            audioContainer.style.display = "block";

            if (isIphone) {
                // On iPhone, update the state so that the next tap plays the audio.
                generateBtn.innerText = "Tap to Play";
                audioReady = true;
            } else {
                // On non-iPhone devices, play automatically.
                audioPlayer.play();
            }
        } catch (error) {
            console.error("Error fetching generated speech:", error);
            alert("Failed to generate speech. Check the console for details.");
        }
    });
});
