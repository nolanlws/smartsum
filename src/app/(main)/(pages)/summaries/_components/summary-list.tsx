const { convert } = require("html-to-text");
import { ComponentProps } from "react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Summary } from "./summary";

type SummaryListProps = {
  handleSetSummary: (summary: Summary) => void;
  summaries: Summary[];
  summary?: Summary;
};

export function SummaryList({
  handleSetSummary,
  summaries,
  summary,
}: SummaryListProps) {
  return (
    <ScrollArea className="mb-5 h-[calc(100vh-200px)]">
      <div className="flex flex-col gap-2 p-4 pt-0">
        {summaries.map((item) => (
          <button
            key={item.id}
            className={cn(
              "flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all hover:bg-accent",
              summary?.id === item.id && "bg-muted",
            )}
            onClick={() => handleSetSummary(item)}
          >
            <div className="flex w-full flex-col gap-1">
              <div className="flex items-center">
                <div className="flex items-center gap-2">
                  <div className="font-semibold">{item.title}</div>
                  {!item.read && (
                    <span className="flex h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </div>
                <div
                  className={cn(
                    "ml-auto text-xs",
                    summary?.id === item.id
                      ? "text-foreground"
                      : "text-muted-foreground",
                  )}
                >
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </div>
              </div>
              <div className="text-xs font-medium">{item.url}</div>
            </div>
            <div className="line-clamp-2 text-xs text-muted-foreground">
              {convert(item.summary.substring(0, 300))}
            </div>
            {item.categories.length ? (
              <div className="flex items-center gap-2">
                {JSON.parse(item?.categories).map((category: string) => (
                  <Badge
                    key={category}
                    variant={getBadgeVariantFromLabel(category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            ) : null}
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}

export function getBadgeVariantFromLabel(
  label: string,
): ComponentProps<typeof Badge>["variant"] {
  if (["work"].includes(label.toLowerCase())) {
    return "default";
  }

  if (["personal"].includes(label.toLowerCase())) {
    return "outline";
  }

  return "secondary";
}
