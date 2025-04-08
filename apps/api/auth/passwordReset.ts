import { FastifyReply, FastifyRequest, HTTPMethods } from "fastify";
import { db } from "@pathize/db";
import { AuthResponse } from "../types";
import { verifyPasswordResetToken } from "../lib";

type Querystring = {
  token: string;
};

const handler = async (
  request: FastifyRequest<{ Querystring: Querystring }>,
  reply: FastifyReply,
) => {
  const { token } = request.query;
  try {
    const BASE_URL =
      process.env.NODE_ENV === "production"
        ? "https://jupiter-api.fly.dev"
        : process.env.NODE_ENV === "staging"
          ? "https://jupiter-api-staging.fly.dev"
          : "http://localhost:3000";
    const isTokenValid = await verifyPasswordResetToken(token);
    const subject = isTokenValid.payload.sub;
    console.log(subject);
    const users = await db.user.findMany({
      where: {
        email: subject,
      },
    });

    console.log(users);

    if (users.length === 0) {
      return reply.status(404).send({
        status: 404,
        message: "Not found",
      } as AuthResponse<string>);
    }

    const htmlTemplate = `
    <html>
      <head>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
      </head>
      <body class="flex items-center justify-center h-screen bg-gray-100">
        <div class="w-full max-w-lg">
            <form id="resetForm" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 mx-auto">
            <div id="errorMessage" class="text-red-500 mb-4 hidden"></div>
            <div id="successMessage" class="text-green-500 mb-4 hidden"></div>
            <input type="hidden" id="emailField" value="${subject}" />
            <div id="formWrapper">
              <div class="mb-4">
                  <h1 class="text-center text-xl font-bold text-gray-900">Reset Pathize password</h1>
              </div>
              <div class="mb-4">
                  <label class="block text-gray-700 text-sm font-bold mb-2" for="passwordField">
                  New password:
                  </label>
                  <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" id="passwordField" required />
              </div>
              <div class="mb-4">
                  <label class="block text-gray-700 text-sm font-bold mb-2" for="confirmPasswordField">
                  Confirm new password:
                  </label>
                  <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="password" id="confirmPasswordField" required />
              </div>
              <div class="flex items-center justify-between">
                  <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="button" onclick="resetPassword()">
                  Submit
                  </button>
              </div>
            </div>
            </form>
        </div>
        <script>
          window.BASE_URL = '${BASE_URL}';
          window.token = '${token}';
        </script>
        <script>
          async function resetPassword() {
            var email = document.getElementById('emailField').value;
            var password = document.getElementById('passwordField').value;
            var confirmPassword = document.getElementById('confirmPasswordField').value;
            if (password !== confirmPassword) {
              alert('Passwords do not match');
              return;
            }
            // if the password is less than six characters
            if (password.length < 6) {
              alert('Password must be at least six characters');
              return;
            }
            try {
              const validatePasswordResetResponse = await fetch('${BASE_URL}/api/v1/validatePasswordReset', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      Authorization: 'Bearer ${token}'
                  },
                  body: JSON.stringify({
                      password,
                      email
                  })
              });
              const validatePasswordResetResponseJson = await validatePasswordResetResponse.json();
              if (validatePasswordResetResponse.status === 401) {
                const errorMessage = document.getElementById('errorMessage');
                errorMessage.textContent = "Something went wrong, please try to reset your password again.";
                errorMessage.classList.remove('hidden');
                setTimeout(function() {
                  errorMessage.textContent = "";
                  errorMessage.classList.add('hidden');
                }, 10000);
              }
              // if it was a 500
              if (validatePasswordResetResponse.status === 500) {
                  const errorMessage = document.getElementById('errorMessage');
                  errorMessage.textContent = "There was an error resetting your password. Please refresh the page and try again.";
                  errorMessage.classList.remove('hidden');
                  setTimeout(function() {
                      errorMessage.textContent = "";
                      errorMessage.classList.add('hidden');
                  }, 10000);
              }
              // if it was a 404, the email was not found
              if (validatePasswordResetResponse.status === 404) {
                  const errorMessage = document.getElementById('errorMessage');
                  errorMessage.textContent = "Something went wrong, please try to reset your password again.";
                  errorMessage.classList.remove('hidden');
                  setTimeout(function() {
                      errorMessage.textContent = "";
                      errorMessage.classList.add('hidden');
                  }, 10000);
              }
              // show a success message that the password was successfully reset
              if (validatePasswordResetResponse.status === 200) {
                  const successMessage = document.getElementById('errorMessage');
                  successMessage.textContent = "Your password has been successfully reset! You can close this page, and log in with your new password.";
                  // also, hide the entire form
                  const formWrapper = document.getElementById('formWrapper');
                  formWrapper.classList.add('hidden');
                  successMessage.classList.remove('hidden');
                }
              } catch (err) {
                  console.error(err);
            }
          }
        </script>
      </body>
    </html>`;

    return reply.type("text/html").send(htmlTemplate);
  } catch (err) {
    console.error(err);
    return reply.status(500).send({
      status: 500,
      message: "Internal server error",
    } as AuthResponse<string>);
  }
};

const schema = {
  querystring: {
    type: "object",
    properties: {
      token: { type: "string" },
    },
    required: ["token"],
  },
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
    404: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },

      required: ["status", "message"],
    },
    500: {
      type: "object",
      properties: {
        status: { type: "number" },
        message: { type: "string" },
      },
      required: ["status", "message"],
    },
  },
};

export const passwordResetRoute = {
  method: "GET" as HTTPMethods,
  url: "/api/v1/passwordReset",
  schema,
  handler,
};
