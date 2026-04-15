export const schema = `
  type Property { id: ID!, title: String!, city: String!, price: Float!, status: String! }
  type Query { properties: [Property!]! }
`;
