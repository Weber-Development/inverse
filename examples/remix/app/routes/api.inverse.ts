import type { ActionFunctionArgs } from "@remix-run/node";
import { createInverseHandler } from "@sweberdev/inverse";

const inverse = createInverseHandler({
  company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
  onDeclaration: async (record) => {
    console.log("declaration", record.id);
  },
  sendReceipt: async (receipt) => {
    console.log("receipt for", receipt.to);
  },
});

export const action = ({ request }: ActionFunctionArgs) => inverse(request);
