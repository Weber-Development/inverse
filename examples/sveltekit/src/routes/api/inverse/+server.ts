import { createInverseHandler } from "@sweberdev/inverse";
import type { RequestHandler } from "./$types";

const inverse = createInverseHandler({
  company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
  onDeclaration: async (record) => {
    console.log("declaration", record.id);
  },
  sendReceipt: async (receipt) => {
    console.log("receipt for", receipt.to);
  },
});

export const POST: RequestHandler = ({ request }) => inverse(request);
