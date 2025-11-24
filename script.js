// Load YouTube IFrame API asynchronously
const tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

let player;
let config = null;
let activeCheckpoints = new Set();
let currentCheckpointIndex = 0;
let timeCheckInterval;
let duration = 0;
const formOverlay = document.getElementById('formOverlay');
const formFrame = document.getElementById('formFrame');
const continueBtn = document.getElementById('continueBtn');
const body = document.body;
const timelineTrack = document.getElementById('timelineTrack');
const timelineProgress = document.getElementById('timelineProgress');
const timelineWatchedLabel = document.getElementById('timelineWatchedLabel');
const timelineQuestionsLabel = document.getElementById('timelineQuestionsLabel');
let timelineMarkers = [];

if (timelineTrack) {
    timelineTrack.addEventListener('click', onTimelineClick);
}

// This function creates an <iframe> (and YouTube player)
// after the API code downloads.
function onYouTubeIframeAPIReady() {
    // Use global videoConfig object from config.js
    if (typeof videoConfig !== 'undefined') {
        config = videoConfig;
        if (config.checkpoints) {
            config.checkpoints.sort((a, b) => a.timestamp - b.timestamp);
        }
        initializePlayer(config.videoId);
    } else {
        console.error("Config not found. Make sure config.js is loaded.");
        alert("Error loading video configuration.");
    }
}

function initializePlayer(videoId) {
    player = new YT.Player('player', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        host: 'https://www.youtube-nocookie.com',
        playerVars: {
            'playsinline': 1,
            'controls': 1,
            'rel': 0,
            'origin': (window.location.protocol === 'file:') ? undefined : window.location.origin
        },
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange,
            'onError': onPlayerError
        }
    });
}

function onPlayerReady(event) {
    // Player is ready
    startMonitoring();
    setupTimeline();
}

function onPlayerError(event) {
    console.error("YouTube Player Error:", event.data);
    if (event.data === 150 || event.data === 101 || event.data === 153) {
        alert("This video cannot be played in an embedded player. The video owner has restricted it. Please try a different video ID in config.js.");
    } else {
        alert("An error occurred with the video player. Error code: " + event.data);
    }
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        startMonitoring();
    } else {
        stopMonitoring();
    }
}

function startMonitoring() {
    stopMonitoring(); // Clear existing interval if any
    timeCheckInterval = setInterval(checkTime, 500); // Check every 500ms
}

function stopMonitoring() {
    if (timeCheckInterval) {
        clearInterval(timeCheckInterval);
        timeCheckInterval = null;
    }
}

function checkTime() {
    if (!player || !player.getCurrentTime || !config || !config.checkpoints) return;

    const currentTime = player.getCurrentTime();
    if (duration && timelineProgress) {
        const pct = Math.min(100, (currentTime / duration) * 100);
        timelineProgress.style.width = pct + '%';
    }

    updateTimelineLabels(currentTime);
    const nextCheckpoint = config.checkpoints[currentCheckpointIndex];

    // Check if we passed the checkpoint
    if (nextCheckpoint && currentTime >= nextCheckpoint.timestamp && !activeCheckpoints.has(currentCheckpointIndex)) {
        triggerCheckpoint(nextCheckpoint, currentCheckpointIndex);
    }
}

function triggerCheckpoint(checkpoint, index) {
    player.pauseVideo();
    activeCheckpoints.add(index);
    currentCheckpointIndex++;

    if (timelineMarkers[index]) {
        timelineMarkers[index].classList.add('completed');
    }

    if (player && player.getCurrentTime) {
        updateTimelineLabels(player.getCurrentTime());
    }

    // Load Form
    formFrame.src = checkpoint.formUrl;

    // Show Overlay
    formOverlay.classList.remove('hidden');
    body.classList.add('form-active');

    // On mobile, scroll to form
    if (window.innerWidth <= 768) {
        setTimeout(() => {
            formOverlay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }
}

function onTimelineClick(event) {
    if (!player || !player.seekTo || !duration || !timelineTrack) return;

    const rect = timelineTrack.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const width = rect.width || 1;
    let pct = clickX / width;
    pct = Math.max(0, Math.min(1, pct));

    const newTime = pct * duration;
    if (isNaN(newTime)) return;

    const state = player.getPlayerState ? player.getPlayerState() : null;

    player.seekTo(newTime, true);

    // If the video was playing before, keep it playing after seek
    if (typeof YT !== 'undefined' && YT.PlayerState && state === YT.PlayerState.PLAYING) {
        player.playVideo();
    }

    // Update UI immediately for responsiveness
    if (timelineProgress) {
        timelineProgress.style.width = (pct * 100) + '%';
    }
    updateTimelineLabels(newTime);
}

function setupTimeline() {
    if (!player || !player.getDuration || !config || !config.checkpoints || !timelineTrack) return;

    const d = player.getDuration();
    if (!d || isNaN(d) || d === Infinity) {
        setTimeout(setupTimeline, 500);
        return;
    }

    duration = d;

    timelineMarkers.forEach(marker => marker.remove());
    timelineMarkers = [];

    const totalCheckpoints = config.checkpoints.length;

    config.checkpoints.forEach((checkpoint, index) => {
        const position = Math.min(100, (checkpoint.timestamp / duration) * 100);
        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = position + '%';
        timelineTrack.appendChild(marker);
        timelineMarkers.push(marker);
    });

    updateTimelineLabels(0);
}

function updateTimelineLabels(currentTime) {
    if (timelineWatchedLabel) {
        timelineWatchedLabel.textContent = 'Watched: ' + formatTime(currentTime);
    }

    if (timelineQuestionsLabel && config && config.checkpoints) {
        const total = config.checkpoints.length;
        const answered = activeCheckpoints.size;
        timelineQuestionsLabel.textContent = 'Questions: ' + answered + ' / ' + total;
    }
}

function formatTime(seconds) {
    const totalSeconds = Math.floor(seconds || 0);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return mins + ':' + (secs < 10 ? '0' + secs : secs);
}

// Continue Button Logic
continueBtn.addEventListener('click', () => {
    const confirmed = window.confirm('Did you submit the form?');
    if (!confirmed) {
        return;
    }

    // Hide Overlay
    formOverlay.classList.add('hidden');
    body.classList.remove('form-active');

    // Resume Video
    if (player && player.playVideo) {
        player.playVideo();
    }
});
