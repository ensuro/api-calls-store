import { BNToDecimal } from "./utils/helpers/api_calls";
import { registerAPI } from "./helpers/apiRegistry";

const baseUrl = "https://api-sepolia.etherscan.io/api";

/** Risk Module Endpoints **/
registerAPI(
  "ethBalance",
  (address) => `${baseUrl}/?module=account&action=balance&address=${address}`,
  (response) => BNToDecimal(response.result, 18)
);

registerAPI(
  "ethPrice",
  () => `${baseUrl}/?module=stats&action=ethprice`,
  (response) => response.result?.ethusd
);
