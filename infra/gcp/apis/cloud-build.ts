import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable Cloud Build API
export function enableCloudBuild(dependsOn: pulumi.Resource[]) {
  return new gcp.projects.Service(
    "cloud-build-api",
    {
      service: "cloudbuild.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    },
  );
}
