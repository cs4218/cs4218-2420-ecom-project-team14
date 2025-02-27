// Contact.test.js
import React from "react";
import { render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom";
import Contact from "./Contact";

// Mock the Layout component
jest.mock("../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

// Mock react-icons
jest.mock("react-icons/bi", () => ({
  BiMailSend: () => <span data-testid="mail-icon">Mail Icon</span>,
  BiPhoneCall: () => <span data-testid="phone-icon">Phone Icon</span>,
  BiSupport: () => <span data-testid="support-icon">Support Icon</span>,
}));

describe("Contact Component", () => {
  // Basic Rendering Tests
  describe("Basic Rendering", () => {
    it("renders without crashing", () => {
      render(<Contact />);
      expect(screen.getByTestId("mock-layout")).toBeInTheDocument();
    });

    it("renders with correct layout title", () => {
      render(<Contact />);
      expect(screen.getByTestId("mock-layout")).toHaveAttribute(
        "data-title",
        "Contact us"
      );
    });
  });

  // Structure Tests
  describe("Component Structure", () => {
    it("contains main container with contactus class", () => {
      render(<Contact />);
      const layout = screen.getByTestId("mock-layout");
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".contactus")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".row")).toBeInTheDocument();
    });

    it("contains two columns with correct classes", () => {
      render(<Contact />);
      const layout = screen.getByTestId("mock-layout");
      // eslint-disable-next-line testing-library/no-node-access
      const columns = layout.querySelectorAll(".col-md-6, .col-md-4");
      expect(columns).toHaveLength(2);
      expect(columns[0]).toHaveClass("col-md-6");
      expect(columns[1]).toHaveClass("col-md-4");
    });
  });

  // Image Tests
  describe("Image Element", () => {
    it("renders contact image with correct attributes", () => {
      render(<Contact />);
      const image = screen.getByAltText("contactus");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
      expect(image).toHaveStyle({ width: "100%" });
    });
  });

  // Content Tests
  describe("Content", () => {
    it("renders heading with correct text and styling", () => {
      render(<Contact />);
      const heading = screen.getByText("CONTACT US");
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveClass(
        "bg-dark",
        "p-2",
        "text-white",
        "text-center"
      );
    });

    it("renders contact information paragraph", () => {
      render(<Contact />);
      const infoParagraph = screen.getByText(
        /For any query or info about product/
      );
      expect(infoParagraph).toBeInTheDocument();
      expect(infoParagraph).toHaveClass("text-justify", "mt-2");
    });

    it("renders contact details with icons", () => {
      render(<Contact />);
      const contactInfoDiv = screen
        .getByTestId("mock-layout")
        // eslint-disable-next-line testing-library/no-node-access
        .querySelector(".col-md-4");
      // Email section
      const emailParagraph = within(contactInfoDiv).getByText(
        /www.help@ecommerceapp.com/
      );
      expect(emailParagraph).toHaveClass("mt-3");
      expect(emailParagraph).toBeInTheDocument();

      // Phone section
      const phoneParagraph = screen.getByText(/012-3456789/);
      expect(phoneParagraph).toHaveClass("mt-3");
      expect(phoneParagraph).toContainElement(screen.getByTestId("phone-icon"));

      // Support section
      const supportParagraph = screen.getByText(/1800-0000-0000/);
      expect(supportParagraph).toHaveClass("mt-3");
      expect(supportParagraph).toContainElement(
        screen.getByTestId("support-icon")
      );
    });
  });

  // Icon Tests
  describe("Icons", () => {
    it("renders all contact icons", () => {
      render(<Contact />);
      expect(screen.getByTestId("mail-icon")).toBeInTheDocument();
      expect(screen.getByTestId("phone-icon")).toBeInTheDocument();
      expect(screen.getByTestId("support-icon")).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe("Accessibility", () => {
    it("image has valid alt text", () => {
      render(<Contact />);
      const image = screen.getByAltText("contactus");
      expect(image).toHaveAttribute("alt", "contactus");
    });

    it("heading has correct hierarchy", () => {
      render(<Contact />);
      const heading = screen.getByText("CONTACT US");
      expect(heading.tagName).toBe("H1");
    });
  });

  // Styling Tests
  describe("Styling", () => {
    it("applies correct Bootstrap classes", () => {
      render(<Contact />);
      const layout = screen.getByTestId("mock-layout");

      // Row and columns
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".row")).toHaveClass("contactus");
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".col-md-6")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".col-md-4")).toBeInTheDocument();

      // Heading
      const heading = screen.getByText("CONTACT US");
      expect(heading).toHaveClass(
        "bg-dark",
        "p-2",
        "text-white",
        "text-center"
      );

      // Paragraphs
      const infoParagraph = screen.getByText(/For any query/);
      expect(infoParagraph).toHaveClass("text-justify", "mt-2");

      // Contact details
      const contactDetails = screen.getAllByText(/:/);
      contactDetails.forEach((detail) => {
        expect(detail).toHaveClass("mt-3");
      });
    });
  });

  // Snapshot Testing
  describe("Snapshot", () => {
    it("matches snapshot", () => {
      const { container } = render(<Contact />);
      expect(container).toMatchSnapshot();
    });
  });

  // Layout Integration Tests
  describe("Layout Integration", () => {
    it("passes correct props to Layout component", () => {
      render(<Contact />);
      const layout = screen.getByTestId("mock-layout");
      expect(layout).toHaveAttribute("data-title", "Contact us");
    });
  });

  // Responsive Design Tests
  describe("Responsive Design", () => {
    it("contains bootstrap responsive classes", () => {
      render(<Contact />);
      const layout = screen.getByTestId("mock-layout");

      // Check for responsive column classes
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".col-md-6")).toBeInTheDocument();
      // eslint-disable-next-line testing-library/no-node-access
      expect(layout.querySelector(".col-md-4")).toBeInTheDocument();
    });
  });
});
