const text = 'hi, my name is npc tim';
const typingSpeed = 75;
let a = 0;

function type() {
    if (a < text.length) {
        document.getElementById('centered').innerHTML += text.charAt(a);
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

// Start the typing effect on window load
window.onload = type;
