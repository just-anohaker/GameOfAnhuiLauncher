
import axios = require("axios");

export class ETMHttp {
    static async get(url: string, params: {} = {}, timeout: number = 4000): Promise<any> {
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

    static async put(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
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

    static async post(url: string, body: {} = {}, timeout: number = 4000): Promise<any> {
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


export default ETMHttp;
