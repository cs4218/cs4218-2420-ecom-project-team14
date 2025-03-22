import "@testing-library/jest-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/cart";
import HomePage from "./HomePage";

// Mock modules
jest.mock("axios");
jest.mock("react-hot-toast");

jest.mock("react-router-dom", () => ({ useNavigate: jest.fn() }));

jest.mock("../context/cart", () => ({ useCart: jest.fn() }));

jest.mock("../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

jest.mock("react-icons/ai", () => ({
  AiOutlineReload: () => <span>ReloadIcon</span>,
}));

const mockCart = {};
const mockAddToCart = jest.fn();
const mockRemoveFromCart = jest.fn();
const mockUpdateQuantity = jest.fn();
const mockClearCart = jest.fn();

describe("HomePage component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue({
      cart: mockCart,
      addToCart: mockAddToCart,
      removeFromCart: mockRemoveFromCart,
      updateQuantity: mockUpdateQuantity,
      clearCart: mockClearCart,
    });
  });

  // UI Navigation tests
  describe("Navigation Tests", () => {
    it("should navigate to product details page when More Details is clicked", async () => {
      const mockNavigate = jest.fn();
      jest
        .spyOn(require("react-router-dom"), "useNavigate")
        .mockReturnValue(mockNavigate);
      const mockProducts = [
        {
          _id: 1,
          name: "Product 1",
          price: 100,
          description: "This is product 1 description",
          slug: "test-product-1",
        },
      ];

      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/category/get-category")) {
          return Promise.resolve({ data: { success: true, category: [] } });
        } else if (url.includes("/api/v1/product/product-count")) {
          return Promise.resolve({ data: { total: 1 } });
        } else if (url.includes("/api/v1/product/product-list")) {
          return Promise.resolve({ data: { products: mockProducts } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });
      render(<HomePage />);
      await waitFor(() => {
        expect(screen.getByText("Product 1")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("More Details"));
      expect(mockNavigate).toHaveBeenCalledWith(
        `/product/${mockProducts[0].slug}`
      );
    });
  });

  describe("HomePage Filters general tests", () => {
    it("should call window.location.reload when RESET FILTERS is clicked", async () => {
      // Redefine window.location.reload as it is read only
      const originalLocation = window.location;
      delete window.location;
      window.location = { ...originalLocation, reload: jest.fn() };
      const reloadSpy = jest
        .spyOn(window.location, "reload")
        .mockImplementation(() => {});
      axios.get.mockResolvedValue({ data: { success: true, category: [] } });
      render(<HomePage />);
      await waitFor(() => {
        expect(screen.getByText("RESET FILTERS")).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText("RESET FILTERS"));
      expect(reloadSpy).toHaveBeenCalled();
      reloadSpy.mockRestore();
      // Restore window.location
      window.location = originalLocation;
    });

    it("should fetch all products when both radio and checkboxes are not selected", async () => {
      axios.get.mockResolvedValueOnce({ data: { products: [] } });
      render(<HomePage />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/product-list/1"
        );
      });
    });

    it("should call product filters API when a price range is selected", async () => {
      const mockCategories = [];
      axios.get.mockImplementation((url) => {
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({
            data: { success: true, category: mockCategories },
          });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url.includes("/api/v1/product/product-list")) {
          return Promise.resolve({ data: { products: [] } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      axios.post.mockResolvedValueOnce({ data: { products: [] } });

      render(<HomePage />);

      await waitFor(() => {
        const radios = screen.getAllByRole("radio");
        expect(radios.length).toBeGreaterThan(0);
      });
      const radios = screen.getAllByRole("radio");

      // Simulate clicking one of the radios
      fireEvent.click(radios[0]);

      // Verify that the API call to product filters
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          {
            checked: [],
            radio: expect.anything(),
          }
        );
      });
    });

    it("should update filter state when a category checkbox is toggled", async () => {
      const mockCategories = [
        { _id: "1", name: "Test Category 1", slug: "category-1" },
        { _id: "2", name: "Test Category 2", slug: "category-2" },
      ];

      axios.get.mockImplementation((url) => {
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({
            data: { success: true, category: mockCategories },
          });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url.includes("/api/v1/product/product-list")) {
          return Promise.resolve({ data: { products: [] } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      axios.post.mockResolvedValueOnce({ data: { products: [] } });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("Test Category 1")).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText("Test Category 2")).toBeInTheDocument();
      });

      const checkbox = screen.getByRole("checkbox", { name: /Category 1/i });
      fireEvent.click(checkbox);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          {
            checked: ["1"],
            radio: [],
          }
        );
      });

      // Categories should still be visible after
      await waitFor(() => {
        expect(screen.getByText("Test Category 1")).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(screen.getByText("Test Category 2")).toBeInTheDocument();
      });
    });
  });

  it("should display only products from selected category when category is toggled", async () => {
    // Mock categories
    const mockCategories = [
      { _id: "c1", name: "Test Category 1", slug: "category-1" },
      { _id: "c2", name: "Test Category 2", slug: "category-2" },
    ];

    // Mock initial products (from both categories)
    const initialProducts = [
      {
        _id: "p1",
        name: "Product from Category 1",
        price: 100,
        description: "This is from category 1",
        slug: "product-category-1",
        category: "1",
      },
      {
        _id: "p2",
        name: "Product from Category 2",
        price: 200,
        description: "This is from category 2",
        slug: "product-category-2",
        category: "2",
      },
    ];

    // Mock filtered products (only from category 1)
    const filteredProducts = [
      {
        _id: "p1",
        name: "Product from Category 1",
        price: 100,
        description: "This is from category 1",
        slug: "product-category-1",
        category: "1",
      },
    ];

    // Mock API responses
    axios.get.mockImplementation((url) => {
      if (url === "/api/v1/category/get-category") {
        return Promise.resolve({
          data: { success: true, category: mockCategories },
        });
      }
      if (url === "/api/v1/product/product-count") {
        return Promise.resolve({ data: { total: 2 } });
      }
      if (url.includes("/api/v1/product/product-list")) {
        return Promise.resolve({ data: { products: initialProducts } });
      }
      return Promise.reject(new Error(`Not found: ${url}`));
    });

    // Mock the filter API response
    axios.post.mockResolvedValueOnce({
      data: { products: filteredProducts },
    });

    render(<HomePage />);

    // Wait for initial products to be displayed
    await waitFor(() => {
      expect(screen.getByText("Product from Category 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText("Product from Category 2")).toBeInTheDocument();
    });

    // Select category 1
    const checkbox = screen.getByRole("checkbox", { name: /Category 1/i });
    fireEvent.click(checkbox);

    // Verify the API call is made with correct arguments
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        "/api/v1/product/product-filters",
        {
          checked: ["c1"],
          radio: [],
        }
      );
    });

    // Verify only products from category 1 are displayed
    await waitFor(() => {
      expect(screen.getByText("Product from Category 1")).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Product from Category 2")
      ).not.toBeInTheDocument();
    });
  });

  describe("Pagination Tests", () => {
    // Boundary Value 1 page
    it("should not load more products when page is 1 (lower boundary)", async () => {
      const mockProducts = [
        {
          _id: 1,
          name: "Product 1",
          price: 100,
          description: "This is product 1 description",
          slug: "test-product-1",
        },
      ];
      axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

      render(<HomePage />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/product-list/1"
        );
      });
    });

    // Equivalence partitioning 2 pages
    it("should load more products when page > 1", async () => {
      const initialProducts = [
        {
          _id: 1,
          name: "Product 1",
          price: 100,
          description: "This is product 1 description",
          slug: "test-product-1",
        },
        {
          _id: 2,
          name: "Product 2",
          price: 150,
          description: "This is product 2 description",
          slug: "test-product-2",
        },
        {
          _id: 3,
          name: "Product 3",
          price: 200,
          description: "This is product 3 description",
          slug: "test-product-3",
        },
        {
          _id: 4,
          name: "Product 4",
          price: 250,
          description: "This is product 4 description",
          slug: "test-product-4",
        },
        {
          _id: 5,
          name: "Product 5",
          price: 300,
          description: "This is product 5 description",
          slug: "test-product-5",
        },
        {
          _id: 6,
          name: "Product 6",
          price: 350,
          description: "This is product 6 description",
          slug: "test-product-6",
        },
      ];

      const moreProducts = [
        {
          _id: 7,
          name: "Product 7",
          price: 400,
          description: "This is product 7 description",
          slug: "test-product-7",
        },
        {
          _id: 8,
          name: "Product 8",
          price: 450,
          description: "This is product 8 description",
          slug: "test-product-8",
        },
      ];

      // Mock API calls with specific URLs
      axios.get.mockImplementation((url) => {
        if (url === "/api/v1/product/product-list/1") {
          return Promise.resolve({ data: { products: initialProducts } });
        }
        if (url === "/api/v1/product/product-list/2") {
          return Promise.resolve({ data: { products: moreProducts } });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 8 } });
        }
        // Fallback
        return Promise.resolve({ data: {} });
      });
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Loadmore/i)).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText(/Loadmore/i));

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/product-list/2"
        );
      });
    });
  });

  describe("Products Array Tests", () => {
    // Edge case when API returns null as products
    it("should handle null product list gracefully", async () => {
      axios.get.mockResolvedValueOnce({ data: { products: null } });
      render(<HomePage />);
      // Wait for all products to be displayed
      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
      });

      expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();
    });

    // Boundary Value empty products array
    it("should handle empty products array", async () => {
      axios.get.mockResolvedValueOnce({ data: { products: [] } });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("All Products")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.queryByTestId("product-card")).not.toBeInTheDocument();
      });
    });

    // Boundary value single product in array
    it("should handle single product (minimal case)", async () => {
      const singleProduct = [
        {
          _id: 1,
          name: "Test Product",
          price: 100,
          description: "Test Description",
          slug: "test-product",
        },
      ];
      // Mocking the axios.get method with refactoring of source code in mind
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/category/get-category")) {
          return Promise.resolve({ data: { success: true, category: [] } });
        }
        if (url.includes("/api/v1/product/product-count")) {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url.includes("/api/v1/product/product-list/1")) {
          return Promise.resolve({ data: { products: singleProduct } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });
      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
      });
    });

    it("should hide load more button when products.length === total (boundary)", async () => {
      const products = [{ _id: 1, name: "Product 1" }];

      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/product-count")) {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url.includes("/api/v1/product/product-list/1")) {
          return Promise.resolve({ data: { products } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.queryByText(/Loadmore/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Filter Boundary Tests", () => {
    it("should handle empty filters (boundary case)", async () => {
      axios.get.mockResolvedValueOnce({ data: { products: [] } });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("Filter By Category")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Filter By Price")).toBeInTheDocument();
      });
    });
  });

  describe("Product Description Tests", () => {
    it("should truncate description > 60 characters even at 61 characters boundary value", async () => {
      const longDescription =
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. " +
        "Sed facilisis velit non massa luctus, quis elementum sapien semper. " +
        "Curabitur tristique fringilla risus, sit amet porttitor felis pharetra vel. Fusce eget suscipit augue. " +
        "Sed laoreet a orci ut porta. Etiam accumsan augue a mi maximus gravida tempor non nisl. " +
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque a augue in tellus sollicitudin blandit. " +
        "Nam sollicitudin libero et posuere placerat. Curabitur sit amet diam eu ligula fermentum pulvinar non mattis urna. " +
        "Maecenas mattis convallis dictum. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia " +
        "curae; Pellentesque eleifend quam.";
      const products = [
        {
          _id: 1,
          name: "Test Product",
          price: 100,
          description: longDescription.substring(0, 61),
          slug: "test-product",
        },
      ];

      // Expected truncation: first 60 characters + ellipsis
      const expectedTruncated = longDescription.substring(0, 60) + "...";
      // Mock API responses
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/product-list/")) {
          return Promise.resolve({ data: { products } });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({ data: { success: true, category: [] } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      render(<HomePage />);

      // Wait for loading state to complete
      await waitFor(() => {
        const productCard = screen.getByText("Test Product");
        expect(productCard).toBeInTheDocument();
      });

      // Truncated description should be rendered
      const descriptionElement = screen.getByText(expectedTruncated);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.tagName.toLowerCase()).toBe("p");
      expect(descriptionElement.className).toContain("card-text");
    });

    // Equivalence Partition for product description less than 60 characters
    it("should not truncate description <= 60 characters", async () => {
      const shortDescription = "Short description under 60 chars";
      const products = [
        {
          _id: 1,
          name: "Test Product",
          price: 100,
          description: shortDescription,
          slug: "test-product",
        },
      ];

      // Mock API responses
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/product-list/")) {
          return Promise.resolve({ data: { success: true, products } });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { success: true, total: 1 } });
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({ data: { success: true, category: [] } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      render(<HomePage />);

      // Wait for loading state to complete and check product is rendered
      await waitFor(() => {
        const productCard = screen.getByText("Test Product");
        expect(productCard).toBeInTheDocument();
      });

      // The description should be shown in full without ellipsis
      const descriptionElement = screen.getByText(shortDescription);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.tagName.toLowerCase()).toBe("p");
      expect(descriptionElement.className).toContain("card-text");

      // Verify the description is exactly as provided (no truncation or ellipsis)
      expect(descriptionElement.textContent).toBe(shortDescription);
    });
  });

  describe("Cart Operations Boundary Tests", () => {
    it("should add first item to empty cart (boundary case)", async () => {
      const products = [
        {
          _id: 1,
          name: "Test Product",
          price: 100,
          description: "Test Description",
          slug: "test-product",
        },
      ];
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/category/get-category")) {
          return Promise.resolve({ data: { success: true, category: [] } });
        } else if (url.includes("/api/v1/product/product-count")) {
          return Promise.resolve({ data: { total: 1 } });
        } else if (url.includes("/api/v1/product/product-list")) {
          return Promise.resolve({ data: { products: products } });
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });

      render(<HomePage />);

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: "ADD TO CART" })
        ).toBeInTheDocument();
      });

      fireEvent.click(screen.getByRole("button", { name: "ADD TO CART" }));

      expect(mockAddToCart).toHaveBeenCalledWith("test-product");
    });
  });

  // Error Handling Tests
  describe("Error Handling", () => {
    it("should log API errors", async () => {
      const consoleLogSpy = jest.spyOn(console, "log").mockImplementation();
      axios.get.mockRejectedValueOnce(new Error("API Error"));

      render(<HomePage />);

      await waitFor(() => {
        expect(consoleLogSpy).toHaveBeenCalled();
      });

      consoleLogSpy.mockRestore();
    });

    it("should display error notification if product fetching fails", async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/category/get-category")) {
          return Promise.resolve({ data: { success: true, category: [] } });
        } else if (url.includes("/api/v1/product/product-count")) {
          return Promise.resolve({ data: { total: 1 } });
        } else if (url.includes("/api/v1/product/product-list")) {
          return Promise.reject(new Error("Network Error"));
        }
        return Promise.reject(new Error(`Not found: ${url}`));
      });
      render(<HomePage />);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(
          expect.stringContaining("Network Error")
        );
      });
    });
  });

  describe("Loadmore Button", () => {
    it("should not show Loadmore button after products are all loaded", async () => {
      const initialProducts = [
        {
          _id: 1,
          name: "Product 1",
          price: 100,
          description: "This is product 1 description",
          slug: "test-product-1",
        },
        {
          _id: 2,
          name: "Product 2",
          price: 150,
          description: "This is product 2 description",
          slug: "test-product-2",
        },
        {
          _id: 3,
          name: "Product 3",
          price: 200,
          description: "This is product 3 description",
          slug: "test-product-3",
        },
        {
          _id: 4,
          name: "Product 4",
          price: 250,
          description: "This is product 4 description",
          slug: "test-product-4",
        },
        {
          _id: 5,
          name: "Product 5",
          price: 300,
          description: "This is product 5 description",
          slug: "test-product-5",
        },
        {
          _id: 6,
          name: "Product 6",
          price: 350,
          description: "This is product 6 description",
          slug: "test-product-6",
        },
      ];

      const moreProducts = [
        {
          _id: 7,
          name: "Product 7",
          price: 400,
          description: "This is product 7 description",
          slug: "test-product-7",
        },
        {
          _id: 8,
          name: "Product 8",
          price: 450,
          description: "This is product 8 description",
          slug: "test-product-8",
        },
      ];
      // Mock API calls with specific URLs
      axios.get.mockImplementation((url) => {
        if (url === "/api/v1/product/product-list/1") {
          return Promise.resolve({ data: { products: initialProducts } });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 8 } });
        }
        if (url === "/api/v1/product/product-list/2") {
          return Promise.resolve({ data: { products: moreProducts } });
        }
        // Default fallback
        return Promise.resolve({ data: {} });
      });

      render(<HomePage />);

      // Wait for the Loadmore button to appear
      await waitFor(() => {
        expect(screen.getByText(/Loadmore/i)).toBeInTheDocument();
      });

      // Click the Loadmore button
      fireEvent.click(screen.getByText(/Loadmore/i));

      // Wait for the button to disappear after loading more products
      await waitFor(() => {
        expect(screen.queryByText(/Loadmore/i)).not.toBeInTheDocument();
      });
    });
  });
});
