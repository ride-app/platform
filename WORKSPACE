# This file marks the root of the Bazel workspace.
# See MODULE.bazel for external dependencies setup.

# Declares that this directory is the root of a Bazel workspace.
# See https://docs.bazel.build/versions/main/build-ref.html#workspace
workspace(
    # How this workspace would be referenced with absolute labels from another workspace
    name = "platform",
)

load("@rules_nodejs//nodejs:repositories.bzl", "node_repositories")

node_repositories(
    name = "nodejs",
    # node_version = "16.20.2",
)
