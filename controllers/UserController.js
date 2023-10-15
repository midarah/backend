import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { UserModel } from "../models/UserModel.js";
// Configuração do Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2023-08-16",
});
// Middlewares
import createUserToken from "../helpers/create-user-token.js";
import getUserByToken from "../helpers/get-user-by-token.js";
import getToken from "../helpers/get-token.js";
class UserController {
    static async register(req, res) {
        const { name, email, password, confirmPassword } = req.body;
        // Validações
        if (!name) {
            res.status(422).json({ message: "O nome é obrigatório!" });
            return;
        }
        if (!email) {
            res.status(422).json({ message: "O nome é obrigatório!" });
            return;
        }
        if (!password) {
            res.status(422).json({
                message: "A senha é obrigatória!",
            });
            return;
        }
        if (!confirmPassword) {
            res.status(422).json({
                message: "A confirmação da senha é obrigatória!",
            });
            return;
        }
        if (password !== confirmPassword) {
            res.status(422).json({
                message: "A senha e a confirmação de senha precisam ser iguais!",
            });
            return;
        }
        // const errors = validationResult(req);
        // if (!errors.isEmpty()) {
        // 	const errorMessages = errors.array().map((error) => error.msg);
        // 	return res.status(422).json({ errors: errorMessages });
        // }
        // Verificar se o usuário existe
        const userExist = await UserModel.findOne({ email: email });
        if (userExist) {
            res.status(422).json({
                message: "Email já cadastrado, Por favor utilize outro email. ",
            });
            return;
        }
        // Criar senha Hash (Codificada)
        const salt = await bcrypt.genSalt(12);
        const passwordHash = await bcrypt.hash(password, salt);
        // Criar um conta no Stripe
        const customer = await stripe.customers.create({
            email,
        });
        // console.log("Stripe customer criado", customer);
        // Criar um usuário
        const user = new UserModel({
            name,
            email,
            password: passwordHash,
            stripe_customer_id: customer.id,
        });
        try {
            const newUser = await user.save();
            await createUserToken(newUser, req, res);
        }
        catch (error) {
            console.error(error); // Registre o erro no console
            res.status(500).json({ message: "Erro interno no servidor." });
        }
    }
    static async login(req, res) {
        const { email, password } = req.body;
        // Validações
        if (!email) {
            res.status(422).json({ message: "O Email é obrigatório" });
            return;
        }
        if (!password) {
            res.status(422).json({ message: "A senha é obrigatória" });
            return;
        }
        // Verificar se o usuário existe
        const user = await UserModel.findOne({ email: email });
        if (!user) {
            res.status(422).json({
                message: "Não há usuário cadastrado com esse email!",
            });
            return;
        }
        // Verificar se a senha digitada é igual a senha no banco de dados
        const checkPassword = await bcrypt.compare(password, user.password);
        if (!checkPassword) {
            res.status(422).json({
                message: "Senha inválida !",
            });
            return;
        }
        await createUserToken(user, req, res);
    }
    static async checkUser(req, res) {
        // Usuário atual (A variável começa indefinida)
        let currentUser;
        if (req.headers.authorization) {
            const token = await getToken(req);
            if (token) {
                // Verifique se token não é undefined
                try {
                    // Decodificando o Token
                    const decoded = jwt.verify(token, process.env.JWT_SECRET);
                    currentUser = await UserModel.findById(decoded.id);
                    if (currentUser) {
                        currentUser.password = "";
                    }
                }
                catch (error) {
                    console.error("Erro na verificação do token:", error);
                }
            }
        }
        else {
            currentUser = null;
        }
        res.status(200).send(currentUser);
    }
    static async getUserById(req, res) {
        const id = req.params.id;
        const user = await UserModel.findById(id).select("-password");
        if (!user) {
            res.status(422).json({ message: "Usuário não encontrado!" });
            return;
        }
        res.status(200).json({ user });
    }
    static async editUser(req, res) {
        const id = req.params.id;
        const token = await getToken(req);
        try {
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
            const { name, email, password, confirmPassword } = req.body;
            // Upload de imagem
            let image = "";
            // Configuração do Req File para que o filename seja igual a key (Local e AWS S3)
            if (req.file) {
                if ("key" in req.file) {
                    // Estamos usando o armazenamento S3
                    if (typeof req.file.key === "string") {
                        image = req.file.key;
                    }
                }
                else {
                    // Estamos usando o armazenamento local
                    if (typeof req.file.filename === "string") {
                        image = req.file.filename;
                    }
                }
            }
            // Validações
            if (!name) {
                res.status(422).json({ message: "O nome é obrigatório" });
                return;
            }
            user.name = name;
            if (!email) {
                res.status(422).json({ message: "O email é obrigatório" });
                return;
            }
            if (email !== user.email) {
                const userExist = await UserModel.findOne({ email: email });
                if (userExist) {
                    res.status(422).json({
                        message: "Já existe um usuário cadastrado com esse email!",
                    });
                    return;
                }
                user.email = email;
            }
            if (password !== confirmPassword) {
                res.status(422).json({
                    message: "A senha e a confirmação de senha precisam ser iguais!",
                });
                return;
            }
            if (password) {
                // Alteração da senha
                const salt = await bcrypt.genSalt(12);
                const passwordHash = await bcrypt.hash(password, salt);
                user.password = passwordHash;
            }
            await user.save();
            const updatedUser = await UserModel.findById(user._id).select("-password");
            res.status(200).json({
                message: "Usuário atualizado com sucesso!",
                user: updatedUser,
            });
        }
        catch (err) {
            res.status(500).json({ message: err });
        }
    }
}
export default UserController;
