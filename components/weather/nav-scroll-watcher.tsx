"use client";

import { useEffect } from "react";

export function NavScrollWatcher() {
  useEffect(() => {
    const nav = document.getElementById("main-nav");
    if (!nav) return;

    function handleScroll() {
      if (window.scrollY > 80) {
        nav!.classList.add("scrolled");
      } else {
        nav!.classList.remove("scrolled");
      }
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return null;
}
