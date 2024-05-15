const text = 'npc tim'
const typingSpeed = 500;
let a = 0;

function type() {
    if (a < text.length) {
        document.getElementById('centered').innerHTML += text.charAt(a);
        a++;
        setTimeout(type, typingSpeed);
    }
}

window.onload = type;
