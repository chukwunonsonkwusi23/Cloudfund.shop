// lib/cors.js
import Cors from "cors";
import { NextRequest, NextResponse } from "next/server";

// Initialize the cors middleware
const cors = Cors({
  methods: ["POST", "GET", "HEAD"],
  origin: "http://localhost:3000", // Allow your development client URL
});

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: NextRequest, res: NextResponse, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export default cors;
export { runMiddleware };
