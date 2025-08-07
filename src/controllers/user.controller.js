import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/AppError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const resgisterUser = asyncHandler(async (req, res) => {
  // get user details
  const { username, email, fullName, password } = req.body;

  // Basic validations
  if (!fullName) throw new ApiError(400, "Full name is required");
  if (!username) throw new ApiError(400, "Username is required");
  if (!email) throw new ApiError(400, "Email is required");
  if (!password) throw new ApiError(400, "Password is required");

  // Check for existing user
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(409, "User with this username or email already exists");
  }

  // Avatar is required
  const avatarLocalPath = req.files?.avatar[0]?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // Cover image is optional
  let coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  // Upload avatar on cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar || !avatar.url) {
    throw new ApiError(500, "Avatar upload failed");
  }

  // Upload cover image (if provided)
  let coverImage = { url: "" };
  if (coverImageLocalPath) {
    coverImage = (await uploadOnCloudinary(coverImageLocalPath)) || { url: "" };
  }
  // console.log("Avatar path:", avatarLocalPath);
  // console.log("CoverImage path:", coverImageLocalPath);

  // create user object - create entry in db
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage.url,
    email,
    username: username.toLowerCase(),
    password,
  });

  // remove password and refresh token field from response
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully"));
});

export { resgisterUser };
