import { body } from "express-validator";

const expressFormatValidator = [
    body("email")
        .isEmail()
        .withMessage("Wrong email format entered"),
];
export default expressFormatValidator;