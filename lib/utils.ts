import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Função utilitária central (cn) para mesclagem de classes CSS.
 * Combina o `clsx` (para manipulação condicional de classes) com o `twMerge` 
 * (para resolver conflitos inteligentes de classes do Tailwind CSS, evitando sobreposições incorretas).
 * 
 * @param inputs - Lista de classes, objetos condicionais ou arrays aceitos pelo clsx.
 * @returns String consolidada e limpa contendo as classes finais aplicadas.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}