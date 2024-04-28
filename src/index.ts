import { Hono } from "hono";
import { poweredBy } from "hono/powered-by";
import { logger } from "hono/logger";
import dbConnect from "./db/connect";
import videosModel from "./db/video";
import { isValidObjectId } from "mongoose";
import { stream, streamText } from "hono/streaming";

const app = new Hono();

// middlewares
app.use(poweredBy());
app.use(logger());

dbConnect()
  .then(() => {
    // GET List
    app.get("/", async (c) => {
      const documents = await videosModel.find();
      return c.json(
        documents.map((d) => d.toObject()),
        200
      );
    });
    // Create document
    app.post("/", async (c) => {
      const formData = await c.req.json();
      console.log(JSON.stringify(formData));
      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      const video = new videosModel(formData);

      try {
        const document = await video.save();
        return c.json(document.toObject(), 201);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });
    // View document by ID
    app.get("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await videosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return c.json(document, 200);
    });
    app.get("/d/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await videosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      return streamText(c, async (stream) => {
        stream.onAbort(() => {
          console.log("Aborted!");
        });

        for (let i = 0; i < document.description.length; i++) {
          await stream.write(document.description[i]);
          await stream.sleep(100);
        }
      });
    });
    app.patch(":documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      const document = await videosModel.findById(id);
      if (!document) return c.json("Document not found", 404);

      const formData = await c.req.json();

      if (!formData.thumbnailUrl) delete formData.thumbnailUrl;

      try {
        const updatedDocument = await videosModel.findByIdAndUpdate(id, formData, { new: true });
        return c.json(updatedDocument?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });
    app.delete("/:documentId", async (c) => {
      const id = c.req.param("documentId");
      if (!isValidObjectId(id)) return c.json("Invalid ID", 400);

      try {
        const deleted = await videosModel.findByIdAndDelete(id);
        return c.json(deleted?.toObject(), 200);
      } catch (error) {
        return c.json((error as any)?.message || "Internal server error", 500);
      }
    });
  })
  .catch((error) => {
    app.get("/*", (c) => {
      return c.text(`Failed to connect mongodb: ${error.message}`);
    });
  });

app.onError((err, c) => {
  console.error(`${err}`);
  return c.text(`App Error ${err.message}`, 500);
});

export default app;
