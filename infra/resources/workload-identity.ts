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
    opts?: pulumi.ComponentResourceOptions
  ) {
    super("ride:infra:WorkloadIdentity", name, {}, opts);

    // Create the Workload Identity Pool.
    const workloadIdentityPool = new gcp.iam.WorkloadIdentityPool(
      `${args.id}-workload-identity-pool`,
      {
        workloadIdentityPoolId: args.id,
        displayName: args.displayName,
      },
      {
        parent: this,
      }
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
      }
    );

    // Bind the specified service accounts to the Workload Identity Pool Provider.
    args.serviceAccounts?.map(async (serviceAccount) => {
      const name = await new Promise<string>((resolve, reject) => {
        oidcProvider.workloadIdentityPoolId.apply((workloadIdentityPoolId) => {
          return serviceAccount.displayName.apply((value) => {
            resolve(
              `${workloadIdentityPoolId}-${value}-workload-identity-pool-iam-policy-binding`
            );
          });
        });
      });

      new gcp.serviceaccount.IAMBinding(
        name,
        {
          serviceAccountId: serviceAccount.name,
          role: "roles/iam.workloadIdentityUser",
          members: [
            pulumi.interpolate`principalSet://iam.googleapis.com/projects/${args.projectNumber??gcp.config.project}/locations/global/workloadIdentityPools/${oidcProvider.workloadIdentityPoolId}/*`,
          ],
        },
        {
          parent: this,
        }
      );
    });
  }
}
