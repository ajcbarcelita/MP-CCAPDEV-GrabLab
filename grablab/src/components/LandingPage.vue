<template>
    <div id="app-bg">
        <!-- Navbar -->
        <div id="navbar">
            <span id="navbar-brand">GrabLab</span>
            <router-link id="login-register" to="/student">Login/Register</router-link>
        </div>

        <!-- Hero Section -->
        <section id="hero-section">
            <h1 id="hero-title">Reserve Lab Rooms<br />Effortlessly</h1>
            <p id="hero-description">
                Streamline your laboratory Reservations with our modern booking system. Available
                from 7am on wards with real-time availability tracking.
            </p>
            <a href="#" id="hero-cta">
                Browse Lab Rooms
                <img src="/src/assets/right_arrow.png" alt="arrow" class="hero-arrow" />
            </a>
        </section>

        <!-- Why Choose Section -->
        <section id="why-choose-section">
            <h2 id="why-choose-title">Why Chose GrabLab?</h2>
            <div id="why-choose-cards">
                <!-- Card 1 -->
                <div class="why-card">
                    <div class="why-card-icon">
                        <img src="/src/assets/Calendar.png" alt="Early Booking" class="why-card-svg" />
                    </div>
                    <h3 class="why-card-title">Early Booking</h3>
                    <p class="why-card-desc">
                        Reserve lab rooms with our intuitive calendar interface
                    </p>
                </div>
                <!-- Card 2 -->
                <div class="why-card">
                    <div class="why-card-icon">
                        <img
                            src="/src/assets/Clock.png"
                            alt="Real-time Availability"
                            class="why-card-svg"
                        />
                    </div>
                    <h3 class="why-card-title">Real-time Availability</h3>
                    <p class="why-card-desc">See Available Slots from 7 AM onwards instantly</p>
                </div>
                <!-- Card 3 -->
                <div class="why-card">
                    <div class="why-card-icon">
                        <img
                            src="/src/assets/multiuser.png"
                            alt="Multi-user Support"
                            class="why-card-svg"
                        />
                    </div>
                    <h3 class="why-card-title">Multi-user Support</h3>
                    <p class="why-card-desc">
                        Student and Technician roles with appropriate permissions
                    </p>
                </div>
            </div>
        </section>

        <!-- Latest Reviews -->
        <section id="reviews-section">
            <h2 id="reviews-title">Latest Reviews</h2>
            <div id="reviews-list">
                <!-- Review Card 1 -->
                <div class="review-card">
                    <div class="review-meta">
                        <div class="review-author">Aaron</div>
                        <div class="review-date">13/06/2025</div>
                    </div>
                    <h3 class="review-title">Lab Booking Made Simple</h3>
                    <p class="review-body">
                       GrabLab takes the hassle out of reserving lab space. It's fast, reliable, and super easy to use.
                    </p>
                </div>
                <!-- Review Card 2 -->
                <div class="review-card">
                    <div class="review-meta">
                        <div class="review-author">Josh</div>
                        <div class="review-date">14/06/2025</div>
                    </div>
                    <h3 class="review-title">Finally, No More Double Bookings</h3>
                    <p class="review-body">I love how I can see real-time availability and avoid schedule conflicts. GrabLab is a lifesaver during thesis season!</p>
                </div>
                <!-- Review Card 3 -->
                <div class="review-card">
                    <div class="review-meta">
                        <div class="review-author">John</div>
                        <div class="review-date">15/06/2025</div>
                    </div>
                    <h3 class="review-title">Good UX</h3>
                    <p class="review-body">The user experience is top-notch. Everything is intuitive and easy to find.</p>
                </div>
            </div>
        </section>

        <!-- Footer -->
        <footer id="footer">Basta Footer Toh</footer>
    </div>
</template>

<script>
export default {
    name: 'LandingPage'
}
</script>
