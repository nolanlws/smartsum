import { cookies } from "next/headers";
import { accounts, mails } from "./data";
import { Mail } from "./_components/summary";
import { getUserSummaries } from "./actions/getUserSummaries"; // Adjust the path according to your project structure
import { db } from "@/server/db";

export default async function MailPage() {
  // Replace this with the actual way of retrieving userId
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, 1), // Hardcoded user ID for now need generate token
  });

  if (!user) {
    return <p>User not authenticated</p>;
  }

  const summaries = await getUserSummaries(user.id);
  console.log(summaries);
  const layout = cookies().get("react-resizable-panels:layout");
  const collapsed = cookies().get("react-resizable-panels:collapsed");

  const defaultLayout =
    layout?.value !== "undefined" ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed =
    collapsed?.value !== "undefined" ? JSON.parse(collapsed.value) : undefined;

  return (
    <Mail
      accounts={accounts}
      mails={mails}
      summaries={summaries}
      defaultLayout={defaultLayout}
      defaultCollapsed={defaultCollapsed}
      navCollapsedSize={4}
    />
  );
}
