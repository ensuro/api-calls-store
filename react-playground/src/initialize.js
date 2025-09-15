import { initializeAPIStore, registerAPI, getAPI, BNToDecimal } from "api-calls-store";

const baseUrl = "https://api-sepolia.etherscan.io/api";

initializeAPIStore({ getAPI, clockCount: 15 });

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
