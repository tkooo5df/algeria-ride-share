#!/usr/bin/env node

const express = require('express');
const path = require('path');
const { createServer } = require('vite');

const app = express();
const port = process.env.PORT || 4173;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router (SPA) - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});