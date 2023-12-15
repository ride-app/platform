import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Creates a GCP service account to deploy Cloud Run Services with the specified project ID.
 * @param dependsOn - An array of resources that the service account depends on.
 * @returns The created GCP service account.
 */
export function createCloudRunServiceManagerServiceAccount(
  dependsOn: pulumi.Resource[]
): gcp.serviceaccount.Account {
  // Create a new GCP service account with the specified account ID and display name.
  const serviceAccount = new gcp.serviceaccount.Account(
    "cloud-run-service-manager-service-account",
    {
      accountId: "cloud-run-service-manager",
      displayName: "Cloud Run Service Manager",
    },
    {
      dependsOn: dependsOn,
    }
  );

  // Define the roles that the service account will have.
  const svcAccRoles = [
    "roles/artifactregistry.reader",
    "roles/artifactregistry.writer",
    "roles/run.admin",
    "roles/iam.serviceAccountUser",
    "roles/serviceusage.serviceUsageConsumer",
    "roles/iam.serviceAccountTokenCreator",
  ];

  // Grant the service account the defined roles.
  svcAccRoles.map(
    (role, idx) =>
      new gcp.projects.IAMMember(
        `cloud-run-service-account-iam-member-${idx}`,
        {
          role: role,
          member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
          project: gcp.config.project!,
        }
      )
  );

  // Return the created service account.
  return serviceAccount;
}
