import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Creates a new GCP service account for Pulumi with the specified project ID.
 * @param projectId - The ID of the GCP project to associate the service account with.
 * @returns The newly created GCP service account.
 */
export function createPulumiServiceAccount(
  dependsOn: pulumi.Resource[]
): gcp.serviceaccount.Account {
  // Create a new GCP service account for Pulumi
  const serviceAccount = new gcp.serviceaccount.Account(
    "pulumi-service-account",
    {
      accountId: "pulumi",
      displayName: "Pulumi",
    },
    {
      dependsOn: dependsOn,
    }
  );

  // Define the roles for the service account
  const svcAccRoles = [
    "roles/editor",
    "roles/resourcemanager.projectIamAdmin",
    "roles/iam.serviceAccountTokenCreator",
    "roles/iam.serviceAccountUser",
  ];

  // Add the roles to the service account
  svcAccRoles.map(
    (role, idx) =>
      new gcp.projects.IAMMember(`pulumi-service-account-iam-member-${idx}`, {
        role: role,
        member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
        project: gcp.config.project!,
      })
  );

  // Return the newly created service account
  return serviceAccount;
}
