import { useLoaderData, Link } from "@remix-run/react";
import connectDb from "~/db/connectDb.server.js";
import { getSession } from "~/sessions.server.js";
import { redirect } from "@remix-run/node";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (!session.has("userId")) {
    throw redirect("/login");
  }
  const db = await connectDb();
  const profile = await db.models.Profile.findById(session.userId);
  return profile;
}

export default function Index() {
  const profiles = useLoaderData();

  return (
    <div>
      {/* <ul className="ml-5 list-disc">
        {profiles.map((profile) => {
          return (
            <li key={profile._id}>
              <Link
                to={`/profiles/${profile._id}`}
                className="text-blue-600 hover:underline">
              </Link>
            </li>
          );
        })}
      </ul> */}
    </div>
  );
}
