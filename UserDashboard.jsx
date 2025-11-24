import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [orderData, setOrderData] = useState({
    items: [{ name: '', quantity: 1, price: 0 }],
    deliveryAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders/my-orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleOrderChange = (index, field, value) => {
    const updatedItems = [...orderData.items];
    updatedItems[index][field] = value;
    setOrderData({ ...orderData, items: updatedItems });
  };

  const addItem = () => {
    setOrderData({
      ...orderData,
      items: [...orderData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index) => {
    const updatedItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: updatedItems });
  };

  const handleAddressChange = (field, value) => {
    setOrderData({
      ...orderData,
      deliveryAddress: {
        ...orderData.deliveryAddress,
        [field]: value
      }
    });
  };

  const calculateTotal = () => {
    return orderData.items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const totalAmount = calculateTotal();
      await axios.post('http://localhost:5000/api/orders', {
        ...orderData,
        totalAmount
      });

      setShowOrderForm(false);
      setOrderData({
        items: [{ name: '', quantity: 1, price: 0 }],
        deliveryAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: ''
        }
      });
      fetchOrders();
      alert('Order created successfully!');
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error creating order. Please try again.');
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'delivered': return 'status-delivered';
      default: return 'status-pending';
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>User Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-actions">
          <button 
            onClick={() => setShowOrderForm(!showOrderForm)}
            className="btn-primary"
          >
            {showOrderForm ? 'Cancel' : 'Create New Order'}
          </button>
        </div>

        {showOrderForm && (
          <div className="order-form">
            <h3>Create New Order</h3>
            <form onSubmit={submitOrder}>
              <div className="form-section">
                <h4>Order Items</h4>
                {orderData.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => handleOrderChange(index, 'name', e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      placeholder="Quantity"
                      value={item.quantity}
                      onChange={(e) => handleOrderChange(index, 'quantity', parseInt(e.target.value))}
                      min="1"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => handleOrderChange(index, 'price', parseFloat(e.target.value))}
                      required
                    />
                    {orderData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} className="btn-danger">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem} className="btn-secondary">
                  Add Item
                </button>
              </div>

              <div className="form-section">
                <h4>Delivery Address</h4>
                <input
                  type="text"
                  placeholder="Street"
                  value={orderData.deliveryAddress.street}
                  onChange={(e) => handleAddressChange('street', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="City"
                  value={orderData.deliveryAddress.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="State"
                  value={orderData.deliveryAddress.state}
                  onChange={(e) => handleAddressChange('state', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="ZIP Code"
                  value={orderData.deliveryAddress.zipCode}
                  onChange={(e) => handleAddressChange('zipCode', e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Country"
                  value={orderData.deliveryAddress.country}
                  onChange={(e) => handleAddressChange('country', e.target.value)}
                  required
                />
              </div>

              <div className="order-total">
                <strong>Total: ${calculateTotal().toFixed(2)}</strong>
              </div>

              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Submitting...' : 'Submit Order'}
              </button>
            </form>
          </div>
        )}

        <div className="orders-list">
          <h3>My Orders</h3>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order._id.slice(-6)}</span>
                    <span className={`status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="order-details">
                    <p><strong>Items:</strong></p>
                    <ul>
                      {order.items.map((item, index) => (
                        <li key={index}>
                          {item.name} (Qty: {item.quantity}) - ${item.price}
                        </li>
                      ))}
                    </ul>
                    <p><strong>Total: ${order.totalAmount}</strong></p>
                    <p><strong>Address:</strong> {order.deliveryAddress.street}, {order.deliveryAddress.city}</p>
                    <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                    {order.adminNotes && (
                      <p><strong>Admin Notes:</strong> {order.adminNotes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
