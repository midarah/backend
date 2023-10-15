import jwt from "jsonwebtoken";
const createUserToken = async (user, req, res) => {
    // Criar Token
    const token = jwt.sign({
        name: user.name,
        id: user._id.toString(), // Convertendo ObjectId para string
    }, process.env.JWT_SECRET);
    // Retornar Token
    res.status(200).json({
        message: "Você está autenticado!",
        token: token,
        userId: user._id.toString(), // Convertendo ObjectId para string
    });
};
export default createUserToken;
