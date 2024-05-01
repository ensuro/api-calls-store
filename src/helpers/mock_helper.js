import * as api_calls from "./api_calls";

export const setupRiskFieldGets = (axiosMock, address) => {
  const baseUrl = "https://test.ensuro.co/api";
  axiosMock
    .onGet(`${baseUrl}/etokens/${address}/apr/?days_from=7`)
    .reply(200, { apy: api_calls.getFieldSumByChar("apy") });
  axiosMock
    .onGet(`${baseUrl}/etokens/${address}/scr_breakdown/`)
    .reply(200, { data: [{ scr: api_calls.getFieldSumByChar("scrBreakdown") }] });
  axiosMock.onGet(`${baseUrl}/riskmodules/${address}/gwp/`).reply(200, { gwp: api_calls.getFieldSumByChar("gwp") });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/surplus/`)
    .reply(200, { surplus: api_calls.getFieldSumByChar("surplus") });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/matured_surplus/`)
    .reply(200, { surplus: api_calls.getFieldSumByChar("maturedSurplus") });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/cashflow/?days_from=90`)
    .reply(200, { data: `ret${address}cashflow` });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/surplus_history/?days_from=90`)
    .reply(200, { data: `ret${address}surplusHistory` });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/matured_surplus_history/?days_from=90`)
    .reply(200, { data: `ret${address}maturedSurplusHistory` });
  axiosMock
    .onGet(`${baseUrl}/riskmodules/${address}/active_premiums/?days_from=90`)
    .reply(200, { data: `ret${address}activePremiums` });
  axiosMock
    .onGet(`${baseUrl}/policies/?rm=${address}&status=active&limit=1`)
    .reply(200, { count: `ret${address}activePolicies` });
};

export const setupWalletMocks = (axiosMock, address) => {
  const baseUrl = "https://test.ensuro.co/api";
  axiosMock.onPost(`${baseUrl}/wallet/${address}/verify/`).reply(200, { token: "withPersonaReferenceID" });
};
