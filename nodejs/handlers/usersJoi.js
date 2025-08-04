import Joi from "joi";

const nameSchema = Joi.object({
    first: Joi.string().min(2).max(256).required(),
    middle: Joi.string().min(2).max(256).allow(""),
    last: Joi.string().min(2).max(256).required(),
});

const addressSchema = Joi.object({
    state: Joi.string().min(2).max(256).allow(""),
    country: Joi.string().min(2).max(256).required(),
    city: Joi.string().min(2).max(256).required(),
    street: Joi.string().min(2).max(256).required(),
    houseNumber: Joi.string().min(1).max(256).required(),
});

const imageSchema = Joi.object({
    url: Joi.string().min(11).max(1024).allow(""),
    alt: Joi.string().min(2).max(256).allow(""),
});

export const registerSchema = Joi.object({
    name: nameSchema.required(),
    isBusiness: Joi.boolean().required(),
    phone: Joi.string()
        .min(9)
        .max(14)
        .required()
        .regex(/0[0-9]{1,2}-?[0-9]{7}/),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string()
        .min(6)
        .max(1024)
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*-])[a-zA-Z\d!@#$%^&*-]{6,}$/
        )
        .required(),
    address: addressSchema.required(),
    image: imageSchema,
    isAdmin: Joi.boolean(),
    createdAt: Joi.date(),
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    password: Joi.string().required(),
});