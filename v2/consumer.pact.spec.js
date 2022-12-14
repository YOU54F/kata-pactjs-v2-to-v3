// (1) Import the pact library and matching methods
const { Pact } = require("@pact-foundation/pact");
const { Matchers } = require("@pact-foundation/pact");
const { like, regex } = Matchers;
// This is the target of our Pact test, the ProductApiClient
const { ProductApiClient } = require("./api");
// This is domain object that the Consumer cares about, it will utilise
// the response from the provider and unmarshall it into the required model
const { Product } = require("./product");
// This is an assertion library, you can use whichever assertion language
// for your unit testing tool of choice
const chai = require("chai");
const expect = chai.expect;

// (2) Configure our Pact library
const mockProvider = new Pact({
  consumer: "katacoda-consumer-v2",
  provider: "katacoda-provider-v2",
  cors: true, // needed for katacoda environment
});

describe("Products API test", () => {
  // (3) Setup Pact lifecycle hooks
  before(() => mockProvider.setup());
  afterEach(() => mockProvider.verify());
  after(() => mockProvider.finalize());

  it("get product by ID", async () => {
    // (4) Arrange: Setup our expected interactions
    //
    // We use Pact to mock out the backend API
    const expectedProduct = { id: 10, type: "pizza", name: "Margharita" };

    await mockProvider.addInteraction({
      state: "a product with ID 10 exists",
      uponReceiving: "a request to get a product",
      withRequest: {
        method: "GET",
        path: "/products/10",
      },
      willRespondWith: {
        status: 200,
        headers: {
          "Content-Type": regex({
            generate: "application/json; charset=utf-8",
            matcher: "^application/json",
          }),
        },
        body: like(expectedProduct),
      },
    });

    // (5) Act: test our API client behaves correctly
    // Note we configure the ProductApiClient API client dynamically to
    // point to the mock service Pact created for us, instead of the real one
    const api = new ProductApiClient(mockProvider.mockService.baseUrl);
    const product = await api.getProduct(10);

    // (6) Assert that we got the expected response from our provider and our
    // client code unmarshalled it into the object  we expected
    expect(product).to.deep.equal(new Product(10, "Margharita", "pizza"));
  });
});
