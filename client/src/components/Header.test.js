import "@testing-library/jest-dom/extend-expect";
import { fireEvent, getByText, render, waitFor } from "@testing-library/react";
import { describe } from "node:test";
import React from "react";
import toast from "react-hot-toast";
import { MemoryRouter } from "react-router-dom";
import { useAuth } from "../context/auth";
import { useCart } from "../context/cart";
import useCategory from "../hooks/useCategory";
import Header from "./Header";

jest.mock("react-hot-toast");
jest.mock("../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("../context/cart", () => ({ useCart: jest.fn() }));
jest.mock("../hooks/useCategory");

describe("Header Component", () => {
  const mockSetAuth = jest.fn();
  const mockSetCart = jest.fn();
  const mockCategories = [
    { name: "category1", slug: "cat-1" },
    { name: "category2", slug: "cat-2" },
  ];
  const mockCart = [{ name: "cart item 1" }, { name: "cart item 2" }];

  const mockAdminUser = {
    user: {
      name: "mock admin user name",
      role: 1,
    },
    token: "fakeToken",
  };

  const mockNonAdminUser = {
    user: {
      name: "mock non admin user name",
      role: 0,
    },
    token: "fakeToken",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useCart.mockReturnValue([mockCart, mockSetCart]);
  });

  it("renders correctly", () => {
    useAuth.mockReturnValue([null, mockSetAuth]);
    useCategory.mockReturnValue([]);

    const { getByRole, getByTitle } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(getByRole("link", { name: "🛒 Virtual Vault" })).toBeInTheDocument();
    expect(getByRole("link", { name: "🛒 Virtual Vault" })).toHaveAttribute(
      "href",
      "/"
    );

    expect(getByRole("link", { name: "Categories" })).toBeInTheDocument();
    expect(getByRole("link", { name: "Categories" })).toHaveAttribute(
      "href",
      "/categories"
    );

    expect(getByRole("link", { name: "Cart" })).toBeInTheDocument();
    expect(getByRole("link", { name: "Cart" })).toHaveAttribute(
      "href",
      "/cart"
    );

    // Check cart badge
    expect(getByTitle(mockCategories.length.toString())).toBeInTheDocument();
  });

  it("renders category links correctly", () => {
    useAuth.mockReturnValue([null, mockSetAuth]);
    useCategory.mockReturnValue(mockCategories);

    const { getByRole } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    for (let idx = 0; idx < mockCategories.length; idx++) {
      const currCategory = mockCategories[idx];
      expect(
        getByRole("link", { name: currCategory.name })
      ).toBeInTheDocument();
      expect(getByRole("link", { name: currCategory.name })).toHaveAttribute(
        "href",
        `/category/${currCategory.slug}`
      );
    }
  });

  describe("when user is logged in", () => {
    describe("when user is logged in as regular user", () => {
      it("should render correct user dashboard href", () => {
        useAuth.mockReturnValue([mockNonAdminUser, mockSetAuth]);
        useCategory.mockReturnValue([]);

        const { getByRole } = render(
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        );

        expect(getByRole("link", { name: "Dashboard" })).toHaveAttribute(
          "href",
          "/dashboard/user"
        );
      });
    });

    describe("when user is logged in as admin user", () => {
      it("should render correct admin dashboard href", () => {
        useAuth.mockReturnValue([mockAdminUser, mockSetAuth]);
        useCategory.mockReturnValue([]);

        const { getByRole } = render(
          <MemoryRouter>
            <Header />
          </MemoryRouter>
        );

        expect(getByRole("link", { name: "Dashboard" })).toHaveAttribute(
          "href",
          "/dashboard/admin"
        );
      });
    });

    it("should render dashboard links and logout links", () => {
      useAuth.mockReturnValue([mockAdminUser, mockSetAuth]);
      useCategory.mockReturnValue([]);

      const { getByRole } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
      expect(getByRole("link", { name: "Logout" })).toBeInTheDocument();
      expect(getByRole("link", { name: "Logout" })).toHaveAttribute(
        "href",
        "/"
      );
    });

    it("should not render register and login links", () => {
      useAuth.mockReturnValue([mockAdminUser, mockSetAuth]);
      useCategory.mockReturnValue([]);

      const { queryByRole } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(queryByRole("link", { name: "Register" })).toBeNull();
      expect(queryByRole("link", { name: "Login" })).toBeNull();
    });

    it("should handle logout correctly", async () => {
      useAuth.mockReturnValue([mockAdminUser, mockSetAuth]);
      useCategory.mockReturnValue([]);

      const { getByRole } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      fireEvent.click(getByRole("link", { name: "Logout" }));

      await waitFor(() => {
        expect(mockSetAuth).toHaveBeenCalledTimes(1);
        expect(mockSetAuth).toHaveBeenCalledWith({ token: "", user: null });
      });
      expect(toast.success).toHaveBeenCalledWith("Logout Successfully");
    });
  });

  describe("When user is not logged in", () => {
    it("should render register and login links correctly", () => {
      useAuth.mockReturnValue([null, mockSetAuth]);
      useCategory.mockReturnValue([]);

      const { getByRole } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(getByRole("link", { name: "Register" })).toBeInTheDocument();
      expect(getByRole("link", { name: "Register" })).toHaveAttribute(
        "href",
        "/register"
      );

      expect(getByRole("link", { name: "Login" })).toBeInTheDocument();
      expect(getByRole("link", { name: "Login" })).toHaveAttribute(
        "href",
        "/login"
      );
    });

    it("should not render dashboard links and logout links", () => {
      useAuth.mockReturnValue([null, mockSetAuth]);
      useCategory.mockReturnValue([]);

      const { queryByRole } = render(
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      );

      expect(queryByRole("link", { name: "Dashboard" })).toBeNull();
      expect(queryByRole("link", { name: "Logout" })).toBeNull();
    });
  });
});
