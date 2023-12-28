import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * A Pulumi component resource that creates a Service Account and adds the specified roles.
 * @extends pulumi.ComponentResource
 */
export class ServiceAccount extends pulumi.ComponentResource {
  account: gcp.serviceaccount.Account;

  /**
   * Creates a new ServiceAccount instance.
   * @param name - The name of the service account.
   * @param args - The arguments required to create the service account.
   * @param opts - Additional resource options.
   */
  constructor(
    name: string,
    args: {
      accountId: string; // The ID of the Workload Identity Pool.
      displayName: string; // The display name of the Workload Identity Pool.
      roles: string[]; // The allowed audiences for the OIDC identity provider.
    },
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ride:platform:gcp:service-account", name, {}, opts);

    this.account = new gcp.serviceaccount.Account(
      `${args.accountId}-service-account`,
      {
        accountId: args.accountId,
        displayName: args.displayName,
      },
      {
        parent: this,
      },
    );

    // Add the roles to the service account
    args.roles.map(
      (role, idx) =>
        new gcp.projects.IAMMember(
          `${args.accountId}-service-account-iam-member-${idx}`,
          {
            role: role,
            member: pulumi.interpolate`serviceAccount:${this.account.email}`,
            project: gcp.config.project!,
          },
          {
            parent: this,
          },
        ),
    );
  }
}
