import { describe, expect, it } from "vitest";
import * as api from "../src";

// Public API of 1.x. Removing or renaming an export is a breaking change and needs a major
// version; adding one is a minor change (add it to the list).
const STABLE = [
  "HONEYPOT_FIELD",
  "addPeriod",
  "checkControls",
  "checkHtml",
  "checkUrl",
  "contractEndDate",
  "createInverseHandler",
  "createNodeHandler",
  "createRecord",
  "createReference",
  "declarationFields",
  "declarationText",
  "extractControls",
  "format",
  "formatDate",
  "formatDateTime",
  "getMessages",
  "handleDeclaration",
  "isLocale",
  "isValidIsoDate",
  "isWithinWithdrawalPeriod",
  "legalRevision",
  "locales",
  "messages",
  "nextWorkingDay",
  "platforms",
  "renderReceipt",
  "snippet",
  "toIsoDate",
  "toWebRequest",
  "validate",
  "validateCancellation",
  "validateWithdrawal",
  "withdrawalDeadline",
  "withdrawalStatus",
];

describe("public API", () => {
  it("keeps every stable export", () => {
    expect(STABLE.filter((name) => !(name in api))).toEqual([]);
  });

  it("has no export that is missing from the stable list", () => {
    expect(Object.keys(api).filter((name) => !STABLE.includes(name))).toEqual([]);
  });
});
