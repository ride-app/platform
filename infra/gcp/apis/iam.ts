import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Enables the IAM API for the current GCP project.
 * @returns A new `gcp.projects.Service` instance representing the IAM API.
 */
export function enableIam(dependsOn: pulumi.Resource[] = []) {
  const iamApi = new gcp.projects.Service(
    `iam-api`,
    {
      service: "iam.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    },
  );

  // Enable the IAM Service Account Credentials API for the project.
  new gcp.projects.Service(
    `iam-service-account-credentials-api`,
    {
      service: "iamcredentials.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    },
  );

  return iamApi;
}
