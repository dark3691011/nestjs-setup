export const MyIndexMapping: any = {
  mappings: {
    properties: {
      name: { type: "text" },
      age: { type: "integer" },
      createdAt: { type: "date" },
      message1: { type: "text", analyzer: "standard" },
    },
  },
};
