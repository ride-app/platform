import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

// Enable Eventarc API
export function enableEventArc(dependsOn: pulumi.Resource[]) {
  return new gcp.projects.Service(
    "eventarc-api",
    {
      service: "eventarc.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    }
  );
}
