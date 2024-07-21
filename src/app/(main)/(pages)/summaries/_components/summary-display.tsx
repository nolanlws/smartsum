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

interface SummaryDisplayProps {
  summary?: Summary;
}

export function SummaryDisplay({ summary }: SummaryDisplayProps) {
  const today = new Date();

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
      <Separator />
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
          <div className="h-[800px] whitespace-pre-wrap pt-10 text-sm">
            <BlockEditor summary={summary} />
          </div>
          <Separator />
          <div className="p-4">
            <form>
              <div className="grid gap-4">
                <div className="flex items-center">
                  <Button
                    onClick={(e) => e.preventDefault()}
                    size="sm"
                    className="ml-auto"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </form>
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
