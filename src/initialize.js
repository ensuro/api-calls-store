import { toDecimal } from "./utils/helpers/api_calls";
import { registerAPI } from "./helpers/apiRegistry";

const baseUrl = "https://offchain-sepolia.ensuro.co/api";
/** Risk Module Endpoints **/
registerAPI(
  "activePolicies",
  (address) => `${baseUrl}/policies/?rm=${address}&status=active&limit=1`,
  (response) => response.count
);

registerAPI(
  "gwp",
  (address) => `${baseUrl}/riskmodules/${address}/gwp/`,
  (response) => toDecimal(response.gwp)
);
