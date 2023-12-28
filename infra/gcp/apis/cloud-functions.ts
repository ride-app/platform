import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable Cloud Function API
export function enableCloudFunctions(dependsOn: pulumi.Resource[]) {
  return new gcp.projects.Service(
    "cloud-functions-api",
    {
      service: "cloudfunctions.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    },
  );
}
