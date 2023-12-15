/* eslint-disable require-jsdoc */
import * as functions from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";

import { BillGenerator, Bill } from "./utils/bill-generator";
import { pathLength } from "./utils/distance";
import { decode } from "@googlemaps/polyline-codec";

import { credentials } from "@grpc/grpc-js";
import {
	BatchCreateTransactionsRequest,
	Transaction_Type,
} from "./gen/ride/wallet/v1alpha1/wallet_service";
import { WalletServiceClient } from "./gen/ride/wallet/v1alpha1/wallet_service.grpc-client";

export const createBill = functions
	.runWith({ failurePolicy: true })
	.firestore.document("trips/{tripId}")
	.onUpdate(async (change, context) => {
		// try {
		if (
			change.before.get("status") == change.after.get("status") &&
			change.after.get("status") !== "complete" &&
			change.after.get("status") !== "cancelled"
		) {
			return;
		}

		const billGenerator = new BillGenerator({
			base: {
				distance: 5,
				time: 0,
				waitTime: 0,
			},
			rider: {
				cancellation: 3,
				tax: {
					percentage: 0.0,
				},
				platformFee: 2,
			},
			driver: {
				cancellation: 3,
				tax: {
					percentage: 0,
				},
				platformFee: {
					percentage: 10,
				},
			},
		});

		const firestore = getFirestore();

		if (change.after.get("status") == "complete") {
			billGenerator.billData.base.distance =
				pathLength(decode(change.after.get("polyline"))) *
				change.after.get("passengers");

			const bill = billGenerator.generateBill();

			await firestore.collection("bills").add({
				parent: context.params.tripId,
				rate: billGenerator.rates,
				billData: billGenerator.billData,
				bill,
			});
		} else if (change.after.get("status") == "cancelled") {
			// TODO: Check if the trip has started. If it has then add the distance fee also
			if (change.after.get("cancelledBy") == "driver") {
				billGenerator.billData.driver.cancellation = 1;
			} else {
				billGenerator.billData.rider.cancellation = 1;
			}

			const bill = billGenerator.generateBill();

			await firestore.collection("bills").add({
				parent: context.params.tripId,
				rate: billGenerator.rates,
				billData: billGenerator.billData,
				bill,
			});
		}
		// } catch (error) {
		// 	if (error instanceof ExpectedError) {
		// 		functions.logger.error(error);
		// 	} else {
		// 		throw error;
		// 	}
		// }
	});

export class WalletService {
	private static _instance: WalletService;
	private static _stub: WalletServiceClient;
	private constructor() {
		WalletService._stub = new WalletServiceClient(
			`${process.env.WALLET_SERVICE_ADDRESS}`,
			credentials.createInsecure()
		);
	}

	static get instance(): WalletService {
		return this._instance || (this._instance = new this());
	}

	// get client(): WalletServiceClient {
	// 	return WalletService._stub;
	// }

	// async getWalletId(uid: string): Promise<string | undefined> {
	// 	return new Promise((resolve, reject) => {
	// 		WalletService._stub.getWallet(
	// 			{
	// 				uid,
	// 			},
	// 			(err, res) => {
	// 				if (err) {
	// 					reject(err);
	// 				} else {
	// 					resolve(res?.wallet?.uid);
	// 				}
	// 			}
	// 		);
	// 	});
	// }

	async createTransactions(
		req: BatchCreateTransactionsRequest
	): Promise<string | undefined> {
		return new Promise((resolve, reject) => {
			WalletService._stub.batchCreateTransactions(req, (err, res) => {
				if (err) {
					reject(err);
				} else {
					resolve(res?.batchId);
				}
			});
		});
	}
}

export const createTransactionFromBill = functions
	.runWith({ failurePolicy: true })
	.firestore.document("bills/{billId}")
	.onCreate(async (snapshot) => {
		// try {
		const tripId = snapshot.get("parent") as string;

		const bill: Bill = snapshot.get("bill");

		const tripRef = getFirestore().collection("trips").doc(tripId);

		const tripSnap = await tripRef.get();

		const riderUid = tripSnap.get("user.id") as string;
		const driverUid = tripSnap.get("driver.id") as string;

		const batchId = await WalletService.instance.createTransactions({
			requestId: "",
			transactions: [
				{
					parent: `users/${riderUid}/wallet`,
					transaction: {
						name: "",
						amount: bill.base.total + bill.rider.total,
						type: Transaction_Type.DEBIT,
						details: {
							displayName: "Trip Fare",
							reference: tripId,
						},
					},
				},
				{
					parent: `users/${driverUid}/wallet`,
					transaction: {
						name: "",
						amount: bill.base.total - bill.driver.total,
						type: Transaction_Type.CREDIT,
						details: {
							displayName: "Trip Fare",
							reference: tripId,
						},
					},
				},
			],
		});

		tripRef.update({
			transactionBatchId: batchId,
		});
		// } catch (error) {
		// 	if (error instanceof ExpectedError) {
		// 		functions.logger.error(error);
		// 	} else {
		// 		throw error;
		// 	}
		// }
	});
