declare namespace Express {
  interface Request {
    usuario?: {
      id: string;
      rol: "admin" | "ciudadano";
    };
  }
}
