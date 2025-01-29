const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth'); // Auth middleware
const cors = require('cors');  // Add CORS
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all requests
app.use(cors());

// Create Apollo Server instance
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

// Set up Apollo Server to start and apply middleware
async function startServer() {
  await server.start(); // Start the Apollo server before applying middleware
  server.applyMiddleware({ app, path: '/graphql' }); // Explicit path for GraphQL

  // Set up Express to handle requests
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/dist')));
  }

  db.once('open', () => {
    app.listen(PORT, () =>
      console.log(`🌍 Now listening on localhost:${PORT}${server.graphqlPath}`)
    );
  });
}

startServer(); // Start the Apollo Server
