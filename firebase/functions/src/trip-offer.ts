import * as functions from "firebase-functions";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

export const onOfferDeclined = functions
	.runWith({ failurePolicy: true })
	.firestore.document("activeDrivers/{driverId}/tripOffers/{tripId}")
	.onDelete(async (snapshot, context) => {
		const tripOffer = snapshot.data();

		await getFirestore()
			.collection("activeDrivers")
			.doc(context.params.driverId)
			.update({ capacity: FieldValue.increment(tripOffer.passengers) });
	});

export const onOfferAccept = functions
	.runWith({ failurePolicy: true })
	.firestore.document("activeDrivers/{driverId}/tripOffers/{tripId}")
	.onUpdate(async (snapshot, context) => {
		if (!snapshot.before.get("accepted") && snapshot.after.get("accepted")) {
			const firestore = getFirestore();

			firestore.runTransaction(async (transaction) => {
				transaction.delete(
					firestore
						.collection("activeDrivers")
						.doc(context.params.driverId)
						.collection("tripOffers")
						.doc(context.params.tripId),
				);

				transaction.set(
					firestore
						.collection("activeDrivers")
						.doc(context.params.driverId)
						.collection("activeTrips")
						.doc(context.params.tripId),
					{
						ref: firestore.collection("trips").doc(context.params.tripId),
					},
				);

				// transaction.update(
				// 	firestore
				// 		.collection("activeDrivers")
				// 		.doc(context.params.driverId),
				// 	{
				// 		currentPathString: snapshot.after.get("polyline"),
				// 	}
				// );
			});

			// await firestore
			// 	.collection("activeDrivers")
			// 	.doc(context.params.driverId)
			// 	.collection("tripOffers")
			// 	.doc(context.params.tripId)
			// 	.delete();

			// await firestore
			// 	.collection("activeDrivers")
			// 	.doc(context.params.driverId)
			// 	.collection("activeTrips")
			// 	.doc(context.params.tripId)
			// 	.set({
			// 		ref: firestore.collection("trips").doc(context.params.tripId),
			// 	});
		}
	});
