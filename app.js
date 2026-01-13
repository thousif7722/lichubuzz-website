// Main Application File
const API_BASE_URL = 'http://localhost:5000/api';

// State
let currentUser = null;
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let products = [];

// DOM Elements
const mainContent = document.getElementById('main-content');

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
    setupEventListeners();
    handleRouting();
    loadPage(window.location.hash || '#/');
    updateCartCount();
});

// Check authentication status
async function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/profile`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.ok) {
                const user = await response.json();
                currentUser = user;
                updateAuthUI();
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        }
    }
}

// Setup event listeners
function setupEventListeners() {
    // Navigation links
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link') || e.target.closest('.nav-link')) {
            e.preventDefault();
            const link = e.target.closest('.nav-link');
            const page = link.getAttribute('data-page');
            navigateTo(page);
        }
    });
    
    // Mobile menu
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.innerHTML = nav.classList.contains('active') 
                ? '<i class="fas fa-times"></i>' 
                : '<i class="fas fa-bars"></i>';
        });
    }
    
    // Cart icon
    const cartIcon = document.getElementById('cart-icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('cart');
        });
    }
}

// Handle routing
function handleRouting() {
    window.addEventListener('hashchange', () => {
        loadPage(window.location.hash);
    });
}

// Load page based on route
async function loadPage(hash) {
    const page = hash.substring(2) || 'home';
    
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === page) {
            link.classList.add('active');
        }
    });
    
    // Close mobile menu
    const nav = document.querySelector('nav');
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (nav && nav.classList.contains('active')) {
        nav.classList.remove('active');
        if (mobileMenuBtn) {
            mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
        }
    }
    
    // Load page content
    switch(page) {
        case 'home':
            await loadHomePage();
            break;
        case 'products':
            await loadProductsPage();
            break;
        case 'cart':
            await loadCartPage();
            break;
        case 'login':
            loadLoginPage();
            break;
        case 'register':
            loadRegisterPage();
            break;
        case 'admin':
            await loadAdminPage();
            break;
        case 'about':
            loadAboutPage();
            break;
        case 'contact':
            loadContactPage();
            break;
        default:
            await loadHomePage();
    }
}

// Navigation function
function navigateTo(page) {
    window.location.hash = `#/${page}`;
}

// Load home page
async function loadHomePage() {
    try {
        const response = await fetch(`${API_BASE_URL}/products?limit=4`);
        const featuredProducts = await response.json();
        
        mainContent.innerHTML = `
            <section class="hero">
                <div class="container">
                    <h1>WALKING WITH PURPOSE.</h1>
                    <p>Premium Vegan Sneakers</p>
                    <a href="#/products" class="btn">Shop Now</a>
                </div>
            </section>
            
            <section class="products-section">
                <div class="container">
                    <div class="section-header">
                        <h2>OUR BEST SELLERS</h2>
                    </div>
                    <div class="products-grid" id="featured-products">
                        ${featuredProducts.map(product => `
                            <div class="product-card">
                                ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                                <div class="product-img">
                                    <img src="${product.image}" alt="${product.name}">
                                </div>
                                <div class="product-info">
                                    <h3 class="product-title">${product.name}</h3>
                                    <div class="product-price">
                                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                                        $${product.price}
                                    </div>
                                    <button class="add-to-cart" data-id="${product._id}">
                                        <i class="fas fa-shopping-cart"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <div class="text-center">
                        <a href="#/products" class="btn btn-outline">VIEW ALL</a>
                    </div>
                </div>
            </section>
        `;
        
        // Add event listeners to add-to-cart buttons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCartFromButton);
        });
        
    } catch (error) {
        console.error('Error loading home page:', error);
        mainContent.innerHTML = '<div class="container"><p>Error loading products. Please try again later.</p></div>';
    }
}

// Load products page
async function loadProductsPage() {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        products = await response.json();
        
        mainContent.innerHTML = `
            <section class="products-section">
                <div class="container">
                    <div class="section-header">
                        <h2>All Products</h2>
                    </div>
                    <div class="products-filter">
                        <button class="filter-btn active" data-filter="all">All</button>
                        <button class="filter-btn" data-filter="men">Men</button>
                        <button class="filter-btn" data-filter="women">Women</button>
                        <button class="filter-btn" data-filter="unisex">Unisex</button>
                    </div>
                    <div class="products-grid" id="products-grid">
                        ${products.map(product => `
                            <div class="product-card" data-category="${product.category}">
                                ${product.badge ? `<span class="badge">${product.badge}</span>` : ''}
                                <div class="product-img">
                                    <img src="${product.image}" alt="${product.name}">
                                </div>
                                <div class="product-info">
                                    <h3 class="product-title">${product.name}</h3>
                                    <div class="product-price">
                                        ${product.oldPrice ? `<span class="old-price">$${product.oldPrice}</span>` : ''}
                                        $${product.price}
                                    </div>
                                    <button class="add-to-cart" data-id="${product._id}">
                                        <i class="fas fa-shopping-cart"></i> Add to Cart
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        `;
        
        // Add event listeners
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', addToCartFromButton);
        });
        
        document.querySelectorAll('.filter-btn').forEach(button => {
            button.addEventListener('click', filterProducts);
        });
        
    } catch (error) {
        console.error('Error loading products:', error);
        mainContent.innerHTML = '<div class="container"><p>Error loading products. Please try again later.</p></div>';
    }
}

// Filter products
function filterProducts(e) {
    const filter = e.target.dataset.filter;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Filter products
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Load cart page
async function loadCartPage() {
    mainContent.innerHTML = `
        <section class="cart-page">
            <div class="container">
                <h1>Your Shopping Cart</h1>
                ${cart.length === 0 ? 
                    '<p>Your cart is empty. <a href="#/products">Continue shopping</a></p>' : 
                    '<div class="cart-container" id="cart-container"></div>'
                }
            </div>
        </section>
    `;
    
    if (cart.length > 0) {
        await renderCart();
    }
}

// Load login page
function loadLoginPage() {
    mainContent.innerHTML = `
        <section class="auth-page">
            <div class="container">
                <div class="auth-container">
                    <h2>Login</h2>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <button type="submit" class="btn" style="width: 100%;">Login</button>
                    </form>
                    <p style="text-align: center; margin-top: 20px;">
                        Don't have an account? <a href="#/register">Register here</a>
                    </p>
                </div>
            </div>
        </section>
    `;
    
    document.getElementById('login-form').addEventListener('submit', handleLogin);
}

// Load register page
function loadRegisterPage() {
    mainContent.innerHTML = `
        <section class="auth-page">
            <div class="container">
                <div class="auth-container">
                    <h2>Register</h2>
                    <form id="register-form">
                        <div class="form-group">
                            <label for="name">Full Name</label>
                            <input type="text" id="name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email</label>
                            <input type="email" id="email" name="email" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Password</label>
                            <input type="password" id="password" name="password" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmPassword">Confirm Password</label>
                            <input type="password" id="confirmPassword" name="confirmPassword" required>
                        </div>
                        <button type="submit" class="btn" style="width: 100%;">Register</button>
                    </form>
                    <p style="text-align: center; margin-top: 20px;">
                        Already have an account? <a href="#/login">Login here</a>
                    </p>
                </div>
            </div>
        </section>
    `;
    
    document.getElementById('register-form').addEventListener('submit', handleRegister);
}

// Load about page
function loadAboutPage() {
    mainContent.innerHTML = `
        <section class="about-page">
            <div class="container">
                <h1>About QUENX</h1>
                <div class="about-content">
                    <p>QUENX is a premium vegan sneaker brand committed to sustainable fashion. 
                    We believe in walking with purpose - every step should be comfortable, stylish, and environmentally conscious.</p>
                    
                    <h2>Our Mission</h2>
                    <p>To create high-quality, stylish footwear that doesn't compromise on ethics or the environment.</p>
                    
                    <h2>Our Values</h2>
                    <ul>
                        <li>Sustainability: All our materials are vegan and eco-friendly</li>
                        <li>Quality: Premium craftsmanship for lasting comfort</li>
                        <li>Style: Modern designs for everyday wear</li>
                        <li>Ethics: Fair labor practices and transparent supply chain</li>
                    </ul>
                </div>
            </div>
        </section>
    `;
}

// Load contact page
function loadContactPage() {
    mainContent.innerHTML = `
        <section class="contact-page">
            <div class="container">
                <h1>Contact Us</h1>
                <div class="contact-container">
                    <div class="contact-info">
                        <h3>Get in Touch</h3>
                        <p><i class="fas fa-map-marker-alt"></i> 123 Fashion Street, Style City</p>
                        <p><i class="fas fa-phone"></i> +1 (234) 567-8900</p>
                        <p><i class="fas fa-envelope"></i> info@quenx.com</p>
                        
                        <h3>Business Hours</h3>
                        <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
                        <p>Saturday: 10:00 AM - 4:00 PM</p>
                        <p>Sunday: Closed</p>
                    </div>
                    <div class="contact-form">
                        <h3>Send us a Message</h3>
                        <form id="contact-form">
                            <div class="form-group">
                                <input type="text" placeholder="Your Name" required>
                            </div>
                            <div class="form-group">
                                <input type="email" placeholder="Your Email" required>
                            </div>
                            <div class="form-group">
                                <textarea placeholder="Your Message" rows="5" required></textarea>
                            </div>
                            <button type="submit" class="btn">Send Message</button>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    `;
}

// Update authentication UI
function updateAuthUI() {
    const loginLink = document.querySelector('a[data-page="login"]');
    if (currentUser) {
        loginLink.innerHTML = 'Logout';
        loginLink.setAttribute('data-page', 'logout');
        
        // Add admin link if user is admin
        if (currentUser.isAdmin) {
            const nav = document.querySelector('nav ul');
            if (!document.querySelector('a[data-page="admin"]')) {
                const adminLi = document.createElement('li');
                adminLi.innerHTML = '<a href="#/admin" class="nav-link" data-page="admin">Admin</a>';
                nav.appendChild(adminLi);
            }
        }
    } else {
        loginLink.innerHTML = 'Login';
        loginLink.setAttribute('data-page', 'login');
        
        // Remove admin link if exists
        const adminLink = document.querySelector('a[data-page="admin"]');
        if (adminLink) {
            adminLink.closest('li').remove();
        }
    }
}

// Update cart count
function updateCartCount() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(element => {
        element.textContent = totalItems;
        element.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Add to cart function
async function addToCartFromButton(e) {
    const productId = e.target.closest('.add-to-cart').dataset.id;
    
    try {
        const response = await fetch(`${API_BASE_URL}/products/${productId}`);
        const product = await response.json();
        
        addToCart(product);
        
        // Show feedback
        const button = e.target.closest('.add-to-cart');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Added!';
        button.style.backgroundColor = '#4CAF50';
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.backgroundColor = '';
        }, 1500);
        
    } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Error adding product to cart. Please try again.');
    }
}

// Add product to cart
function addToCart(product) {
    const existingItem = cart.find(item => item._id === product._id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    
    // If on cart page, refresh it
    if (window.location.hash === '#/cart') {
        loadCartPage();
    }
}

// Render cart
async function renderCart() {
    const cartContainer = document.getElementById('cart-container');
    
    if (!cartContainer) return;
    
    let subtotal = 0;
    
    cartContainer.innerHTML = `
        <div class="cart-items">
            ${cart.map(item => {
                const itemTotal = item.price * item.quantity;
                subtotal += itemTotal;
                
                return `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-info">
                            <div class="cart-item-title">${item.name}</div>
                            <div class="cart-item-price">$${item.price}</div>
                            <div class="quantity-control">
                                <button class="quantity-btn minus" data-id="${item._id}">-</button>
                                <span>${item.quantity}</span>
                                <button class="quantity-btn plus" data-id="${item._id}">+</button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            $${itemTotal.toFixed(2)}
                        </div>
                        <button class="cart-item-remove" data-id="${item._id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                `;
            }).join('')}
        </div>
        <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row">
                <span>Shipping</span>
                <span>${subtotal > 35 ? 'FREE' : '$5.00'}</span>
            </div>
            <div class="summary-row">
                <span>Tax</span>
                <span>$${(subtotal * 0.08).toFixed(2)}</span>
            </div>
            <div class="summary-row summary-total">
                <span>Total</span>
                <span>$${(subtotal + (subtotal > 35 ? 0 : 5) + (subtotal * 0.08)).toFixed(2)}</span>
            </div>
            <button class="btn" style="width: 100%; margin-top: 20px;" id="checkout-btn">
                Proceed to Checkout
            </button>
        </div>
    `;
    
    // Add event listeners
    document.querySelectorAll('.quantity-btn.minus').forEach(button => {
        button.addEventListener('click', updateQuantity);
    });
    
    document.querySelectorAll('.quantity-btn.plus').forEach(button => {
        button.addEventListener('click', updateQuantity);
    });
    
    document.querySelectorAll('.cart-item-remove').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
    
    document.getElementById('checkout-btn').addEventListener('click', proceedToCheckout);
}

// Update item quantity
function updateQuantity(e) {
    const productId = e.target.dataset.id;
    const isPlus = e.target.classList.contains('plus');
    
    const item = cart.find(item => item._id === productId);
    if (item) {
        if (isPlus) {
            item.quantity += 1;
        } else {
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cart = cart.filter(item => item._id !== productId);
            }
        }
    }
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Remove from cart
function removeFromCart(e) {
    const productId = e.target.closest('.cart-item-remove').dataset.id;
    cart = cart.filter(item => item._id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
}

// Proceed to checkout
function proceedToCheckout() {
    if (!currentUser) {
        alert('Please login to proceed with checkout.');
        navigateTo('login');
        return;
    }
    
    if (cart.length === 0) {
        alert('Your cart is empty.');
        return;
    }
    
    // In a real app, this would integrate with a payment gateway
    alert('Checkout functionality would be implemented here. This is a demo.');
}

// Export functions for other modules
window.app = {
    navigateTo,
    updateCartCount,
    addToCart,
    currentUser,
    API_BASE_URL
};