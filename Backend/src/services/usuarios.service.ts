import bcrypt from "bcryptjs";
import { usuariosRepository } from "../repositories/usuarios.repository";

export const usuariosService = {
  async getAll() {
    return usuariosRepository.findAll();
  },

  async create(data: {
    nombre: string;
    correo: string;
    contrasena: string;
    rol: "admin" | "ciudadano";
  }) {
    const existe = await usuariosRepository.findByCorreo(data.correo);
    if (existe) throw new Error("Ya existe una cuenta con ese correo");

    const hashContrasena = await bcrypt.hash(data.contrasena, 10);
    return usuariosRepository.create({
      nombre: data.nombre,
      correo: data.correo,
      hashContrasena,
      rol: data.rol,
    });
  },
};
