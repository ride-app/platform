/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { ExpectedError } from "./utils/expected-error";

export const reconcile = functions
	.runWith({ failurePolicy: true })
	.firestore.document("transactions/{transactionId}")
	.onCreate(async (snap) => {
		try {
			const firestore = getFirestore();

			if (
				typeof snap.get("accountId") !== "string" ||
				typeof snap.get("amount") !== "number" ||
				typeof snap.get("type") !== "string"
			) {
				throw new ExpectedError("Invalid transaction data");
			}

			if (snap.get("type") !== "CREDIT" && snap.get("type") !== "DEBIT") {
				throw new ExpectedError("Invalid transaction type");
			}

			await firestore.runTransaction(async (transaction) => {
				const accountId = snap.get("accountId") as string;
				const amount = snap.get("amount") as number;
				const type = snap.get("type") as string;

				const accountRef = firestore.collection("wallets").doc(accountId);
				const account = await transaction.get(accountRef);

				if (account.exists === false) {
					throw new ExpectedError("Account not found");
				}

				const balance = account.get("balance") as number;

				if (type === "CREDIT") {
					transaction.update(accountRef, {
						balance: balance + amount,
						updatedAt: FieldValue.serverTimestamp(),
					});
				} else if (type === "DEBIT") {
					transaction.update(accountRef, {
						balance: balance - amount,
						updatedAt: FieldValue.serverTimestamp(),
					});
				}
			});
		} catch (error) {
			if (error instanceof ExpectedError) {
				functions.logger.error(error);
			} else {
				throw error;
			}
		}
	});
