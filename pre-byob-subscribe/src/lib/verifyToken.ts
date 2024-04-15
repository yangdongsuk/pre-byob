import jwt from "jsonwebtoken";

interface JWTPayload {
  email: string;
}

const JWT_KEY = "rokafrokafrokafrokafrokafrokafrokaf";

export default {
  generate(email: string) {
    const token = jwt.sign({ email }, JWT_KEY, {
      expiresIn: "1h",
    });

    return token;
  },
  verify(token: string) {
    return jwt.verify(token, JWT_KEY) as JWTPayload;
  },
};
