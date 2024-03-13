import { getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions-test";
import { createBill } from "../src";
import * as distanceUtil from "../src/utils/distance";
import * as polylineCodec from "@googlemaps/polyline-codec";

const testEnv = functions(
	{
		projectId: "ride-app-test-1",
	},
	"./test-service-account.json",
);

const wrapped = testEnv.wrap(createBill);

const firestore = getFirestore();

afterAll(testEnv.cleanup);

describe("Create Bill", () => {
	afterEach(() => firestore.recursiveDelete(firestore.collection("bills")));

	it("should not create a bill when status is same as previous status", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				status: "same",
			},
			"trips/test-trip-id",
		);

		await expect(
			wrapped(testEnv.makeChange(data, data), {
				params: { tripId: "test-trip-id" },
			}),
		).resolves.not.toThrow();

		const billSnap = await firestore
			.collection("bills")
			.where("parent", "==", "test-trip-id")
			.get();
		expect(billSnap.empty).toBeTruthy();
	});

	it("should not create a bill when status is neither complete or cancelled", async () => {
		const data = testEnv.firestore.makeDocumentSnapshot(
			{
				status: "incomplete",
			},
			"trips/test-trip-id",
		);

		await expect(
			wrapped(testEnv.makeChange(data, data), {
				params: { tripId: "test-trip-id" },
			}),
		).resolves.not.toThrow();

		const billSnap = await firestore
			.collection("bills")
			.where("parent", "==", "test-trip-id")
			.get();
		expect(billSnap.empty).toBeTruthy();
	});

	describe("Given status updated", () => {
		describe("Given current status is complete, distance rate is 5, distance is 10", () => {
			jest.spyOn(distanceUtil, "pathLength").mockReturnValue(10);
			jest.spyOn(polylineCodec, "decode").mockReturnValue([]);

			it("When passengers is 1 then distance fare is 50", async () => {
				const before = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "test",
					},
					"trips/test-trip-id",
				);
				const after = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "complete",
						polyline: "",
						passengers: 1,
					},
					"trips/test-trip-id",
				);
				await expect(
					wrapped(testEnv.makeChange(before, after), {
						params: { tripId: "test-trip-id" },
					}),
				).resolves.not.toThrow();

				const billSnap = await firestore
					.collection("bills")
					.where("parent", "==", "test-trip-id")
					.get();

				expect(billSnap.docs[0].get("bill").base.distance).toBe(50);
			});

			it("When passengers is 2 then distance fare is 100", async () => {
				const before = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "test",
					},
					"trips/test-trip-id",
				);
				const after = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "complete",
						polyline: "",
						passengers: 2,
					},
					"trips/test-trip-id",
				);

				await expect(
					wrapped(testEnv.makeChange(before, after), {
						params: { tripId: "test-trip-id" },
					}),
				).resolves.not.toThrow();

				const billSnap = await firestore
					.collection("bills")
					.where("parent", "==", "test-trip-id")
					.get();

				expect(billSnap.docs[0].get("bill").base.distance).toBe(100);
			});
		});

		describe("Given current status is cancelled and cancellation fee is 3", () => {
			it("When cancelled by driver then driver cancellation fee is 3", async () => {
				const before = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "test",
					},
					"trips/test-trip-id",
				);
				const after = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "cancelled",
						cancelledBy: "driver",
					},
					"trips/test-trip-id",
				);
				await expect(
					wrapped(testEnv.makeChange(before, after), {
						params: { tripId: "test-trip-id" },
					}),
				).resolves.not.toThrow();

				const billSnap = await firestore
					.collection("bills")
					.where("parent", "==", "test-trip-id")
					.get();

				expect(billSnap.docs[0].get("bill").driver.cancellation).toBe(3);
			});

			it("When cancelled by rider then rider cancellation fee is 3", async () => {
				const before = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "test",
					},
					"trips/test-trip-id",
				);
				const after = testEnv.firestore.makeDocumentSnapshot(
					{
						status: "cancelled",
						cancelledBy: "rider",
					},
					"trips/test-trip-id",
				);
				await expect(
					wrapped(testEnv.makeChange(before, after), {
						params: { tripId: "test-trip-id" },
					}),
				).resolves.not.toThrow();

				const billSnap = await firestore
					.collection("bills")
					.where("parent", "==", "test-trip-id")
					.get();

				expect(billSnap.docs[0].get("bill").rider.cancellation).toBe(3);
			});
		});
	});
});
