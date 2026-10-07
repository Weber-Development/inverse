import { createNodeHandler } from "@sweberdev/inverse";
import express from "express";

const app = express();
app.post(
  "/api/inverse",
  express.json(),
  createNodeHandler({
    company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
    // The static shop lives on another domain, so answer its preflight request.
    cors: { origin: ["https://shop.example.com"] },
    onDeclaration: async (record) => console.log("declaration", record.id),
    sendReceipt: async (receipt) => console.log("receipt for", receipt.to),
  }),
);
app.listen(3000);
