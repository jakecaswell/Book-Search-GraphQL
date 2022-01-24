const express = require('express');
const path = require('path');
const db = require('./config/connection');
//import the apollo server
const { ApolloServer } = require('apollo-server-express');
const { authMiddleWare } = require('./utils/auth');
// import our schemas to the server
const { typeDefs, resolvers } = require('./schemas')

const app = express();
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  // create a new Apollo server and pass in our schema data
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleWare
  })

  // start the apollo server
  await server.start();

  // integrate our apollo server with the express application as middleware
  server.applyMiddleware({ app });

  // log where we can go to test our GQL API
  console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
}

// initialize the apollo server
startServer();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
})

}

db.once('open', () => {
  app.listen(PORT, () => console.log(`🌍 Now listening on localhost:${PORT}`));
});
