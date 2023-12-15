import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * FirebaseProject is a Pulumi component resource that creates a Firebase project with Firestore and Realtime Database.
 * @class
 */
export class FirebaseProject extends pulumi.ComponentResource {
  readonly firebaseProject: gcp.firebase.Project;
  readonly firestore: gcp.firestore.Database;
  readonly firebaseDatabase: gcp.firebase.DatabaseInstance;

  /**
   * Creates a new Firebase project with Firestore and Realtime Database.
   * @constructor
   * @param {string} name - The name of the resource.
   * @param {Object} args - The arguments required for creating the Firebase project.
   * @param {pulumi.Input<string>} args.projectId - The GCP project to associate the Firebase project with.
   * @param {pulumi.ComponentResourceOptions} opts - The resource options.
   */
  constructor(
    name: string,
    args: { projectId: pulumi.Input<string> } = {projectId: gcp.config.project!},
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("ride:infra:FirebaseProject", name, {}, opts);

    // Enable Firebase management API.
    const firebaseManagementApi = new gcp.projects.Service(
      "firebase-management-api",
      {
        service: "firebase.googleapis.com",
      },
      { parent: this }
    );

    // Create a new Firebase project.
    this.firebaseProject = new gcp.firebase.Project(
      "firebase-project",
      {
        project: args.projectId,
      },
      {
        dependsOn: [firebaseManagementApi],
        parent: this,
      }
    );

    // Enable Firebase Realtime Database API.
    const firebaseDatabaseApi = new gcp.projects.Service(
      "firebase-database-api",
      {
        service: "firebasedatabase.googleapis.com",
      },
      { parent: this }
    );

    // Create a new Firebase Realtime Database instance.
    this.firebaseDatabase = new gcp.firebase.DatabaseInstance(
      "firebase-rtdb",
      {
        instanceId: pulumi.interpolate`${args.projectId.toString().split("/")[1]}-default-rtdb`,
        region: "asia-southeast1",
        type: "DEFAULT_DATABASE",
      },
      {
        parent: this,
        dependsOn: [this.firebaseProject, firebaseDatabaseApi],
      }
    );

    // Enable Firestore API.
    const firestoreApi = new gcp.projects.Service(
      "firestore-api",
      {
        service: "firestore.googleapis.com",
      },
      { parent: this }
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
        dependsOn: [this.firebaseProject, firestoreApi],
        parent: this,
      }
    );

    // Enable Firebase App Testers API.
    const firebaseAppTestersApi = new gcp.projects.Service(
      "firebase-app-testers-api",
      {
        service: "firebaseapptesters.googleapis.com",
      },
      { parent: this }
    );
  }
}
