import { initializeApp } from "firebase-admin/app";

import {
	setUserClaims as setUserClaimsImpl,
	setDriverClaims as setDriverClaimsImpl,
} from "./registration";

import {
	createBill as createBillImpl,
	createTransactionFromBill as createTransactionFromBillImpl,
} from "./billing";

import { reconcile as reconcileImpl } from "./reconcile";

initializeApp();

export const setUserClaims = setUserClaimsImpl;
export const setDriverClaims = setDriverClaimsImpl;

export const createBill = createBillImpl;

export const createTransactionFromBill = createTransactionFromBillImpl;

export const reconcile = reconcileImpl;
