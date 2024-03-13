import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions-test";
import { reconcile } from "../src/index";
import { randomUUID } from "crypto";

const testEnv = functions(
	{
		projectId: "ride-app-test-1",
	},
	"./test-service-account.json",
);

const wrapped = testEnv.wrap(reconcile);
let currentAccountId: string;

afterAll(testEnv.cleanup);

beforeEach(() => {
	currentAccountId = `test-${randomUUID()}`;
});

describe("Reconcile", () => {
	it("should not commit transaction when accountId is not string", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				accountId: 10,
				amount: 10,
				type: "DEBIT",
			},
			"transactions/test-transaction-id",
		);
		const wrappedFunction = wrapped(data);

		await expect(wrappedFunction).resolves.not.toThrow();

		const after = await getFirestore()
			.collection("wallets")
			.doc(currentAccountId)
			.get();

		expect(after.exists).toBe(false);
	});

	it("should not commit transaction when amount is not number", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				accountId: currentAccountId,
				amount: "10",
				type: "DEBIT",
			},
			"transactions/test-transaction-id",
		);
		const wrappedFunction = wrapped(data);

		await expect(wrappedFunction).resolves.not.toThrow();

		const after = await getFirestore()
			.collection("wallets")
			.doc(currentAccountId)
			.get();

		expect(after.exists).toBe(false);
	});

	it("should not commit transaction when type is not CREDIT or DEBIT", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				accountId: currentAccountId,
				amount: 10,
				type: "INVALID",
			},
			"transactions/test-transaction-id",
		);
		const wrappedFunction = wrapped(data);

		await expect(wrappedFunction).resolves.not.toThrow();

		const after = await getFirestore()
			.collection("wallets")
			.doc(currentAccountId)
			.get();

		expect(after.exists).toBe(false);
	});

	describe("Given Account Does Not Exist", () => {
		it("Logs Error and returns without committing a transaction", async () => {
			const data = testEnv.firestore.makeDocumentSnapshot(
				{
					accountId: currentAccountId,
					amount: 10,
					type: "DEBIT",
				},
				"transactions/test-transaction-id",
			);
			const wrappedFunction = wrapped(data);

			await expect(wrappedFunction).resolves.not.toThrow();

			const after = await getFirestore()
				.collection("wallets")
				.doc(currentAccountId)
				.get();

			expect(after.exists).toBe(false);
		});
	});

	describe("Given Account Balance is 10", () => {
		beforeEach(async () => {
			await getFirestore().doc(`wallets/${currentAccountId}`).set({
				balance: 10,
			});
		});

		afterEach(async () => {
			await getFirestore().doc(`wallets/${currentAccountId}`).delete();
		});
		it("When 10 is debited then balance is 0", async () => {
			const data = testEnv.firestore.makeDocumentSnapshot(
				{
					accountId: currentAccountId,
					amount: 10,
					type: "DEBIT",
				},
				"transactions/test-transaction-id",
			);
			const wrappedFunction = wrapped(data);

			await expect(wrappedFunction).resolves.not.toThrow();

			const after = await getFirestore()
				.collection("wallets")
				.doc(currentAccountId)
				.get();

			expect(after.get("balance")).toBe(0);
		});

		it("When 0 is credited then balance is 10", async () => {
			const data = testEnv.firestore.makeDocumentSnapshot(
				{
					accountId: currentAccountId,
					amount: 0,
					type: "CREDIT",
				},
				"transactions/test-transaction-id",
			);
			const wrappedFunction = wrapped(data);

			await expect(wrappedFunction).resolves.not.toThrow();

			const after = await getFirestore()
				.collection("wallets")
				.doc(currentAccountId)
				.get();

			expect(after.get("balance")).toBe(10);
		});
	});
});
