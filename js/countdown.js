/**
 * Countdown Timer Implementation
 * Creates urgency for users to take action
 */
document.addEventListener('DOMContentLoaded', function() {
    // Set the countdown date (2 days from now)
    const countdownDate = new Date();
    countdownDate.setDate(countdownDate.getDate() + 2);
    countdownDate.setHours(countdownDate.getHours() + 14);
    countdownDate.setMinutes(countdownDate.getMinutes() + 23);
    
    // Update the countdown every second
    const countdownTimer = setInterval(function() {
        // Get current date and time
        const now = new Date().getTime();
        
        // Find the distance between now and the countdown date
        const distance = countdownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Display the result
        document.getElementById("countdown-days").textContent = days;
        document.getElementById("countdown-hours").textContent = hours;
        document.getElementById("countdown-minutes").textContent = minutes;
        document.getElementById("countdown-seconds").textContent = seconds;
        
        // If the countdown is finished, display expired message
        if (distance < 0) {
            clearInterval(countdownTimer);
            document.getElementById("countdown").innerHTML = "<p class='expired'>Time Expired!</p>";
        }
    }, 1000);
}); 