const { GraphQLError } = require('graphql');
const jwt = require('jsonwebtoken');

// Set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // Authentication error used in GraphQL resolvers
  AuthenticationError: new GraphQLError('Could not authenticate user.', {
    extensions: {
      code: 'UNAUTHENTICATED',
    },
  }),

  // Auth middleware for GraphQL
  authMiddleware: function ({ req }) {
    let token = req.body.token || req.query.token || req.headers.authorization;

    if (req.headers.authorization) {
      // Strip "Bearer " from the authorization header, if present
      token = token.split(' ').pop().trim();
    }

    if (!token) {
      return req; // No token found, proceed with empty user in context
    }

    try {
      // Verify the token and get the user data from the token payload
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data; // Attach the user data to the request object
    } catch (err) {
      console.log('Invalid token', err);
    }

    return req; // Return the request with or without user data
  },

  // Function to generate JWT token
  signToken: function ({ email, username, _id }) {
    const payload = { email, username, _id };
    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};
