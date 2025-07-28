import axios from "axios";
import { Wallet } from "../models/Wallet";
import { env } from "../utils/envValidator";
import { Business } from "../models/Business";
import mongoose from "mongoose";
import { Transaction } from "../models/Transaction";
import { generateTxId } from "../utils/otp";
import {flattenObject} from "../utils/flatten";

export class WalletService {
  private flutterwaveBaseUrl = env.FLUTTERWAVE_BASE_URL;
  private shippingWalletId = env.SHIPPING_WALLET_ID;
  private packagingWalletId = env.PACKAGING_WALLET_ID;
  private fillingWalletId = env.FILLING_WALLET_ID;
  private bankingWalletId = env.BANKING_WALLET_ID;
  private transferWalletId = env.TRANSFER_WALLET_ID;
  private flutterwaveSecret = env.FLUTTERWAVE_SECRET_KEY as string;
  private baniBaseUrl = env.BANI_BASE_URL;
  private moniSignature = env.BANI_MONI_SIGNATURE;
  private baniToken = env.BANI_TOKEN;

  //Flutterwave createWallet Method
  // async createWallet(
  //   businessId: string,
  //   email: string,
  //   phoneNumber: string,
  //   firstName: string,
  //   lastName: string,
  //   bvn: string,
  //   narration: string,
  //   primary?: boolean
  // ) {
  //   try {
  //     // **Validate businessId format**
  //     if (!mongoose.Types.ObjectId.isValid(businessId)) {
  //       throw new Error("Invalid businessId format");
  //     }

  //     // **Check if business exists**
  //     const businessExists = await Business.findById(businessId);
  //     if (!businessExists) {
  //       throw new Error("Business not found");
  //     }

  //     // Generate a unique transaction reference
  //     const txRef = `${firstName}_${Date.now()}`;

  //     // Flutterwave API request payload
  //     const requestData = {
  //       email, //CORRUPT THIS EMAIL
  //       tx_ref: txRef,
  //       phonenumber: phoneNumber,
  //       is_permanent: true,
  //       firstname: firstName,
  //       lastname: lastName,
  //       narration,
  //       bvn,
  //     };

  //     // Call Flutterwave API
  //     const response = await axios.post(
  //       `${this.flutterwaveBaseUrl}/virtual-account-numbers`,
  //       requestData,
  //       {
  //         headers: { Authorization: `Bearer ${this.flutterwaveSecret}` },
  //       }
  //     );

  //     const responseData = response.data;
  //     if (responseData.status !== "success") {
  //       throw new Error("Failed to create virtual account");
  //     }

  //     const {
  //       flw_ref,
  //       order_ref,
  //       account_number,
  //       bank_name,
  //       created_at,
  //     } = responseData.data;


  //     // Create and save the wallet in MongoDB
  //     const wallet = await Wallet.create({
  //       businessId,
  //       balance: 0,
  //       currency: "NGN", // Change if dynamic
  //       narration,
  //       txRef,
  //       flwRef: flw_ref,
  //       orderRef: order_ref,
  //       accountNumber: Number(account_number),
  //       accountStatus: "ACTIVE",
  //       bankName: bank_name,
  //       primary,
  //       firstName,
  //       lastName,
  //       email, //Use the Uncorrupted email here
  //       phoneNumber,
  //       createdAt: new Date(created_at),
  //     });

  //     return wallet;
  //   } catch (error: any) {
  //     throw new Error(
  //       `Error creating wallet: ${error?.response?.data?.message}`
  //     );
  //   }
  // }

  async fetchAllWalletData(){
    try {
      const wallets = await Wallet.find();
      return wallets;
    } catch (error) {
      console.log(error)
      throw new Error("Error fetching wallets data");
    }
  }

  async createWallet(
    businessId: string,
    email: string,
    phoneNumber: string,
    firstName: string,
    lastName: string,
    bvn: string,
    narration: string,
    primary?: boolean,
    businessName? : string
  ) {
    try {
      // **Validate businessId format**
      if (!mongoose.Types.ObjectId.isValid(businessId)) {
        throw new Error("Invalid businessId format");
      }

      // // // **Check if business exists**
      const businessExists = await Business.findById(businessId);
      if (!businessExists) {
        throw new Error("Business not found");
      }
    
      // Generate a unique transaction reference
      const txRef = `${firstName}_${Date.now()}`;

      // Flutterwave API request payload
      const requestData = {
        email, //CORRUPT THIS EMAIL
        tx_ref: txRef,
        phonenumber: phoneNumber,
        is_permanent: true,
        firstname: firstName,
        lastname: lastName,
        narration,
        bvn,
      };


      const customer = {
        customer_first_name: firstName,
        customer_last_name: lastName,
        customer_phone: phoneNumber,
        customer_email: email,
        customer_address: "h",
        customer_state: "h",
        customer_city: "h"
      };
      
  
      console.log("creating new customer", customer)

      // Call Bani API
      const response = await axios.post(
        `${this.baniBaseUrl}comhub/add_my_customer/`,
        customer,
        {
          headers: { 
            Authorization: `Bearer ${this.baniToken}`,
            "Content-Type": "application/json",
            "moni-signature": this.moniSignature,
          },
        }
      );

      console.log("customer created")

      
      const responseData = response.data;
      if (!responseData.status) {
      console.log("failed to create customer")

        throw new Error("Failed to create virtual account");
      }

      const {
        customer_ref
      } = responseData;

      const walletPayload = {
        pay_va_step: "direct",
        country_code: "NG",
        pay_currency: "NGN",
        holder_account_type: "permanent",
        customer_ref,
        pay_ext_ref: txRef,
        alternate_name: businessName? businessName : firstName + " " + lastName,
        holder_legal_number: bvn,
        bank_name: "guaranty trust bank",
      }

      const walletResponse = await axios.post(
        `${this.baniBaseUrl}partner/collection/bank_transfer/`,
        walletPayload,
        {
          headers: { 
            Authorization: `Bearer ${this.baniToken}`,
            "Content-Type": "application/json",
            "moni-signature": this.moniSignature,
          },
        }
      );
      console.log("created new bank", walletResponse.data)



      const {
        payment_reference,
        holder_account_number,
        holder_bank_name,
        amount,
        payment_ext_reference,
        account_type,
        account_name
      } = walletResponse.data;
      


      //Business account implementation
      const oldWallet = await Wallet.findOne({ businessId });
      if (oldWallet) {
        oldWallet.business_account_number = holder_account_number;
        oldWallet.business_bank_name = holder_bank_name;
        await oldWallet.save();

        return oldWallet;
      }

      // Create and save the wallet in MongoDB


      const wallet = await Wallet.create({
        businessId,
        balance: 0,
        currency: "NGN", // Change if dynamic
        narration,
        txRef,
        flwRef: txRef,
        orderRef: txRef,
        accountNumber: Number(holder_account_number),
        accountStatus: "ACTIVE",
        bankName: holder_bank_name,
        primary,
        firstName,
        lastName,
        email, //Use the Uncorrupted email here
        phoneNumber,
        createdAt: new Date(),
      });

      return wallet;

      // return walletResponse.data;
    } catch (error: any) {

      throw new Error(
        `Error creating wallet: ${error?.response?.data?.message}`
      );
    }
  }

  /**
   * Get all bank details from Flutterwave
   */
  async getAllBanks(countryCode: string = "NG") {
    try {
      const response = await axios.get(
        `${this.flutterwaveBaseUrl}/banks/${countryCode}`,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecret}`,
          },
        }
      );

      if (response.data.status !== "success") {
        throw new Error("Failed to fetch banks");
      }

      return response.data.data;
    } catch (error: any) {
      console.error("Error fetching banks:", error.response?.data || error);
      throw new Error(
        `Failed to fetch banks: ${
          error?.response?.data?.message || "Unknown error"
        }`
      );
    }
  }

  async getBusinessWallets(businessId: string) {
    return Wallet.find({ businessId });
  }

  async getTransactionsByWalletId(walletId: string) {
    return await Transaction.find({ walletId }).sort({ createdAt: -1 });
  }

  async getWalletBalance(walletId: string) {
    const wallet = await Wallet.findById(walletId);
    if (!wallet) throw new Error("Wallet not found");
    return wallet.balance;
  }
  async processPayment(
    walletId: string,
    amount: number[],
    meta: string,
    service: "shipping" | "filling" | "packaging" | "transfer"
  ) {
    const wallet = await Wallet.findById(walletId);
    console.log(walletId)

    if (!wallet) throw new Error("Wallet not found");

    const total = amount.reduce((prev, curr) => prev + curr, 0);
    if (wallet.balance < total) throw new Error("Insufficient funds");      

    // Deduct balance       
    wallet.balance -= total;
    await wallet.save();

    // Generate transactionId               
    const txId = generateTxId();


    // User wallet transaction
    const transactions = [
      {
        txId,
        txRef: wallet.txRef,
        walletId,
        amount: total,
        currency: wallet.currency,
        type: "payment",
        meta,
        status: "successful",
      },
    ];

    let serviceWallets: { id: string; index: number }[] = [];

    switch (service) {
      case "shipping":
        serviceWallets = [
          { id: this.shippingWalletId, index: 0 },
          { id: this.bankingWalletId, index: 1 },
        ];
        break;
      case "filling":
        serviceWallets = [
          { id: this.fillingWalletId, index: 0 },
          { id: this.bankingWalletId, index: 1 },
        ];
        break;
      case "packaging":
        serviceWallets = [
          { id: this.packagingWalletId, index: 0 },
          { id: this.bankingWalletId, index: 1 },
        ];
          break;
      case "transfer":
        serviceWallets = [
          { id: this.transferWalletId, index: 0 },
          { id: this.bankingWalletId, index: 1 },
        ];
    }

    // Fetch and update all service wallets in parallel
    const wallets = await Promise.all(
      serviceWallets.map(({ id }) => Wallet.findById(id))
    );

    wallets.forEach((serviceWallet, i) => {
      if (!serviceWallet) throw new Error(`${service} wallet not found`);
      serviceWallet.balance += amount[serviceWallets[i].index];
    });

    // Save all updated wallets in parallel
    await Promise.all(wallets.map((w) => w!.save()));


    // Record App wallet transactions
    transactions.push(
      ...serviceWallets.map(({ id, index }) => ({
        txId,
        txRef: wallet.txRef,
        walletId: id,
        amount: amount[index],
        currency: wallet.currency,
        type: "payment",
        meta,
        status: "successful",
      }))
    );

    await Transaction.insertMany(transactions);
    return { message: "Transaction successful", txId };
  }

  /**
   * Verify Transaction with Flutterwave
   */
  async verifyTransaction(transactionId: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecret}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error verifying transaction:", error);
      throw new Error("Failed to verify transaction with Flutterwave.");
    }
  }

  /**
   * Transfer funds using Flutterwave's Create Transfer API
   */
  async transferToWallet(
    recipientAccountNumber: string,
    amount: number,
    narration: string
  ): Promise<any> {
    try {
      const requestData = {
        account_bank: "flutterwave_virtual", // Bank code for virtual accounts
        account_number: recipientAccountNumber,
        amount,
        narration,
        currency: "NGN",
        reference: `TRF_${Date.now()}`,
        debit_currency: "NGN", // Ensure debit currency is NGN
      };

      const response = await axios.post(
        `${this.flutterwaveBaseUrl}/transfers`, // Use correct v3 API endpoint
        requestData,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecret}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error transferring funds:", error.response?.data || error);
      throw new Error(
        `Failed to transfer funds: ${
          error?.response?.data?.message || "Unknown error"
        }`
      );
    }
  }

  /**
   * Transfer funds to bank
   */
  async transferToBank(
    accountBank: string,
    accountNumber: string,
    amount: number,
    narration: string
  ): Promise<any> {
    try {
      const requestData = {
        account_bank: accountBank, // Bank code for virtual accounts
        account_number: accountNumber,
        amount,
        narration,
        currency: "NGN",
        reference: `TRF_${Date.now()}`,
        debit_currency: "NGN", // Ensure debit currency is NGN
      };

      const response = await axios.post(
        `${this.flutterwaveBaseUrl}/transfers`, // Use correct v3 API endpoint
        requestData,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecret}`,
            "Content-Type": "application/json",
          },
        }
      );

      // await Transaction.create({
      //     txId:response.data.data.id,
      //     walletId: walletId,
      //     txRef: txRef,
      //     amount,
      //     currency:"NGN",
      //     type: "withdrawal",
      //     status:"successful",
      //     meta:response.data.data,
      //     paymentGatewayResponse:response,
      //   });

      return response.data;
    } catch (error: any) {
      console.error("Error transferring funds:", error.response?.data || error);
      throw new Error(
        `Failed to transfer funds: ${
          error?.response?.data?.message || "Unknown error"
        }`
      );
    }
  }

  async baniTransferToBank(
    receiverAmount: string,
    transferMethod: string,
    receiverCurrency: string,
    transferReceiverType: string,   
    receiverAccountNumber: string,
    receiverCountryCode: string,
    receiverAccountName: string,
    receiverSortCode: string,
    senderAmount: string,
    senderCurrency: string,
    businessId: string,
    narration: string,
    meta:string,
    walletId: string
  ): Promise<any> {

    const parsedReceiverAmount = parseFloat(receiverAmount);
    if (isNaN(parsedReceiverAmount) || parsedReceiverAmount <= 0) {
      throw new Error('Invalid receiver amount');    
    }
    


    // const businessExists = await Wallet.findOne({businessId});
    // if (!businessExists) {
    //   throw new Error("Business not found");
    // }


    // if(businessExists.balance < parsedReceiverAmount) {
    //   throw new Error("Insufficient funds")  
    // }
    
    try {
      const requestData = {
      payout_step: "direct",
      receiver_currency: receiverCurrency,
      receiver_amount: receiverAmount,
      transfer_method: transferMethod,
      transfer_receiver_type: transferReceiverType,
      receiver_account_num: receiverAccountNumber,
      receiver_country_code: receiverCountryCode,
      receiver_account_name: receiverAccountName, 
      receiver_sort_code: receiverSortCode,
      sender_amount: senderAmount, 
      sender_currency: senderCurrency,
      transfer_ext_ref: `TRF_${Date.now()}`,
      // source_partner_code: 'NGSTAN',
      transfer_note: narration,
      source_partner_code: 'NGSQGT'
  };



      const response = await axios.post(
        `${this.baniBaseUrl}partner/payout/initiate_transfer/`, // Use correct v3 API endpoint
        requestData,
        {   
          headers: {
            Authorization: `Bearer ${this.baniToken}`,
            "moni-signature": this.moniSignature,
            "Content-Type": "application/json", 
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error("Error transferring funds:", error.response?.data || error);

      throw new Error(
        `Failed to transfer funds: ${
          error?.response?.data?.message || "Unknown error"
        }`
      );
    }
  }

  /**
   * Update BVN for a Wallet via Flutterwave
   */
  async updateBvn(walletId: string, newBvn: string): Promise<any> {
    try {
      const wallet = await Wallet.findById(walletId);
      if (!wallet) throw new Error("Wallet not found");

      const requestData = {
        order_ref: wallet.orderRef,
        bvn: newBvn,
      };

      const response = await axios.post(
        `${this.flutterwaveBaseUrl}/virtual-account-numbers/update-bvn`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${this.flutterwaveSecret}`,
          },
        }
      );

      const responseData = response.data;
      if (responseData.status !== "success") {
        throw new Error("Failed to update BVN"); 
      }

      return responseData;
    } catch (error: any) {
      console.error("Error updating BVN:", error);
      throw new Error(
        `Failed to update BVN: ${error?.response?.data?.message}`
      );
    }
  }
}
