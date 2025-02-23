const text = 'Hi, my name is Tim.';
const typingSpeed = 75;
let a = 0;

function type() {
    if (a < text.length) {
        document.getElementById('centered').innerHTML = text.substring(0, a + 1); // Replace the content
        a++;
        setTimeout(type, typingSpeed);
    } else {
        fadeInLinks();
    }
}

function fadeInLinks() {
    const links = document.getElementById('links');
    links.classList.add('fade-in');     // Apply fade-in effect to #links
    
    // Fade in #status after #links has finished fading in
    setTimeout(() => {
        fadeInStatus();
    }, 1500);     // Match the transition duration
}

function fadeInStatus() {
    const status = document.getElementById('status');
    status.classList.add('fade-in');    // Apply fade-in effect to #status
}

document.addEventListener('mousemove', (event) => {
    const eyes = document.querySelectorAll('#left_eyes, #right_eyes');
    const container = document.getElementById('characters-container');
    
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const mouseX = event.clientX - rect.left; // Mouse X relative to container
    const mouseY = event.clientY - rect.top;  // Mouse Y relative to container
    
    eyes.forEach(eye => {
        const eyeRect = eye.getBoundingClientRect();
        const eyeCenterX = eyeRect.left + eyeRect.width / 2;
        const eyeCenterY = eyeRect.top + eyeRect.height / 2;
        
        // Calculate angle to the mouse
        const deltaX = mouseX - eyeCenterX + rect.left;
        const deltaY = mouseY - eyeCenterY + rect.top;
        const angle = Math.atan2(deltaY, deltaX);

        // Limit movement distance
        const movementDistance = 0.6; // Base movement distance
        const offsetX = movementDistance * Math.cos(angle);
        const offsetY = movementDistance * Math.sin(angle);

        // Add jitter for shakiness
        const jitterAmount = 0.2; // Adjust for the amount of shakiness
        const jitterX = (Math.random() - 0.5) * jitterAmount;
        const jitterY = (Math.random() - 0.5) * jitterAmount;

        // Apply transformation with jitter
        eye.style.transform = `translate(${offsetX + jitterX}px, ${offsetY + jitterY}px)`;
    });
});

// List of MP3s for each link
const mp3s = {
    xLink: ['audio/x1.mp3', 'audio/x2.mp3', 'audio/x3.mp3'],
    highlightsLink: ['audio/highlights1.mp3', 'audio/highlights2.mp3', 'audio/highlights3.mp3']
};

// Function to handle link clicks
function handleLinkClick(event, linkType) {
    event.preventDefault(); // Prevent immediate redirection
    
    const linkHref = event.target.href; // Get the link's target URL
    const audioList = mp3s[linkType]; // Get the corresponding audio list
    const randomAudio = audioList[Math.floor(Math.random() * audioList.length)]; // Randomly select an audio
    
    // Play the audio
    const audio = new Audio(randomAudio);
    audio.play();
    
    // Redirect after the audio has finished playing
    audio.onended = () => {
        window.location.href = linkHref;
    };
}

// Attach event listeners to the links
document.addEventListener('DOMContentLoaded', () => {
    const xLink = document.querySelector('a[href="https://x.com/0xnpctim"]');
    const highlightsLink = document.querySelector('a[href="highlights.html"]');
    
    if (xLink) {
        xLink.addEventListener('click', (event) => handleLinkClick(event, 'xLink'));
    }
    
    if (highlightsLink) {
        highlightsLink.addEventListener('click', (event) => handleLinkClick(event, 'highlightsLink'));
    }
});

// Start the typing effect on window load
window.onload = type;
