document.addEventListener('DOMContentLoaded', function() {
    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            // Here you would normally send the data to a server
            console.log('Form submitted:', data);
            
            // Show success message
            alert('Thank you for your message! We will contact you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }
    
    // Social Media Links
    const socialLinks = document.querySelectorAll('.social-links a');
    
    socialLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            alert('Social media link would open in a new tab');
        });
    });
});