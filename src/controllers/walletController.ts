import { Request, Response, NextFunction } from "express";
import { WalletService } from "../services/walletService";
import { Wallet } from "../models/Wallet";
import { sendErrorResponse } from "../utils/sendResponse";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { GraphService, PersonPayload } from "../services/graphService";
import { KycMapped, KycStateFlat } from "../schemas/walletSchema";

interface AuthRequest extends Request {
  user?: any;
}


function mapKycStateToPayload(input: KycStateFlat): PersonPayload {
  return {
    name_first: input.firstName,
    name_last: input.lastName,
    name_other: input.otherName,
    phone: input.phoneNumber,
    email: input.email,
    dob: input.dateOfBirth,
    id_type: input.typeId,
    id_number: input.identificationNumber,
    id_country: input.issuingCountry,
    bank_id_number: input.bvnNumber,
    id_level: "secondary",
    kyc_level: "basic",
    address: {
      line1: input.address1,
      line2: input.address2 || "", // Ensure line2 is a string
      city: input.city,
      state: input.state,
      country: input.country,
      postal_code: input.postalCode, // Ensure postal_code is a string
    },
    documents: [{
      type: input.typeId,
      url: input.identificationFile,
      issue_date: input.issueDate,
      expiry_date: input.expiryDate,
    }]
    // address_line1: input.address1,
    // address_city: input.city,
    // address_state: input.state,
    // address_country: input.country,
    // line1: input.address1,
    // city: input.city,
    // state: input.state,
    // country: input.country,
    // postal_code: input.postal_code || "", // Ensure postal_code is a string
    // background_information: input.identificationFile
    //   ? {
    //       documents: [
    //         {
    //           file: input.identificationFile,
    //           issueDate: input.issueDate,
    //           expiryDate: input.expiryDate,
    //         },
    //       ],
    //     }
    //   : undefined,
  };
}

export class WalletController {
  private walletService: WalletService;

  constructor() {
    this.walletService = new WalletService();

    // Bind all methods to ensure `this` is correctly referenced
    this.createWallet = this.createWallet.bind(this);
    this.getAllBanks = this.getAllBanks.bind(this);
    this.getTransactionsByWalletId = this.getTransactionsByWalletId.bind(this);
    this.getBusinessWallets = this.getBusinessWallets.bind(this);
    this.getWalletBalance = this.getWalletBalance.bind(this);
    this.processPayment = this.processPayment.bind(this);
    this.transferToBank = this.transferToBank.bind(this);
    this.baniTransferToBank = this.baniTransferToBank.bind(this);
    this.updateBvn = this.updateBvn.bind(this);
  }

  async createWallet(req: Request, res: Response) {
    try {
      const {
        businessId,
        email,
        phoneNumber,
        firstName,
        lastName,
        bvn,
        narration,
      } = req.body;

      if (
        !businessId ||
        !email ||
        !phoneNumber ||
        !firstName ||
        !lastName ||
        !bvn ||
        !narration
      ) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const wallet = await this.walletService.createWallet(
        businessId,
        email,
        phoneNumber,
        firstName,
        lastName,
        bvn,
        narration
      );
      return res
        .status(201)
        .json({ message: "Wallet created successfully", data: wallet });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get all banks
   */
  async getAllBanks(req: Request, res: Response, next: NextFunction) {
    try {
      const { countryCode } = req.query;
      const banks = await this.walletService.getAllBanks(countryCode as string);
      return res.status(200).json(banks);
    } catch (error) {
      next(error);
    }
  }

  async getBusinessWallets(req: Request, res: Response, next: NextFunction) {
    try {
      const { businessId } = req.params;
      const wallets = await this.walletService.getBusinessWallets(businessId);
      res.status(200).json({ success: true, wallets });
    } catch (error) {
      next(error);
    }
  }

  async getWalletBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletId } = req.params;
      const balance = await this.walletService.getWalletBalance(walletId);
      res.status(200).json({ success: true, balance });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all transaction for a wallet
   */
  async getTransactionsByWalletId(req: Request, res: Response) {
    try {
      const { walletId } = req.params;

      const transactions = await this.walletService.getTransactionsByWalletId(
        walletId
      );

      res.status(200).json({
        message: "Transactions fetched successfully",
        data: transactions,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Failed to fetch transactions",
        error: error.message,
      });
    }
  }

  /**
   * Verify Flutterwave Transaction
   */
  async verifyTransaction(req: Request, res: Response, next: NextFunction) {
    try {
      const { transactionId } = req.params;
      if (!transactionId) {
        return res.status(400).json({ error: "Transaction ID is required" });
      }

      const transactionDetails = await this.walletService.verifyTransaction(
        transactionId
      );

      if (!transactionDetails) {
        return res.status(404).json({ error: "Transaction not found" });
      }

      res.status(200).json(transactionDetails);
    } catch (error: any) {
      console.error("Transaction Verification Error:", error.message);
      res.status(500).json({ error: "Failed to verify transaction" });
    }
  }

  async processPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletId, amount, meta, service } = req.body;
      const response = await this.walletService.processPayment(
        walletId,
        amount,
        meta,
        service
      );
      res.status(200).json({ success: true, response });
    } catch (error: any) {
      console.log(error?.message);
      console.log(error?.response?.data);
      next(error);
    }
  }

  /**
   * Transfer funds to bank
   */
  async transferToBank(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        recipientAccountBank,
        recipientAccountNumber,
        amount,
        narration,
      } = req.body;

      if (
        !recipientAccountBank ||
        !recipientAccountNumber ||
        !amount ||
        !narration
      ) {
        return res.status(400).json({ error: "All fields are required" });
      }

      const transferResponse = await this.walletService.transferToBank(
        recipientAccountBank,
        recipientAccountNumber,
        amount,
        narration
      );
      res.status(200).json({ success: true, data: transferResponse });
    } catch (error) {
      next(error);
    }
  }

  async baniTransferToBank(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const {
        receiverAmount,
        transferMethod,
        receiverCurrency,
        transferReceiverType,
        receiverAccountNumber,
        receiverCountryCode,
        receiverAccountName,
        receiverSortCode,
        senderAmount,
        narration,
        senderCurrency,
        businessId,
        walletId,
        meta,
      } = req.body;

      if (senderAmount && senderAmount < 1000) {
        return res
          .status(400)
          .json({ error: "Sender amount must be at least 1,000 naira" });
      }

      if (senderAmount && senderAmount !== receiverAmount) {
        return res
          .status(400)
          .json({ error: "Sender amount must match receiver amount" });
      }

      if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      const getTransferCost = (plan: "free" | "sme" | "growth"): number => {
        switch (plan) {
          case "free":
            return 50;
          case "sme":
            return 30;
          case "growth":
            return 10; 
        }
      };

      await this.walletService.processPayment(
        walletId,
        [parseInt(senderAmount), getTransferCost(user?.plan || "free")],
        meta,
        "transfer"
      );
      


      const transferResponse = await this.walletService.baniTransferToBank(
        receiverAmount,
        transferMethod,
        receiverCurrency,
        transferReceiverType,
        receiverAccountNumber,
        receiverCountryCode,
        receiverAccountName,
        receiverSortCode,
        senderAmount,
        senderCurrency,
        businessId,
        narration,
        meta,
        walletId
      );
      res.status(200).json({ success: true, data: transferResponse });
    } catch (error) {
      next(error);
    }
  }

  async fetchWalletsData(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1; // Default to page 1
      const limit = parseInt(req.query.limit as string) || 10; // Default to 10 items per page
      const skip = (page - 1) * limit;

      const wallets = await Wallet.find().skip(skip).limit(limit);
      if (!wallets || wallets.length === 0) {
        res.status(200).json({
          success: true,
          wallets: [],
          pagination: {
            currentPage: page,
            totalPages: 0,
            limit: 0,
            totalItems: 0,
          },
        });
      }

      res.status(200).json({
        success: true,
        wallets,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((await Wallet.countDocuments()) / limit),
          limit,
          totalItems: await Wallet.countDocuments(),
        },
      });
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async fetchAllTransactions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const transactions = await Transaction.find().skip(skip).limit(limit);
      if (!transactions || transactions.length === 0) {
        return {
          success: true,
          transactions: [],
          message: "No transactions found",
        };
      }

      res.status(200).json({
        success: true,
        transactions,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil((await Transaction.countDocuments()) / limit),
          limit,
          totalItems: await Transaction.countDocuments(),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update BVN for a wallet
   */
  async updateBvn(req: Request, res: Response) {
    try {
      const { walletId, bvn } = req.body;

      if (!walletId || !bvn) {
        return res
          .status(400)
          .json({ message: "walletId and bvn are required" });
      }

      const updatedWallet = await this.walletService.updateBvn(walletId, bvn);
      return res
        .status(200)
        .json({ message: "BVN updated successfully", data: updatedWallet });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async verifyKyc(req: Request, res: Response) {
    const bankingService = new GraphService();
    try {
      const data = req.body;
      const response = await bankingService.createPerson(mapKycStateToPayload(data));
      // remove id from response
      // call the create account endpoint
      res.status(201).json({
        success: true,
        data: response.data
      })
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

}
