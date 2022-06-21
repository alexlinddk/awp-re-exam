import { Form, useActionData } from "@remix-run/react";
import { redirect, json } from "@remix-run/node";
import connectDb from "~/db/connectDb.server.js";

export async function loader() {
  if (!session.has("userId")) {
    throw redirect("/login");
  }
}

export async function action({ request }) {
  if (!session.has("userId")) {
    throw redirect("/login");
  }
  const form = await request.formData();
  const db = await connectDb();
  const session = await getSession(request.headers.get("Cookie"));
  try {
    const newProfile = await db.models.Profile.create({ 
      profileImgUrl: form.get("profileImgUrl"), 
      bio: form.get("bio"), 
      tags: form.get("tags"), 
      userId: form.set(session.get("userId")) 
    });
    return redirect(`/profiles/${newProfile._id}`);
  } catch (error) {
    return json(
      { errors: error.errors, values: Object.fromEntries(form) },
      { status: 400 }
    );
  }
}

export default function CreateProfile() {
  const actionData = useActionData();
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Create profile</h1>
      <Form method="post">
        <label htmlFor="profileImgUrl" className="block font-semibold mb-1">
          Image:
        </label>
        <input
          type="text"
          name="profileImgUrl"
          id="profileImgUrl"
          placeholder="Image"
          defaultValue={actionData?.values.profileImgUrl}
          className={
            actionData?.errors.profileImgUrl ? "border-2 border-red-500" : null
          }
        />
        {actionData?.errors.profileImgUrl && (
          <p className="text-red-500 mt-1 mb-0">
            {actionData.errors.profileImgUrl.message}
          </p>
        )}
        <br />
        <label htmlFor="bio" className="block font-semibold mb-1">
          Bio:
        </label>
        <input
          type="text"
          name="bio"
          id="bio"
          placeholder="Bio"
          defaultValue={actionData?.values.bio}
          className={
            actionData?.errors.bio ? "border-2 border-red-500" : null
          }
        />
        {actionData?.errors.bio && (
          <p className="text-red-500 mt-1 mb-0">
            {actionData.errors.bio.message}
          </p>
        )}
        <br />
        <label htmlFor="tags" className="block font-semibold mb-1">
          Tags:
        </label>
        <input
          type="text"
          name="tags"
          id="tags"
          placeholder="Tags"
          defaultValue={actionData?.values.tags}
          className={
            actionData?.errors.tags ? "border-2 border-red-500" : null
          }
        />
        {actionData?.errors.tags && (
          <p className="text-red-500 mt-1 mb-0">
            {actionData.errors.tags.message}
          </p>
        )}
        <br />
        <button
          type="submit"
          className="mt-3 p-2 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded">
          Save
        </button>
      </Form>
    </div>
  );
}
