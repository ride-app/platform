import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * A Pulumi component resource that creates a Workload Identity Pool and Provider, and binds the specified service accounts to the provider.
 * @class
 * @extends pulumi.ComponentResource
 */
export class WorkloadIdentity extends pulumi.ComponentResource {
  constructor(
    name: string,
    args: {
      id: string; // The ID of the Workload Identity Pool.
      displayName: string; // The display name of the Workload Identity Pool.
      projectNumber?: gcp.organizations.Project; // The GCP project to create the Workload Identity Pool in.
      issuerUri: string; // The URI of the OIDC identity provider.
      attributeMapping?: {
        [key: string]: pulumi.Input<string>;
      }; // The attribute mapping to use for the Workload Identity Pool Provider.
      serviceAccounts?: gcp.serviceaccount.Account[]; // The service accounts to bind to the Workload Identity Pool Provider.
      allowedAudiences?: pulumi.Input<string>[]; // The allowed audiences for the OIDC identity provider.
    },
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ride:platform:gcp:workload-identity", name, {}, opts);

    // Create the Workload Identity Pool.
    const workloadIdentityPool = new gcp.iam.WorkloadIdentityPool(
      `${args.id}-workload-identity-pool`,
      {
        workloadIdentityPoolId: args.id,
        displayName: args.displayName,
      },
      {
        parent: this,
      },
    );

    // Create the Workload Identity Pool Provider.
    const oidcProvider = new gcp.iam.WorkloadIdentityPoolProvider(
      `${args.id}-oidc-provider`,
      {
        workloadIdentityPoolId: workloadIdentityPool.workloadIdentityPoolId,
        workloadIdentityPoolProviderId: `${args.id}-provider`,
        displayName: args.displayName,
        attributeMapping: args.attributeMapping,
        oidc: {
          issuerUri: args.issuerUri,
          allowedAudiences: args.allowedAudiences,
        },
      },
      {
        parent: this,
      },
    );

    // Bind the specified service accounts to the Workload Identity Pool Provider.
    args.serviceAccounts?.map(async (serviceAccount) => {
      const name = await new Promise<string>((resolve) => {
        oidcProvider.workloadIdentityPoolId.apply((workloadIdentityPoolId) => {
          return serviceAccount.accountId.apply((value) => {
            resolve(
              `${value}-service-account-${workloadIdentityPoolId}-workload-identity`,
            );
          });
        });
      });

      new gcp.serviceaccount.IAMBinding(
        `${name}-service-account-token-creator`,
        {
          serviceAccountId: serviceAccount.name,
          role: "roles/iam.serviceAccountTokenCreator",
          members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        {
          parent: this,
        },
      );

      new gcp.serviceaccount.IAMBinding(
        `${name}-service-account-open-id-token-creator`,
        {
          serviceAccountId: serviceAccount.name,
          role: "roles/iam.serviceAccountOpenIdTokenCreator",
          members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        {
          parent: this,
        },
      );

      new gcp.serviceaccount.IAMBinding(
        `${name}-service-account-user`,
        {
          serviceAccountId: serviceAccount.name,
          role: "roles/iam.serviceAccountUser",
          members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
        },
        {
          parent: this,
        },
      );

      new gcp.serviceaccount.IAMBinding(
        `${name}-workload-identity-user`,
        {
          serviceAccountId: serviceAccount.name,
          role: "roles/iam.workloadIdentityUser",
          members: [
            pulumi.interpolate`principalSet://iam.googleapis.com/projects/${
              args.projectNumber ?? gcp.config.project
            }/locations/global/workloadIdentityPools/${
              oidcProvider.workloadIdentityPoolId
            }/*`,
          ],
        },
        {
          parent: this,
        },
      );
    });
  }
}
