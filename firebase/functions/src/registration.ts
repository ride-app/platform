import * as functions from "firebase-functions";
import { getAuth } from "firebase-admin/auth";

export const setUserClaims = functions.firestore
	.document("users/{userId}")
	.onCreate(async (_, context) => {
		await getAuth().setCustomUserClaims(
			(
				await getAuth().getUser(context.params.userId)
			).uid,
			{ isRider: true }
		);
	});

export const setDriverClaims = functions.firestore
	.document("partners/{partnerId}")
	.onCreate(async (_, context) => {
		await getAuth().setCustomUserClaims(
			(
				await getAuth().getUser(context.params.partnerId)
			).uid,
			{ isPartner: true }
		);
	});
