import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Creates a new service account for Artifact Registry with the specified roles and adds it to the project's IAM members.
 * @param projectId - The ID of the project to add the service account to.
 * @returns The newly created Artifact Registry service account.
 */
export function createArtifactRegistryServiceAccount(
  dependsOn: pulumi.Resource[],
): gcp.serviceaccount.Account {
  // Create a new service account for Artifact Registry with the specified display name and account ID.
  const serviceAccount = new gcp.serviceaccount.Account(
    "artifact-registry-service-account",
    {
      accountId: "artifact-registry-admin",
      displayName: "Artifact Registry Admin",
    },
    {
      dependsOn: dependsOn, // Ensure the project is created before creating the service account.
    },
  );

  // Define the roles to be granted to the Artifact Registry service account.
  const svcAccRoles = [
    "roles/artifactregistry.writer",
    // "roles/iam.serviceAccountTokenCreator",
    // "roles/iam.serviceAccountUser",
  ];

  // Grant the roles to the Artifact Registry service account by adding it to the project's IAM members.
  svcAccRoles.map(
    (role, idx) =>
      new gcp.projects.IAMMember(
        `artifact-registry-service-account-iam-member-${idx}`,
        {
          role: role,
          member: pulumi.interpolate`serviceAccount:${serviceAccount.email}`,
          project: gcp.config.project!,
        },
      ),
  );

  // Return the newly created Artifact Registry service account.
  return serviceAccount;
}
