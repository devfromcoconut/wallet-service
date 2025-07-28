import { Router } from "express";
import { WalletController } from "../controllers/walletController";
import {
  createWalletSchema,
  processPaymentSchema,
  updateBvnSchema,
  transferToBankSchema,
  getTransactionsByWalletId,
} from "../schemas/walletSchema";
import { protect } from "../middlewares/auth";
import { validate } from "../middlewares/validate";

const router = Router();     
const walletController = new WalletController();

router.post(
  "/bani",
  protect,
  walletController.baniTransferToBank
);


router.get("/data", 
  // protect, 
  walletController.fetchWalletsData)

/**  
 * @swagger
 * /api/v1/wallets/data:
 *   get:
 *     summary: Get all wallets of a user by admin
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
 */
router.get("/transactions", 
  // protect, 
  walletController.fetchAllTransactions)

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier of the transaction
 *         walletId:
 *           type: string
 *           description: The ID of the associated wallet
 *         txId:
 *           type: string
 *           description: The transaction ID
 *         txRef:
 *           type: string
 *           description: The transaction reference
 *         amount:
 *           type: number
 *           description: The transaction amount
 *         currency:
 *           type: string
 *           description: The currency of the transaction
 *         type:
 *           type: string
 *           description: The type of transaction (e.g., payment)
 *         status:
 *           type: string
 *           description: The status of the transaction (e.g., successful)
 *         meta:
 *           type: object
 *           properties:
 *             data:
 *               type: object
 *               properties:
 *                 senderDetails:
 *                   type: string
 *                   description: Details of the sender
 *                 receiverDetails:
 *                   type: string
 *                   description: Details of the receiver
 *                 weight:
 *                   type: string
 *                   description: Weight of the package
 *                 packageContents:
 *                   type: string
 *                   description: Contents of the package
 *                 packageValue:
 *                   type: number
 *                   description: Value of the package
 *                 paymentMethod:
 *                   type: string
 *                   description: The payment method used
 *                 paymentMethodId:
 *                   type: string
 *                   description: The ID of the payment method
 *         __v:
 *           type: number
 *           description: The version key
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The creation date of the transaction
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The last update date of the transaction
 *       example:
 *         _id: "67e168f7d16f71d134a2734d"
 *         walletId: "67dc21990a5c933c2d172b11"
 *         txId: "8036898652648575"
 *         txRef: "Coconut_1742574887985"
 *         amount: 1449
 *         currency: "NGN"
 *         type: "payment"
 *         status: "successful"
 *         meta:
 *           data:
 *             senderDetails: "1B OLABODE STREET AJAO ESTATE LAGOS, Oshodi, Lagos, NG"
 *             receiverDetails: "1789 Davidson Ave #2B Bronx NY 10453, Bronx, New York, US"
 *             weight: "4.5"
 *             packageContents: "Male local fabricHead tie"
 *             packageValue: 60000
 *             paymentMethod: "Coconut Wallet"
 *             paymentMethodId: "67dd952f38e9283eda92d04b"
 *         __v: 0
 *         createdAt: "2025-03-24T14:15:19.926Z"
 *         updatedAt: "2025-03-24T14:15:19.926Z"
 *
 *     Pagination:
 *       type: object
 *       properties:
 *         currentPage:
 *           type: integer
 *           description: The current page number
 *         totalPages:
 *           type: integer
 *           description: The total number of pages
 *         limit:
 *           type: integer
 *           description: The number of items per page
 *         totalItems:
 *           type: integer
 *           description: The total number of items
 *       example:
 *         currentPage: 1
 *         totalPages: 5
 *         limit: 10
 *         totalItems: 50
 *
 * /api/v1/wallets/transactions:
 *   get:
 *     summary: Get all transactions with pagination
 *     description: Retrieve a paginated list of transactions for a user by an admin
 *     tags: [Wallet, Transactions] # Add Transactions tag to categorize
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transactions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *             example:
 *               success: true
 *               transactions:
 *                 - _id: "67e168f7d16f71d134a2734d"
 *                   walletId: "67dc21990a5c933c2d172b11"
 *                   txId: "8036898652648575"
 *                   txRef: "Coconut_1742574887985"
 *                   amount: 1449
 *                   currency: "NGN"
 *                   type: "payment"
 *                   status: "successful"
 *                   meta:
 *                     data:
 *                       senderDetails: "1B OLABODE STREET AJAO ESTATE LAGOS, Oshodi, Lagos, NG"
 *                       receiverDetails: "1789 Davidson Ave #2B Bronx NY 10453, Bronx, New York, US"
 *                       weight: "4.5"
 *                       packageContents: "Male local fabricHead tie"
 *                       packageValue: 60000
 *                       paymentMethod: "Coconut Wallet"
 *                       paymentMethodId: "67dd952f38e9283eda92d04b"
 *                   __v: 0
 *                   createdAt: "2025-03-24T14:15:19.926Z"
 *                   updatedAt: "2025-03-24T14:15:19.926Z"
 *               pagination:
 *                 currentPage: 1
 *                 totalPages: 5
 *                 limit: 10
 *                 totalItems: 50
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               message: "Unauthorized"
 *       404:
 *         description: No transactions found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               message: "No transactions found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             example:
 *               success: false
 *               message: "Internal server error"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateTransferRequest:
 *       type: object
 *       required:
 *         - receiverAmount
 *         - transferMethod
 *         - receiverCurrency
 *         - transferReceiverType
 *         - receiverAccountNumber
 *         - receiverCountryCode
 *         - senderAmount
 *         - senderCurrency
 *         - businessId
 *         - walletId
 *       properties:
 *         receiverAmount:
 *           type: number
 *           description: Amount to be received by the recipient
 *           example: 100.50
 *         transferMethod:
 *           type: string
 *           description: Method of transfer (e.g., bank, crypto, wallet)
 *           example: bank
 *         receiverCurrency:
 *           type: string
 *           description: Currency of the receiver's amount (e.g., USD, NGN, BTC)
 *           example: USD
 *         transferReceiverType:
 *           type: string
 *           description: Type of receiver account (e.g., bank, crypto_wallet)
 *           example: bank
 *         receiverAccountNumber:
 *           type: string
 *           description: Receiver's account number or wallet address
 *           example: "1234567890"
 *         receiverCountryCode:
 *           type: string
 *           description: ISO country code of the receiver (e.g., US, NG)
 *           example: US
 *         receiverAccountName:
 *           type: string
 *           description: Name of the receiver's account
 *           example: John Doe
 *         receiverSortCode:
 *           type: string
 *           description: Sort code for bank transfers
 *           example: "01-02-03"
 *         senderAmount:
 *           type: number
 *           description: Amount sent by the sender
 *           example: 102.00
 *         senderCurrency:
 *           type: string
 *           description: Currency of the sender's amount (e.g., USD, NGN)
 *           example: USD
 *         businessId:
 *           type: string
 *           description: ID of the business initiating the transfer
 *           example: "biz_123"
 *         meta:
 *           type: object
 *           description: Additional metadata for the transfer
 *           example: { "note": "Payment for services" }
 *         walletId:
 *           type: string
 *           description: ID of the wallet used for the transfer
 *           example: "wallet_456"
 *     TransferResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: Indicates if the transfer was initiated successfully
 *           example: true
 *         message:
 *           type: string
 *           description: Response message
 *           example: Transfer initiated successfully
 *         data:
 *           type: object
 *           properties:
 *             transferId:
 *               type: string
 *               description: Unique identifier for the transfer
 *               example: "tx_789"
 *             status:
 *               type: string
 *               description: Current status of the transfer
 *               example: pending
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         statusCode:
 *           type: number
 *           description: HTTP status code
 *         message:
 *           type: string
 *           description: Error message
 *
 * /api/v1/bani:
 *   post:
 *     summary: Initiate Banni transfer
 *     description: Creates a new transfer request with details about the sender, receiver, and transaction.
 *     tags:
 *       - Transfers
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTransferRequest'
 *     responses:
 *       201:
 *         description: Transfer initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TransferResponse'
 *       400:
 *         description: Invalid request payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 statusCode: 400
 *                 message: Invalid input
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 statusCode: 401
 *                 message: Unauthorized
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *               example:
 *                 statusCode: 500
 *                 message: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Wallet:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Wallet ID
 *         businessId:
 *           type: string
 *           description: ID of the business who owns the wallet
 *         email:
 *           type: string
 *           description: The email linked to the wallet
 *         firstName:
 *           type: string
 *           description: The first name of the wallet owner
 *         lastName:
 *           type: string
 *           description: The last name of the wallet owner
 *         currency:
 *           type: string
 *           description: Currency of the wallet
 *         balance:
 *           type: number
 *           description: Current balance of the wallet
 *         accountNumber:
 *           type: number
 *           description: Account Number of the wallet
 *         bankName:
 *           type: string
 *           description: Name of the bank of the wallet
 *         flwRef:
 *           type: string
 *           description: The forward ref of the wallet
 *         orderRef:
 *           type: string
 *           description: The order ref of the wallet
 *         narration:
 *           type: string
 *           description: The narration of the wallet and identification
 *         accountStatus:
 *           type: string
 *           description: The current status of the wallet
 *     CreateWalletRequest:
 *       type: object
 *       required:
 *         - businessId
 *         - currency
 *         - email
 *         - phoneNumber
 *         - firstName
 *         - lastName
 *         - narration
 *         - bvn
 *       properties:
 *         businessId:
 *           type: string
 *           example: "67c8143b81fe647418a04f21"
 *           description: ID of the user
 *         email:
 *           type: string
 *           example: "sasuke.uchiha@mailinator.com"
 *           description: ID of the user
 *         phoneNumber:
 *           type: number
 *           example: "08134899761"
 *           description: ID of the user
 *         firstName:
 *           type: string
 *           example: "Sasuke"
 *           description: ID of the user
 *         lastName:
 *           type: string
 *           example: "Uchiha"
 *           description: ID of the user
 *         currency:
 *           type: string
 *           example: "NGN"
 *           description: Currency of the wallet
 *         narration:
 *           type: string
 *           example: "Business Name"
 *           description: ID of the user
 *         bvn:
 *           type: string
 *           example: "12345678901"
 *           description: ID of the user
 *     ProcessPaymentRequest:
 *       type: object
 *       required:
 *         - walletId
 *         - amount
 *         - service
 *         - meta
 *       properties:
 *         walletId:
 *           type: string
 *           description: ID of the wallet to debit
 *         amount:
 *           type: array
 *           items:
 *             type: number
 *             minimum: 0.01
 *         service:
 *           type: string
 *           description: Type of service to pay for
 *         meta:
 *           type: object
 *           description: Extra information with the payment
 *     TransferToWalletRequest:
 *       type: object
 *       required:
 *         - toWalletId
 *         - amount
 *       properties:
 *         account number:
 *           type: string
 *           description: ID of the receiver's wallet
 *         amount:
 *           type: number
 *           description: Amount to transfer
 *         description:
 *           type: string
 *           description: Optional transaction description
 *     TransferToBankRequest:
 *       type: object
 *       required:
 *         - recipientAccountBank
 *         - recipientAccountNumber
 *         - amount
 *         - narration
 *       properties:
 *         recipientAccountBank:
 *           type: string
 *           description: Bank of the recipient
 *         recipientAccountNumber:
 *           type: string
 *           description: Account number of recipient
 *         amount:
 *           type: number
 *           description: Amount to transfer
 *         narration:
 *           type: string
 *           description: Optional transaction description
 */

/**
 * @swagger
 * /api/v1/wallets:
 *   post:
 *     summary: Create a new wallet for a user
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWalletRequest'
 *     responses:
 *       201:
 *         description: Wallet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Wallet'
 */
router.post(
  "/",
  protect,
  validate({ body: createWalletSchema }),
  walletController.createWallet
);

/**
 * @swagger
 * /api/v1/wallets/banks:
 *   get:
 *     summary: Get a list of all banks from Flutterwave
 *     tags: [Banks]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: countryCode
 *         schema:
 *           type: string
 *         description: Country code (default "NG" for Nigeria)
 *     responses:
 *       200:
 *         description: Successfully retrieved bank details
 */
router.get("/banks", protect, walletController.getAllBanks);

/**
 * @swagger
 * /api/v1/wallets/{businessId}:
 *   get:
 *     summary: Get all wallets of a user
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: businessId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the business
 *     responses:
 *       200:
 *         description: Wallets retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Wallet'
 */
router.get("/:businessId", protect, walletController.getBusinessWallets);

/**
 * @swagger
 * /api/v1/wallets/verify:
 *   get:
 *     summary: Verify a transaction
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the transaction to verify
 *     responses:
 *       200:
 *         description: Transaction verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   description: Transaction status
 */
router.get("/verify", protect, walletController.verifyTransaction);

/**
 * @swagger
 * /api/v1/wallets/balance/{walletId}:
 *   get:
 *     summary: Get wallet balance
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Balance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   description: Current wallet balance
 */
router.get("/balance/:walletId", protect, walletController.getWalletBalance);

/**
 * 
 * @swagger
 * /api/v1/wallets/pay:
 *   post:
 *     summary: Process payment for shipment
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProcessPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment successful
 */
router.post(
  "/pay",
  protect,
  validate({ body: processPaymentSchema }),
  walletController.processPayment
);

/**
 * @swagger
 * /api/v1/wallets/transfer:
 *   post:
 *     summary: Transfer funds between to customer bank
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TransferToBankRequest'
 *     responses:
 *       200:
 *         description: Transfer successful
 */
router.post(
  "/transfer",
  protect,
  validate({ body: transferToBankSchema }),
  walletController.transferToBank
);

/**
 * @swagger
 * /api/v1/wallets/update-bvn:
 *   post:
 *     summary: Update BVN for a wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - walletId
 *               - bvn
 *             properties:
 *               walletId:
 *                 type: string
 *                 description: The ID of the wallet
 *               bvn:
 *                 type: string
 *                 description: The new BVN to update
 *     responses:
 *       200:
 *         description: BVN updated successfully
 *       400:
 *         description: Bad request (missing or invalid data)
 *       500:
 *         description: Internal server error
 */
router.post(
  "/update-bvn",
  protect,
  validate({ body: updateBvnSchema }), // Ensure valid input
  walletController.updateBvn
);

/**
 * @swagger
 * /api/v1/wallets/transactions/{walletId}:
 *   get:
 *     summary: Get all transactions for a wallet
 *     tags: [Wallet]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: walletId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the wallet
 *     responses:
 *       200:
 *         description: Transactions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       type:
 *                         type: string
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get(
  "/transactions/:walletId",
  protect,
  validate({ params: getTransactionsByWalletId }),
  walletController.getTransactionsByWalletId
);

export default router;
