import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";

/**
 * Creates secrets for Razorpay configuration using Google Cloud Secret Manager.
 * @param dependsOn An optional list of resources that this function depends on.
 */
export function createSecrets(dependsOn?: pulumi.Resource[]) {
  // Get the Razorpay configuration from Pulumi configuration.
  const razorpayConfig = new pulumi.Config("razorpay");

  // Create a new secret for Razorpay key.
  const razorpayKey = new gcp.secretmanager.Secret("razorpay-key", {
    secretId: "razorpay-key",
    replication: {
      auto: {},
    },
  });

  // Create a new version of the Razorpay key secret.
  new gcp.secretmanager.SecretVersion("razorpay-key-version", {
    secret: razorpayKey.id,
    secretData: razorpayConfig.requireSecret("key"),
  });

  // Create a new secret for Razorpay secret.
  const razorpaySecret = new gcp.secretmanager.Secret(
    "razorpay-secret",
    {
      secretId: "razorpay-secret",
      replication: {
        auto: {},
      },
    },
    {
      dependsOn,
    }
  );

  // Create a new version of the Razorpay secret.
  new gcp.secretmanager.SecretVersion("razorpay-secret-version", {
    secret: razorpaySecret.id,
    secretData: razorpayConfig.requireSecret("secret"),
  });

  // Create a new secret for Razorpay account number.
  const razorpayAccNo = new gcp.secretmanager.Secret(
    "razorpay-account-number",
    {
      secretId: "razorpay-account-number",
      replication: {
        auto: {},
      },
    }
  );

  // Create a new version of the Razorpay account number secret.
  new gcp.secretmanager.SecretVersion("razorpay-account-number-version", {
    secret: razorpayAccNo.id,
    secretData: razorpayConfig.requireSecret("accountNumber"),
  });
}
