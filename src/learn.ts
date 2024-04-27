import { Hono } from "hono";
import { stream, streamText } from "hono/streaming";
import { v4 as uuidv4 } from "uuid";

type Video = {
  id: string;
  name: string;
  channelName: string;
  duration: string;
};
let videos: Video[] = [];

const app = new Hono();

// root
app.get("/", (c) => {
  return c.html("<h1>HONO🔥</h1>");
});

// post
app.post("/video", async (c) => {
  const { name, channelName, duration } = await c.req.json();

  const newVideo: Video = {
    id: uuidv4(),
    name,
    channelName,
    duration,
  };

  videos.push(newVideo);

  return c.json(newVideo);
});

// get all
app.get("/videos", (c) => {
  return streamText(c, async (stream) => {
    for (const video of videos) {
      await stream.writeln(JSON.stringify(video));
    }
  });
});

// get one
app.get("/video/:id", (c) => {
  const { id } = c.req.param();

  const video = videos.find((x) => x.id === id);

  if (!video) {
    return c.json({ message: "video not found" }, 404);
  }

  return c.json(video);
});

// update
app.put("/video/:id", async (c) => {
  const { id } = c.req.param();
  const index = videos.findIndex((video) => video.id === id);

  if (index === -1) {
    return c.json({ message: "video not found" }, 404);
  }

  const { name, channelName, duration } = await c.req.json();
  videos[index] = { ...videos[index], name, channelName, duration };

  return c.json(videos[index]);
});

// delete
app.delete("/video/:id", (c) => {
  const { id } = c.req.param();
  videos = videos.filter((video) => video.id !== id);
  return c.json({ message: "video deleted" });
});

// delete all
app.delete("/videos", (c) => {
  videos = [];
  return c.json({ message: "all videos deleted" });
});

export default app;
