import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/orders');
      setOrders(res.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/orders/${orderId}`, {
        status,
        adminNotes: adminNotes || undefined
      });

      setSelectedOrder(null);
      setAdminNotes('');
      fetchOrders();
      alert('Order status updated successfully!');
    } catch (error) {
      console.error('Error updating order:', error);
      alert('Error updating order status. Please try again.');
    }
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
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout} className="logout-btn">Logout</button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="orders-list">
          <h3>All Orders</h3>

          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => (
                <div key={order._id} className="order-card">
                  <div className="order-header">
                    <span className="order-id">Order #{order._id.slice(-6)}</span>

                    {/* FIXED STATUS COLOR CLASS */}
                    <span className={`status ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>

                  <div className="order-details">
                    <p><strong>Customer:</strong> {order.user?.name} ({order.user?.email})</p>

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

                  <div className="order-actions">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="btn-primary"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL POPUP */}
        {selectedOrder && (
          <div className="modal-overlay">
            <div className="modal">
              <h3>Manage Order #{selectedOrder._id.slice(-6)}</h3>

              <div className="form-group">
                <label>Admin Notes:</label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes for the customer..."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button 
                  onClick={() => updateOrderStatus(selectedOrder._id, 'approved')}
                  className="btn-success"
                >
                  Approve
                </button>

                <button 
                  onClick={() => updateOrderStatus(selectedOrder._id, 'rejected')}
                  className="btn-danger"
                >
                  Reject
                </button>

                <button 
                  onClick={() => updateOrderStatus(selectedOrder._id, 'delivered')}
                  className="btn-info"
                >
                  Mark as Delivered
                </button>

                <button 
                  onClick={() => {
                    setSelectedOrder(null);
                    setAdminNotes('');
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
