import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";
import reviewsRouter from "./reviews.js";
import authRouter from "./auth.js";
import notificationsRouter from "./notifications.js";
import carouselRouter from "./carousel.js";
import archivesRouter from "./archives.js";
import eventsRouter from "./events.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);
router.use("/reviews", reviewsRouter);
router.use("/notifications", notificationsRouter);
router.use("/carousel", carouselRouter);
router.use("/archives", archivesRouter);
router.use("/events", eventsRouter);

export default router;
