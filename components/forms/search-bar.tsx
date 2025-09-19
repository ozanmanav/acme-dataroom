"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
}

export function SearchBar({
  onSearch,
  placeholder = "Search files and folders...",
  debounceMs = 300,
  disabled = false,
}: SearchBarProps) {
  const [query, setQuery] = useState("");

  // Debounced search function
  const debouncedSearch = useCallback(
    (searchQuery: string) => {
      const timeoutId = setTimeout(() => {
        onSearch(searchQuery);
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [onSearch, debounceMs]
  );

  // Effect to handle debounced search
  useEffect(() => {
    const cleanup = debouncedSearch(query);
    return cleanup;
  }, [query, debouncedSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Form submit için hemen search yap (debounce'u atla)
    onSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    // Clear işleminde hemen search yap
    onSearch("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex-1 max-w-md">
      <div className="relative">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
        <Input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {query && !disabled && (
          <Button
            type="button"
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
          >
            <X size={18} />
          </Button>
        )}
      </div>
    </form>
  );
}
