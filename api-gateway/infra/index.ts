import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

const serviceName =
  new pulumi.Config("service").get("name") || pulumi.getProject();
const location = "asia-east1";

const github_connection = gcp.cloudbuildv2.Connection.get(
  "github-connection",
  pulumi.interpolate`projects/${gcp.config.project}/locations/${location}/connections/GitHub`,
);

const repository = new gcp.cloudbuildv2.Repository("repository", {
  location,
  parentConnection: github_connection.name,
  remoteUri: "https://github.com/ride-app/api-gateway.git",
});

new gcp.cloudbuild.Trigger("build-trigger", {
  location,
  repositoryEventConfig: {
    repository: repository.id,
    push: {
      branch: "^main$",
    },
  },
  filename: "cloudbuild.yaml",
  substitutions: {
    _SERVICE_SUFFIX: new pulumi.Config().require("serviceSuffix"),
    _DOMAIN: new pulumi.Config().require("domain"),
  },
  includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
});
