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

    let isFirstTapBlocked = false; // Flag to track iPhone behavior

    generateBtn.addEventListener("click", async () => {
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

            // **STOP ANY PREVIOUS AUDIO BEFORE SETTING A NEW ONE**
            audioPlayer.pause();
            audioPlayer.currentTime = 0;

            // Assign the generated audio to the player
            audioPlayer.src = audioURL;
            audioContainer.style.display = "block";

            // Detect if the user is on iPhone
            const isIphone = /iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isIphone && !isFirstTapBlocked) {
                console.log("iPhone detected: Playing for 1 second, then requiring manual play.");
                
                // Play the audio for 1 second
                audioPlayer.play();
                setTimeout(() => {
                    audioPlayer.pause();
                    audioPlayer.currentTime = 0;
                    audioPlayer.src = ""; // Delete the original audio
                    generateBtn.innerText = "Tap Again to Play";
                    isFirstTapBlocked = true;

                    // Ensure only one event listener is added for manual play
                    generateBtn.onclick = () => {
                        audioPlayer.src = audioURL; // Reassign the new audio
                        audioPlayer.play();
                        generateBtn.innerText = "Generate Speech"; // Reset button text
                        isFirstTapBlocked = false; // Reset flag
                        generateBtn.onclick = null; // Remove event to prevent stacking
                    };
                }, 1000); // Play for 1 second

            } else {
                // Play normally on Android and after second tap on iPhone
                audioPlayer.play();
            }

        } catch (error) {
            console.error("Error fetching generated speech:", error);
            alert("Failed to generate speech. Check the console for details.");
        }
    });
});
