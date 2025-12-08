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
    
    // Animation observer
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.feature-card, .step, .testimonial-card, .team-member').forEach((el, index) => {
        el.classList.add(`delay-${(index % 3) + 1}`);
        observer.observe(el);
    });
});

// Export for global access (for demo steps)
window.meetoDemo = {
    selectMood: function(mood) {
        alert(`Selected mood: ${mood}. In real app, this would filter suggestions.`);
    },
    selectDate: function() {
        alert('Date picker would open here');
    },
    inviteFriends: function() {
        alert('Friend selector would open here');
    }
};
