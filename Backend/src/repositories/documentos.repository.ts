import { randomUUID } from "crypto";

export interface Documento {
  id: string;
  reservacionId: string;
  tipo: string;
  nombreArchivo: string;
  contenidoHtml: string;
  createdAt: string;
}

const documentos: Documento[] = [];

export const documentosRepository = {
  findAll(): Documento[] {
    return documentos;
  },

  findById(id: string): Documento | undefined {
    return documentos.find((d) => d.id === id);
  },

  findByReservacionId(reservacionId: string): Documento[] {
    return documentos.filter((d) => d.reservacionId === reservacionId);
  },

  create(data: Omit<Documento, "id" | "createdAt">): Documento {
    const nuevo: Documento = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      ...data,
    };
    documentos.push(nuevo);
    return nuevo;
  },
};
