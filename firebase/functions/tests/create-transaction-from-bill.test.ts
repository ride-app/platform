import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions-test";
import { WalletService } from "../src/billing";
import { createTransactionFromBill } from "../src";

// NOTE: tests not finished

jest.mock("../src/client");

const testEnv = functions(
	{
		projectId: "ride-app-test-1",
	},
	"./test-service-account.json",
);

const wrapped = testEnv.wrap(createTransactionFromBill);

const firestore = getFirestore();

afterAll(testEnv.cleanup);

describe("Create Transaction from bill", () => {
	// When user wallet id is not found throws error
	beforeAll(async () => {
		await firestore
			.collection("trips")
			.doc("test-trip-id")
			.set({
				user: {
					id: "test-user-id",
				},
				driver: {
					id: "test-driver-id",
				},
			});
	});

	const getAccountByUidSpy = jest
		.spyOn(WalletService.prototype, "getWalletId")
		.mockResolvedValue(undefined);

	const createTransactionsSpy = jest.spyOn(
		WalletService.prototype,
		"createTransactions",
	);

	afterEach(() => {
		getAccountByUidSpy.mockClear();
		createTransactionsSpy.mockClear();
		firestore.recursiveDelete(firestore.collection("bills"));
	});

	afterAll(() => firestore.recursiveDelete(firestore.collection("trips")));

	it("should not create a transaction when user wallet id is not found", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				parent: "test-trip-id",
				bill: {
					base: {
						total: 100,
					},
					rider: {
						total: 10,
					},
					driver: {
						total: 10,
					},
				},
			},
			"bills/test-bill-id",
		);

		await expect(
			wrapped(data, {
				params: {
					billId: "test-bill-id",
				},
			}),
		).rejects.toThrow();

		expect(getAccountByUidSpy).toHaveBeenCalledTimes(1);
		expect(createTransactionsSpy).toHaveBeenCalledTimes(0);
	});

	it("should not create a transaction when driver wallet id is not found", async () => {
		getAccountByUidSpy.mockResolvedValueOnce("test-user-wallet-id");

		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				parent: "test-trip-id",
				bill: {
					base: {
						total: 100,
					},
					rider: {
						total: 10,
					},
					driver: {
						total: 10,
					},
				},
			},
			"bills/test-bill-id",
		);

		await expect(
			wrapped(data, {
				params: {
					billId: "test-bill-id",
				},
			}),
		).rejects.toThrow();

		expect(getAccountByUidSpy).toHaveBeenCalledTimes(2);
		expect(createTransactionsSpy).toHaveBeenCalledTimes(0);
	});
	// when transaction is not creat1ed throws error
});
