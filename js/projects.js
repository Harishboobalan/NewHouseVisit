document.addEventListener('DOMContentLoaded', function() {
    // Project Favorite Functionality
    const favoriteBtns = document.querySelectorAll('.favorite-btn');
    
    favoriteBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            const icon = this.querySelector('i');
            if (this.classList.contains('active')) {
                icon.classList.replace('far', 'fas');
            } else {
                icon.classList.replace('fas', 'far');
            }
        });
    });
    
    // Project Share Functionality
    const shareBtns = document.querySelectorAll('.project-actions button:nth-child(2)');
    
    shareBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Share functionality would be implemented here');
        });
    });
});