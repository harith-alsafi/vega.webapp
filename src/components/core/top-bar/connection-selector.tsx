"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon, PlusIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const frameworks = [
  {
    value: "next.js",
    label: "1.1.9.10@rapsi",
  },
  {
    value: "sveltekit",
    label: "1.8.0.1@ras",
  },
  // {
  //   value: "nuxt.js",
  //   label: "Nuxt.js",
  // },
  // {
  //   value: "remix",
  //   label: "Remix",
  // },
  // {
  //   value: "astro",
  //   label: "Astro",
  // },
];

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function ConnectionSelector() {

  return (
    <Select>
    <SelectTrigger className="w-[180px]">
      <SelectValue placeholder="Select a fruit" defaultValue="apple" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        {/* <SelectLabel>Fruits</SelectLabel> */}
        <SelectItem value="apple">Apple</SelectItem>
        <SelectItem value="banana">Banana</SelectItem>
        <SelectItem value="blueberry">Blueberry</SelectItem>
        <SelectItem value="grapes">Grapes</SelectItem>
        <SelectItem value="pineapple">Pineapple</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
  );
}
