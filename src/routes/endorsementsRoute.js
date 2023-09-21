// endorsementsRoute.js: 
// This route file defines the URL routes that correspond 
// to endorsements-related actions. It maps HTTP requests to 
// specific controller functions, allowing your application to 
// respond to requests related to endorsements.

// how to set up page route ?????


const express = require('express');
const router = express.Router();
const endorsementsController = require('./endorsementsController'); // Import the controller

// Define the route that handles endorsements (e.g., POST /endorse)
router.post('/endorse/:postId', endorsementsController.addEndorsement);

module.exports = router;
