import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { bangs } from "../util/bangs";
import SearchIcon from "../util/searchIcon.svg";
import { z } from "zod";

const validateSearch = z.object({
  q: z.string().optional(),
});

function searchIt(search: string) {
  // Only execute in browser environment
  if (typeof window === 'undefined') {
    return null; 
  }

  let defaultBang = bangs.find((b) => b.t === "g");

  let match = search.match(/!(\S+)/i);
  let bang = match ? match[1].toLowerCase() : null;
  const selectedBang = bangs.find((b) => b.t === bang);

  let clean = search.replace(/!\S+\s*/i, "").trim();

  // Try to decode any URL-encoded characters first
  try {
    clean = decodeURIComponent(clean);
  } catch (e) {
    // If decoding fails, use the original string
  }

  let searchUrl = selectedBang?.u?.replace(
    "{{{s}}}",
    encodeURIComponent(clean)
      .replace(/%20/g, "+")
      .replace(/%2F/g, "/")
      .replace(/%2B/g, " ")
  );

  if (selectedBang && searchUrl) {
    window.location.href = searchUrl;
  } else {
    // Apply the same encoding logic to the default search
    window.location.href = defaultBang?.u 
      ? defaultBang.u.replace("{{{s}}}", 
          encodeURIComponent(clean)
            .replace(/%20/g, "+")
            .replace(/%2F/g, "/")
            .replace(/%2B/g, " "))
      : "https://www.google.com/search?q=" + 
          encodeURIComponent(clean)
            .replace(/%20/g, "+")
            .replace(/%2F/g, "/")
            .replace(/%2B/g, " ");
  }
}

export const Route = createFileRoute("/")({
  validateSearch: validateSearch,
  component: Home,
});

function Home() {
  const [text, setText] = useState("");
  const { q } = Route.useSearch();
  
  useEffect(() => {
    if (q) {
      setText(q);
      searchIt(q);
    }
  }, [q]);

  function searchSubmit() {
    if (!text.trim()) return;
    searchIt(text);
  }

  return (
    <div className="flex flex-col justify-center items-center min-h-screen w-full bg-gray-800">
      <div className="w-11/12 max-w-md px-4 py-6 bg-gray-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-white">
          Search
        </h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 text-base border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your search..."
            onKeyDown={(e) => e.key === "Enter" && searchSubmit()}
          />
          <button
            onClick={() => searchSubmit()}
            className="w-full sm:w-auto sm:min-w-[60px] py-3 px-5 flex items-center justify-center bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            aria-label="Search"
          >
            <img src={SearchIcon} alt="Search" className="w-5 h-5 mr-2 sm:mr-0" />
            <span className="sm:hidden">Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
