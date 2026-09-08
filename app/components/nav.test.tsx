import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import { describe, expect, it } from "vitest";

import { Nav } from "./nav";

const renderNav = (initialPath = "/") => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Nav />
      <Routes>
        <Route path="*" element={null} />
      </Routes>
    </MemoryRouter>
  );
};

describe("Nav", () => {
  it("renders the desktop links and the menu toggle", () => {
    renderNav();

    expect(screen.getByRole("link", { name: "Dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Albums" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Listens" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+ New" })).toBeInTheDocument();

    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "mobile-nav");
  });

  it("keeps the mobile panel closed by default", () => {
    renderNav();

    expect(document.getElementById("mobile-nav")).not.toBeInTheDocument();
  });

  it("opens and closes the mobile panel when the toggle is clicked", async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole("button", { name: "Toggle menu" });

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const panel = document.getElementById("mobile-nav");
    expect(panel).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Dashboard" })).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "+ New" })).toHaveLength(2);

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.getElementById("mobile-nav")).not.toBeInTheDocument();
  });

  it("closes the mobile panel after navigating to a link", async () => {
    const user = userEvent.setup();
    renderNav();

    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    await user.click(toggle);
    expect(document.getElementById("mobile-nav")).toBeInTheDocument();

    const [, mobileAlbumsLink] = screen.getAllByRole("link", {
      name: "Albums",
    });
    await user.click(mobileAlbumsLink);

    expect(document.getElementById("mobile-nav")).not.toBeInTheDocument();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("hides the desktop nav below sm and the toggle at sm and above", () => {
    renderNav();

    const desktopNav = screen
      .getByRole("link", { name: "Listens" })
      .closest("nav");
    expect(desktopNav).toHaveClass("hidden", "sm:flex");

    const toggle = screen.getByRole("button", { name: "Toggle menu" });
    expect(toggle).toHaveClass("sm:hidden");
  });
});
