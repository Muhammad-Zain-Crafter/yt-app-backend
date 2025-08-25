import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { deleteVideo, getAllVideos, getVideoById, publishVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js";

const router = Router();

router.route("/publish-video").post(
    verifyJWT,
    upload.fields([
       { name: "videoFile", maxCount: 1 },
       { name: "thumbnail", maxCount: 1 }
    ]), publishVideo
)

// no auth required
router.route("/get-allVideos").get(
    getAllVideos
)

router.route("/v/:videoId")
.get(verifyJWT, getVideoById)
.delete(verifyJWT, deleteVideo)
.patch(verifyJWT, upload.single("thumbnail"), updateVideo)

router.route("/toggle/publish/:videoId").patch(verifyJWT, togglePublishStatus);

export default router;