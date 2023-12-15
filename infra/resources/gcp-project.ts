import * as gcp from "@pulumi/gcp";

/**
 * Creates a new GCP project with the provided name and project ID.
 * @param projectName - The name of the project to create.
 * @param projectId - The ID of the project to create.
 * @returns The newly created GCP project.
 */
export function createGCPProject(projectName: string) {
  // Create a new GCP project with the provided name, project ID, and billing account.
  const project = new gcp.organizations.Project(
    `gcp-project`,
    {
      labels: {
        firebase: "enabled",
      },
      name: projectName,
      orgId: "436785160172",
      projectId: gcp.config.project!,
      billingAccount: "0143EF-5EFE92-53D9A3",
    },
    {
      protect: true, // Prevent accidental deletion of the project.
    }
  );

  // Enable the Service Usage API for the project.
  new gcp.projects.Service(
    "service-usage-api",
    {
      service: "serviceusage.googleapis.com",
    },
    {
      protect: true, // Prevent accidental deletion of the service.
      dependsOn: [project], // Ensure the project is created before enabling the service.
    }
  );

  // Enable the IAM Service Account Credentials API for the project.
  new gcp.projects.Service(
    `iam-service-account-credentials-api`,
    {
      service: "iamcredentials.googleapis.com",
    },
    {
      dependsOn: [project], // Ensure the project is created before enabling the service.
    }
  );

  return project; // Return the newly created GCP project.
}
