import jwt from "jsonwebtoken";
import getToken from "./get-token.js";
const checkToken = (req, res, next) => {
    if (!req.headers.authorization) {
        return res.status(401).json({ message: "Acesso Negado!" });
    }
    const token = getToken(req);
    if (!token) {
        return res.status(401).json({ message: "Acesso Negado!" });
    }
    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        return res.status(401).json({ message: "Token Inválido!" });
    }
};
export default checkToken;
function next() {
    throw new Error("Function not implemented.");
}
