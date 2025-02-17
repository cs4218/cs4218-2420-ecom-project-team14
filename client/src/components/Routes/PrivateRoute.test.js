import { render, waitFor } from "@testing-library/react";
import axios from "axios";
import React from "react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/auth";
import PrivateRoute from "./PrivateRoute";

jest.mock("axios");
jest.mock("../../context/auth", () => ({ useAuth: jest.fn() }));
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

describe("Private Route Component", () => {
  const mockNonLoggedInUser = {};
  const mockLoggedInUser = {
    token: "user",
  };
  const mockUseNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useNavigate.mockReturnValue(mockUseNavigate);
  });
  describe("when a valid user is logged in", () => {
    it("should allow the user to access to child page", async () => {
      useAuth.mockReturnValue([mockLoggedInUser]);
      axios.get.mockResolvedValue({
        status: 200,
        data: { ok: true },
      });

      const { getByText } = render(
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/private" element={<PrivateRoute />}>
              <Route path="" element={<p>Test Private Route</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(getByText("Test Private Route")).toBeInTheDocument();
      });
    });
  });

  describe("when a non existent user is logged in", () => {
    it("should allow the user to access to child page", async () => {
      useAuth.mockReturnValue([mockLoggedInUser]);
      axios.get.mockRejectedValue({
        response: {
          status: 401,
          data: { success: false, message: "Unauthorized Access" },
        },
      });

      const { getByText } = render(
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/private" element={<PrivateRoute />}>
              <Route path="" element={<p>Test Private Route</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(mockUseNavigate).toBeCalledTimes(1);
        expect(mockUseNavigate).toBeCalledWith("/forbidden");
      });
    });
  });

  describe("when user is not logged in", () => {
    it("should redirect the user to the login page", () => {
      useAuth.mockReturnValue([mockNonLoggedInUser]);

      render(
        <MemoryRouter initialEntries={["/private"]}>
          <Routes>
            <Route path="/private" element={<PrivateRoute />}>
              <Route path="" element={<p>Test Private Route</p>} />
            </Route>
          </Routes>
        </MemoryRouter>
      );

      expect(mockUseNavigate).toBeCalledTimes(1);
      expect(mockUseNavigate).toBeCalledWith("/login");
    });
  });

  it("should render the loading spinner correctly", () => {
    const { getByRole } = render(
      <MemoryRouter initialEntries={["/private"]}>
        <Routes>
          <Route path="/private" element={<PrivateRoute />}>
            <Route path="" element={<p>Test Private Route</p>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(getByRole("status")).toBeInTheDocument();
  });
});
