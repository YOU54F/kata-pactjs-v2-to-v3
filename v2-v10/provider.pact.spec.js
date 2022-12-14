const { Verifier } = require("@pact-foundation/pact");
const { server } = require("./provider");
const { versionFromGitTag } = require("absolute-version");

describe("Pact Verification", () => {
  before((done) => server.listen(8081, done));

  it("validates the expectations of ProductService", () => {
    const opts = {
      logLevel: "INFO",
      providerBaseUrl: "http://localhost:8081",
      providerVersion: versionFromGitTag() + "-provider",
      provider: "katacoda-provider-v2-v10",
      providerBranch:
        process.env.GIT_BRANCH ??
        versionFromGitTag().split("-")[1].split("+")[1],
      consumerVersionSelectors: [{ mainBranch: true }],
      pactBrokerUrl: process.env.PACT_BROKER_BASE_URL,
      // pactUrls: [
      //   `${process.env.PWD}/pacts/katacoda-consumer-katacoda-provider.json`,
      // ],
      publishVerificationResult: true,
      enablePending: true,
    };

    return new Verifier(opts).verifyProvider().then((output) => {
      console.log("Pact Verification Complete!");
      console.log(output);
    });
  });
});
