import { Schema, model } from "mongoose";

export interface IVeideoSchema {
  title: string;
  description: string;
  thumbnailUrl?: string;
  watched: boolean;
  name: string;
}

const VideoSchema = new Schema<IVeideoSchema>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  thumbnailUrl: {
    type: String,
    default: "https://viaplaceholder.com/1600x900.webp",
    required: false,
  },
  watched: {
    type: Boolean,
    default: false,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});

const videosModel = model("videos", VideoSchema);

export default videosModel;
