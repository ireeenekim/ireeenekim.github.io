let currentAudio = null;
let currentCard = null;

function togglePlay(audioId, cardElement) {
    const mediaElement = document.getElementById(audioId);
    const icon = cardElement.querySelector('i');

    // 1. If we clicked the same song that is already playing
    if (currentAudio === mediaElement) {
        if (mediaElement.paused) {
            mediaElement.play();
            cardElement.classList.add('playing');
            icon.classList.remove('fa-play');
            icon.classList.add('fa-pause');
        } else {
            mediaElement.pause();
            cardElement.classList.remove('playing');
            icon.classList.remove('fa-pause');
            icon.classList.add('fa-play');
        }
    } 
    // 2. If we clicked a NEW song
    else {
        // Stop the old one if it exists
        if (currentAudio) {
            currentAudio.pause();
            currentAudio.currentTime = 0; // Rewind
            if (currentCard) {
                currentCard.classList.remove('playing');
                currentCard.querySelector('i').classList.remove('fa-pause');
                currentCard.querySelector('i').classList.add('fa-play');
            }
        }

        // Play the new one
        currentAudio = mediaElement;
        currentCard = cardElement;
        
        // This works for both <audio> and <video> tags
        mediaElement.play().catch(error => {
            console.log("Playback failed (user interactions required):", error);
        });

        cardElement.classList.add('playing');
        icon.classList.remove('fa-play');
        icon.classList.add('fa-pause');
    }
}