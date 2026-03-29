import { Router } from 'express';
import { db } from './db';
import crypto from 'crypto';

const router = Router();

// Get all connected devices
router.get('/devices', (req, res) => {
  db.all('SELECT * FROM devices', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Register a new device
router.post('/devices', (req, res) => {
  const { user_id, device_name, device_type, accelerometer_model } = req.body;
  const id = crypto.randomUUID();
  
  db.run(
    `INSERT INTO devices (id, user_id, device_name, device_type, accelerometer_model, connection_status) VALUES (?, ?, ?, ?, ?, 'offline')`,
    [id, user_id, device_name, device_type, accelerometer_model],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id, device_name });
    }
  );
});

// Get profiles
router.get('/profiles', (req, res) => {
  db.all('SELECT * FROM profiles', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Get actions
router.get('/actions', (req, res) => {
  db.all('SELECT * FROM actions', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Create an action
router.post('/actions', (req, res) => {
  const { profile_id, tap_pattern, action_type, action_config } = req.body;
  const id = crypto.randomUUID();
  
  db.run(
    `INSERT INTO actions (id, profile_id, tap_pattern, action_type, action_config) VALUES (?, ?, ?, ?, ?)`,
    [id, profile_id, tap_pattern, action_type, JSON.stringify(action_config)],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id });
    }
  );
});

export default router;
