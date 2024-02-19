import * as React from "react";
import Textarea, { TextareaAutosizeProps } from "react-textarea-autosize";
import { useEnterSubmit } from "@/lib/hooks/use-enter-submit";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconArrowElbow, IconPlus } from "@/components/ui/icons";
import { useRouter } from "next/navigation";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import ReactTextareaAutocomplete, {
  TextareaProps,
  ItemComponentProps,
} from "@webscopeio/react-textarea-autocomplete";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ContextMenu } from "@/components/ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

export interface PromptProps
  extends Pick<ChatCompletion, "input" | "setInput"> {
  onSubmit: (value: string) => void;
  isLoading: boolean;
}

const data = [
  { name: "smile", char: "Bonjour" },
  { name: "heart", char: "John" },
  { name: "rotate", char: "Joe" },
  { name: "sun", char: "Poe" },
  { name: "bun", char: "Loe" },
  { name: "fun", char: "Moe" },
  { name: "run", char: "Koe" },
  { name: "gun", char: "yoe" },
  { name: "dun", char: "ioe" },
  { name: "cun", char: "aoe" },
  { name: "vun", char: "boe" },
  { name: "nun", char: "coe" },
  { name: "mum", char: "zoe" },
  { name: "bum", char: "xoe" },
];

function getItems(token: string) {
  return data
    .filter((item) => item.name.toLowerCase().includes(token.toLowerCase()))
    .slice(0, 5);
}

export interface ItemInterface {
  name: string;
  char: string;
}

// export const CustomTextArea:React.FunctionComponent<TextareaAutosizeProps> = (props: TextareaProps<ItemInterface, TextareaAutosizeProps>) => {
//   return <Textarea {...props} />
// }

export const CustomTextArea: React.FunctionComponent<TextareaAutosizeProps> = (
  props: TextareaAutosizeProps
) => (
  <Textarea
    className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
    {...props}
    rows={1}
    tabIndex={0}
    placeholder="Send a message."
  />
);

export const LoadingComponent = () => <div>Loading</div>;

export const ItemComponent: React.FunctionComponent<
  ItemComponentProps<ItemInterface>
> = ({ selected, entity }: ItemComponentProps<ItemInterface>) => (
  <div>{`${entity.name}: ${entity.char}`}</div>
);

export type TextAreaAutosizeProps = TextareaAutosizeProps &
  React.RefAttributes<HTMLTextAreaElement>;

export interface CompletionTextAreaProps<T> extends TextAreaAutosizeProps {
  trigger: string;
  GetItems: (token: string) => T[];
}

export function CompletionTextArea({
  ref,
  onChange,
  tabIndex,
  rows,
  maxRows,
  placeholder,
  spellCheck,
  onKeyDown,
  value,
  trigger,
  className,
}: CompletionTextAreaProps<ItemInterface>) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState<ItemInterface[]>([]);

  return (
    <>
      <Textarea
        className={className}
        ref={ref}
        tabIndex={tabIndex}
        rows={rows}
        maxRows={maxRows}
        value={value}
        placeholder={placeholder}
        spellCheck={spellCheck}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          if (e.target.value[e.target.value.length - 1] === trigger[0]) {
            setItems(getItems(e.target.value));
            setIsOpen(true);
          }
          onChange?.(e);
        }}
      />
      <DropdownMenu onOpenChange={setIsOpen} open={isOpen}>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuItem>
              {items.map((item) => (
                <div key={item.name}>{item.name}</div>
              ))}
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

import "./style.css";
import { set } from "zod";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import FunctionIcon from "@/icons/FunctionIcon";
import { ChatCompletion } from "@/services/chat-completion";

export function PromptForm({
  onSubmit,
  input,
  setInput,
  isLoading,
}: PromptProps) {
  const { formRef, onKeyDown } = useEnterSubmit();
  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const router = useRouter();
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);
  const [isOpen, setIsOpen] = React.useState(false);
  const [items, setItems] = React.useState<ItemInterface[]>([]);
  const [selected, setSelected] = React.useState<string>("");
  // const [autoFocus, setAutoFocus] = React.useState(false);

  const setInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const setSelectFocus = () => {
    if (selectRef.current) {
      selectRef.current.focus();
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (!input?.trim()) {
          return;
        }
        setInput("");
        await onSubmit(input);
      }}
      ref={formRef}
    >
      <div className="relative flex flex-col w-full px-8 overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border sm:px-12 z-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.preventDefault();
                router.refresh();
                router.push("/");
              }}
              className={cn(
                buttonVariants({ size: "sm", variant: "outline" }),
                "absolute left-0 top-4 h-8 w-8 rounded-full bg-background p-0 sm:left-4"
              )}
            >
              <IconPlus />
              <span className="sr-only">New Chat</span>
            </button>
          </TooltipTrigger>
          <TooltipContent>New Chat</TooltipContent>
        </Tooltip>
        <Popover
          onOpenChange={(value) => {
            setIsOpen(value);
            setInputFocus();
          }}
          open={isOpen}
        >
          <PopoverContent
            onCloseAutoFocus={() => {
              setInputFocus();
            }}
            ref={selectRef}
            onKeyDown={(e) => {}}
            autoFocus={true}
            className="max-h-96 grow p-0 min-h-[90px "
          >
            <Command>
              <CommandInput placeholder="Search..." className="h-9" />
              <CommandEmpty>No result found.</CommandEmpty>
              <CommandGroup>
                {items.map((item) => (
                  <CommandItem
                    onSelect={(currentValue) => {
                      setSelected(currentValue);
                      const actualInput = input.slice(0, input.length - 1);
                      setInput(actualInput + currentValue);
                      // setInputFocus();
                      setIsOpen(false);
                    }}
                    value={item.name}
                    key={item.name}
                  >
                    <div className="mr-2">
                      <FunctionIcon />
                    </div>
                    {item.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
          <PopoverTrigger asChild>
            <Textarea
              autoFocus
              className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm z-0"
              ref={inputRef}
              tabIndex={0}
              rows={1}
              value={input}
              placeholder="Send a message."
              spellCheck={false}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  setSelectFocus();
                } else {
                  onKeyDown(e);
                }
              }}
              onChange={(e) => {
                if (e.target.value[e.target.value.length - 1] === "@") {
                  setItems(getItems("s"));
                  setIsOpen(true);
                  setInputFocus();
                }
                setInput(e.target.value);
              }}
            />
          </PopoverTrigger>
        </Popover>
        <div className="absolute right-0 top-4 sm:right-4">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || input === ""}
              >
                <IconArrowElbow />
                <span className="sr-only">Send message</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Send message</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </form>
  );
}
