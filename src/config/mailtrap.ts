export default {
    host: process.env.MAILTRAP_HOST as string,
    port: parseInt(process.env.MAILTRAP_PORT as string, 10),
    auth: {
        user: process.env.MAILTRAP_USER as string,
        pass: process.env.MAILTRAP_PASS as string,
    },
};
