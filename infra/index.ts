import * as gcp from "@pulumi/gcp";

import { createArtifactRegistryServiceAccount } from "./gcp/IAM/service-accounts/artifact-registry";
import { createCloudRunServiceManagerServiceAccount } from "./gcp/IAM/service-accounts/cloud-run-service-manager";
import { createPulumiServiceAccount } from "./gcp/IAM/service-accounts/pulumi";
import { updateDefaultComputeServiceAccount } from "./gcp/IAM/service-accounts/default-compute";
import { updateCloudBuildServiceAccount } from "./gcp/IAM/service-accounts/cloud-build";

import { createArtifactRegistry } from "./gcp/resources/artifact-registries";
import { FirebaseProject } from "./gcp/resources/firebase";
import { createSecrets } from "./gcp/resources/secrets";
import { ServiceAccount } from "./gcp/commons/service-account";
import { WorkloadIdentity } from "./gcp/commons/workload-identity";

import { enableCloudRun } from "./gcp/apis/cloud-run";
import { enableIam } from "./gcp/apis/iam";
import { enableSecretManager } from "./gcp/apis/secret-manager";
import { enableCloudFunctions } from "./gcp/apis/cloud-functions";
import { enableCloudBuild } from "./gcp/apis/cloud-build";
import { enableEventArc } from "./gcp/apis/event-arc";

// Enable IAM API
const iamApi = enableIam();

// Create a new service account for Pulumi
// const pulumiSvcAcc = createPulumiServiceAccount([iamApi]);
const pulumiSvcAcc = new ServiceAccount(
  "pulumi-service-account",
  {
    accountId: "pulumi",
    displayName: "Pulumi",
    roles: ["roles/editor", "roles/resourcemanager.projectIamAdmin"],
  },
  {
    dependsOn: [iamApi],
  },
);

// Create a new Firebase project and associate it with the GCP project
new FirebaseProject("firebase");

// Create a new Artifact Registry instance
createArtifactRegistry([]);

// Create a new service account for Artifact Registry
const artifactRegistrySvcAcc = new ServiceAccount(
  "artifact-registry-service-account",
  {
    accountId: "artifact-registry",
    displayName: "Artifact Registry",
    roles: [
      "roles/artifactregistry.writer",
      "roles/iam.serviceAccountTokenCreator",
      "roles/iam.serviceAccountUser",
    ],
  },
  {
    dependsOn: [iamApi],
  },
);

// Enable Cloud Run API
enableCloudRun();

// Create a new service account for Cloud Run Service Manager
// const cloudRunSvcAcc = createCloudRunServiceManagerServiceAccount([iamApi]);
const cloudRunSvcAcc = new ServiceAccount(
  "cloud-run-service-manager-service-account",
  {
    accountId: "cloud-run-service-manager",
    displayName: "Cloud Run Service Manager",
    roles: [
      "roles/artifactregistry.reader",
      "roles/artifactregistry.writer",
      "roles/run.admin",
      "roles/serviceusage.serviceUsageConsumer",
    ],
  },
  {
    dependsOn: [iamApi],
  },
);

// Create a new Workload Identity pool for Github Actions
// new WorkloadIdentity(
//   "github-actions-workload-identity",
//   {
//     displayName: "Github Actions",
//     id: "github-actions",
//     issuerUri: "https://token.actions.githubusercontent.com",
//     attributeMapping: {
//       "attribute.repository_owner": "assertion.repository_owner",
//       "attribute.actor": "assertion.actor",
//       "attribute.repository": "assertion.repository",
//       "google.subject": "assertion.sub",
//     },
//     serviceAccounts: [
//       cloudRunSvcAcc.account,
//       artifactRegistrySvcAcc.account,
//       pulumiSvcAcc.account,
//     ],
//   },
//   {
//     dependsOn: [iamApi],
//   }
// );

// Create a new Workload Identity pool for Pulumi
new WorkloadIdentity(
  "pulumi-workload-identity",
  {
    displayName: "Pulumi",
    id: "pulumi",
    issuerUri: "https://api.pulumi.com/oidc",
    attributeMapping: {
      "google.subject": "assertion.sub",
    },
    allowedAudiences: ["ride"],
    serviceAccounts: [pulumiSvcAcc.account, cloudRunSvcAcc.account],
  },
  {
    dependsOn: [iamApi],
  },
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
