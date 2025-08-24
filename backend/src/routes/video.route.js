import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getAllVideos, getVideoById, publishVideo } from "../controllers/video.controller.js";


const router = Router();

router.route("/publish-video").post(
    verifyJWT,
    upload.fields([
       { name: "videoFile", maxCount: 1 },
       { name: "thumbnail", maxCount: 1 }
    ]), publishVideo
)

router.route("/get-videos").get(
    verifyJWT, getAllVideos
)

router.route("/get-videoById").get(
    verifyJWT, getVideoById
)

export default router;