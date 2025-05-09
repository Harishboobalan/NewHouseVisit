document.addEventListener('DOMContentLoaded', function() {
    // Property Filter Functionality
    const filterForm = document.querySelector('.property-filters form');
    
    if (filterForm) {
        filterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally make an AJAX request to filter properties
            // For static site, we'll just log the values
            const formData = new FormData(filterForm);
            const filters = Object.fromEntries(formData.entries());
            console.log('Filters applied:', filters);
            alert('Filters applied (check console for details)');
        });
    }
    
    // Property Favorite Functionality
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
    
    // Pagination
    const pageBtns = document.querySelectorAll('.page-btn');
    
    pageBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            pageBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
});