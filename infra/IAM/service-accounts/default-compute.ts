import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * This function updates the default compute service account with the specified roles.
 * @param projectNumber - The GCP project to update the default compute service account for.
 */
export function updateDefaultComputeServiceAccount(
  projectNumber: string = gcp.config.project!
) {
  // Specify the roles to add to the default compute service account.
  const svcAccRoles = ["roles/secretmanager.secretAccessor"];

  // Map over the roles and create a new IAM member for each one.
  svcAccRoles.map(
    (role, idx) =>
      new gcp.projects.IAMMember(
        `default-compute-service-account-iam-member-${idx}`,
        {
          role: role,
          member: pulumi.interpolate`serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`,
          project: gcp.config.project!,
        }
      )
  );
}
