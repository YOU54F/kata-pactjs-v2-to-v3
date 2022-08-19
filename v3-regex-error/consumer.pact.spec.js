// (1) Import the pact library and matching methods
const { PactV3 } = require("@pact-foundation/pact");
const { MatchersV3 } = require("@pact-foundation/pact");
const { like, regex } = MatchersV3;
// This is the target of our Pact test, the ProductApiClient
const { ProductApiClient } = require("./api");
const { Product } = require("./product");
// This is an assertion library, you can use whichever assertion language
// for your unit testing tool of choice
const chai = require("chai");
const expect = chai.expect;

// (2) Configure our Pact library
const mockProvider = new PactV3({
  consumer: "katacoda-consumer-v3-regex-error",
  provider: "katacoda-provider-v3-regex-error",
  cors: true, // needed for katacoda environment
});

describe("Products API test", () => {
  it("get product by ID", async () => {
    // (3) Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    const expectedProduct = { id: 10, type: "pizza", name: "Margharita" };

    mockProvider
      .given("a product with ID 10 exists")
      .uponReceiving("a request to get a product")
      .withRequest({
        method: "GET",
        path: "/products/10",
      })
      .willRespondWith({
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
        },
        // headers: {
        //   "Content-Type": regex({
        //     generate: "application/json; charset=utf-8",
        //     matcher: "^application/json",
        //   }),
        // },
        // Fails if using regex for headers
        // 2022-08-19T15:04:09.775212Z  WARN ThreadId(01) pact_models::content_types: Failed to parse '' as a content type: mime parse error: a slash (/) was missing between the type and subtype
        // 2022-08-19T15:04:09.775667Z  WARN ThreadId(01) pact_models::content_types: Failed to parse '' as a content type: mime parse error: a slash (/) was missing between the type and subtype
        // 2022-08-19T15:04:09.796729Z  INFO tokio-runtime-worker pact_mock_server::hyper_server: Received request HTTP Request ( method: GET, path: /products/10, query: None, headers: Some({"accept": ["application/json", "text/plain", "*/*"], "user-agent": ["axios/0.27.2"], "connection": ["close"], "host": ["127.0.0.1:64094"]}), body: Empty )
        // 2022-08-19T15:04:09.797750Z  INFO tokio-runtime-worker pact_matching: comparing to expected HTTP Request ( method: GET, path: /products/10, query: None, headers: None, body: Missing )
        // 2022-08-19T15:04:09.799699Z  INFO tokio-runtime-worker pact_mock_server::hyper_server: Request matched, sending response HTTP Response ( status: 200, headers: Some({"Content-Type": [""]}), body: Present(81 bytes) )
        body: like(expectedProduct),
      });

    // (4) Act: test our API client behaves correctly
    return mockProvider.executeTest(async (mockserver) => {
      // Note we configure the ProductApiClient API client dynamically to
      // point to the mock service Pact created for us, instead of the real one
      const api = new ProductApiClient(mockserver.url);
      const product = await api.getProduct(10);

      // (5) Assert that we got the expected response from our provider and our
      // client code unmarshalled it into the object  we expected
      expect(product).to.deep.equal(new Product(10, "Margharita", "pizza"));
    });
  });
});
