/**
 * Index page: home, documents tab, collections tab, search, upload, create folder.
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Index from "./Index";

function renderIndex() {
  return render(
    <BrowserRouter>
      <Index />
    </BrowserRouter>
  );
}

describe("Index page", () => {
  it("renders without crashing", () => {
    renderIndex();
    expect(screen.getByText(/Delta Tau Delta/)).toBeInTheDocument();
  });

  it("shows Documents and Collections tabs", () => {
    renderIndex();
    expect(screen.getByRole("tab", { name: /Documents/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Collections/i })).toBeInTheDocument();
  });

  it("shows search placeholder", () => {
    renderIndex();
    expect(screen.getByPlaceholderText(/Search by course/)).toBeInTheDocument();
  });
});
