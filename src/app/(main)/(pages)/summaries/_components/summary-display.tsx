import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import format from "date-fns/format";
import nextSaturday from "date-fns/nextSaturday";
import {
  Archive,
  ArchiveX,
  Clock,
  Forward,
  MoreVertical,
  Reply,
  ReplyAll,
  Trash2,
} from "lucide-react";

import {
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Mail } from "../data";
import { Summary } from "./summary";
import { BlockEditor } from "@/components/custom/BlockEditor";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariantFromLabel } from "./summary-list";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SummaryDisplayProps {
  summary?: Summary;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center p-2">
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!summary}>
                <Archive className="h-4 w-4" />
                <span className="sr-only">Archive</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Archive</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" disabled={!summary}>
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Move to trash</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Move to trash</TooltipContent>
          </Tooltip>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Tooltip>
            <Popover>
              <PopoverTrigger asChild>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" disabled={!summary}>
                    <Clock className="h-4 w-4" />
                    <span className="sr-only">History</span>
                  </Button>
                </TooltipTrigger>
              </PopoverTrigger>
              <PopoverContent className="flex h-24 w-[535px] p-0"></PopoverContent>
            </Popover>
            <TooltipContent>History</TooltipContent>
          </Tooltip>
        </div>
        <Separator orientation="vertical" className="ml-auto h-6" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={!summary}>
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">More</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Mark as unread</DropdownMenuItem>
            <DropdownMenuItem>Star thread</DropdownMenuItem>
            <DropdownMenuItem>Add label</DropdownMenuItem>
            <DropdownMenuItem>Mute thread</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {summary ? (
        <div className="flex flex-1 flex-col">
          <div className="flex h-32 items-start p-4">
            <div className="flex items-start gap-4 text-sm">
              <div className="grid gap-1">
                <div className="mb-2  font-semibold">{summary.title}</div>
                <div className="mb-2 line-clamp-1 text-xs">{summary.url}</div>
                {summary.categories.length ? (
                  <div className="flex items-center gap-2">
                    {JSON.parse(summary?.categories).map((category: string) => (
                      <Badge
                        key={category}
                        variant={getBadgeVariantFromLabel(category)}
                      >
                        {category}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
            {summary.createdAt && (
              <div className="ml-auto text-xs text-muted-foreground">
                {format(new Date(summary.createdAt), "PPpp")}
              </div>
            )}
          </div>
          <Separator />
          {/* <div className="h-[800px] whitespace-pre-wrap pt-10 text-sm"> */}
          <ScrollArea className="mb-5 h-[calc(100vh-600px)]">
            <BlockEditor summary={summary} />
          </ScrollArea>
          {/* </div> */}
          <Separator />
          <div className="grid h-[400px] grid-cols-3 gap-4 bg-foreground">
            {/* Left Cards Section */}
            <div className="flex h-[400px] flex-col">
              <p className="py-4 text-xl font-bold">Highlights</p>
              <ScrollArea className="mb-24 rounded-lg bg-background p-4 shadow-md">
                {summary?.highlights.map((highlight: string, index: number) => (
                  <div
                    key={index}
                    className="my-2 rounded-lg border p-4 shadow"
                  >
                    {highlight}
                  </div>
                ))}
                {/* Add more cards as needed */}
              </ScrollArea>
            </div>

            {/* Middle Cards Section */}
            <div className="flex h-[400px] flex-col">
              <p className="py-4 text-xl font-bold">Notes</p>
              <ScrollArea className="mb-24 rounded-lg bg-background p-4 shadow-md">
                {summary?.notes.map((note: string, index: number) => (
                  <div
                    key={index}
                    className="my-2 rounded-lg border p-4 shadow"
                  >
                    {note}
                  </div>
                ))}
                {/* Add more cards as needed */}
              </ScrollArea>
            </div>

            {/* Button Section */}
            <div className="flex h-[400px] flex-col justify-end">
              <div className="mx-10 mb-24 flex justify-end space-x-4">
                <Button
                  onClick={(e) => e.preventDefault()}
                  size="sm"
                  className="bg-green-500 text-white hover:bg-green-600"
                >
                  Regenerate Summary
                </Button>
                <Button
                  onClick={(e) => e.preventDefault()}
                  size="sm"
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          No message selected
        </div>
      )}
    </div>
  );
}
