export class ShippingService {
  constructor() {
    // 基本運費設置
    this.rates = {
      domestic: {
        standard: 5.99,
        express: 12.99,
        freeShippingThreshold: 100
      },
      international: {
        standard: 19.99,
        express: 39.99,
        freeShippingThreshold: 200
      }
    };

    // 稅率設置
    this.taxRates = {
      US: {
        // 州稅率
        CA: 0.0725, // California
        NY: 0.0885, // New York
        TX: 0.0625, // Texas
        // ... 其他州
        default: 0.06 // 默認稅率
      },
      CA: 0.13, // Canada
      default: 0.10 // 其他國家默認稅率
    };
  }

  calculateShipping(order, address) {
    const subtotal = this.calculateSubtotal(order);
    
    // 判斷國內/國際
    const isDomestic = address.country === 'US';
    const rates = isDomestic ? this.rates.domestic : this.rates.international;
    
    // 檢查是否符合免運門檻
    if (subtotal >= rates.freeShippingThreshold) {
      return 0;
    }

    // 根據配送方式計算運費
    return order.shippingMethod === 'express' ? rates.express : rates.standard;
  }

  calculateTax(order, address) {
    const subtotal = this.calculateSubtotal(order);
    
    // 獲取適用稅率
    let taxRate;
    if (address.country === 'US') {
      taxRate = this.taxRates.US[address.state] || this.taxRates.US.default;
    } else {
      taxRate = this.taxRates[address.country] || this.taxRates.default;
    }

    return subtotal * taxRate;
  }

  calculateSubtotal(order) {
    return order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  calculateTotal(order, address) {
    const subtotal = this.calculateSubtotal(order);
    const shipping = this.calculateShipping(order, address);
    const tax = this.calculateTax(order, address);

    return {
      subtotal,
      shipping,
      tax,
      total: subtotal + shipping + tax
    };
  }
}

export const shippingService = new ShippingService(); 