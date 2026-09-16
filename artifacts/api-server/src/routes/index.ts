import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products.js";
import cartRouter from "./cart.js";
import wishlistRouter from "./wishlist.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/products", productsRouter);
router.use("/cart", cartRouter);
router.use("/wishlist", wishlistRouter);

export default router;
