import Stripe from "stripe";
import { UserModel } from "../models/UserModel.js";
// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
});
// Middlewares
import getUserByToken from "../helpers/get-user-by-token.js";
import getToken from "../helpers/get-token.js";
class StripeController {
    static async prices(req, res) {
        const prices = await stripe.prices.list();
        console.log("prices", prices);
        res.json(prices.data.reverse());
    }
    static async createSubscription(req, res) {
        const token = getToken(req);
        // Verificar se o usuário existe
        if (!token) {
            res.status(422).json({
                message: "Token ausente. Faça login novamente.",
            });
            return;
        }
        const user = await getUserByToken(token);
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        try {
            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [
                    {
                        price: req.body.priceId,
                        quantity: 1,
                    },
                ],
                customer: user.stripe_customer_id,
                success_url: process.env.STRIPE_SUCCESS_URL,
                cancel_url: process.env.STRIPE_CANCEL_URL,
            });
            console.log("Checkout session", session);
            res.json(session.url);
        }
        catch (err) {
            console.log(err);
        }
    }
    static async getStatus(req, res) {
        const token = getToken(req);
        // Verificar se o usuário existe
        if (!token) {
            res.status(422).json({
                message: "Token ausente. Faça login novamente.",
            });
            return;
        }
        const user = await getUserByToken(token);
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        try {
            //Status vindo do Stripe
            const subscription = await stripe.subscriptions.list({
                customer: user.stripe_customer_id,
                limit: 1,
                status: "all",
                expand: ["data.default_payment_method"],
            });
            // Atualização do usuário no banco de dados
            const updated = await UserModel.findByIdAndUpdate(user._id, {
                subscriptionInfo: subscription.data,
            }, { new: true });
            res.json(updated);
        }
        catch (err) {
            console.log(err);
        }
    }
    static async subscriptionInfo(req, res) {
        const token = getToken(req);
        // Verificar se o usuário existe
        if (!token) {
            res.status(422).json({
                message: "Token ausente. Faça login novamente.",
            });
            return;
        }
        const user = await getUserByToken(token);
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        try {
            //Status vindo do Stripe
            const subscription = await stripe.subscriptions.list({
                customer: user.stripe_customer_id,
                status: "all",
                expand: ["data.default_payment_method"],
            });
            res.json(subscription);
        }
        catch (err) {
            console.log(err);
        }
    }
    static async customerPortal(req, res) {
        const token = getToken(req);
        // Verificar se o usuário existe
        if (!token) {
            res.status(422).json({
                message: "Token ausente. Faça login novamente.",
            });
            return;
        }
        const user = await getUserByToken(token);
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        try {
            if (typeof user.stripe_customer_id === "string") {
                const portalSession = await stripe.billingPortal.sessions.create({
                    customer: user.stripe_customer_id,
                    return_url: process.env.STRIPE_SUCCESS_URL,
                });
                res.json(portalSession.url);
            }
            else {
                // Lidar com o caso em que user.stripe_customer_id é undefined ou não é uma string.
                // Por exemplo, você pode retornar um erro ou fazer outra ação apropriada.
                res.status(422).json({
                    message: "ID do cliente Stripe inválido!",
                });
            }
        }
        catch (err) {
            console.error(err);
            res.status(500).json({
                message: "Erro ao criar a sessão do portal de faturamento.",
            });
        }
    }
    // Método estático para lidar com o webhook do Stripe
    static async webhookStripe(req, res) {
        const sig = req.headers["stripe-signature"];
        const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET_KEY;
        try {
            if (req.body !== undefined) {
                const payload = req.body.toString(); // Converte para string
                let event;
                if (typeof payload === "string") {
                    event = stripe.webhooks.constructEvent(payload, sig, // Converte para string
                    endpointSecret // Converte para string
                    );
                }
                else {
                    console.error("Tipo de payload inválido.");
                    return res.status(400).json({ success: false });
                }
                switch (event.type) {
                    case "customer.subscription.updated":
                    case "customer.subscription.deleted":
                        const eventData = event.data.object;
                        if (!eventData) {
                            console.log(`Objeto do evento ${event.type} é nulo ou indefinido.`);
                            return res.status(400).json({ success: false });
                        }
                        const stripeSubscriptionId = eventData.id;
                        try {
                            // Encontre o usuário correspondente no banco de dados com base na associação entre a assinatura e o cliente
                            const userEvent = await UserModel.findOne({
                                "subscriptionInfo.id": stripeSubscriptionId,
                            }).exec();
                            if (!userEvent) {
                                console.log(`Usuário com stripe_subscription_id ${stripeSubscriptionId} não encontrado.`);
                            }
                            else {
                                // Declare o tipo de subscriptionInfo como um array de objetos com a propriedade 'id'
                                const subscriptionInfo = userEvent.subscriptionInfo;
                                // Remova todos os itens do array subscriptionInfo, exceto o primeiro item (índice 0)
                                await UserModel.updateOne({
                                    _id: userEvent._id,
                                }, {
                                    $pull: {
                                        subscriptionInfo: {
                                            id: {
                                                $ne: subscriptionInfo[0].id,
                                            },
                                        },
                                    },
                                });
                                // Atualize o primeiro item do array subscriptionInfo
                                await UserModel.updateOne({
                                    _id: userEvent._id,
                                    "subscriptionInfo.id": stripeSubscriptionId,
                                }, {
                                    $set: {
                                        "subscriptionInfo.$.status": "canceled",
                                    },
                                    $unset: {
                                        "subscriptionInfo.$.plan.active": 1,
                                    },
                                });
                                console.log(`Usuário com stripe_subscription_id ${stripeSubscriptionId} atualizado. Todos os outros itens em subscriptionInfo foram removidos, e o status foi definido como canceled.`);
                            }
                        }
                        catch (error) {
                            console.error(`Erro ao atualizar o usuário: ${error}`);
                        }
                        break;
                    default:
                        console.log(`Tipo de evento não tratado: ${event.type}`);
                }
                // Return a 200 response to acknowledge receipt of the event
                return res.status(200).json({ received: true });
            }
            else {
                console.error("Erro no corpo da solicitação.");
                return res.status(400).json({ success: false });
            }
        }
        catch (error) {
            console.error(`Webhook Error: ${error.message}`);
            return res.status(400).json({ success: false });
        }
    }
}
export default StripeController;
