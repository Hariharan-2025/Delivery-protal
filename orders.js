const express = require('express');
const Order = require('../models/Order');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Create order (User)
router.post('/', auth, async (req, res) => {
  try {
    const { items, totalAmount, deliveryAddress } = req.body;

    const order = new Order({
      user: req.user.id,
      items,
      totalAmount,
      deliveryAddress
    });

    await order.save();
    
    await order.populate('user', 'name email');
    
    res.status(201).json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get user orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get all orders (Admin)
router.get('/', auth, adminAuth, async (req, res) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update order status (Admin)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;

    await order.save();
    await order.populate('user', 'name email');

    res.json(order);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;