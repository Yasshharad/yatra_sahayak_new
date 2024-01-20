"use strict";

var jwt = require('jsonwebtoken');

var User = require('../models/User');

var authMiddleware = function authMiddleware(req, res, next) {
  var token, decoded, user;
  return regeneratorRuntime.async(function authMiddleware$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          // Check for token in the request header or cookies
          token = req.header('Authorization') || req.cookies.token;

          if (token) {
            _context.next = 3;
            break;
          }

          return _context.abrupt("return", res.status(401).json({
            message: 'Authorization denied. Token not found'
          }));

        case 3:
          _context.prev = 3;
          // Verify the token
          decoded = jwt.verify(token, 'mySecretKey'); // Use your secret key here
          // Fetch user data from the database based on the decoded user ID

          _context.next = 7;
          return regeneratorRuntime.awrap(User.findById(decoded.userId));

        case 7:
          user = _context.sent;

          if (user) {
            _context.next = 10;
            break;
          }

          return _context.abrupt("return", res.status(401).json({
            message: 'Invalid token - User not found'
          }));

        case 10:
          // Attach user information to the request object
          req.user = user;
          next();
          _context.next = 18;
          break;

        case 14:
          _context.prev = 14;
          _context.t0 = _context["catch"](3);
          console.error(_context.t0);
          res.status(401).json({
            message: 'Invalid token'
          });

        case 18:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[3, 14]]);
};

module.exports = authMiddleware;