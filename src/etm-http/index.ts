
import axios = require("axios");

export interface IETMHttp {
    get(url: string, params: {}, timeout: number): Promise<any>;

    put(url: string, body: {}, timeout: number): Promise<any>;

    post(url: string, body: {}, timeout: number): Promise<any>;
}

export class ETMHttp implements IETMHttp {
    async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data = { success: false, error: "" } } = await axios.default.get(url, { params, timeout });
            const { success } = data;
            delete data.success;
            if (!success) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.log(`[ETMHttp] get[${url}, ${JSON.stringify(params)}] error:`, error.toString());
            throw error;
        }

    }

    async put(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data = { success: false, error: "" } } = await axios.default.put(url, body, { timeout });
            const { success } = data;
            delete data.success;
            if (!success) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.log(`[ETMHttp] put[${url}, ${JSON.stringify(body)}] error:`, error.toString());
            throw error;
        }
    }

    async post(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data = { success: false, error: "" } } = await axios.default.post(url, body, { timeout });
            const { success } = data;
            delete data.success;
            if (!success) {
                throw new Error(data.error);
            }
            return data;
        } catch (error) {
            console.log(`[ETMHttp] post[${url}, ${JSON.stringify(body)}] error:`, error.toString());
            throw error;
        }
    }
}

const http = new ETMHttp();

export default http;
