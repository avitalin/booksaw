import { Address } from '../models/Address.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export const addressController = {
  // 獲取用戶的所有地址
  async getAddresses(req, res, next) {
    try {
      const addresses = await Address.find({ user: req.user.id })
        .sort({ isDefault: -1, createdAt: -1 });
      res.json(addresses);
    } catch (error) {
      next(error);
    }
  },

  // 添加新地址
  async addAddress(req, res, next) {
    try {
      const addressCount = await Address.countDocuments({ user: req.user.id });
      
      // 限制每個用戶最多10個地址
      if (addressCount >= 10) {
        throw new ValidationError('Maximum number of addresses reached (10)');
      }

      // 如果是第一個地址，設為默認
      const isFirst = addressCount === 0;
      
      const address = new Address({
        ...req.body,
        user: req.user.id,
        isDefault: isFirst || req.body.isDefault
      });

      await address.save();
      res.status(201).json(address);
    } catch (error) {
      next(error);
    }
  },

  // 更新地址
  async updateAddress(req, res, next) {
    try {
      const address = await Address.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      Object.assign(address, req.body);
      await address.save();
      
      res.json(address);
    } catch (error) {
      next(error);
    }
  },

  // 刪除地址
  async deleteAddress(req, res, next) {
    try {
      const address = await Address.findOneAndDelete({
        _id: req.params.id,
        user: req.user.id
      });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      // 如果刪除的是默認地址，將最新的地址設為默認
      if (address.isDefault) {
        const newDefault = await Address.findOne({ user: req.user.id })
          .sort({ createdAt: -1 });
          
        if (newDefault) {
          newDefault.isDefault = true;
          await newDefault.save();
        }
      }

      res.status(204).end();
    } catch (error) {
      next(error);
    }
  },

  // 設置默認地址
  async setDefaultAddress(req, res, next) {
    try {
      const address = await Address.findOne({
        _id: req.params.id,
        user: req.user.id
      });

      if (!address) {
        throw new NotFoundError('Address not found');
      }

      address.isDefault = true;
      await address.save();
      
      res.json(address);
    } catch (error) {
      next(error);
    }
  }
}; 