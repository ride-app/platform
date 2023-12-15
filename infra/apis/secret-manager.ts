import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Enables the Secret Manager API for the current GCP project.
 * @returns A new GCP project service instance for the Secret Manager API.
 */
export function enableSecretManager(dependsOn: pulumi.Resource[]) {
  return new gcp.projects.Service(
    "secret-manager-api",
    {
      service: "secretmanager.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    }
  );
}
