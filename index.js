import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";

import { events, locations, users, participants } from "./data.js";

const uid = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const typeDefs = `#graphql

  #User
  type User {
    id: ID!
    username: String!
    email: String!
    events: [Event!]!
  }
  input createUserInput {
    
    username: String
    email: String
  }
  input updateUserInput {
    username: String
    email: String
  }



  #Event
  type Event {
    id: ID!
    title: String!
    date: String!
    user_id: ID!
    location_id: ID! 
    user: User!
    location: Location!
    participants: [Participant!]!
  }
  input createEventInput {
    title: String
    date: String
    
  }
  input updateEventInput {
    title: String
    date: String
  }



  #Loaction
  type Location {
    id: ID!
    name: String!
    lat: Float!
    lng: Float!
  }
  input createLocationInput {
    name: String
  }
  input updateLocationInput {
    name: String
  }



  #Participant
  type Participant {
    id: ID!
    event_id: ID!
  }
  input createPartInput {
    
    event_id: ID
  }
  input updatePartInput {
    
    event_id: ID
  }

  type allDeleted {
    count: Int
  }
  
  type Query {
    users: [User!]!
    user(id:ID!): User!

    events: [Event!]!
    event(id:ID!):Event!

    locations: [Location!]!
    location(id:ID!):Location!

    participants: [Participant!]!
    participant(id:ID!):Participant!
  }

  type Mutation {
    createUser( data: createUserInput  ): User
    updateUser (id: ID, data : updateUserInput ): User
    deleteUser(id: ID, username: String): User
    deleteAllUsers: allDeleted
    createEvent(data: createEventInput): Event
    updateEvent(id: ID, data: updateEventInput): Event
    deleteEvent(id: ID, title: String): Event
    deleteAllEvents: allDeleted
    createLocation( data: createLocationInput ): Location
    updateLocation(id: ID, data: updateLocationInput): Location
    deleteLocation(id: ID, name: String): Location
    deleteAllLocations: allDeleted
    createPart( data: createPartInput   ): Participant
    updatePart( user_id: ID, data: updatePartInput ): Participant
    deletePart(user_id: ID, event_id: ID ): Participant
    deleteAllParts: allDeleted 
  }
`;

const resolvers = {
  Query: {
    users: () => users,
    user: (parent, args) => users.find((user) => user.id == args.id),

    events: () => events,
    event: (parent, args) => events.find((event) => event.id == args.id),

    locations: () => locations,
    location: (parent, args) => locations.find((location) => location.id == args.id),

    participants: () => participants,
    participant: (parent, args) => participants.find((participant) => participant.id == args.id),
  },
  User: {
    events: (parent) => events.filter((event) => event.user_id == parent.id),
  },
  Event: {
    user: (parent) => users.find((user) => user.id === parent.user_id),
    location: (parent) => locations.find((location) => location.id === parent.location_id),
    participants: (parent) => participants.filter((participant) => participant.event_id == parent.id),
  },

  Mutation: {
    createUser: (parent, { data }) => {
      const user = { id: uid, ...data };

      users.push(user);

      return user;
    },

    updateUser: (parent, { id, data }) => {
      const userIndex = users.findIndex((user) => user.id == id);

      if (userIndex == -1) {
        return new Error("Data not found!");
      }

      const newUpdatedUser = (users[userIndex] = { ...users[userIndex], ...data });

      return newUpdatedUser;
    },

    deleteUser: (parent, { id, username }) => {
      const userIndex = users.findIndex((user) => user.id == id || user.username == username);

      if (userIndex == -1) {
        return new Error("Data not found!");
      }

      const deletedUser = users[userIndex];

      users.splice(userIndex, 1);

      return deletedUser;
    },

    deleteAllUsers: () => {
      const length = users.length;

      users.splice(0, length);

      return { count: length };
    },

    // Event
    createEvent: (parent, { data }) => {
      const event = { id: uid, ...data };

      events.push(event);

      return event;
    },

    updateEvent: (parent, { id, data }) => {
      const eventIndex = events.findIndex((event) => event.id == id);

      if (eventIndex == -1) {
        return new Error("Data not found!");
      }

      const newUpdatedEvent = (events[eventIndex] = { ...events[eventIndex], ...data });

      return newUpdatedEvent;
    },

    deleteEvent: (parent, { id, title }) => {
      const eventIndex = events.findIndex((event) => event.id == id || event.title == title);

      if (eventIndex == -1) {
        return new Error("Data not found!");
      }

      const deletedEvent = events[eventIndex];

      events.splice(eventIndex, 1);

      return deletedEvent;
    },

    deleteAllEvents: () => {
      const length = events.length;

      events.splice(0, length);

      return {
        count: length,
      };
    },

    // Location
    createLocation: (parent, { data }) => {
      const location = { id: uid, ...data };

      locations.push(location);

      return location;
    },

    updateLocation: (parent, { id, data }) => {
      const locationIndex = locations.findIndex((location) => location.id == id);

      if (locationIndex == -1) {
        return new Error("Data not found!");
      }

      const newUpdatedLocation = (locations[locationIndex] = { ...locations[locationIndex], ...data });

      return newUpdatedLocation;
    },

    deleteLocation: (parent, { id, name }) => {
      const locationIndex = locations.findIndex((location) => location.id == id || location.name == name);

      if (locationIndex == -1) {
        return new Error("Data not found!");
      }

      const deletedLocation = locations[locationIndex];

      locations.splice(locationIndex, 1);

      return deletedLocation;
    },

    deleteAllLocations: () => {
      const length = locations.length;

      locations.splice(0, length);

      return { count: length };
    },

    //Participants
    createPart: (parent, { data }) => {
      const part = { id: uid, ...data, event_id: uid };

      participants.push(part);

      return part;
    },

    updatePart: (parent, { user_id, data }) => {
      const partIndex = participants.findIndex((participant) => participant.user_id == user_id);

      if (partIndex == -1) {
        return new Error("Data not found!");
      }

      const newUpdatedPart = (participants[partIndex] = { id: uid, ...participants[partIndex], ...data });

      return newUpdatedPart;
    },

    deletePart: (parent, { id, user_id, event_id }) => {
      const partIndex = participants.findIndex((participant) => participant.user_id == user_id || participant.event_id == event_id);

      if (partIndex == -1) {
        return new Error("Data not found!");
      }

      const newDeletedPart = participants[partIndex];

      participants.splice(partIndex, 1);

      return newDeletedPart;
    },

    deleteAllParts: () => {
      const length = participants.length;

      participants.splice(0, length);

      return { count: length };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
