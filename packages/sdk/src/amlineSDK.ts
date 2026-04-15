export class AmlineSDK {
  constructor(private readonly baseUrl: string) {}

  async getProperties() {
    return fetch(`${this.baseUrl}/properties`).then((response) => response.json());
  }

  async getInvoices() {
    return fetch(`${this.baseUrl}/billing/invoices`).then((response) => response.json());
  }
}
