// Admin functions
async function loadAdminPage() {
    if (!app.currentUser || !app.currentUser.isAdmin) {
        app.navigateTo('login');
        return;
    }
    
    try {
        const [productsRes, ordersRes] = await Promise.all([
            fetch(`${app.API_BASE_URL}/products`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }),
            fetch(`${app.API_BASE_URL}/orders`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            })
        ]);
        
        const products = await productsRes.json();
        const orders = await ordersRes.json();
        
        mainContent.innerHTML = `
            <section class="admin-page">
                <div class="container">
                    <div class="admin-container">
                        <div class="admin-sidebar">
                            <ul>
                                <li><a href="#/admin/dashboard" class="active" data-admin-tab="dashboard">Dashboard</a></li>
                                <li><a href="#/admin/products" data-admin-tab="products">Products</a></li>
                                <li><a href="#/admin/orders" data-admin-tab="orders">Orders</a></li>
                                <li><a href="#/admin/users" data-admin-tab="users">Users</a></li>
                            </ul>
                        </div>
                        <div class="admin-content" id="admin-content">
                            <h2>Admin Dashboard</h2>
                            <div class="dashboard-stats">
                                <div class="stat-card">
                                    <h3>${products.length}</h3>
                                    <p>Total Products</p>
                                </div>
                                <div class="stat-card">
                                    <h3>${orders.length}</h3>
                                    <p>Total Orders</p>
                                </div>
                                <div class="stat-card">
                                    <h3>$${orders.reduce((total, order) => total + order.totalAmount, 0).toFixed(2)}</h3>
                                    <p>Total Revenue</p>
                                </div>
                            </div>
                            
                            <div class="admin-tab" id="products-tab" style="display: none;">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                                    <h3>Products</h3>
                                    <button class="btn" id="add-product-btn">Add Product</button>
                                </div>
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Image</th>
                                            <th>Name</th>
                                            <th>Price</th>
                                            <th>Stock</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${products.map(product => `
                                            <tr>
                                                <td><img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover;"></td>
                                                <td>${product.name}</td>
                                                <td>$${product.price}</td>
                                                <td>${product.countInStock}</td>
                                                <td>
                                                    <button class="btn btn-sm edit-product" data-id="${product._id}">Edit</button>
                                                    <button class="btn btn-sm btn-danger delete-product" data-id="${product._id}">Delete</button>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            <div class="admin-tab" id="orders-tab" style="display: none;">
                                <h3>Orders</h3>
                                <table class="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Order ID</th>
                                            <th>Customer</th>
                                            <th>Total</th>
                                            <th>Status</th>
                                            <th>Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${orders.map(order => `
                                            <tr>
                                                <td>${order._id.slice(-8)}</td>
                                                <td>${order.user.name}</td>
                                                <td>$${order.totalAmount}</td>
                                                <td>${order.status}</td>
                                                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
        
        // Add event listeners for admin tabs
        document.querySelectorAll('[data-admin-tab]').forEach(tab => {
            tab.addEventListener('click', showAdminTab);
        });
        
        document.getElementById('add-product-btn')?.addEventListener('click', showAddProductForm);
        document.querySelectorAll('.edit-product').forEach(btn => {
            btn.addEventListener('click', editProduct);
        });
        document.querySelectorAll('.delete-product').forEach(btn => {
            btn.addEventListener('click', deleteProduct);
        });
        
    } catch (error) {
        console.error('Error loading admin page:', error);
        mainContent.innerHTML = '<div class="container"><p>Error loading admin page. Please try again.</p></div>';
    }
}

function showAdminTab(e) {
    e.preventDefault();
    
    const tab = e.target.dataset.adminTab;
    
    // Update active tab
    document.querySelectorAll('[data-admin-tab]').forEach(t => {
        t.classList.remove('active');
    });
    e.target.classList.add('active');
    
    // Show selected tab content
    document.querySelectorAll('.admin-tab').forEach(t => {
        t.style.display = 'none';
    });
    
    document.getElementById(`${tab}-tab`).style.display = 'block';
}

function showAddProductForm() {
    mainContent.innerHTML = `
        <section class="auth-page">
            <div class="container">
                <div class="auth-container">
                    <h2>Add New Product</h2>
                    <form id="add-product-form">
                        <div class="form-group">
                            <label for="product-name">Product Name</label>
                            <input type="text" id="product-name" name="name" required>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Price ($)</label>
                            <input type="number" id="product-price" name="price" step="0.01" required>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" name="description" rows="3" required></textarea>
                        </div>
                        <div class="form-group">
                            <label for="product-image">Image URL</label>
                            <input type="text" id="product-image" name="image" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Category</label>
                            <select id="product-category" name="category" required>
                                <option value="men">Men</option>
                                <option value="women">Women</option>
                                <option value="unisex">Unisex</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-stock">Stock Quantity</label>
                            <input type="number" id="product-stock" name="countInStock" required>
                        </div>
                        <div class="form-group">
                            <label for="product-brand">Brand</label>
                            <input type="text" id="product-brand" name="brand" required>
                        </div>
                        <button type="submit" class="btn" style="width: 100%;">Add Product</button>
                        <button type="button" class="btn btn-outline" style="width: 100%; margin-top: 10px;" onclick="app.navigateTo('admin')">
                            Cancel
                        </button>
                    </form>
                </div>
            </div>
        </section>
    `;
    
    document.getElementById('add-product-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const product = Object.fromEntries(formData.entries());
        product.price = parseFloat(product.price);
        product.countInStock = parseInt(product.countInStock);
        
        try {
            const response = await fetch(`${app.API_BASE_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(product)
            });
            
            if (response.ok) {
                alert('Product added successfully!');
                app.navigateTo('admin');
            } else {
                alert('Error adding product');
            }
        } catch (error) {
            console.error('Error adding product:', error);
            alert('An error occurred');
        }
    });
}

function editProduct(e) {
    const productId = e.target.dataset.id;
    // Implementation for edit product
    alert('Edit product functionality would be implemented here');
}

async function deleteProduct(e) {
    const productId = e.target.dataset.id;
    
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        const response = await fetch(`${app.API_BASE_URL}/products/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (response.ok) {
            alert('Product deleted successfully!');
            loadAdminPage();
        } else {
            alert('Error deleting product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred');
    }
}