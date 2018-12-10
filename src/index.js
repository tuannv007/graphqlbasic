const { GraphQLServer } = require('graphql-yoga')
const {PubSub} =  require('apollo-server')
const MESSAGE_CREATED = 'MESSAGE_CREATED';
const pubsub = new PubSub();

let links = [{
    id: 'link-0',
    url: 'www.howtographql.com',
    description: 'Fullstack tutorial for GraphQL'
  }]
  
// 1
let idCount =1
const typeDefs = `
type Query {
  info: String!
  feed: [Link!]!
}
type Link {
    id: ID!
    description: String!
    url: String!
  }
  type Mutation {
    post(url: String!, description: String!): Link!
  }

  type Subscription {
    newLink: Link
}
`

// 2
const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: () => links
  },
  Mutation: {
    // 2
    post: (root, args) => {
       const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      }
      links.push(link)
      pubsub.publish(MESSAGE_CREATED, { newLink: link });
      return link
    },
  },
  Subscription: {
    newLink: {
        subscribe: () => pubsub.asyncIterator([MESSAGE_CREATED]),
      },
  },
  Link: {
    id: (root) => root.id,
    description: (root) => root.description,
    url: (root) => root.url,
  }
}

// 3
const server = new GraphQLServer({
  typeDefs,
  resolvers,
})
server.start(() => console.log(`Server is running on http://localhost:4000`))