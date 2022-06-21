import { json, redirect } from "@remix-run/node";
import { Form, Link, useActionData } from "@remix-run/react";
import bcrypt from "bcryptjs";
import { getSession, commitSession } from "~/sessions.server.js";
import connectDb from "~/db/connectDb.server.js";

export async function loader({ request }) {
  const session = await getSession(request.headers.get("Cookie"));
  if (session.has("userId")) {
    throw redirect("/");
  }
  return null;
}

export async function action({ request }) {
  const db = await connectDb();
  const form = await request.formData();

  if (form.get("password").trim() !== form.get("repeatPassword").trim()) {
    return json(
      { errorMessage: "Passwords didn't match" },
      { status: 400 }
    );
  }

  if (form.get("password").trim()?.length < 8) {
    return json(
      { errorMessage: "Password should be at least 8 characters long" },
      { status: 400 }
    );
  }

  const hashedPassword = await bcrypt.hash(form.get("password").trim(), 10);

  try {
    const user = await db.models.User.create({
      username: form.get("username").trim(),
      password: hashedPassword,
    });
    if (user) {
      const session = await getSession(request.headers.get("Cookie"));
      return redirect("/", {
        headers: {
          "Set-Cookie": await commitSession(session),
        }
      });
    } else {
      return json(
        { errorMessage: "User couldn't be created" },
        { status: 400 }
      );
    }
  } catch (error) {
    return json(
      {
        errorMessage:
          error.message ??
          error.errors?.map((error) => error.message).join(", "),
      },
      { status: 400 }
    );
  }
}

export default function Register() {
  const actionData = useActionData();

  return (
    <div className="m-3">
      <h2>Register</h2>
      {actionData?.errorMessage ? (
        <p className="text-red-500 font-bold my-3">{actionData.errorMessage}</p>
      ) : null}
      <Form method="post" className="text-inherit">
        <Input
          type="text"
          name="username"
          id="username"
          placeholder="Username"
        />
        <Input
          type="password"
          name="password"
          id="password"
          placeholder="Password"
        />
        <Input
          type="password"
          name="repeatPassword"
          id="repeatPassword"
          placeholder="Repeat password"
        />
        <div className="flex flex-row items-center gap-3">
          <button type="submit" className="my-3 p-2 border rounded">
            Sign up
          </button>
          <span className="italic">or</span>
          <Link to="/login" className="underline">
            Log in
          </Link>
        </div>
      </Form>
    </div>
  );
}

function Input({ ...rest }) {
  return (
    <input
      {...rest}
      className="block my-3 border rounded px-2 py-1 w-full lg:w-1/2 bg-white border-zinc-300"
    />
  );
}
