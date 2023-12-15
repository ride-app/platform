import * as gcp from "@pulumi/gcp";

import { createArtifactRegistryServiceAccount } from "./IAM/service-accounts/artifact-registry";
import { createCloudRunServiceManagerServiceAccount } from "./IAM/service-accounts/cloud-run-service-manager";
import { createPulumiServiceAccount } from "./IAM/service-accounts/pulumi";
import { updateDefaultComputeServiceAccount } from "./IAM/service-accounts/default-compute";
import { updateCloudBuildServiceAccount } from "./IAM/service-accounts/cloud-build";

import { createArtifactRegistry } from "./resources/artifact-registries";
import { createGCPProject } from "./resources/gcp-project";
import { FirebaseProject } from "./resources/firebase";
import { createSecrets } from "./resources/secrets";
import { WorkloadIdentity } from "./resources/workload-identity";

import { enableCloudRun } from "./apis/cloud-run";
import { enableIam } from "./apis/iam";
import { enableSecretManager } from "./apis/secret-manager";
import { enableCloudFunctions } from "./apis/cloud-functions";
import { enableCloudBuild } from "./apis/cloud-build";
import { enableEventArc } from "./apis/event-arc";

// Enable the Service Usage API for the project.
const serviceUsageApi = new gcp.projects.Service(
  "service-usage-api",
  {
    service: "serviceusage.googleapis.com",
  },
  {
    protect: true, // Prevent accidental deletion of the service.
  }
);

// Enable IAM API
const iamApi = enableIam([serviceUsageApi]);

// Create a new service account for Pulumi
const pulumiSvcAcc = createPulumiServiceAccount([iamApi]);

// Create a new Firebase project and associate it with the GCP project
new FirebaseProject("firebase",);

// Create a new Artifact Registry instance
createArtifactRegistry([]);

// Create a new service account for Artifact Registry
const artifactRegistrySvcAcc = createArtifactRegistryServiceAccount([iamApi]);

// Enable Cloud Run API
enableCloudRun([]);

// Create a new service account for Cloud Run Service Manager
const cloudRunSvcAcc = createCloudRunServiceManagerServiceAccount([iamApi]);

// Create a new Workload Identity pool for Github Actions
new WorkloadIdentity(
  "github-actions-workload-identity",
  {
    displayName: "Github Actions",
    id: "github-actions",
    issuerUri: "https://token.actions.githubusercontent.com",
    attributeMapping: {
      "attribute.repository_owner": "assertion.repository_owner",
      "attribute.actor": "assertion.actor",
      "attribute.repository": "assertion.repository",
      "google.subject": "assertion.sub",
    },
    serviceAccounts: [cloudRunSvcAcc, artifactRegistrySvcAcc, pulumiSvcAcc],
  },
  {
    dependsOn: [iamApi],
  }
);

// Create a new Workload Identity pool for Pulumi
new WorkloadIdentity(
  "pulumi-workload-identity",
  {
    displayName: "Pulumi",
    id: "pulumi",
    issuerUri: "https://api.pulumi.com/oidc",
    attributeMapping: {
      "google.subject": "pulumi:environments:org:ride:env:<yaml>",
    },
    allowedAudiences: ["ride"],
    serviceAccounts: [pulumiSvcAcc, cloudRunSvcAcc],
  },
  {
    dependsOn: [iamApi],
  }
);

// Enable Secret Manager API
const secretManagerApi = enableSecretManager([]);

// Create new secrets
createSecrets([secretManagerApi]);

// Update the default compute service account with the new service accounts
updateDefaultComputeServiceAccount();

updateCloudBuildServiceAccount();

// Enable Cloud Functions API
enableCloudFunctions([]);

// Enable Cloud Build API
enableCloudBuild([]);

// Enable Event Arc API
enableEventArc([]);