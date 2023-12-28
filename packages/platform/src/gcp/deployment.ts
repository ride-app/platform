import * as gcp from "@pulumi/gcp";
import * as pulumi from "@pulumi/pulumi";

export class AppDeployment extends pulumi.ComponentResource {
  constructor(
    name: string,
    args: {
      deploymentName: pulumi.Input<string>;
      location: pulumi.Input<string>;
      cloudBuildFile: pulumi.Input<string>;
      substitutions?: pulumi.Input<{
        [key: string]: pulumi.Input<string>;
      }>;
    },
    opts?: pulumi.ComponentResourceOptions,
  ) {
    super("ride:platform:gcp:app-deployment", name, {}, opts);

    const github_connection = gcp.cloudbuildv2.Connection.get(
      "github-connection",
      pulumi.interpolate`projects/${gcp.config.project}/locations/${args.location}/connections/GitHub`,
    );

    const repository = new gcp.cloudbuildv2.Repository("repository", {
      location: args.location,
      parentConnection: github_connection.name,
      remoteUri: pulumi.interpolate`https://github.com/ride-app/${args.deploymentName}.git`,
    });

    new gcp.cloudbuild.Trigger("build-trigger", {
      location: args.location,
      repositoryEventConfig: {
        repository: repository.id,
        push: {
          branch: "^main$",
        },
      },
      substitutions: args.substitutions,
      filename: "cloudbuild.yaml",
      includeBuildLogs: "INCLUDE_BUILD_LOGS_WITH_STATUS",
    });
  }
}
