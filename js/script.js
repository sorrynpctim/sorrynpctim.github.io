const text = 'Hi, my name is NPC Tim.';
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

// List of MP3s for each link
const mp3s = {
    instgramLink: ['audio/instagram1.mp3', 'audio/instagram2.mp3', 'audio/instagram3.mp3'],
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
    const instgramLink = document.querySelector('a[href="https://www.instagram.com/sorrynpctim/"]');
    const highlightsLink = document.querySelector('a[href="highlights.html"]');
    
    if (instgramLink) {
        instgramLink.addEventListener('click', (event) => handleLinkClick(event, 'instgramLink'));
    }
    
    if (highlightsLink) {
        highlightsLink.addEventListener('click', (event) => handleLinkClick(event, 'highlightsLink'));
    }
});

// Start the typing effect on window load
window.onload = type;
