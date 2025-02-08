import { createNextRouteHandler } from "uploadthing/next";

import { ourFileRouter } from "./core";
import { UTApi } from "uploadthing/server";

// Export routes for Next App Router
export const { GET, POST } = createNextRouteHandler({
  router: ourFileRouter,
});

export async function DELETE(request: Request) {
  const data = await request.json();
  const keys = data.keys;
  const utapi = new UTApi();
  return await utapi.deleteFiles(keys).then((res) => {
    return Response.json(res);
  });
}
