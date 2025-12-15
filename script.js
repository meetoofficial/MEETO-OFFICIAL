<!-- JavaScript -->
    <script src="script.js"></script>
</body>
</html> and my scripts js is // Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getFirestore, collection, getDocs, getCountFromServer, onSnapshot, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-analytics.js";

const firebaseConfig = {
    apiKey: "AIzaSyAOwk37TCbc_loEb-LFXLK3qWQBdOaaqlU",
    authDomain: "meeto-website.firebaseapp.com",
    projectId: "meeto-website",
    storageBucket: "meeto-website.firebasestorage.app",
    messagingSenderId: "950489624932",
    appId: "1:950489624932:web:65f005771901f763e64a71",
    measurementId: "G-TVM3G555P5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Real-time counters
let travelersCount = 0;
let adventuresCount = 0;

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.createElement('div');
mobileMenu.className = 'mobile-menu';

// Create mobile menu content
mobileMenu.innerHTML = `
    <ul>
        <li><a href="#home">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#how-it-works">How It Works</a></li>
        <li><a href="#testimonials">Stories</a></li>
        <li><a href="#team">Team</a></li>
        <li><a href="#contact">Contact</a></li>
        <li><a href="app.html" class="btn btn-primary">Launch App</a></li>
    </ul>
`;

document.body.appendChild(mobileMenu);

menuToggle.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    menuToggle.innerHTML = mobileMenu.classList.contains('active') 
        ? '<i class="fas fa-times"></i>' 
        : '<i class="fas fa-bars"></i>';
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!menuToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    }
});

// Close mobile menu when clicking links
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        mobileMenu.classList.remove('active');
        menuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Initialize real-time counters
async function initializeCounters() {
    try {
        // Get travelers count (users collection)
        const travelersRef = collection(db, 'users');
        const travelersSnapshot = await getCountFromServer(travelersRef);
        travelersCount = travelersSnapshot.data().count;
        
        // Get adventures count
        const adventuresRef = collection(db, 'adventures');
        const adventuresSnapshot = await getCountFromServer(adventuresRef);
        adventuresCount = adventuresSnapshot.data().count;
        
        // Update UI
        updateCountersUI();
        
        // Listen for real-time updates
        setupRealTimeListeners();
        
    } catch (error) {
        console.error('Error initializing counters:', error);
        // Set default values if Firebase not set up
        travelersCount = 15600;
        adventuresCount = 8500;
        updateCountersUI();
    }
}

function updateCountersUI() {
    const statElements = document.querySelectorAll('.stat h3');
    if (statElements.length >= 2) {
        // Adventures Created
        animateCounter(statElements[0], adventuresCount);
        // Travelers Connected
        animateCounter(statElements[1], travelersCount);
        // Countries (static for now)
        statElements[2].textContent = '120+';
    }
}

function animateCounter(element, target) {
    const increment = target / 50;
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + '+';
    }, 30);
}

function setupRealTimeListeners() {
    // Real-time travelers count
    onSnapshot(collection(db, 'users'), (snapshot) => {
        travelersCount = snapshot.size;
        const statElements = document.querySelectorAll('.stat h3');
        if (statElements[1]) {
            statElements[1].textContent = travelersCount + '+';
        }
    });
    
    // Real-time adventures count
    onSnapshot(collection(db, 'adventures'), (snapshot) => {
        adventuresCount = snapshot.size;
        const statElements = document.querySelectorAll('.stat h3');
        if (statElements[0]) {
            statElements[0].textContent = adventuresCount + '+';
        }
    });
}

// Testimonials system
async function loadTestimonials() {
    try {
        const testimonialsRef = collection(db, 'testimonials');
        const querySnapshot = await getDocs(testimonialsRef);
        
        const testimonialsGrid = document.querySelector('.testimonials-grid');
        if (!testimonialsGrid || querySnapshot.empty) return;
        
        testimonialsGrid.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const testimonialHTML = `
                <div class="testimonial-card">
                    <div class="testimonial-content">
                        <p>"${data.message}"</p>
                    </div>
                    <div class="testimonial-author">
                        <img src="${data.photoURL || 'https://randomuser.me/api/portraits/lego/1.jpg'}" alt="${data.name}">
                        <div>
                            <h4>${data.name}</h4>
                            <p>${data.role || 'Traveler'} • ${data.location || 'Global'}</p>
                        </div>
                    </div>
                </div>
            `;
            testimonialsGrid.innerHTML += testimonialHTML;
        });
        
    } catch (error) {
        console.error('Error loading testimonials:', error);
    }
}

// Contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = contactForm.querySelector('#contactName').value;
        const email = contactForm.querySelector('#contactEmail').value;
        const message = contactForm.querySelector('#contactMessage').value;
        
        try {
            await addDoc(collection(db, 'contactMessages'), {
                name: name,
                email: email,
                message: message,
                timestamp: serverTimestamp(),
                read: false
            });
            
            alert('Thank you for your message! We will get back to you soon.');
            contactForm.reset();
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Error sending message. Please try again.');
        }
    });
}

// Video demo functionality
function setupVideoDemo() {
    const videoPlaceholder = document.querySelector('.video-placeholder');
    if (!videoPlaceholder) return;
    
    videoPlaceholder.addEventListener('click', async () => {
        // Create modal for video
        const modalHTML = `
            <div class="video-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center;">
                <div style="position: relative; width: 90%; max-width: 1000px;">
                    <button class="close-modal" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 24px; cursor: pointer;">✕</button>
                    <div style="position: relative; padding-bottom: 56.25%;">
                        <iframe width="100%" height="100%" style="position: absolute; top: 0; left: 0; border: none;" 
                                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
                                title="MEETO Demo" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Close modal
        const modal = document.querySelector('.video-modal');
        const closeBtn = modal.querySelector('.close-modal');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });
}

// Interactive demo functionality
function setupInteractiveDemo() {
    const interactiveDemoBtn = document.querySelector('a[href="app.html"] .fa-magic');
    if (!interactiveDemoBtn) return;
    
    const parentLink = interactiveDemoBtn.closest('a');
    parentLink.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Track demo click in analytics
        analytics.logEvent('demo_button_clicked');
        
        // Show interactive demo modal
        const modalHTML = `
            <div class="interactive-demo-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;">
                <div style="background: white; border-radius: 20px; padding: 40px; max-width: 800px; width: 100%; position: relative;">
                    <button class="close-demo-modal" style="position: absolute; top: 20px; right: 20px; background: none; border: none; font-size: 24px; cursor: pointer;">✕</button>
                    <h2 style="color: var(--primary); margin-bottom: 20px;">Interactive Demo</h2>
                    <p style="margin-bottom: 30px;">Experience how MEETO makes planning easy:</p>
                    
                    <div class="demo-steps" style="display: grid; gap: 20px; margin-bottom: 40px;">
                        <div class="demo-step" style="padding: 20px; border: 2px solid var(--primary); border-radius: 10px; cursor: pointer;" onclick="this.style.background='#f8f9ff'">
                            <h3 style="color: var(--primary);">1. Choose Your Mood</h3>
                            <p>Select: Chill, Foodie, Wellness, Study, or Explorer</p>
                        </div>
                        <div class="demo-step" style="padding: 20px; border: 2px solid var(--primary-light); border-radius: 10px; cursor: pointer;" onclick="this.style.background='#f8f9ff'">
                            <h3 style="color: var(--primary);">2. Pick Date & Time</h3>
                            <p>Choose when you want to adventure</p>
                        </div>
                        <div class="demo-step" style="padding: 20px; border: 2px solid var(--primary-light); border-radius: 10px; cursor: pointer;" onclick="this.style.background='#f8f9ff'">
                            <h3 style="color: var(--primary);">3. Invite Friends</h3>
                            <p>Select friends from your network</p>
                        </div>
                        <div class="demo-step" style="padding: 20px; border: 2px solid var(--primary-light); border-radius: 10px; cursor: pointer;" onclick="this.style.background='#f8f9ff'">
                            <h3 style="color: var(--primary);">4. Vote on Options</h3>
                            <p>Democratic decision-making with AI suggestions</p>
                        </div>
                    </div>
                    
                    <button onclick="window.location.href='app.html'" style="background: var(--gradient-primary); color: white; border: none; padding: 15px 30px; border-radius: 50px; font-weight: bold; cursor: pointer; font-size: 16px;">
                        Try Full App Experience
                    </button>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Close modal
        const modal = document.querySelector('.interactive-demo-modal');
        const closeBtn = modal.querySelector('.close-demo-modal');
        
        closeBtn.addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });
}

// Social media links
function setupSocialLinks() {
    const socialLinks = {
        twitter: 'https://twitter.com/meeto',
        instagram: 'https://instagram.com/meeto',
        facebook: 'https://facebook.com/meeto',
        linkedin: 'https://linkedin.com/company/meeto',
        youtube: 'https://youtube.com/meeto'
    };
    
    document.querySelectorAll('.social-links a').forEach(link => {
        const platform = link.querySelector('i').className.split('fa-')[1].split(' ')[0];
        if (socialLinks[platform]) {
            link.href = socialLinks[platform];
            link.target = '_blank';
        }
    });
}

// Blog system (simplified)
async function loadBlogPosts() {
    try {
        const blogRef = collection(db, 'blogPosts');
        const querySnapshot = await getDocs(blogRef);
        
        if (querySnapshot.empty) return;
        
        // You can implement a blog page later
        console.log('Blog posts loaded:', querySnapshot.size);
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
    }
}



// 2. LinkedIn link - Update setupSocialLinks function
// Replace the existing setupSocialLinks function with this updated version
function setupSocialLinks() {
    const socialLinks = {
        
        instagram: 'https://www.instagram.com/m_eet_o/',
       
        linkedin: 'www.linkedin.com/in/meeto-company', // Add your actual LinkedIn URL here
       
    };
    
    document.querySelectorAll('.social-links a').forEach(link => {
        const icon = link.querySelector('i');
        if (icon) {
            const classNames = icon.className.split(' ');
            const platformClass = classNames.find(cls => cls.startsWith('fa-'));
            if (platformClass) {
                const platform = platformClass.replace('fa-', '');
                if (socialLinks[platform]) {
                    link.href = socialLinks[platform];
                    link.target = '_blank';
                    link.rel = 'noopener noreferrer';
                }
            }
        }
    });
}

// Email functionality for Help Center and Contact Us
function setupEmailLinks() {
    console.log('Setting up email links...');
    
    // Help Center -> opens email to meetoassist@gmail.com
    const helpCenterLink = document.getElementById('helpCenter');
    if (helpCenterLink) {
        console.log('Help Center link found');
        helpCenterLink.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent("MEETO Help Center Support");
            const body = encodeURIComponent("Hello MEETO Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nThank you!");
            window.location.href = `mailto:meetoassist@gmail.com?subject=${subject}&body=${body}`;
        });
    } else {
        console.error('Help Center link element not found!');
    }
    
    // Contact Us -> opens email to meeto.official@gmail.com
    const contactUsLink = document.getElementById('contactUs');
    if (contactUsLink) {
        console.log('Contact Us link found');
        contactUsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent("MEETO Contact Inquiry");
            const body = encodeURIComponent("Hello MEETO Team,\n\nI'd like to get in touch about:\n\n[Please describe your inquiry here]\n\nBest regards,");
            window.location.href = `mailto:meeto.official@gmail.com?subject=${subject}&body=${body}`;
        });
    } else {
        console.error('Contact Us link element not found!');
    }
}

// Make sure this function is called when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, setting up email links...');
    setupEmailLinks();
});
    
    // Questions? -> scrolls to FAQ section (you'll need to add this section)
    // For now, let's make it open a general contact email
    const questionsLink = document.getElementById('questionsLink');
    if (questionsLink) {
        questionsLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Option 1: Open email
            window.location.href = 'mailto:meeto.official@gmail.com?subject=Question about MEETO';
            
            // Option 2: If you want to create a FAQ section later:
            // const faqSection = document.getElementById('faq');
            // if (faqSection) {
            //     faqSection.scrollIntoView({ behavior: 'smooth' });
            // } else {
            //     window.location.href = 'mailto:meeto.official@gmail.com?subject=Question about MEETO';
            // }
        });
    }
}

// 4. Launch App button functionality
const launchAppBtn = document.getElementById('launchAppBtn');
if (launchAppBtn) {
    launchAppBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Track analytics event
        if (typeof analytics !== 'undefined') {
            analytics.logEvent('launch_app_clicked');
        }
        // Redirect to app page or show interactive demo
        window.location.href = 'app.html';
    });
}
// Initialize everything when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Firebase counters
    initializeCounters();
    
    // Load testimonials from Firebase
    loadTestimonials();
    
    // Setup video demo
    setupVideoDemo();
    
    // Setup interactive demo
    setupInteractiveDemo();
    
    // Setup social links
    setupSocialLinks();
    
    // Setup contact form
    setupContactForm();
    
    // Load blog posts
    loadBlogPosts();

    // Setup email links (NEW)
    setupEmailLinks();

    // In your DOMContentLoaded event listener, add:
    setupWaitlistForm();
    
    // Update footer year
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.boxShadow = 'var(--shadow-lg)';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });

// ========== WAITLIST MODAL FUNCTIONS ==========
// Make sure these are available globally
window.openCustomWaitlistForm = function() {
    console.log('Opening waitlist modal...');
    const modal = document.getElementById('custom-waitlist-modal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const form = document.getElementById('custom-waitlist-form');
        const success = document.getElementById('custom-success');
        if (form) {
            form.reset();
            form.style.display = 'block';
        }
        if (success) success.style.display = 'none';
        
        // Animate progress bar
        setTimeout(() => {
            const progress = document.getElementById('step-progress');
            if (progress) progress.style.width = '33%';
        }, 300);
    } else {
        console.error('Waitlist modal not found!');
    }
};

window.closeCustomWaitlistForm = function() {
    const modal = document.getElementById('custom-waitlist-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Reset progress
        const progress = document.getElementById('step-progress');
        if (progress) progress.style.width = '0%';
    }
};

window.submitCustomForm = async function() {
    const name = document.getElementById('custom-name')?.value.trim();
    const email = document.getElementById('custom-email')?.value.trim();
    const wantsUpdates = document.getElementById('custom-updates')?.checked;
    
    // Validation
    if (!name) {
        alert('Please enter your name');
        return;
    }
    
    if (!email) {
        alert('Please enter your email');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    const submitBtn = document.querySelector('#custom-waitlist-form button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
    submitBtn.disabled = true;
    
    try {
        // Submit to Google Sheets via Google Form
        const formData = new FormData();
        formData.append('entry.1138680293', name); // Name field
        formData.append('entry.1897401214', email); // Email field
        formData.append('entry.1331061618', wantsUpdates ? 'Yes, please!' : 'No, thanks');
        
        // Submit to Google Form
        await fetch('https://docs.google.com/forms/d/e/1FAIpQLSfhpo8u5bcrsetcRkY5xF2aqx6TVV1xcPNttZWyXKVmOUfuzg/formResponse', {
            method: 'POST',
            mode: 'no-cors',
            body: formData
        });
        
        // Show success
        setTimeout(() => {
            const progress = document.getElementById('step-progress');
            if (progress) progress.style.width = '100%';
            
            const form = document.getElementById('custom-waitlist-form');
            const success = document.getElementById('custom-success');
            if (form) form.style.display = 'none';
            if (success) success.style.display = 'block';
            
            // Trigger confetti
            triggerConfetti();
        }, 1000);
        
    } catch (error) {
        console.log('Form submitted (no-cors mode)');
        // Still show success
        const form = document.getElementById('custom-waitlist-form');
        const success = document.getElementById('custom-success');
        if (form) form.style.display = 'none';
        if (success) success.style.display = 'block';
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
};

function triggerConfetti() {
    const colors = ['#667eea', '#764ba2', '#6B46C1', '#553C9A'];
    
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.zIndex = '10001';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.opacity = '0.8';
        
        document.body.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${360}deg)`, opacity: 0 }
        ], {
            duration: 2000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// ========== CARD FLIP FUNCTIONALITY ==========
function setupCardFlips() {
    const cards = document.querySelectorAll('.story-interactive-card');
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't flip if clicking on button inside back
            if (e.target.closest('button') || e.target.tagName === 'BUTTON') {
                return;
            }
            
            this.classList.toggle('flipped');
        });
    });
}

// ========== EMAIL LINKS ==========
function setupEmailLinks() {
    // Help Center -> opens email to meetoassist@gmail.com
    const helpCenterLink = document.getElementById('helpCenter');
    if (helpCenterLink) {
        helpCenterLink.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent("MEETO Help Center Support Request");
            const body = encodeURIComponent("Hello MEETO Support Team,\n\nI need help with:\n\n[Please describe your issue here]\n\nThank you!");
            window.location.href = `mailto:meetoassist@gmail.com?subject=${subject}&body=${body}`;
        });
    }
    
    // Contact Us -> opens email to meeto.official@gmail.com
    const contactUsLink = document.getElementById('contactUs');
    if (contactUsLink) {
        contactUsLink.addEventListener('click', (e) => {
            e.preventDefault();
            const subject = encodeURIComponent("MEETO Contact Inquiry");
            const body = encodeURIComponent("Hello MEETO Team,\n\nI'd like to get in touch about:\n\n[Please describe your inquiry here]\n\nBest regards,");
            window.location.href = `mailto:meeto.official@gmail.com?subject=${subject}&body=${body}`;
        });
    }
}

// ========== INITIALIZE EVERYTHING ==========
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing waitlist functionality...');
    
    // Your existing initialization code...
    initializeCounters();
    loadTestimonials();
    setupVideoDemo();
    setupInteractiveDemo();
    setupSocialLinks();
    setupContactForm();
    loadBlogPosts();
    setupEmailLinks();
    
    // New functionality
    setupCardFlips();
    
    // Setup button listeners
    const joinWaitlistBtn = document.getElementById('join-waitlist-btn');
    if (joinWaitlistBtn) {
        joinWaitlistBtn.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('Join Waitlist button clicked');
            openCustomWaitlistForm();
        });
    }
    
    // Also handle any other waitlist buttons
    document.querySelectorAll('[onclick*="openCustomWaitlistForm"]').forEach(element => {
        element.addEventListener('click', (e) => {
            e.preventDefault();
            openCustomWaitlistForm();
        });
    });
    
    // Setup modal close on outside click
    const modal = document.getElementById('custom-waitlist-modal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeCustomWaitlistForm();
            }
        });
        
        // Close with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.style.display === 'flex') {
                closeCustomWaitlistForm();
            }
        });
    }
    
    // Update footer year
    const yearSpan = document.querySelector('.current-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }
    
    // Add scroll effect to header
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.boxShadow = 'var(--shadow-lg)';
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.boxShadow = 'var(--shadow-sm)';
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
    
    console.log('Waitlist functions available:', {
        openCustomWaitlistForm: typeof openCustomWaitlistForm,
        closeCustomWaitlistForm: typeof closeCustomWaitlistForm,
        submitCustomForm: typeof submitCustomForm
    });
});

// Make functions globally available
window.openCustomWaitlistForm = openCustomWaitlistForm;
window.closeCustomWaitlistForm = closeCustomWaitlistForm;
window.submitCustomForm = submitCustomForm;



    // Minimalist Waitlist Functions
function openMinimalWaitlist() {
    const modal = document.getElementById('minimalWaitlistModal');
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form
        const form = document.getElementById('minimalWaitlistForm');
        const success = document.getElementById('waitlistSuccess');
        if (form) {
            form.reset();
            form.style.display = 'block';
        }
        if (success) success.style.display = 'none';
    }
}

function closeMinimalWaitlist() {
    const modal = document.getElementById('minimalWaitlistModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

async function submitMinimalWaitlist() {
    const name = document.getElementById('waitlistName').value.trim();
    const email = document.getElementById('waitlistEmail').value.trim();
    
    // Validation
    if (!name) {
        alert('Please enter your name');
        return false;
    }
    
    if (!email) {
        alert('Please enter your email');
        return false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address');
        return false;
    }
    
    // Show loading state
    const submitBtn = document.getElementById('submitWaitlistBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    if (btnText && btnLoading) {
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline';
        submitBtn.disabled = true;
    }
    
    try {
        // SAVE TO FIREBASE - THIS IS THE REAL CODE
        console.log('Saving to Firebase...');
        
        // Import Firebase inside the function
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js");
        const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js");
        
        const firebaseConfig = {
            apiKey: "AIzaSyAOwk37TCbc_loEb-LFXLK3qWQBdOaaqlU",
            authDomain: "meeto-website.firebaseapp.com",
            projectId: "meeto-website",
            storageBucket: "meeto-website.firebasestorage.app",
            messagingSenderId: "950489624932",
            appId: "1:950489624932:web:65f005771901f763e64a71",
            measurementId: "G-TVM3G555P5"
        };
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        // Save to Firebase
        const docRef = await addDoc(collection(db, 'waitlist'), {
            name: name,
            email: email,
            timestamp: serverTimestamp(),
            source: 'website',
            notified: false
        });
        
        console.log('SUCCESS: Document written with ID: ', docRef.id);
        
        // Show success message
        const form = document.getElementById('minimalWaitlistForm');
        const success = document.getElementById('waitlistSuccess');
        
        if (form) form.style.display = 'none';
        if (success) success.style.display = 'block';
        
        // Simple confetti
        triggerSimpleConfetti();
        
    } catch (error) {
        console.error('Error saving to waitlist:', error);
        alert('Error saving. Please try again. Error: ' + error.message);
    } finally {
        // Reset button state
        const submitBtn = document.getElementById('submitWaitlistBtn');
        const btnText = submitBtn?.querySelector('.btn-text');
        const btnLoading = submitBtn?.querySelector('.btn-loading');
        
        if (btnText && btnLoading) {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.disabled = false;
        }
    }
    
    return false;
}

function triggerWaitlistConfetti() {
    // Simple confetti effect
    const colors = ['#667eea', '#764ba2', '#6B46C1'];
    
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '8px';
            confetti.style.height = '8px';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.borderRadius = '50%';
            confetti.style.zIndex = '10001';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10px';
            confetti.style.opacity = '0.8';
            
            document.body.appendChild(confetti);
            
            const animation = confetti.animate([
                { transform: 'translateY(0) rotate(0deg)', opacity: 0.8 },
                { transform: `translateY(${window.innerHeight + 50}px) rotate(${360}deg)`, opacity: 0 }
            ], {
                duration: 1500 + Math.random() * 1000,
                easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
            });
            
            animation.onfinish = () => confetti.remove();
        }, i * 100);
    }
}
// Video Play Functionality
document.addEventListener('DOMContentLoaded', function() {
    const videoPlaceholder = document.getElementById('videoPlaceholder');
    const demoVideo = document.getElementById('demoVideo');
    
    if (videoPlaceholder && demoVideo) {
        // When clicking the placeholder
        videoPlaceholder.addEventListener('click', function() {
            // Hide the placeholder
            this.style.display = 'none';
            
            // Show the video player
            demoVideo.style.display = 'block';
            
            // Start playing the video
            demoVideo.play().catch(function(error) {
                console.log('Video play failed:', error);
                // If autoplay fails, show controls and let user click play
                demoVideo.controls = true;
            });
        });
        
        // Optional: Show placeholder again when video ends
        demoVideo.addEventListener('ended', function() {
            videoPlaceholder.style.display = 'flex';
            this.style.display = 'none';
        });
        
        // Optional: Pause handling
        demoVideo.addEventListener('pause', function() {
            // You could add a custom pause overlay if needed
        });
    }
});
function viewWaitlistDashboard() {
    // This would open an admin panel to view waitlist members
    // For now, let's just show a message
    closeMinimalWaitlist();
    alert('Admin dashboard coming soon! Currently collecting waitlist data in Firebase.');
    
    // You could implement this later:
    // window.open('/admin/waitlist-dashboard.html', '_blank');
}

// Setup form submission
function setupWaitlistForm() {
const form = document.getElementById('minimalWaitlistForm');
if (form) {
   form.addEventListener('submit', function(e) {
    e.preventDefault();
    submitMinimalWaitlist();
});
}
    
    // Update existing "Join Waitlist" button to use new modal
    const joinWaitlistBtn = document.getElementById('join-waitlist-btn');
    if (joinWaitlistBtn) {
        joinWaitlistBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openMinimalWaitlist();
        });
    }
    
    // Close modal on outside click
    const modal = document.getElementById('minimalWaitlistModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeMinimalWaitlist();
            }
        });
    }
    
    // Close with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modal = document.getElementById('minimalWaitlistModal');
            if (modal && modal.style.display === 'flex') {
                closeMinimalWaitlist();
            }
        }
    });
}

// Make functions globally available
window.openMinimalWaitlist = openMinimalWaitlist;
window.closeMinimalWaitlist = closeMinimalWaitlist;
window.submitMinimalWaitlist = submitMinimalWaitlist;
window.viewWaitlistDashboard = viewWaitlistDashboard;
