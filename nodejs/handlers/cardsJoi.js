import Joi from "joi";

const imageSchema = Joi.object({
    url: Joi.string()
        .uri()
        .min(11)
        .max(1024)
        .allow(""),
    alt: Joi.string()
        .min(2)
        .max(256)
        .allow(""),
});

const addressSchema = Joi.object({
    state: Joi.string()
        .min(2)
        .max(256)
        .allow(""),
    country: Joi.string()
        .min(2)
        .max(256)
        .required(),
    city: Joi.string()
        .min(2)
        .max(256)
        .required(),
    street: Joi.string()
        .min(2)
        .max(256)
        .required(),
    houseNumber: Joi.string()
        .min(1)
        .max(256)
        .required(),
    zip: Joi.string()
        .min(2)
        .max(256)
        .required(),
});

export const cardSchema = Joi.object({
    title: Joi.string()
        .min(2)
        .max(256)
        .required(),
    subtitle: Joi.string()
        .min(2)
        .max(256)
        .required(),
    description: Joi.string()
        .min(2)
        .max(1024)
        .required(),
    phone: Joi.string()
        .min(9)
        .max(14)
        .required()
        .regex(/0[0-9]{1,2}-?[0-9]{7}/),
    email: Joi.string()
        .email({ tlds: { allow: false } })
        .required(),
    web: Joi.string()
        .uri()
        .min(14)
        .max(256)
        .allow(""),
    image: imageSchema,
    address: addressSchema.required(),
    likes: Joi.array().items(Joi.string()),
    user_id: Joi.string(),
    createdAt: Joi.date(),
});