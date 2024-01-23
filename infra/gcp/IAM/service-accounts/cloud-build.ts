import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * This function updates the cloud build service account with the specified roles.
 * @param projectNumber - The GCP project to update the default compute service account for.
 */
export function updateCloudBuildServiceAccount(
  projectNumber: string = gcp.config.project!,
) {
  // Get the project number and use it to construct the default compute service account email.
  // Specify the roles to add to the default compute service account.
  const svcAccRoles: string[] = [
    "roles/iam.serviceAccountUser",
    "roles/secretmanager.secretAccessor",
    "roles/run.admin",
  ];

  // Map over the roles and create a new IAM member for each one.
  return svcAccRoles.map(
    (role, idx) =>
      new gcp.projects.IAMMember(
        `cloud-build-service-account-iam-member-${idx}`,
        {
          role: role,
          member: pulumi.interpolate`serviceAccount:${projectNumber}@cloudbuild.gserviceaccount.com`,
          project: gcp.config.project!,
        },
      ),
  );
}
