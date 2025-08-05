// CLOCK AND DATE
function updateTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const time = `${hours % 12 || 12}:${minutes}`;

  const clockEl = document.getElementById("status-clock");
  clockEl.textContent = time;

  const weekdays = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  document.querySelector(".clock").textContent = time;
  document.querySelector(".date").textContent = `${weekdays[now.getDay()]}, ${
    months[now.getMonth()]
  } ${now.getDate()}`;

  const statusClock = document.getElementById("status-clock");
  if (statusClock) statusClock.textContent = time;
}

updateTime();
setInterval(updateTime, 1000);

// SLIDE TO UNLOCK
const handle = document.getElementById("unlock-handle");
const container = document.getElementById("slider-container");
const slideText = document.querySelector(".slide-text");

let isDragging = false;
let startX;
let handleStartLeft;

function startDrag(x) {
  isDragging = true;
  startX = x;
  handleStartLeft = handle.offsetLeft;
}

function moveDrag(x) {
  if (!isDragging) return;
  const deltaX = x - startX;
  let newLeft = handleStartLeft + deltaX;
  const maxLeft = container.clientWidth - handle.clientWidth;
  newLeft = Math.max(0, Math.min(newLeft, maxLeft));
  handle.style.left = `${newLeft}px`;
  const progress = newLeft / maxLeft;
  slideText.style.opacity = `${1 - progress}`;
}

function endDrag() {
  if (!isDragging) return;
  isDragging = false;
  const maxLeft = container.clientWidth - handle.clientWidth;
  const currentLeft = parseInt(handle.style.left, 10);
  if (currentLeft >= maxLeft - 5) {
    unlock();
  } else {
    handle.style.left = "0px";
    slideText.style.opacity = "1";
  }
}

handle.addEventListener("mousedown", (e) => {
  startDrag(e.clientX);
  e.preventDefault();
});

handle.addEventListener("touchstart", (e) => {
  startDrag(e.touches[0].clientX);
  e.preventDefault();
});

document.addEventListener("mousemove", (e) => moveDrag(e.clientX));
document.addEventListener("touchmove", (e) => moveDrag(e.touches[0].clientX));
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// UNLOCK TRANSITION
function unlock() {
  const audio = new Audio("sounds/unlock-sound.wav");
  audio.play();
  updateTime();

  document.getElementById("clock-bar").classList.add("slide-up");
  document.getElementById("lock-bottom").classList.add("slide-down");
  document.getElementById("unlock-handle").classList.add("slide-down");
  document.getElementById("time-block").classList.add("slide-up");

  setTimeout(() => {
    document.getElementById("screen").style.display = "none";
    const home = document.getElementById("home-screen");
    home.style.display = "flex";

    setTimeout(() => {
      document.getElementById("dock-wrapper").classList.add("show-dock");
      document.getElementById("instagram-icon").classList.add("slide-in");
      document.getElementById("youtube-icon").classList.add("slide-in");
      document.getElementById("camera-icon").classList.add("slide-in");
      document.getElementById("blackberry-icon").classList.add("slide-in");
    }, 50);
  }, 400);
}

// CAMERA APP
const cameraIcon = document.getElementById("camera-icon");
const video = document.getElementById("camera-view");
const exitBtn = document.getElementById("exit-camera");

cameraIcon.addEventListener("click", () => {
  navigator.mediaDevices
    .getUserMedia({ video: true })
    .then((stream) => {
      video.srcObject = stream;
      video.style.display = "block";
      exitBtn.style.display = "block";
      video.style.transform = "scaleX(-1)";
    })
    .catch((err) => {
      console.error("Camera error:", err);
      alert("Camera app failed.");
    });
});

exitBtn.addEventListener("click", () => {
  video.style.display = "none";
  exitBtn.style.display = "none";
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((track) => track.stop());
  }
  video.srcObject = null;
});
