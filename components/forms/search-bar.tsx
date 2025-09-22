"use client";

import { useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
  disabled?: boolean;
}

// Zod schema for search validation
const searchSchema = z.object({
  query: z
    .string()
    .max(100, "Search query is too long")
    .transform((val) => val.trim()),
});

type SearchFormData = z.infer<typeof searchSchema>;

export function SearchBar({
  onSearch,
  placeholder = "Search files and folders...",
  debounceMs = 300,
  disabled = false,
}: SearchBarProps) {
  const form = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: "",
    },
  });

  const { handleSubmit, control, setValue, watch } = form;

  // Watch for changes in query field
  const watchedQuery = useWatch({
    control,
    name: "query",
  });

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
    const cleanup = debouncedSearch(watchedQuery || "");
    return cleanup;
  }, [watchedQuery, debouncedSearch]);

  const onSubmit = (data: SearchFormData) => {
    // Form submit için hemen search yap (debounce'u atla)
    onSearch(data.query);
  };

  const handleClear = () => {
    setValue("query", "");
    // Clear işleminde hemen search yap
    onSearch("");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="relative flex-1 max-w-md"
      >
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
          />
          <FormField
            control={control}
            name="query"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    type="text"
                    placeholder={placeholder}
                    disabled={disabled}
                    className="pl-10 pr-10"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          {watchedQuery && !disabled && (
            <Button
              type="button"
              onClick={handleClear}
              variant="ghost"
              size="sm"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600 z-10"
            >
              <X size={18} />
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
