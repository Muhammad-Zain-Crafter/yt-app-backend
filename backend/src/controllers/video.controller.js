import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const publishVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  // TODO: get video, upload to cloudinary, create video
  if (!title || !description) {
    throw new ApiError(400, "Title and description are required");
  }

  const videoFilePath = req.files?.videoFile?.[0]?.path;
  const thumbnailPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFilePath) {
    throw new ApiError(400, "Video file is required");
  }

  const videoFile = await uploadOnCloudinary(videoFilePath);
  const thumbnail = await uploadOnCloudinary(thumbnailPath);

  if (!videoFile.url) {
    throw new ApiError(500, "Video upload failed");
  }

  const video = await Video.create({
    title,
    description,
    duration: videoFile.duration,
    videoFile: {
      url: videoFile.url,
      public_id: videoFile.public_id,
    },
    thumbnail: {
      url: thumbnail.url,
      public_id: thumbnail.public_id,
    },
    owner: req.user._id,
    isPublished: false,
  });

  const videoUploaded = await Video.findById(video._id);
  if (!videoUploaded) {
    throw new ApiError(500, "videoUpload failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "video published successfully"));
});

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
  //TODO: get all videos based on query, sort, pagination
  const pipeline = [];

  if (query) {
    pipeline.push({
      $search: {
        // Perform a text search.
        index: "video-search",
        text: {
          query: query,
          path: ["title", "description"], // search only on title, description
        },
      },
    });
  }
  if (userId) {
    if (!isValidObjectId(userId)) {
      // checks whether a given value is a valid MongoDB ObjectId
      throw new ApiError(400, "invalid user");
    }

    pipeline.push({
      $match: {
        owner: mongoose.Types.ObjectId(userId),
      },
    });
  }
  // fetch videos only that are set isPublished as true
  pipeline.push({ $match: { isPublished: true } });

  //sortBy can be views, createdAt and duration
  //sortType can be ascending(-1) or descending(1)

  if (sortBy && sortType) {
    pipeline.push({
      $sort: {
        [sortBy]: sortType === "asc" ? 1 : -1, // (1 for ascending, -1 for descending)
      },
    });
  }
  // If user didn’t provide sortBy and sortType, then sort by createdAt in descending order (latest first).
  else {
    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });
  }
  pipeline.push(
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "ownerDetails",
        pipeline: [
          {
            $project: {
              username: 1,
              "avatar.url": 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$ownerDetails", // takes an array field and splits it into multiple documents,
    }
  );
  const videoAggregate = await Video.aggregate(pipeline);

  const options = {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
  };
  const video = await Video.aggregatePaginate(videoAggregate, options);

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: get video by id
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "invalid video id");
  }

  if (!isValidObjectId(req.user?._id)) {
    throw new ApiError(400, "invalid user id");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likes",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipliner: [
          {
            $lookup: {
              from: "subscriptions",
              localField: "_id",
              foreignField: "channel",
              as: "subscribers",
            },
          },
          {
            addfields: {
              subscribersCount: { $size: "$subscribers" },
              // Check if req.user._id exists inside subscribers.subscriber array
              isSubscribed: {
                $cond: {
                  if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                  then: true,
                  else: false,
                },
              },
            },
          },
          {
            $project: {
              username: 1,
              "avatar.url": 1,
              subscribersCount: 1,
              isSubscribed: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        likesCount: {
          $size: "$likes",
        },
        ownser: {
          $first: "$owner",
        },
        isLiked: {
          $cond: {
            if: { $in: [req.user_id, "$likes.likedBy"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        "videoFile.url": 1,
        title: 1,
        description: 1,
        views: 1,
        createdAt: 1,
        duration: 1,
        comments: 1,
        owner: 1,
        likesCount: 1,
        isLiked: 1,
      },
    },
  ]);
  if (!video) {
    throw new ApiError(400, "failed to fetch video");
  }
  
  // increment views if video fetched successfully
  await Video.findByIdAndUpdate(videoId, 
    {
      $inc: {
        views: 1
      }
    }
  )
  // add this video to user watch history
  await User.findByIdAndUpdate(req.user?._id,
    {
      $addToSet: {
        // addToSet adds the value to the array only if it doesn't already exist
        watchHistory: videoId 
      }
    }
  )
  return res
        .status(200)
        .json(
            new ApiResponse(
              200,
              video[0],
              "video details fetched successfully")
        );
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: update video details like title, description, thumbnail
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  //TODO: delete video
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
});

export {
  publishVideo,
  getAllVideos,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
