import { body } from "express-validator";
const validateRegisterInput = [
    body("name").notEmpty().withMessage("O nome é obrigatório!").trim(),
    body("email").isEmail().withMessage("Email inválido").trim(),
    body("password")
        .notEmpty()
        .withMessage("A senha é obrigatória!")
        .isLength({ min: 6 })
        .withMessage("A senha deve ter pelo menos 6 caracteres")
        .trim(),
    body("confirmPassword")
        .notEmpty()
        .withMessage("A confirmação da senha é obrigatória")
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("A senha e a confirmação de senha precisam ser iguais!");
        }
        return true;
    }),
];
export { validateRegisterInput };
