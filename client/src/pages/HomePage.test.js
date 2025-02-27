import React from "react";
import { screen, render, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import HomePage from "./HomePage";
import axios from "axios";

// Mock modules
jest.mock("axios");
jest.mock("react-hot-toast");
import toast from "react-hot-toast";
jest.mock("react-router-dom", () => ({
  useNavigate: () => jest.fn(),
}));

jest.mock("../context/cart", () => ({
  useCart: () => {
    const cart = [];
    const setCart = jest.fn();
    return [cart, setCart];
  },
}));

jest.mock("../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

jest.mock('react-icons/ai', () => ({
  AiOutlineReload: () => <span>ReloadIcon</span>,
}));

describe("HomePage component", () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  // Boundary Value Analysis Tests
  describe("Pagination Boundary Tests", () => {
    it("should not load more products when page is 1 (lower boundary)", async () => {
      const mockProducts = [{ _id: 1, name: "Product 1",price: 100,
        description:"This is product 1 description",
        slug: "test-product-1",}];
      axios.get.mockResolvedValueOnce({ data: { products: mockProducts } });

      render(<HomePage />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          "/api/v1/product/product-list/1"
        );
      });
    });

    it("should load more products when page > 1", async () => {
      const initialProducts = [{ _id: 1, name: "Product 1",price: 100,
        description: "This is product 1 description",
        slug: "test-product-1",}];
      const moreProducts = [{ _id: 2, name: "Product 2" ,price: 200,
        description: "This is product 2 description",
        slug: "test-product-2",}];

      axios.get
        .mockResolvedValueOnce({ data: { products: initialProducts } })
        .mockResolvedValueOnce({ data: { total: 2 } })
        .mockResolvedValueOnce({ data: { products: moreProducts } });

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

  describe("Products Array Boundary Tests", () => {
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
      axios.get
      .mockResolvedValueOnce({ data: { success: true, category: [] } })  // Mock for getAllCategory()
      .mockResolvedValueOnce({ data: { total: 1 } })                      // Mock for getTotal()
      .mockResolvedValueOnce({ data: { products: singleProduct } });       // Mock for getAllProducts()

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("Test Product")).toBeInTheDocument();
      });
    });

    it("should hide load more button when products.length === total (boundary)", async () => {
      const products = [{ _id: 1, name: "Product 1" }];

      axios.get
        .mockResolvedValueOnce({ data: { products } })
        .mockResolvedValueOnce({ data: { total: 1 } });

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

    it("should handle single category selection (minimal case)", async () => {
      const mockCategories = [{ _id: "1", name: "Category 1", slug: "category-1" }];
      
      // Mock GET calls for categories and products
      axios.get.mockImplementation((url) => {
        if (url.includes("/api/v1/product/product-list/")) {
          return Promise.resolve({ data: { products: [] } });
        }
        if (url === "/api/v1/product/product-count") {
          return Promise.resolve({ data: { total: 1 } });
        }
        if (url === "/api/v1/category/get-category") {
          return Promise.resolve({ data: { success: true, category: mockCategories } });
        }
        return Promise.reject(new Error("Not found"));
      });
      // Mock the POST call for filtering products
      axios.post.mockResolvedValueOnce({ data: { products: [] } });
      
      render(<HomePage />);
      
      // Wait until the category is rendered
      await waitFor(() => {
        expect(screen.getByText("Category 1")).toBeInTheDocument();
      });
      
      // Target the checkbox instead of just the text
      fireEvent.click(screen.getByRole("checkbox", { name: /Category 1/i }));
      
      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          "/api/v1/product/product-filters",
          {
            checked: ["1"],
            radio: [],
          }
        );
      });
    });
    
  });

  describe("Product Description Boundary Tests", () => {
    it("should truncate description > 60 characters", async () => {
      const longDescription =
        "This is a very long description that should be truncated at exactly sixty chars.";
      const products = [
        {
          _id: 1,
          name: "Test Product",
          price: 100,
          description: longDescription,
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
        return Promise.reject(new Error("Not found"));
      });

      render(<HomePage />);

      // Wait for loading state to complete
      await waitFor(() => {
        const productCard = screen.getByText("Test Product");
        expect(productCard).toBeInTheDocument();
      });

      // Then check for the truncated description
      const descriptionElement = screen.getByText(expectedTruncated);
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement.tagName.toLowerCase()).toBe('p');
      expect(descriptionElement.className).toContain('card-text');
    });

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
      expect(descriptionElement.tagName.toLowerCase()).toBe('p');
      expect(descriptionElement.className).toContain('card-text');

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
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: [] } })  // for getAllCategory()
        .mockResolvedValueOnce({ data: { total: 1 } }) // for getTotal()
        .mockResolvedValueOnce({ data: { products } }); // for getAllProducts()

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText("ADD TO CART")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("ADD TO CART"));

      expect(localStorage.getItem("cart")).toBeTruthy();
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
      axios.get
        .mockResolvedValueOnce({ data: { success: true, category: [] } }) // Mock getAllCategory success
        .mockResolvedValueOnce({ data: { total: 1 } })                      // Mock getTotal success
        .mockRejectedValueOnce(new Error("Network Error"));                 // Mock getAllProducts failure

      render(<HomePage />);
      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Network Error"));
      });
    });
  });

  describe("Rapid Clicks on Loadmore Button", () => {
    it("should not trigger multiple API calls on rapid clicking", async () => {
      const initialProducts = [{ _id: 1, name: "Product 1", price: 100,description: "This is product 1 description",slug: "test-product-1",}];
      const moreProducts = [{ _id: 2, name: "Product 2" ,price: 200,description: "This is product 2 description",slug: "test-product-2",}];

      axios.get
        .mockResolvedValueOnce({ data: { products: initialProducts } })
        .mockResolvedValueOnce({ data: { total: 2 } })
        .mockResolvedValueOnce({ data: { products: moreProducts } });

      render(<HomePage />);

      await waitFor(() => {
        expect(screen.getByText(/Loadmore/i)).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText(/Loadmore/i);
      // Simulate rapid clicks
      fireEvent.click(loadMoreButton);
      fireEvent.click(loadMoreButton);
      
      await waitFor(() => {
        // Check that the API call for page 2 is made only once
        const page2Calls = axios.get.mock.calls.filter(call => call[0] === "/api/v1/product/product-list/2");
        expect(page2Calls.length).toBe(1);
      });
    });
  });
});
