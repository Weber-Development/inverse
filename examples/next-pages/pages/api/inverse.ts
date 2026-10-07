import { createNodeHandler } from "@sweberdev/inverse";

export default createNodeHandler({
  company: { name: "Acme GmbH", address: "Musterweg 1, 10115 Berlin", email: "hallo@acme.de" },
  onDeclaration: async (record) => {
    // store the record: database, ledger, ticket system
    console.log("declaration", record.id);
  },
  sendReceipt: async (receipt) => {
    // send receipt.to, receipt.subject, receipt.text and receipt.html with your mail service
    console.log("receipt for", receipt.to);
  },
});
