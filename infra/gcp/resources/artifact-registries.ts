import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Creates a new Artifact Registry repository for Docker images.
 * @returns The newly created Artifact Registry repository.
 */
export function createArtifactRegistry(dependsOn: pulumi.Resource[]) {
  // Creating a new GCP service for Artifact Registry API
  const ArtifactRegistryApi = new gcp.projects.Service(
    "artifact-registry-api",
    {
      service: "artifactregistry.googleapis.com",
    },
    {
      dependsOn: dependsOn,
    },
  );

  // Creating a new Artifact Registry repository for Docker images
  return new gcp.artifactregistry.Repository(
    "docker-registry",
    {
      repositoryId: "docker-registry",
      location: "asia-south2",
      format: "DOCKER",
    },
    {
      // Making sure that the repository is created after the Artifact Registry API service
      dependsOn: [ArtifactRegistryApi],
    },
  );
}
