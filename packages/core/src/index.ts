export {
  type CheckResult,
  type Control,
  type ControlMatch,
  checkControls,
  checkHtml,
  checkUrl,
  extractControls,
  type KindResult,
  type Verdict,
} from "./check";
export {
  addPeriod,
  type ContractEndOptions,
  contractEndDate,
  isWithinWithdrawalPeriod,
  nextWorkingDay,
  type Period,
  toIsoDate,
  type WithdrawalPeriodOptions,
  type WithdrawalStatus,
  withdrawalDeadline,
  withdrawalStatus,
} from "./deadline";
export {
  type CorsOptions,
  createInverseHandler,
  type HandlerFailure,
  type HandlerOptions,
  type HandlerResult,
  type HandlerSuccess,
  HONEYPOT_FIELD,
  handleDeclaration,
  type RateLimitOptions,
} from "./handler";
export {
  format,
  getMessages,
  isLocale,
  locales,
  type MessageOverrides,
  type Messages,
  messages,
} from "./i18n";
export { type LegalRevision, legalRevision } from "./legal";
export {
  createNodeHandler,
  type NodeRequest,
  type NodeResponse,
  toWebRequest,
} from "./node";
export { type ReceiptOptions, renderReceipt } from "./receipt";
export {
  type CreateRecordOptions,
  createRecord,
  createReference,
  declarationFields,
  declarationText,
  type FormatOptions,
  formatDate,
  formatDateTime,
} from "./record";
export { type Platform, platforms, type SnippetOptions, snippet } from "./snippets";
export type * from "./types";
export {
  isValidIsoDate,
  validate,
  validateCancellation,
  validateWithdrawal,
} from "./validate";
