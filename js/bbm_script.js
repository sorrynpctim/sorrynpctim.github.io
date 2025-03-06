const text = 'Black British Music (!)';
const typingSpeed = 75;
let a = 0;

function type() {
    console.log("Typing effect started.");
    if (a < text.length) {
        document.getElementById('centered').innerHTML = text.substring(0, a + 1); // Replace the content
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

// Audio Playback Setup
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM fully loaded. Initializing event listeners...");

    const generateBtn = document.getElementById("generateBtn");
    const audioPlayer = document.getElementById("audioPlayer");
    const audioContainer = document.getElementById("audio-container");

    console.log("Elements fetched:", {
        generateBtn,
        audioPlayer,
        audioContainer
    });

    // Pre-stored test WAV file (Make sure it exists in ./media/)
    const testMP3 = "./media/PBM.wav";

    let blobURL = null; // Store the generated Blob URL to prevent memory leaks

    generateBtn.addEventListener("click", () => {
        console.log("Generate Speech button clicked.");
        console.log(`Fetching audio file: ${testMP3}`);

        fetch(testMP3)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                console.log("Audio file fetched successfully.");
                return response.blob();
            })
            .then(blob => {
                console.log("Blob created from audio file.");

                // Clean up any previously created Blob URL
                if (blobURL) {
                    console.log("Revoking previous Blob URL.");
                    URL.revokeObjectURL(blobURL);
                }

                // Create a new Blob URL
                blobURL = URL.createObjectURL(blob);
                console.log("New Blob URL created:", blobURL);

                // Set the audio player source & play it
                audioPlayer.src = blobURL;
                console.log("Audio player source set.");
                audioPlayer.play();
                console.log("Audio playback started.");

                // Show the audio player
                audioContainer.style.display = "block";
                console.log("Audio container made visible.");
            })
            .catch(error => console.error("Error loading audio:", error));
    });
});
