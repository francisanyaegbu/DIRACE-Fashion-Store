import { Router, type Request, type Response, type IRouter } from 'express';
import {
  sendOrderStatusEmail,
  getEmailDispatchHistory,
  buildOrderStatusEmail,
  type OrderNotificationPayload,
} from '../lib/email';
import { logger } from '../lib/logger';

const router: IRouter = Router();

/**
 * POST /api/notifications/order-status
 * Dispatches an automated email to the client when order status becomes 'Shipped' or 'Delivered'
 */
router.post('/order-status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { order, status } = req.body as {
      order: OrderNotificationPayload;
      status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
    };

    if (!order || !order.id) {
      res.status(400).json({ error: 'Missing order payload.' });
      return;
    }

    if (status !== 'Shipped' && status !== 'Delivered') {
      res.status(400).json({
        error: `Automated client emails are only triggered for 'Shipped' or 'Delivered' status updates (received '${status}').`,
      });
      return;
    }

    const recipient = order.customer_email?.trim();
    if (!recipient || !recipient.includes('@')) {
      res.status(400).json({
        error: `Order #${order.id} has no valid customer email address (${recipient || 'empty'}).`,
      });
      return;
    }

    logger.info({ orderId: order.id, status, recipient }, 'Initiating automated client order status email');

    const result = await sendOrderStatusEmail(order, status);

    res.json({
      success: true,
      message: `Client notification for Order #${order.id} (${status}) processed successfully.`,
      dispatch: result,
    });
  } catch (err: any) {
    logger.error({ err }, 'Failed to dispatch order status notification email');
    res.status(500).json({
      error: err.message || 'Failed to dispatch order status email.',
    });
  }
});

/**
 * GET /api/notifications/history
 * Returns recent dispatch records for the admin panel
 */
router.get('/history', async (_req: Request, res: Response): Promise<void> => {
  try {
    const history = getEmailDispatchHistory();
    res.json({ history });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to retrieve notification history.' });
  }
});

/**
 * POST /api/notifications/render-preview
 * Allows rendering a live preview of the email in the admin modal
 */
router.post('/render-preview', (req: Request, res: Response): void => {
  try {
    const { order, status } = req.body as {
      order: OrderNotificationPayload;
      status: 'Shipped' | 'Delivered';
    };

    if (!order) {
      res.status(400).json({ error: 'Missing order payload.' });
      return;
    }

    const rendered = buildOrderStatusEmail(order, status || 'Shipped');
    res.json({
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to render preview.' });
  }
});

export default router;
