import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * FirebaseProject is a Pulumi component resource that creates a Firebase project with Firestore and Realtime Database.
 * @class
 */
export class FirebaseProject extends pulumi.ComponentResource {
  // readonly project: gcp.firebase.Project;
  readonly firestore: gcp.firestore.Database;
  // readonly firebaseDatabase: gcp.firebase.DatabaseInstance;

  /**
   * Creates a new Firebase project with Firestore and Realtime Database.
   * @constructor
   * @param {string} name - The name of the resource.
   * @param {Object} args - The arguments required for creating the Firebase project.
   * @param {gcp.organizations.Project} args.project - The GCP project to associate the Firebase project with.
   * @param {pulumi.ComponentResourceOptions} opts - The resource options.
   */
  constructor(name: string, opts?: pulumi.ComponentResourceOptions) {
    super("ride:infra:FirebaseProject", name, {}, opts);

    // Enable Firebase Realtime Database API.
    const firebaseDatabaseApi = new gcp.projects.Service(
      "firebase-database-api",
      {
        service: "firebasedatabase.googleapis.com",
      },
      {
        parent: this,
        retainOnDelete: true,
      },
    );

    // Enable Firestore API.
    const firestoreApi = new gcp.projects.Service(
      "firestore-api",
      {
        service: "firestore.googleapis.com",
      },
      {
        parent: this,
        retainOnDelete: true,
      },
    );

    // Create a new Firestore database.
    this.firestore = new gcp.firestore.Database(
      "firestore",
      {
        locationId: "asia-south1",
        name: "(default)",
        type: "FIRESTORE_NATIVE",
      },
      {
        dependsOn: [firestoreApi],
        parent: this,
        retainOnDelete: true,
      },
    );

    // Enable Firebase App Testers API.
    const firebaseAppTestersApi = new gcp.projects.Service(
      "firebase-app-testers-api",
      {
        service: "firebaseapptesters.googleapis.com",
      },
      {
        parent: this,
        retainOnDelete: true,
      },
    );
  }
}
