import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Enables the Cloud Run API for the current GCP project.
 * @returns A new `gcp.projects.Service` instance representing the Cloud Run API.
 */
export function enableCloudRun(dependsOn: pulumi.Resource[]) {
  return new gcp.projects.Service("cloud-run-api", {
    service: "run.googleapis.com",
  });
}
