
import axios = require("axios");

export class TOTHttp {
    static async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
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

    static async post(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
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

export default TOTHttp;
