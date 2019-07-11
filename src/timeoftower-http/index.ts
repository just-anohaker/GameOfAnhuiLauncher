
import axios = require("axios");

export interface ITOTHttp {
    get(url: string, params: {}, timeout: number): Promise<any>;

    post(url: string, body: {}, timeout: number): Promise<any>;
}

export class TOTHttp implements ITOTHttp {
    async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data } = await axios.default.get(url, { params, timeout });
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.data;
        } catch (error) {
            console.log(`[TOTHttp] get[${url}, ${JSON.stringify(params)}] error:`, error.toString());
            throw error;
        }
    }

    async post(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
        try {
            const { data } = await axios.default.post(url, body, { timeout });
            if (!data.success) {
                throw new Error(data.error);
            }
            return data.data;
        } catch (error) {
            console.log(`[TOTHttp] post[${url}, ${JSON.stringify(body)}] error:`, error.toString());
            throw error;
        }
    }
}

const http = new TOTHttp();

export default http;
