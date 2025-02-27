import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { axe, toHaveNoViolations } from "jest-axe";
import Policy from "./Policy";

// Mock the Layout component to simplify testing
jest.mock("./../components/Layout", () => {
  return ({ children, title }) => (
    <div data-testid="mock-layout" data-title={title}>
      {children}
    </div>
  );
});

expect.extend(toHaveNoViolations);

describe("Policy component", () => {
  // Snapshot test for regression testing
  it("should match snapshot", () => {
    const { container } = render(<Policy />);
    expect(container).toMatchSnapshot();
  });

  describe("Policy component rendering tests", () => {
    it("should render with correct title", () => {
      render(<Policy />);
      const layout = screen.getByTestId("mock-layout");
      expect(layout).toHaveAttribute("data-title", "Privacy Policy");
    });

    it("should display the contact image", () => {
      render(<Policy />);
      const image = screen.getByAltText("contactus");
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute("src", "/images/contactus.jpeg");
      expect(image).toHaveStyle({ width: "100%" });
    });

    it("should contain privacy policy text", () => {
      render(<Policy />);
      // Using getAllByText since there are multiple identical paragraphs, 
      // to be replaced when actual privacy policies are added
      const policyTexts = screen.getAllByText("add privacy policy");
      // Verify each paragraph is rendered
      policyTexts.forEach(text => {
        expect(text).toBeInTheDocument();
      });
    });

    it("should have proper column structure", () => {
      render(<Policy />);
      // Check for the main container div with contactus class
      const policyTexts = screen.getAllByText("add privacy policy")
      const mainContainer = policyTexts[0].closest(".contactus");
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass("row");
      
      // Check for the image column
      const imageColumn = screen.getByAltText("contactus").closest(".col-md-6");
      expect(imageColumn).toBeInTheDocument();
      
      // Check for the text column
      const textColumn = screen.getAllByText("add privacy policy")[0].closest(".col-md-4");
      expect(textColumn).toBeInTheDocument();
    });
  });

  // Accessibility testing
  describe("Accessibility tests", () => {
    it("should not have accessibility violations", async () => {
      const { container } = render(<Policy />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
    
    it("should have alt text for image", () => {
      render(<Policy />);
      const image = screen.getByAltText("contactus");
      expect(image).toHaveAttribute("alt", "contactus");
    });
  });
});