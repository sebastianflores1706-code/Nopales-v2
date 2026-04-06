import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { usuariosRepository } from "../repositories/usuarios.repository";

const JWT_SECRET = process.env.JWT_SECRET ?? "nopales_dev_secret_changeme";
const JWT_EXPIRES_IN = "7d";

function generarToken(id: string, rol: "admin" | "ciudadano"): string {
  return jwt.sign({ id, rol }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

export type AuthResponse = {
  token: string;
  usuario: { id: string; nombre: string; correo: string; rol: "admin" | "ciudadano" };
};

export const authService = {
  async login(correo: string, contrasena: string): Promise<AuthResponse> {
    const usuario = await usuariosRepository.findByCorreo(correo);
    if (!usuario) throw new Error("Credenciales incorrectas");

    const valido = await bcrypt.compare(contrasena, usuario.hashContrasena);
    if (!valido) throw new Error("Credenciales incorrectas");

    const token = generarToken(usuario.id, usuario.rol);
    return {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    };
  },

  async register(nombre: string, correo: string, contrasena: string): Promise<AuthResponse> {
    const existe = await usuariosRepository.findByCorreo(correo);
    if (existe) throw new Error("Ya existe una cuenta con ese correo");

    const hashContrasena = await bcrypt.hash(contrasena, 10);
    const usuario = await usuariosRepository.create({ nombre, correo, hashContrasena });

    const token = generarToken(usuario.id, usuario.rol);
    return {
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    };
  },
};
