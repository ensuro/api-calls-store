import Big from "big.js";
import { isEmpty } from "lodash";

export const toDecimal = (number) => {
  return Big(number);
};

export const getFieldSumByChar = (field) => {
  let sum = 0;
  for (let i = 0; i < field.length; i++) {
    sum += field.charCodeAt(i);
  }
  return sum;
};

export const addDaysParams = (days_from, days_to, days = undefined) => {
  if (days_to && days_from && days) return { days, days_from, days_to };
  if (days_from && days) return { days, days_from };
  if (days_to && days) return { days, days_to };
  if (days_to && days_from) return { days_from, days_to };
  if (days_from) return { days_from };
  if (days_to) return { days_to };
  if (days) return { days };
  return {};
};

export const makeQueryParams = (...args) => {
  const merged = Object.assign({}, ...args);
  if (!isEmpty(merged)) return `?${new URLSearchParams(merged)}`;
  return "";
};
